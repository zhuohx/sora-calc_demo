import React, { useState } from 'react';
import { DailySoraRate } from '../types/sora';
import { X, Upload, Download, Plus, RotateCcw, Search, Check, AlertCircle, Database } from 'lucide-react';
import { exportRatesToCsv, parseRatesFromCsv, INITIAL_MAS_SORA_DATA } from '../services/masRates';

interface RatesManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  rates: DailySoraRate[];
  onUpdateRates: (updatedRates: DailySoraRate[]) => void;
}

export const RatesManagerModal: React.FC<RatesManagerModalProps> = ({
  isOpen,
  onClose,
  rates,
  onUpdateRates
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newRate, setNewRate] = useState<number>(3.25);
  const [newVolume, setNewVolume] = useState<number>(4000);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredRates = rates.filter((r) => r.date.includes(searchTerm));

  const handleAddRate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate || isNaN(newRate)) return;

    // Check if date already exists
    const existingIdx = rates.findIndex((r) => r.date === newDate);
    let updated: DailySoraRate[];

    if (existingIdx >= 0) {
      updated = [...rates];
      updated[existingIdx] = {
        date: newDate,
        rate: newRate,
        volumeSgdMillion: newVolume || undefined
      };
      setFeedback(`Updated existing rate for ${newDate} to ${newRate.toFixed(4)}%`);
    } else {
      updated = [
        {
          date: newDate,
          rate: newRate,
          volumeSgdMillion: newVolume || undefined
        },
        ...rates
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setFeedback(`Added new SORA rate for ${newDate} (${newRate.toFixed(4)}%)`);
    }

    onUpdateRates(updated);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseRatesFromCsv(text);
      if (parsed.length > 0) {
        onUpdateRates(parsed);
        setFeedback(`Successfully imported ${parsed.length} rates from CSV.`);
      } else {
        setFeedback('Failed to parse CSV. Ensure format is: Date, SORA Rate (%), Volume (optional)');
      }
      setTimeout(() => setFeedback(null), 3500);
    };
    reader.readAsText(file);
  };

  const handleDownloadCsv = () => {
    const csv = exportRatesToCsv(rates);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MAS_SORA_Rates_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleResetToDefault = () => {
    if (confirm('Reset rate history to default verified MAS dataset?')) {
      onUpdateRates(INITIAL_MAS_SORA_DATA);
      setFeedback('Reset to default MAS historical rates.');
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0D1527] border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">MAS Daily SORA Rates Dataset</h2>
              <p className="text-xs text-slate-400">
                Inspect, modify, upload, or export overnight rates used in compound interest calculations
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
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-300">
          {/* Feedback banner */}
          {feedback && (
            <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-700 text-emerald-300 flex items-center gap-2 font-mono">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{feedback}</span>
            </div>
          )}

          {/* Add / Override Rate Form */}
          <form
            onSubmit={handleAddRate}
            className="bg-[#121C33] border border-slate-800 rounded-xl p-4 flex flex-wrap items-end gap-3"
          >
            <div className="flex-1 min-w-[140px]">
              <label className="text-[11px] font-medium text-slate-300 mb-1 block">Date (Singapore)</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                required
                className="w-full bg-[#0D1527] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="w-32">
              <label className="text-[11px] font-medium text-slate-300 mb-1 block">SORA Rate (% p.a.)</label>
              <input
                type="number"
                step="0.0001"
                min="0"
                max="25"
                value={newRate}
                onChange={(e) => setNewRate(parseFloat(e.target.value) || 0)}
                required
                placeholder="3.2500"
                className="w-full bg-[#0D1527] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-emerald-300 text-right focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="w-36">
              <label className="text-[11px] font-medium text-slate-300 mb-1 block">Volume (S$ Million)</label>
              <input
                type="number"
                step="10"
                min="0"
                value={newVolume}
                onChange={(e) => setNewVolume(parseFloat(e.target.value) || 0)}
                placeholder="4200"
                className="w-full bg-[#0D1527] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white text-right focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Save Entry</span>
            </button>
          </form>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter by date (e.g. 2026-09)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#121C33] border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-slate-700"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 cursor-pointer transition">
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                <span>Upload CSV</span>
                <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
              </label>

              <button
                onClick={handleDownloadCsv}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 cursor-pointer transition"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={handleResetToDefault}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 cursor-pointer transition"
                title="Reset to MAS Default Dataset"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-slate-800 rounded-lg max-h-72">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead className="bg-[#121C33] sticky top-0 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-right">Published SORA Rate</th>
                  <th className="py-2.5 px-3 text-right">Volume (S$ Million)</th>
                  <th className="py-2.5 px-3 text-center">Day of Week</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 font-mono tabular-nums">
                {filteredRates.map((r) => {
                  const d = new Date(r.date);
                  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                  const dayName = days[d.getUTCDay()];
                  const isFriday = d.getUTCDay() === 5;

                  return (
                    <tr key={r.date} className="hover:bg-slate-800/30 transition">
                      <td className="py-2 px-3 font-medium text-slate-200">{r.date}</td>
                      <td className="py-2 px-3 text-right font-semibold text-emerald-300">
                        {r.rate.toFixed(4)}%
                      </td>
                      <td className="py-2 px-3 text-right text-slate-400">
                        {r.volumeSgdMillion ? `S$${r.volumeSgdMillion.toLocaleString()}M` : '—'}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                          isFriday ? 'bg-amber-950/60 text-amber-300 border border-amber-800/50' : 'text-slate-400'
                        }`}>
                          {dayName} {isFriday ? '(3d weight)' : ''}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            {rates.length} total rate records loaded
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
