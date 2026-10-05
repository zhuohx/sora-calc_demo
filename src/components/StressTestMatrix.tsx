import React, { useState } from 'react';
import { StressTestScenario, LoanInputs } from '../types/sora';
import { AlertCircle, ShieldAlert, TrendingUp, ArrowUpRight, Scale } from 'lucide-react';

interface StressTestMatrixProps {
  scenarios: StressTestScenario[];
  inputs: LoanInputs;
  baseMonthlyPayment: number;
}

export const StressTestMatrix: React.FC<StressTestMatrixProps> = ({
  scenarios,
  inputs,
  baseMonthlyPayment
}) => {
  const [customShiftBps, setCustomShiftBps] = useState<number>(100);

  const formatSgd = (val: number, decimals: number = 0) => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(val);
  };

  // Find the MAS TDSR scenario
  const masScenario = scenarios.find((s) => s.isMasStressTest);

  return (
    <div className="bg-[#0D1527] border border-slate-800 rounded-xl p-5 shadow-xl space-y-6">
      {/* MAS TDSR Regulatory Callout */}
      <div className="bg-gradient-to-r from-amber-950/40 via-[#161B2E] to-slate-900 border border-amber-800/40 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-amber-900/40 border border-amber-700/50 text-amber-400 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">MAS Total Debt Servicing Ratio (TDSR) Benchmark</h3>
              <span className="text-[10px] font-mono uppercase bg-amber-950 text-amber-300 border border-amber-800 px-1.5 py-0.5 rounded">
                Regulatory 4.00% Floor
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Monetary Authority of Singapore (MAS) regulations mandate that banks assess residential property mortgage affordability at a medium-term stress test rate of <strong>at least 4.00% p.a.</strong>
            </p>
          </div>
        </div>

        {masScenario && (
          <div className="bg-[#0B101E] border border-slate-800 rounded-lg px-4 py-2.5 shrink-0 text-right w-full sm:w-auto">
            <div className="text-[10px] text-slate-400 uppercase font-mono">MAS Stressed Monthly Instalment</div>
            <div className="text-lg font-bold font-mono text-amber-400 tabular-nums">
              {formatSgd(masScenario.monthlyPayment)}
            </div>
            <div className="text-[11px] text-amber-300/80 font-mono">
              +{formatSgd(masScenario.monthlyDelta)}/mo (+{((masScenario.monthlyDelta / baseMonthlyPayment) * 100).toFixed(1)}%)
            </div>
          </div>
        )}
      </div>

      {/* Sensitivity Table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Rate Sensitivity & Payment Shock Matrix (Loan S${(inputs.loanAmount / 1000).toFixed(0)}k · {inputs.tenureYears} Yrs)
            </h4>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Bank Spread: +{inputs.bankSpread.toFixed(2)}%
          </span>
        </div>

        <div className="overflow-x-auto border border-slate-800 rounded-lg">
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead className="bg-[#121C33] text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Scenario</th>
                <th className="py-2.5 px-3 text-right">SORA Rate</th>
                <th className="py-2.5 px-3 text-right">Effective Rate</th>
                <th className="py-2.5 px-3 text-right">Monthly Instalment</th>
                <th className="py-2.5 px-3 text-right">Monthly Variance</th>
                <th className="py-2.5 px-3 text-right">Total Interest Paid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 font-mono tabular-nums">
              {scenarios.map((sc, idx) => {
                const isBase = sc.rateDeltaBps === 0 && !sc.isMasStressTest;
                return (
                  <tr
                    key={idx}
                    className={`transition ${
                      sc.isMasStressTest
                        ? 'bg-amber-950/20 hover:bg-amber-950/30 font-semibold'
                        : isBase
                        ? 'bg-emerald-950/30 hover:bg-emerald-950/40 font-semibold'
                        : 'hover:bg-slate-800/30'
                    }`}
                  >
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <span className={sc.isMasStressTest ? 'text-amber-300' : isBase ? 'text-emerald-300' : 'text-slate-200'}>
                          {sc.label}
                        </span>
                        {isBase && (
                          <span className="text-[9px] bg-emerald-900/60 text-emerald-300 border border-emerald-700/60 px-1 rounded">
                            CURRENT
                          </span>
                        )}
                        {sc.isMasStressTest && (
                          <span className="text-[9px] bg-amber-900/60 text-amber-300 border border-amber-700/60 px-1 rounded">
                            REGULATORY
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-300">{sc.soraRate.toFixed(4)}%</td>
                    <td className="py-2.5 px-3 text-right text-slate-100 font-semibold">{sc.effectiveRate.toFixed(4)}%</td>
                    <td className="py-2.5 px-3 text-right font-bold text-white">{formatSgd(sc.monthlyPayment)}</td>
                    <td className="py-2.5 px-3 text-right">
                      {sc.monthlyDelta === 0 ? (
                        <span className="text-slate-400">Baseline</span>
                      ) : sc.monthlyDelta > 0 ? (
                        <span className="text-rose-400 font-medium">+{formatSgd(sc.monthlyDelta)}</span>
                      ) : (
                        <span className="text-emerald-400 font-medium">{formatSgd(sc.monthlyDelta)}</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right text-amber-300/90">{formatSgd(sc.totalInterest)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
