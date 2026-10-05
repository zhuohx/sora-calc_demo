import React from 'react';
import { LoanInputs, SoraBenchmarkType, CalculationMode, CompoundedRatesSummary } from '../types/sora';
import { Sliders, HelpCircle, DollarSign, Calendar, Percent, ShieldCheck } from 'lucide-react';

interface LoanInputPanelProps {
  inputs: LoanInputs;
  ratesSummary: CompoundedRatesSummary;
  onChange: (newInputs: Partial<LoanInputs>) => void;
}

export const LoanInputPanel: React.FC<LoanInputPanelProps> = ({
  inputs,
  ratesSummary,
  onChange
}) => {
  const currentSoraRate =
    inputs.benchmarkType === '1M'
      ? ratesSummary.compounded1M
      : inputs.benchmarkType === '6M'
      ? ratesSummary.compounded6M
      : inputs.benchmarkType === 'daily_arrears'
      ? ratesSummary.overnightSora
      : inputs.benchmarkType === 'custom'
      ? inputs.customBenchmarkRate
      : ratesSummary.compounded3M;

  const totalEffective = Math.round((currentSoraRate + inputs.bankSpread) * 10000) / 10000;

  // Preset loan quantum in SGD
  const amountPresets = [
    { label: 'S$400K (HDB)', value: 400000 },
    { label: 'S$800K (Resale / EC)', value: 800000 },
    { label: 'S$1.2M (Private Condo)', value: 1200000 },
    { label: 'S$2.0M (Prime)', value: 2000000 }
  ];

  // Bank spread presets common in Singapore market
  const spreadPresets = [0.60, 0.65, 0.70, 0.85, 1.00];

  const formatSgd = (val: number) => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="bg-[#0D1527] border border-slate-800 rounded-xl p-5 shadow-xl">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-emerald-400" />
          <h2 className="text-base font-semibold text-white">Loan & Rate Parameters</h2>
        </div>
        <div className="text-xs text-slate-400 flex items-center gap-1 font-mono">
          <span>Singapore S$ (SGD)</span>
        </div>
      </div>

      <div className="space-y-5">
        {/* Loan Amount */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-slate-300">Loan Principal Amount</label>
            <span className="text-xs font-mono font-semibold text-emerald-400">
              {formatSgd(inputs.loanAmount)}
            </span>
          </div>

          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">
              S$
            </span>
            <input
              type="number"
              min="10000"
              max="100000000"
              step="10000"
              value={inputs.loanAmount || ''}
              onChange={(e) => onChange({ loanAmount: Number(e.target.value) || 0 })}
              className="w-full bg-[#121C33] border border-slate-700/80 rounded-lg pl-9 pr-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
              placeholder="e.g. 800000"
            />
          </div>

          {/* Quick preset buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mt-2">
            {amountPresets.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => onChange({ loanAmount: preset.value })}
                className={`text-[11px] py-1 px-2 rounded font-medium transition cursor-pointer text-left truncate ${
                  inputs.loanAmount === preset.value
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700/40'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loan Tenure */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-slate-300">Loan Tenure</label>
            <span className="text-xs font-mono font-semibold text-slate-200">
              {inputs.tenureYears} Years ({inputs.tenureYears * 12} Months)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="range"
              min="1"
              max="35"
              step="1"
              value={inputs.tenureYears}
              onChange={(e) => onChange({ tenureYears: Number(e.target.value) })}
              className="flex-1 accent-emerald-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
            <div className="w-16">
              <input
                type="number"
                min="1"
                max="35"
                value={inputs.tenureYears}
                onChange={(e) => onChange({ tenureYears: Math.min(35, Math.max(1, Number(e.target.value) || 1)) })}
                className="w-full bg-[#121C33] border border-slate-700/80 rounded-lg px-2 py-1.5 text-center text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
            <span>5 Years</span>
            <span>15 Yrs</span>
            <span>25 Yrs (MAS Standard)</span>
            <span>35 Yrs Max</span>
          </div>
        </div>

        {/* SORA Benchmark Selection */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1">
              <label className="text-xs font-medium text-slate-300">MAS SORA Benchmark</label>
              <span className="text-[10px] text-slate-400">(Reset Cycle)</span>
            </div>
            <span className="text-xs font-mono font-semibold text-emerald-400">
              {currentSoraRate.toFixed(4)}% p.a.
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {[
              { id: '3M', label: '3M SORA', sub: `${ratesSummary.compounded3M.toFixed(4)}%`, desc: 'Most common mortgage benchmark' },
              { id: '1M', label: '1M SORA', sub: `${ratesSummary.compounded1M.toFixed(4)}%`, desc: 'Frequent monthly resets' },
              { id: '6M', label: '6M SORA', sub: `${ratesSummary.compounded6M.toFixed(4)}%`, desc: 'Semi-annual reset' },
              { id: 'daily_arrears', label: 'Daily Arrears', sub: `${ratesSummary.overnightSora.toFixed(4)}%`, desc: 'ACT/365 daily compounded' }
            ].map((bm) => (
              <button
                key={bm.id}
                type="button"
                onClick={() => onChange({ benchmarkType: bm.id as SoraBenchmarkType })}
                className={`p-2.5 rounded-lg border text-left transition cursor-pointer flex flex-col justify-between ${
                  inputs.benchmarkType === bm.id
                    ? 'bg-emerald-950/40 border-emerald-500/80 text-white ring-1 ring-emerald-500/30'
                    : 'bg-[#121C33]/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-[#121C33]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">{bm.label}</span>
                  {inputs.benchmarkType === bm.id && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  )}
                </div>
                <span className="text-[11px] font-mono text-emerald-400 mt-1">{bm.sub}</span>
              </button>
            ))}
          </div>

          {/* Option for custom override */}
          <div className="mt-2 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => onChange({
                benchmarkType: inputs.benchmarkType === 'custom' ? '3M' : 'custom',
                customBenchmarkRate: inputs.customBenchmarkRate || ratesSummary.compounded3M
              })}
              className="text-slate-400 hover:text-emerald-400 underline underline-offset-2 transition cursor-pointer text-[11px]"
            >
              {inputs.benchmarkType === 'custom' ? '← Back to MAS Published Benchmarks' : 'Custom SORA rate override'}
            </button>
            {inputs.benchmarkType === 'custom' && (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-400">Override:</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="15"
                  value={inputs.customBenchmarkRate}
                  onChange={(e) => onChange({ customBenchmarkRate: parseFloat(e.target.value) || 0 })}
                  className="w-20 bg-[#121C33] border border-emerald-500/50 rounded px-2 py-0.5 text-xs font-mono text-emerald-300 text-right"
                />
                <span className="text-xs text-slate-400">%</span>
              </div>
            )}
          </div>
        </div>

        {/* Bank Margin / Spread */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1">
              <label className="text-xs font-medium text-slate-300">Bank Spread / Margin</label>
              <span className="text-[10px] text-slate-500">(+ Spread added by Bank)</span>
            </div>
            <span className="text-xs font-mono font-semibold text-cyan-400">
              +{inputs.bankSpread.toFixed(2)}% p.a.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">
                +
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={inputs.bankSpread}
                onChange={(e) => onChange({ bankSpread: parseFloat(e.target.value) || 0 })}
                className="w-full bg-[#121C33] border border-slate-700/80 rounded-lg pl-7 pr-7 py-2 text-sm font-mono text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">
                % p.a.
              </span>
            </div>

            {/* Quick spread buttons */}
            <div className="flex gap-1">
              {spreadPresets.map((sp) => (
                <button
                  key={sp}
                  type="button"
                  onClick={() => onChange({ bankSpread: sp })}
                  className={`text-[11px] px-2 py-2 rounded font-mono transition cursor-pointer ${
                    inputs.bankSpread === sp
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                      : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700/60'
                  }`}
                >
                  +{sp.toFixed(2)}%
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Calculation Mode & Start Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
          <div>
            <label className="text-xs font-medium text-slate-300 mb-1.5 block">Repayment Structure</label>
            <select
              value={inputs.calculationMode}
              onChange={(e) => onChange({ calculationMode: e.target.value as CalculationMode })}
              className="w-full bg-[#121C33] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="monthly_amortization">Monthly Amortizing (P + I)</option>
              <option value="interest_only">Interest-Only Period</option>
              <option value="daily_accrual">ACT/365 Daily Money Market Accrual</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 mb-1.5 block">First Repayment Date</label>
            <input
              type="date"
              value={inputs.startDate}
              onChange={(e) => onChange({ startDate: e.target.value })}
              className="w-full bg-[#121C33] border border-slate-700/80 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Total Effective Rate Banner */}
        <div className="bg-gradient-to-r from-emerald-950/40 via-cyan-950/30 to-slate-900 border border-emerald-800/40 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 uppercase tracking-wide block">Total Effective Interest Rate</span>
            <span className="text-xs text-slate-300">
              SORA ({currentSoraRate.toFixed(4)}%) + Bank Margin ({inputs.bankSpread.toFixed(2)}%)
            </span>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold font-mono text-emerald-400 tabular-nums">
              {totalEffective.toFixed(4)}%
            </span>
            <span className="text-[10px] text-slate-400 block font-mono">per annum</span>
          </div>
        </div>
      </div>
    </div>
  );
};
