import React, { useState, useMemo, useEffect } from 'react';
import {
  DailySoraRate,
  LoanInputs,
  CompoundedRatesSummary,
  LoanCalculationResult
} from './types/sora';
import {
  INITIAL_MAS_SORA_DATA,
  getCompoundedRatesSummary,
  fetchMasRates
} from './services/masRates';
import {
  calculateSoraLoan,
  calculateStressTestScenarios
} from './services/soraCalculator';
import { Header } from './components/Header';
import { LoanInputPanel } from './components/LoanInputPanel';
import { ResultsDashboard } from './components/ResultsDashboard';
import { AmortizationTable } from './components/AmortizationTable';
import { CompoundingAuditView } from './components/CompoundingAuditView';
import { StressTestMatrix } from './components/StressTestMatrix';
import { FixedVsSoraComparison } from './components/FixedVsSoraComparison';
import { BackendIntegrationModal } from './components/BackendIntegrationModal';
import { RatesManagerModal } from './components/RatesManagerModal';
import { FormulaModal } from './components/FormulaModal';
import { Info, ExternalLink, ShieldCheck, ChevronRight } from 'lucide-react';

export default function App() {
  // Rates state
  const [rates, setRates] = useState<DailySoraRate[]>(INITIAL_MAS_SORA_DATA);
  const [customApiUrl, setCustomApiUrl] = useState<string>(() => {
    return localStorage.getItem('mas_sora_custom_api') || '';
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshNotification, setRefreshNotification] = useState<string | null>(null);

  // Loan inputs state
  const [loanInputs, setLoanInputs] = useState<LoanInputs>({
    loanAmount: 800000, // S$800k typical Singapore residential loan
    tenureYears: 25,
    bankSpread: 0.70, // +0.70% p.a.
    benchmarkType: '3M', // 3M Compounded SORA is Singapore market primary
    customBenchmarkRate: 3.25,
    calculationMode: 'monthly_amortization',
    startDate: new Date().toISOString().split('T')[0],
    lookbackDays: 90
  });

  // Active view tab
  const [activeTab, setActiveTab] = useState<'schedule' | 'audit' | 'stress' | 'comparison'>('schedule');

  // Modals state
  const [isFormulaOpen, setIsFormulaOpen] = useState(false);
  const [isBackendGuideOpen, setIsBackendGuideOpen] = useState(false);
  const [isRatesManagerOpen, setIsRatesManagerOpen] = useState(false);

  // Derive rates summary (1M, 3M, 6M, overnight)
  const ratesSummary: CompoundedRatesSummary = useMemo(() => {
    return getCompoundedRatesSummary(rates);
  }, [rates]);

  // Main loan calculation result
  const loanResult: LoanCalculationResult = useMemo(() => {
    return calculateSoraLoan(loanInputs, rates);
  }, [loanInputs, rates]);

  // Stress test scenarios
  const stressScenarios = useMemo(() => {
    return calculateStressTestScenarios(loanInputs, loanResult.benchmarkRate);
  }, [loanInputs, loanResult.benchmarkRate]);

  // Handle inputs update
  const handleInputChange = (partial: Partial<LoanInputs>) => {
    setLoanInputs((prev) => ({ ...prev, ...partial }));
  };

  // Sync / refresh rates with MAS or backend
  const handleRefreshRates = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetchMasRates(customApiUrl);
      if (res.data && res.data.length > 0) {
        setRates(res.data);
      }
      setRefreshNotification(res.message);
      setTimeout(() => setRefreshNotification(null), 4000);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Test custom backend endpoint
  const handleTestBackendConnection = async (url: string) => {
    try {
      const res = await fetchMasRates(url);
      if (res.success && res.data.length > 0) {
        setRates(res.data);
        return { success: true, message: `Connected! Loaded ${res.data.length} rates from endpoint.` };
      }
      return { success: false, message: res.message || 'Endpoint returned no rates.' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Connection failed.' };
    }
  };

  const handleSaveCustomApiUrl = (url: string) => {
    setCustomApiUrl(url);
    localStorage.setItem('mas_sora_custom_api', url);
  };

  return (
    <div className="min-h-screen bg-[#080D1A] text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <Header
        summary={ratesSummary}
        onOpenFormula={() => setIsFormulaOpen(true)}
        onOpenBackendGuide={() => setIsBackendGuideOpen(true)}
        onOpenRatesManager={() => setIsRatesManagerOpen(true)}
        onRefreshRates={handleRefreshRates}
        isRefreshing={isRefreshing}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Toast / Notification Banner */}
        {refreshNotification && (
          <div className="bg-emerald-950/70 border border-emerald-700/80 rounded-xl p-3 flex items-center justify-between text-xs text-emerald-300 font-mono animate-fade-in shadow-lg">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>{refreshNotification}</span>
            </div>
            <button
              onClick={() => setRefreshNotification(null)}
              className="text-emerald-400 hover:text-white cursor-pointer px-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Top Split Layout: Inputs & Results */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Loan Input Parameters (5 columns on desktop) */}
          <div className="lg:col-span-5">
            <LoanInputPanel
              inputs={loanInputs}
              ratesSummary={ratesSummary}
              onChange={handleInputChange}
            />
          </div>

          {/* Right Column: Dynamic Results & Visual Summary (7 columns on desktop) */}
          <div className="lg:col-span-7 space-y-6">
            <ResultsDashboard
              result={loanResult}
              inputs={loanInputs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />

            {/* Tab Views */}
            {activeTab === 'schedule' && (
              <AmortizationTable
                monthlySchedule={loanResult.amortizationSchedule}
                yearlySchedule={loanResult.yearlySchedule}
              />
            )}

            {activeTab === 'audit' && (
              <CompoundingAuditView audit={loanResult.compoundingAudit} />
            )}

            {activeTab === 'stress' && (
              <StressTestMatrix
                scenarios={stressScenarios}
                inputs={loanInputs}
                baseMonthlyPayment={loanResult.monthlyPayment}
              />
            )}

            {activeTab === 'comparison' && (
              <FixedVsSoraComparison
                soraResult={loanResult}
                inputs={loanInputs}
              />
            )}
          </div>
        </div>

        {/* Information & Methodology Footer Accordion */}
        <div className="border-t border-slate-800/80 pt-6 mt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-400">
            <div className="bg-[#0D1527]/60 border border-slate-800/60 p-4 rounded-xl">
              <h4 className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                MAS SORA Governance
              </h4>
              <p className="leading-relaxed">
                Administered by the Monetary Authority of Singapore (MAS). Published at 9:00am SGT on each Singapore business day based on actual volume-weighted unsecured overnight SGD interbank transactions.
              </p>
            </div>

            <div className="bg-[#0D1527]/60 border border-slate-800/60 p-4 rounded-xl">
              <h4 className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                ACT/365 Calculation Standard
              </h4>
              <p className="leading-relaxed">
                Interest conforms strictly to the Singapore money market convention: Actual days divided by 365 days. Friday rates compound across 3 calendar days (weekend weighting).
              </p>
            </div>

            <div className="bg-[#0D1527]/60 border border-slate-800/60 p-4 rounded-xl">
              <h4 className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                Backend Integration Ready
              </h4>
              <p className="leading-relaxed">
                Built with a plug-and-play architecture. Configure your backend endpoint URL in the Backend Integration panel when ready, or use the embedded verified MAS historical series.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <FormulaModal
        isOpen={isFormulaOpen}
        onClose={() => setIsFormulaOpen(false)}
      />

      <BackendIntegrationModal
        isOpen={isBackendGuideOpen}
        onClose={() => setIsBackendGuideOpen(false)}
        customApiUrl={customApiUrl}
        onSaveCustomApiUrl={handleSaveCustomApiUrl}
        onTestConnection={handleTestBackendConnection}
      />

      <RatesManagerModal
        isOpen={isRatesManagerOpen}
        onClose={() => setIsRatesManagerOpen(false)}
        rates={rates}
        onUpdateRates={setRates}
      />
    </div>
  );
}
