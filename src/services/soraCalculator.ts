import {
  LoanInputs,
  LoanCalculationResult,
  AmortizationRow,
  YearlyScheduleRow,
  DailySoraRate,
  StressTestScenario,
  CompoundingAuditSummary
} from '../types/sora';
import { computeMasCompoundedSora } from './masRates';

/**
 * Calculates complete loan repayment metrics and amortization table
 */
export function calculateSoraLoan(
  inputs: LoanInputs,
  ratesDataset: DailySoraRate[]
): LoanCalculationResult {
  const {
    loanAmount,
    tenureYears,
    bankSpread,
    benchmarkType,
    customBenchmarkRate,
    calculationMode,
    startDate
  } = inputs;

  // 1. Determine SORA benchmark rate
  let benchmarkRate = 0;
  let auditSummary: CompoundingAuditSummary;

  if (benchmarkType === 'custom') {
    benchmarkRate = customBenchmarkRate;
    auditSummary = {
      d0: 0,
      d: 0,
      productFactor: 0,
      annualizedCompoundedRate: customBenchmarkRate,
      formulaExplanation: 'User custom rate benchmark override',
      rows: []
    };
  } else if (benchmarkType === '1M') {
    auditSummary = computeMasCompoundedSora(ratesDataset, 30);
    benchmarkRate = auditSummary.annualizedCompoundedRate;
  } else if (benchmarkType === '6M') {
    auditSummary = computeMasCompoundedSora(ratesDataset, 180);
    benchmarkRate = auditSummary.annualizedCompoundedRate;
  } else if (benchmarkType === 'daily_arrears') {
    // Compounded in arrears across full available recent period
    auditSummary = computeMasCompoundedSora(ratesDataset, inputs.lookbackDays || 90);
    benchmarkRate = auditSummary.annualizedCompoundedRate;
  } else {
    // Default: 3M Compounded SORA (most common in Singapore)
    auditSummary = computeMasCompoundedSora(ratesDataset, 90);
    benchmarkRate = auditSummary.annualizedCompoundedRate;
  }

  // Ensure non-negative benchmark
  benchmarkRate = Math.max(0, benchmarkRate);

  // 2. Effective Rate (Benchmark + Spread)
  const effectiveRate = Math.round((benchmarkRate + bankSpread) * 10000) / 10000;

  // 3. Monthly Instalment Calculation
  const totalMonths = Math.max(1, Math.round(tenureYears * 12));
  const monthlyRate = effectiveRate / 100 / 12;

  let monthlyPayment = 0;
  if (calculationMode === 'interest_only') {
    monthlyPayment = loanAmount * monthlyRate;
  } else {
    if (monthlyRate === 0) {
      monthlyPayment = loanAmount / totalMonths;
    } else {
      const pow = Math.pow(1 + monthlyRate, totalMonths);
      monthlyPayment = (loanAmount * (monthlyRate * pow)) / (pow - 1);
    }
  }

  // Daily interest accrual using Singapore ACT/365 convention
  const dailyInterestAccrual = (loanAmount * (effectiveRate / 100)) / 365;

  // 4. Generate Amortization Schedule
  const amortizationSchedule: AmortizationRow[] = [];
  let currentBalance = loanAmount;
  let cumulativeInterest = 0;
  let startD = new Date(startDate || new Date().toISOString().split('T')[0]);

  for (let m = 1; m <= totalMonths; m++) {
    // Increment month
    const payDate = new Date(startD);
    payDate.setMonth(startD.getMonth() + m);
    const dateStr = payDate.toISOString().split('T')[0];

    const interestForMonth = currentBalance * monthlyRate;
    let principalForMonth = monthlyPayment - interestForMonth;

    if (calculationMode === 'interest_only') {
      principalForMonth = 0;
    }

    // Edge case: final payment balancing
    if (m === totalMonths && calculationMode !== 'interest_only') {
      principalForMonth = currentBalance;
    }

    const endingBalance = Math.max(0, currentBalance - principalForMonth);
    cumulativeInterest += interestForMonth;

    amortizationSchedule.push({
      month: m,
      date: dateStr,
      beginningBalance: currentBalance,
      payment: principalForMonth + interestForMonth,
      principal: principalForMonth,
      interest: interestForMonth,
      endingBalance: endingBalance,
      cumulativeInterest: cumulativeInterest,
      rateApplied: effectiveRate
    });

    currentBalance = endingBalance;
    if (currentBalance <= 0) break;
  }

  // 5. Aggregate into Yearly Schedule
  const yearlySchedule: YearlyScheduleRow[] = [];
  let yearNum = 1;
  let yearBeginning = loanAmount;
  let yearPayment = 0;
  let yearPrincipal = 0;
  let yearInterest = 0;

  for (let i = 0; i < amortizationSchedule.length; i++) {
    const row = amortizationSchedule[i];
    yearPayment += row.payment;
    yearPrincipal += row.principal;
    yearInterest += row.interest;

    if ((i + 1) % 12 === 0 || i === amortizationSchedule.length - 1) {
      yearlySchedule.push({
        year: yearNum,
        beginningBalance: yearBeginning,
        totalPayment: yearPayment,
        principalPaid: yearPrincipal,
        interestPaid: yearInterest,
        endingBalance: row.endingBalance
      });
      yearNum++;
      yearBeginning = row.endingBalance;
      yearPayment = 0;
      yearPrincipal = 0;
      yearInterest = 0;
    }
  }

  const totalPayment = amortizationSchedule.reduce((acc, r) => acc + r.payment, 0);
  const totalInterest = amortizationSchedule.reduce((acc, r) => acc + r.interest, 0);

  const firstMonth = amortizationSchedule[0] || {
    principal: 0,
    interest: 0
  };

  return {
    effectiveRate,
    benchmarkRate,
    bankSpread,
    monthlyPayment,
    totalPayment,
    totalInterest,
    firstMonthPrincipal: firstMonth.principal,
    firstMonthInterest: firstMonth.interest,
    dailyInterestAccrual,
    amortizationSchedule,
    yearlySchedule,
    compoundingAudit: auditSummary
  };
}

