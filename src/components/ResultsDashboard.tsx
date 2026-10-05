import React from 'react';
import { LoanCalculationResult, LoanInputs } from '../types/sora';
import { DollarSign, Percent, TrendingUp, Calendar, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';

interface ResultsDashboardProps {
  result: LoanCalculationResult;
  inputs: LoanInputs;
  activeTab: 'schedule' | 'audit' | 'stress' | 'comparison';
  onTabChange: (tab: 'schedule' | 'audit' | 'stress' | 'comparison') => void;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  result,
  inputs,
  activeTab,
  onTabChange
}) => {
  const formatSgd = (val: number, decimals: number = 2) => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(val);
  };

  // Percentage breakdown of first month payment
  const firstMonthTotal = result.firstMonthPrincipal + result.firstMonthInterest;
  const principalPercent = firstMonthTotal > 0 ? (result.firstMonthPrincipal / firstMonthTotal) * 100 : 0;
  const interestPercent = firstMonthTotal > 0 ? (result.firstMonthInterest / firstMonthTotal) * 100 : 0;

  // Total interest to principal ratio
  const interestRatio = inputs.loanAmount > 0 ? (result.totalInterest / inputs.loanAmount) * 100 : 0;

  return (
    <div className="space-y-5">
      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Monthly Payment Card */}
        <div className="bg-[#0D1527] border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col justify-between relative overflow-hidden group hover:border-slate-700 transition">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none"></div>
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>{inputs.calculationMode === 'interest_only' ? 'Interest-Only Monthly' : 'Monthly Instalment'}</span>
              <span className="text-[10px] font-mono text-emerald-400">SGD</span>
            </div>
            <div className="text-2xl lg:text-3xl font-bold font-mono text-white tabular-nums tracking-tight">
              {formatSgd(result.monthlyPayment)}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
              <span>Principal: <strong className="text-slate-200 font-mono">{formatSgd(result.firstMonthPrincipal, 0)}</strong></span>
              <span>Interest: <strong className="text-amber-300 font-mono">{formatSgd(result.firstMonthInterest, 0)}</strong></span>
            </div>
            {/* Visual ratio bar */}
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
              <div
                className="bg-emerald-400 h-full transition-all duration-500"
                style={{ width: `${principalPercent}%` }}
                title={`Principal: ${principalPercent.toFixed(1)}%`}
              />
              <div
                className="bg-amber-400 h-full transition-all duration-500"
                style={{ width: `${interestPercent}%` }}
                title={`Interest: ${interestPercent.toFixed(1)}%`}
              />
            </div>
          </div>
        </div>

        {/* Effective Rate Card */}
        <div className="bg-[#0D1527] border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col justify-between hover:border-slate-700 transition">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Effective Interest Rate</span>
              <span className="text-[10px] font-mono text-cyan-400">p.a.</span>
            </div>
            <div className="text-2xl lg:text-3xl font-bold font-mono text-emerald-400 tabular-nums tracking-tight">
              {result.effectiveRate.toFixed(4)}%
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1 font-mono">
            <div className="flex justify-between">
              <span>SORA Benchmark:</span>
              <span className="text-slate-200">{result.benchmarkRate.toFixed(4)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Bank Spread:</span>
              <span className="text-cyan-400">+{result.bankSpread.toFixed(2)}%</span>
            </div>
          </div>
        </div>

        {/* Total Interest Card */}
        <div className="bg-[#0D1527] border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col justify-between hover:border-slate-700 transition">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Total Interest Payable</span>
              <span className="text-[10px] font-mono text-amber-400">Over {inputs.tenureYears} Yrs</span>
            </div>
            <div className="text-2xl lg:text-3xl font-bold font-mono text-amber-300 tabular-nums tracking-tight">
              {formatSgd(result.totalInterest, 0)}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Total Amount:</span>
              <span className="font-mono text-slate-200">{formatSgd(result.totalPayment, 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Interest / Principal:</span>
              <span className="font-mono text-amber-300">{interestRatio.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Daily Interest Accrual Card (ACT/365) */}
        <div className="bg-[#0D1527] border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col justify-between hover:border-slate-700 transition">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Daily Interest Accrual</span>
              <span className="text-[10px] font-mono text-emerald-400">ACT/365</span>
            </div>
            <div className="text-2xl lg:text-3xl font-bold font-mono text-slate-100 tabular-nums tracking-tight">
              {formatSgd(result.dailyInterestAccrual, 2)}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Monthly Approx:</span>
              <span className="font-mono text-slate-200">{formatSgd(result.dailyInterestAccrual * 30.416, 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Annual Interest:</span>
              <span className="font-mono text-slate-200">{formatSgd(result.dailyInterestAccrual * 365, 0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-1.5 p-1 bg-[#0D1527] border border-slate-800 rounded-lg">
          {[
            { id: 'schedule', label: 'Amortisation Schedule' },
            { id: 'audit', label: 'MAS Formula & Daily Audit' },
            { id: 'stress', label: 'MAS TDSR & Stress Test' },
            { id: 'comparison', label: 'Fixed vs SORA Comparison' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id as any)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-2 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>MAS Monetary Authority Standards</span>
        </div>
      </div>
    </div>
  );
};
