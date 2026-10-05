import React, { useState } from 'react';
import { LoanCalculationResult, LoanInputs } from '../types/sora';
import { GitCompare, CheckCircle2, TrendingDown, TrendingUp, Sparkles } from 'lucide-react';

interface FixedVsSoraComparisonProps {
  soraResult: LoanCalculationResult;
  inputs: LoanInputs;
}

export const FixedVsSoraComparison: React.FC<FixedVsSoraComparisonProps> = ({
  soraResult,
  inputs
}) => {
  const [fixedRate, setFixedRate] = useState<number>(2.95);
  const [fixedPeriodYears, setFixedPeriodYears] = useState<number>(2);

  const formatSgd = (val: number, decimals: number = 0) => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(val);
  };

  // Fixed package calculation
  const totalMonths = Math.max(1, Math.round(inputs.tenureYears * 12));
  const fixedMonthlyRate = fixedRate / 100 / 12;
  const fixedMonthlyPayment =
    fixedMonthlyRate > 0
      ? (inputs.loanAmount * (fixedMonthlyRate * Math.pow(1 + fixedMonthlyRate, totalMonths))) /
        (Math.pow(1 + fixedMonthlyRate, totalMonths) - 1)
      : inputs.loanAmount / totalMonths;

  const monthlyDifference = soraResult.monthlyPayment - fixedMonthlyPayment;
  const lockInMonths = fixedPeriodYears * 12;
  const cumulativePeriodDiff = monthlyDifference * lockInMonths;

  // Break-even SORA rate: Fixed Rate - Bank Spread
  const breakEvenSora = Math.max(0, fixedRate - inputs.bankSpread);

  return (
    <div className="bg-[#0D1527] border border-slate-800 rounded-xl p-5 shadow-xl space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-emerald-400" />
            <h3 className="text-base font-semibold text-white">Compare Floating SORA vs Fixed Rate Mortgage</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Typical Singapore Bank Lock-In Benchmarking
          </span>
        </div>
        <p className="text-xs text-slate-300 mt-1 max-w-2xl">
          Evaluate whether locking in a fixed rate protects against future SORA rate spikes or if floating SORA yields immediate interest savings.
        </p>
      </div>

      {/* Comparison Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#121C33]/60 p-4 rounded-xl border border-slate-800">
        <div>
          <label className="text-xs font-medium text-slate-300 block mb-1.5">
            Fixed Rate Package (% p.a.)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.05"
              min="0.5"
              max="10"
              value={fixedRate}
              onChange={(e) => setFixedRate(parseFloat(e.target.value) || 0)}
              className="w-full bg-[#0D1527] border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-cyan-500"
            />
            <div className="flex gap-1">
              {[2.80, 2.95, 3.10, 3.25].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => setFixedRate(rate)}
                  className={`text-[11px] px-2 py-2 rounded font-mono transition cursor-pointer ${
                    fixedRate === rate
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                      : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700/60'
                  }`}
                >
                  {rate.toFixed(2)}%
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-300 block mb-1.5">
            Fixed Lock-In Duration
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((yrs) => (
              <button
                key={yrs}
                type="button"
                onClick={() => setFixedPeriodYears(yrs)}
                className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition cursor-pointer ${
                  fixedPeriodYears === yrs
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                    : 'bg-[#0D1527] border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                {yrs} Year{yrs > 1 ? 's' : ''} Lock-In
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Side by Side Head-to-Head */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* SORA Package Card */}
        <div className="bg-[#121C33] border border-emerald-800/40 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-emerald-400">Floating SORA Package</span>
              <span className="text-[10px] font-mono text-slate-400">{inputs.benchmarkType} Benchmark</span>
            </div>
            <div className="text-2xl font-bold font-mono text-white">
              {formatSgd(soraResult.monthlyPayment)} <span className="text-xs text-slate-400 font-sans font-normal">/ month</span>
            </div>
            <div className="text-xs text-slate-300 font-mono mt-1">
              Effective Rate: <strong className="text-emerald-400">{soraResult.effectiveRate.toFixed(4)}%</strong> (SORA {soraResult.benchmarkRate.toFixed(4)}% + {inputs.bankSpread.toFixed(2)}%)
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>{fixedPeriodYears}-Year Cumulative Outlay:</span>
              <span className="font-mono text-slate-200">{formatSgd(soraResult.monthlyPayment * lockInMonths)}</span>
            </div>
          </div>
        </div>

        {/* Fixed Package Card */}
        <div className="bg-[#121C33] border border-cyan-800/40 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-cyan-400">{fixedPeriodYears}-Year Fixed Package</span>
              <span className="text-[10px] font-mono text-slate-400">Guaranteed Rate</span>
            </div>
            <div className="text-2xl font-bold font-mono text-white">
              {formatSgd(fixedMonthlyPayment)} <span className="text-xs text-slate-400 font-sans font-normal">/ month</span>
            </div>
            <div className="text-xs text-slate-300 font-mono mt-1">
              Guaranteed Rate: <strong className="text-cyan-400">{fixedRate.toFixed(2)}%</strong> for {fixedPeriodYears} Years
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>{fixedPeriodYears}-Year Cumulative Outlay:</span>
              <span className="font-mono text-slate-200">{formatSgd(fixedMonthlyPayment * lockInMonths)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decision Summary */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-white mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Break-Even SORA Analysis</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
            With a bank margin of +{inputs.bankSpread.toFixed(2)}%, the SORA benchmark would need to rise above{' '}
            <strong className="text-emerald-400 font-mono">{breakEvenSora.toFixed(4)}%</strong> for the Fixed rate package to be cheaper than SORA.
          </p>
        </div>

        <div className="text-right shrink-0">
          <div className="text-[10px] text-slate-400 uppercase font-mono">{fixedPeriodYears}-Year Net Difference</div>
          <div className={`text-lg font-bold font-mono tabular-nums ${monthlyDifference > 0 ? 'text-cyan-400' : 'text-emerald-400'}`}>
            {monthlyDifference > 0
              ? `Fixed saves ${formatSgd(Math.abs(cumulativePeriodDiff))}`
              : `SORA saves ${formatSgd(Math.abs(cumulativePeriodDiff))}`}
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            {formatSgd(Math.abs(monthlyDifference))}/mo variance
          </div>
        </div>
      </div>
    </div>
  );
};
