import React, { useState } from 'react';
import { CompoundingAuditSummary, CompoundingAuditRow } from '../types/sora';
import { Calculator, CheckCircle2, Info, ChevronDown, ChevronUp, FileCode } from 'lucide-react';

interface CompoundingAuditViewProps {
  audit: CompoundingAuditSummary;
}

export const CompoundingAuditView: React.FC<CompoundingAuditViewProps> = ({ audit }) => {
  const [showFullTable, setShowFullTable] = useState(false);

  // If no rows, display informative fallback
  if (!audit || audit.rows.length === 0) {
    return (
      <div className="bg-[#0D1527] border border-slate-800 rounded-xl p-6 text-center text-slate-400">
        <Info className="w-8 h-8 mx-auto mb-2 text-slate-500" />
        <p className="text-sm">No daily rate observation records loaded for this benchmark mode.</p>
      </div>
    );
  }

  const displayedRows = showFullTable ? audit.rows : audit.rows.slice(0, 12);

  return (
    <div className="bg-[#0D1527] border border-slate-800 rounded-xl p-5 shadow-xl space-y-6">
      {/* Title & Official Formula Card */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-emerald-400" />
            <h3 className="text-base font-semibold text-white">MAS Compounded SORA Calculation Audit</h3>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded">
            MAS ACT/365 Standard Formula
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed max-w-3xl mb-4">
          The Monetary Authority of Singapore (MAS) specifies the Compounded SORA methodology based on daily backward-looking observation.
          Daily overnight rates are compounded geometrically with day counts weighted by calendar days <span className="font-mono text-cyan-300">n_i</span> to accurately account for weekends and Singapore public holidays.
        </p>

        {/* Mathematical Formula Visual Block */}
        <div className="bg-[#121C33] border border-slate-800 rounded-lg p-4 font-mono text-center">
          <div className="text-xs text-slate-400 mb-2 uppercase tracking-wider font-sans">
            Official MAS Compounding Formula
          </div>
          <div className="text-base sm:text-lg font-semibold text-emerald-300 tracking-wide">
            Compounded SORA = &Biggl[ &prod;<sub>i=1</sub><sup>d<sub>0</sub></sup> &Bigl( 1 + <span className="inline-flex flex-col text-xs align-middle mx-1"><span className="border-b border-emerald-400/60 pb-0.5">r<sub>i</sub> &times; n<sub>i</sub></span><span>365</span></span> &Bigr) &minus; 1 &Biggr] &times; <span className="inline-flex flex-col text-xs align-middle mx-1"><span className="border-b border-emerald-400/60 pb-0.5">365</span><span>d</span></span> &times; 100%
          </div>
        </div>
      </div>

      {/* Variables Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#121C33]/60 border border-slate-800/80 p-3 rounded-lg">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Business Days (d₀)</div>
          <div className="text-xl font-bold font-mono text-white mt-1 tabular-nums">
            {audit.d0} <span className="text-xs font-normal text-slate-400">days</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Number of MAS published rates</div>
        </div>

        <div className="bg-[#121C33]/60 border border-slate-800/80 p-3 rounded-lg">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Calendar Days (d)</div>
          <div className="text-xl font-bold font-mono text-white mt-1 tabular-nums">
            {audit.d} <span className="text-xs font-normal text-slate-400">days</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">&sum; n_i total weighted span</div>
        </div>

        <div className="bg-[#121C33]/60 border border-slate-800/80 p-3 rounded-lg">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Product Factor (&prod; - 1)</div>
          <div className="text-xl font-bold font-mono text-cyan-300 mt-1 tabular-nums">
            {audit.productFactor.toFixed(6)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Compounded capital growth</div>
        </div>

        <div className="bg-emerald-950/30 border border-emerald-800/60 p-3 rounded-lg">
          <div className="text-[10px] text-emerald-400 uppercase tracking-wider font-mono">Resulting SORA</div>
          <div className="text-xl font-bold font-mono text-emerald-300 mt-1 tabular-nums">
            {audit.annualizedCompoundedRate.toFixed(4)}%
          </div>
          <div className="text-[10px] text-emerald-400/80 mt-1">Annualized (ACT/365)</div>
        </div>
      </div>

      {/* Step-by-Step Daily Calculation Audit Table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Step-by-Step Daily Compounding Factor Log ({audit.rows.length} Business Days)
            </h4>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {showFullTable ? `Showing all ${audit.rows.length}` : `Showing first 12 of ${audit.rows.length}`}
          </span>
        </div>

        <div className="overflow-x-auto border border-slate-800 rounded-lg">
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead className="bg-[#121C33] text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Day i</th>
                <th className="py-2.5 px-3">Business Date</th>
                <th className="py-2.5 px-3 text-right">Published SORA (r_i)</th>
                <th className="py-2.5 px-3 text-right">Weight (n_i days)</th>
                <th className="py-2.5 px-3 text-right">Daily Compounding Factor [1 + (r_i&times;n_i)/365]</th>
                <th className="py-2.5 px-3 text-right">Cumulative &prod;</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 font-mono tabular-nums">
              {displayedRows.map((row) => (
                <tr key={row.dayIndex} className="hover:bg-slate-800/30 transition">
                  <td className="py-2 px-3 text-slate-400">i={row.dayIndex}</td>
                  <td className="py-2 px-3 font-medium text-slate-200">{row.businessDate}</td>
                  <td className="py-2 px-3 text-right text-emerald-300 font-semibold">{row.rate.toFixed(4)}%</td>
                  <td className="py-2 px-3 text-right">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                      row.calendarDays > 1 ? 'bg-amber-950/60 text-amber-300 border border-amber-800/50' : 'text-slate-400'
                    }`}>
                      {row.calendarDays} {row.calendarDays > 1 ? 'days (weekend)' : 'day'}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right text-slate-200">{row.compoundingFactor.toFixed(8)}</td>
                  <td className="py-2 px-3 text-right text-cyan-300 font-medium">{row.runningProduct.toFixed(8)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {audit.rows.length > 12 && (
          <div className="mt-3 text-center">
            <button
              onClick={() => setShowFullTable(!showFullTable)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition cursor-pointer"
            >
              {showFullTable ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                  <span>Collapse table to first 12 entries</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Expand all {audit.rows.length} calculation rows</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
