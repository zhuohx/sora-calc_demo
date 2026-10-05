import React from 'react';
import { X, BookOpen, CheckCircle, Info, Landmark, HelpCircle } from 'lucide-react';

interface FormulaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FormulaModal: React.FC<FormulaModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0D1527] border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-400">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">MAS SORA Calculation Standards</h2>
              <p className="text-xs text-slate-400">
                Monetary Authority of Singapore (MAS) and ABS/SFG Compounding Framework
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-300 leading-relaxed">
          {/* Section 1: What is SORA? */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-1.5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              1. What is SORA?
            </h3>
            <p>
              The <strong>Singapore Overnight Rate Average (SORA)</strong> is the volume-weighted average rate of unsecured overnight SGD interbank transactions brokered in Singapore between 8:00am and 6:15pm. It is administered and published daily by the Monetary Authority of Singapore (MAS) at 9:00am SGT on the following business day. SORA replaced SOR and SIBOR as Singapore's key financial benchmark.
            </p>
          </div>

          {/* Section 2: Compounded SORA Formula */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-1.5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              2. Compounded SORA Formula (ACT/365)
            </h3>
            <p className="mb-2">
              For consumer mortgages and business facilities, retail banks in Singapore (DBS, OCBC, UOB, Standard Chartered, HSBC, etc.) benchmark against <strong>Compounded SORA</strong>. The official MAS compounding formula is:
            </p>

            <div className="bg-[#121C33] border border-slate-800 rounded-lg p-3.5 font-mono text-center my-3 text-emerald-300 text-xs sm:text-sm">
              Compounded SORA = &Biggl[ &prod;<sub>i=1</sub><sup>d<sub>0</sub></sup> &Bigl( 1 + <span className="inline-flex flex-col text-[11px] align-middle mx-1"><span className="border-b border-emerald-400/60 pb-0.5">r<sub>i</sub> &times; n<sub>i</sub></span><span>365</span></span> &Bigr) &minus; 1 &Biggr] &times; <span className="inline-flex flex-col text-[11px] align-middle mx-1"><span className="border-b border-emerald-400/60 pb-0.5">365</span><span>d</span></span> &times; 100%
            </div>

            <div className="space-y-1.5 pl-2 border-l-2 border-emerald-500/40">
              <div><strong className="text-white font-mono">d₀</strong>: The number of Singapore business days in the calculation period.</div>
              <div><strong className="text-white font-mono">rᵢ</strong>: The published daily SORA rate for business day <em>i</em>.</div>
              <div><strong className="text-white font-mono">nᵢ</strong>: The number of calendar days for which rate <em>rᵢ</em> applies (e.g., 1 day for Monday through Thursday, 3 days for Friday over the weekend).</div>
              <div><strong className="text-white font-mono">d</strong>: The total number of calendar days in the calculation period (<span className="font-mono">&sum; nᵢ</span>).</div>
              <div><strong className="text-white font-mono">365</strong>: Singapore money market day count convention is strictly <strong>Actual/365 (ACT/365)</strong>.</div>
            </div>
          </div>

          {/* Section 3: Compounded in Advance vs Compounded in Arrears */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-1.5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              3. Compounded in Advance vs Compounded in Arrears
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              <div className="bg-[#121C33] p-3 rounded-lg border border-slate-800">
                <div className="font-semibold text-white mb-1">Compounded in Advance</div>
                <p className="text-[11px] text-slate-300">
                  Rate is observed over the preceding 30, 90, or 180 days and fixed at the start of each interest cycle. The borrower knows their exact instalment amount before the payment period begins.
                </p>
              </div>
              <div className="bg-[#121C33] p-3 rounded-lg border border-slate-800">
                <div className="font-semibold text-white mb-1">Compounded in Arrears</div>
                <p className="text-[11px] text-slate-300">
                  Rate is calculated daily across the active interest period (typically with a 2 to 5 business day backward shift for payment settlement). Common in corporate treasury and commercial lines.
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Singapore Bank Margin */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-1.5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              4. Total Loan Interest Rate
            </h3>
            <p>
              Total Interest Rate = <strong className="text-emerald-300">Compounded SORA</strong> + <strong className="text-cyan-300">Bank Margin (Spread)</strong>.
              For example, 3M SORA of 3.25% + 0.65% bank margin = 3.90% p.a. effective interest.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition cursor-pointer"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