/**
 * Computes Singapore MAS TDSR and rate shift sensitivity scenarios
 */
export function calculateStressTestScenarios(
  baseInputs: LoanInputs,
  currentBenchmark: number
): StressTestScenario[] {
  const { loanAmount, tenureYears, bankSpread } = baseInputs;
  const totalMonths = Math.max(1, Math.round(tenureYears * 12));

  // Current base
  const currentEff = currentBenchmark + bankSpread;
  const currentMonthlyRate = currentEff / 100 / 12;
  const baseMonthly =
    currentMonthlyRate > 0
      ? (loanAmount * (currentMonthlyRate * Math.pow(1 + currentMonthlyRate, totalMonths))) /
        (Math.pow(1 + currentMonthlyRate, totalMonths) - 1)
      : loanAmount / totalMonths;

  const scenariosDef = [
    { label: '-1.00% (-100 bps)', deltaBps: -100, customRate: currentBenchmark - 1.0 },
    { label: '-0.50% (-50 bps)', deltaBps: -50, customRate: currentBenchmark - 0.5 },
    { label: 'Current SORA Base', deltaBps: 0, customRate: currentBenchmark },
    { label: '+0.50% (+50 bps)', deltaBps: 50, customRate: currentBenchmark + 0.5 },
    { label: '+1.00% (+100 bps)', deltaBps: 100, customRate: currentBenchmark + 1.0 },
    { label: '+1.50% (+150 bps)', deltaBps: 150, customRate: currentBenchmark + 1.5 },
    { label: '+2.00% (+200 bps)', deltaBps: 200, customRate: currentBenchmark + 2.0 },
    { label: 'MAS TDSR Stress Test (4.00% Floor)', deltaBps: 0, customRate: 4.00 - bankSpread, isMasStressTest: true }
  ];

  return scenariosDef.map(sc => {
    let soraRate = Math.max(0, sc.customRate);
    let effective = soraRate + bankSpread;

    if (sc.isMasStressTest) {
      effective = 4.00; // MAS property loan TDSR regulatory stress test floor
      soraRate = Math.max(0, effective - bankSpread);
    }

    const mRate = effective / 100 / 12;
    const pmt =
      mRate > 0
        ? (loanAmount * (mRate * Math.pow(1 + mRate, totalMonths))) /
          (Math.pow(1 + mRate, totalMonths) - 1)
        : loanAmount / totalMonths;

    const totalInt = pmt * totalMonths - loanAmount;

    return {
      label: sc.label,
      rateDeltaBps: sc.deltaBps,
      soraRate: Math.round(soraRate * 10000) / 10000,
      effectiveRate: Math.round(effective * 10000) / 10000,
      monthlyPayment: Math.round(pmt * 100) / 100,
      monthlyDelta: Math.round((pmt - baseMonthly) * 100) / 100,
      totalInterest: Math.max(0, Math.round(totalInt * 100) / 100),
      isMasStressTest: sc.isMasStressTest
    };
  });
}
