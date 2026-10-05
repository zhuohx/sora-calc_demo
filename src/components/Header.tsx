import React from 'react';
import { CompoundedRatesSummary } from '../types/sora';
import { Landmark, ArrowUpRight, Code, Database, Sparkles, BookOpen, RefreshCw } from 'lucide-react';

interface HeaderProps {
  summary: CompoundedRatesSummary;
  onOpenFormula: () => void;
  onOpenBackendGuide: () => void;
  onOpenRatesManager: () => void;
  onRefreshRates: () => void;
  isRefreshing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  summary,
  onOpenFormula,
  onOpenBackendGuide,
  onOpenRatesManager,
  onRefreshRates,
  isRefreshing
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-[#080D1A]/90 backdrop-blur-md sticky top-0 z-30">
      {/* Top Banner / Ticker */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-y-2 border-b border-slate-800/50 text-xs">
        <div className="flex items-center gap-3 text-slate-400">
          <div className="flex items-center gap-1.5 font-medium text-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>MAS Official Benchmark</span>
          </div>
          <span className="text-slate-700">|</span>
          <span>Day-Count: <strong className="text-slate-300">ACT/365 (Singapore Standard)</strong></span>
          <span className="text-slate-700 hidden sm:inline">|</span>
          <span className="hidden sm:inline">Published Daily ~9:00 AM SGT</span>
          <span className="text-slate-700 hidden md:inline">|</span>
          <span className="hidden md:inline">As of {summary.lastPublishedDate}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefreshRates}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-2.5 py-1 text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/60 rounded text-xs transition cursor-pointer"
            title="Refresh latest MAS SORA rates"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            <span>{isRefreshing ? 'Checking...' : 'Sync Rates'}</span>
          </button>

          <button
            onClick={onOpenBackendGuide}
            className="flex items-center gap-1 px-2.5 py-1 text-slate-300 hover:text-white bg-slate-800/40 hover:bg-slate-800 border border-slate-700/40 rounded text-xs transition cursor-pointer"
          >
            <Code className="w-3 h-3 text-cyan-400" />
            <span>Backend Integration</span>
          </button>
        </div>
      </div>

      {/* Main Header Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 via-cyan-500/10 to-transparent border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-tight">Singapore SORA Calculator</h1>
                <span className="px-2 py-0.5 text-[10px] uppercase font-mono font-semibold tracking-wider text-emerald-300 bg-emerald-950/60 border border-emerald-800/60 rounded">
                  MAS ACT/365
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Institutional interest & mortgage amortization engine for Singapore Overnight Rate Average benchmarks
              </p>
            </div>
          </div>

          {/* Quick Rate Metrics Cards */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <div className="bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-lg flex flex-col min-w-[100px]">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Overnight SORA</span>
              <span className="text-sm font-semibold font-mono tabular-nums text-slate-100">
                {summary.overnightSora.toFixed(4)}%
              </span>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-lg flex flex-col min-w-[100px]">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">1M SORA</span>
              <span className="text-sm font-semibold font-mono tabular-nums text-slate-200">
                {summary.compounded1M.toFixed(4)}%
              </span>
            </div>

            <div className="bg-emerald-950/30 border border-emerald-800/40 px-3.5 py-1.5 rounded-lg flex flex-col min-w-[110px]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-emerald-400 uppercase font-medium tracking-wider">3M SORA</span>
                <span className="text-[9px] text-emerald-300/80 bg-emerald-900/50 px-1 rounded">Primary</span>
              </div>
              <span className="text-sm font-bold font-mono tabular-nums text-emerald-300">
                {summary.compounded3M.toFixed(4)}%
              </span>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-lg flex flex-col min-w-[100px]">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">6M SORA</span>
              <span className="text-sm font-semibold font-mono tabular-nums text-slate-200">
                {summary.compounded6M.toFixed(4)}%
              </span>
            </div>

            <button
              onClick={onOpenFormula}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700 rounded-lg transition shrink-0 cursor-pointer"
              title="Inspect MAS Compounding Formula"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>MAS Formula</span>
            </button>

            <button
              onClick={onOpenRatesManager}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700 rounded-lg transition shrink-0 cursor-pointer"
              title="View & Edit MAS Daily Rate Series"
            >
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span>Rates Data</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
