/**
 * Types and interfaces for the Singapore Overnight Rate Average (SORA) Calculator.
 * Designed according to Monetary Authority of Singapore (MAS) and ABS/SFG standards.
 */

export interface DailySoraRate {
  date: string; // YYYY-MM-DD
  rate: number; // Percentage (e.g. 3.1500 for 3.1500%)
  volumeSgdMillion?: number; // Interbank overnight volume in S$ Million
  calendarDays?: number; // n_i: number of calendar days for which rate applies (1 for weekday, 3 for Friday)
  factor?: number; // 1 + (r_i * n_i / 365)
  cumulativeProduct?: number; // Running product of daily compounding factors
}

export type SoraBenchmarkType = '1M' | '3M' | '6M' | 'daily_arrears' | 'custom';

export type CalculationMode = 'monthly_amortization' | 'interest_only' | 'daily_accrual';

export interface CompoundedRatesSummary {
  overnightSora: number; // Latest daily rate %
  compounded1M: number;  // 1-Month Compounded SORA %
  compounded3M: number;  // 3-Month Compounded SORA %
  compounded6M: number;  // 6-Month Compounded SORA %
  lastPublishedDate: string;
  source: 'mas_live' | 'dataset' | 'custom_api';
  statusText?: string;
}

export interface LoanInputs {
  loanAmount: number; // Principal in SGD
  tenureYears: number; // Loan duration (e.g. 25)
  bankSpread: number; // Bank margin in % p.a. (e.g. 0.70)
  benchmarkType: SoraBenchmarkType;
  customBenchmarkRate: number; // If user selects custom
  calculationMode: CalculationMode;
  startDate: string; // YYYY-MM-DD
  // Lookback / observation parameters
  lookbackDays: number; // Typically 90 for 3M, 30 for 1M, 180 for 6M
}

export interface AmortizationRow {
  month: number;
  date: string;
  beginningBalance: number;
  payment: number;
  principal: number;
  interest: number;
  endingBalance: number;
  cumulativeInterest: number;
  rateApplied: number;
}

export interface YearlyScheduleRow {
  year: number;
  beginningBalance: number;
  totalPayment: number;
  principalPaid: number;
  interestPaid: number;
  endingBalance: number;
}

export interface CompoundingAuditRow {
  dayIndex: number;
  businessDate: string;
  rate: number; // r_i %
  calendarDays: number; // n_i
  compoundingFactor: number; // 1 + (r_i * n_i / 365)
  runningProduct: number; // \prod
}

export interface CompoundingAuditSummary {
  d0: number; // Number of business days
  d: number; // Total calendar days in calculation period
  productFactor: number; // \prod - 1
  annualizedCompoundedRate: number; // in %
  formulaExplanation: string;
  rows: CompoundingAuditRow[];
}

export interface LoanCalculationResult {
  effectiveRate: number; // Benchmark + Spread in %
  benchmarkRate: number; // SORA benchmark rate in %
  bankSpread: number; // Bank margin in %
  monthlyPayment: number; // Monthly instalment in SGD
  totalPayment: number; // Total principal + interest in SGD
  totalInterest: number; // Total interest paid over loan
  firstMonthPrincipal: number;
  firstMonthInterest: number;
  dailyInterestAccrual: number; // Interest per day based on initial principal
  amortizationSchedule: AmortizationRow[];
  yearlySchedule: YearlyScheduleRow[];
  compoundingAudit: CompoundingAuditSummary;
}

export interface StressTestScenario {
  label: string;
  rateDeltaBps: number;
  soraRate: number;
  effectiveRate: number;
  monthlyPayment: number;
  monthlyDelta: number;
  totalInterest: number;
  isMasStressTest?: boolean;
}
