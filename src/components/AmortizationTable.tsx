import React, { useState } from 'react';
import { AmortizationRow, YearlyScheduleRow } from '../types/sora';
import { Download, Calendar, Filter, ChevronLeft, ChevronRight, FileSpreadsheet } from 'lucide-react';

interface AmortizationTableProps {
  monthlySchedule: AmortizationRow[];
  yearlySchedule: YearlyScheduleRow[];
}

export const AmortizationTable: React.FC<AmortizationTableProps> = ({
  monthlySchedule,
  yearlySchedule
}) => {
  const [viewMode, setViewMode] = useState<'yearly' | 'monthly'>('yearly');
  const [page, setPage] = useState(1);
  const rowsPerPage = 24;

  const formatSgd = (val: number) => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD',
      maximumFractionDigits: 2
    }).format(val);
  };

  const formatSgdRound = (val: number) => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Download schedule as CSV
  const handleExportCsv = () => {
    let csvContent = '';
    if (viewMode === 'yearly') {
      csvContent = 'Year,Beginning Balance (SGD),Total Payment (SGD),Principal Paid (SGD),Interest Paid (SGD),Ending Balance (SGD)\n';
      yearlySchedule.forEach((row) => {
        csvContent += `${row.year},"${row.beginningBalance.toFixed(2)}","${row.totalPayment.toFixed(2)}","${row.principalPaid.toFixed(2)}","${row.interestPaid.toFixed(2)}","${row.endingBalance.toFixed(2)}"\n`;
      });
    } else {
      csvContent = 'Month,Date,Beginning Balance (SGD),Monthly Payment (SGD),Principal (SGD),Interest (SGD),Ending Balance (SGD),Cumulative Interest (SGD),Rate Applied (%)\n';
      monthlySchedule.forEach((row) => {
        csvContent += `${row.month},${row.date},"${row.beginningBalance.toFixed(2)}","${row.payment.toFixed(2)}","${row.principal.toFixed(2)}","${row.interest.toFixed(2)}","${row.endingBalance.toFixed(2)}","${row.cumulativeInterest.toFixed(2)}",${row.rateApplied.toFixed(4)}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SORA_Amortization_Schedule_${viewMode}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalMonthlyPages = Math.ceil(monthlySchedule.length / rowsPerPage);
  const displayedMonthlyRows = monthlySchedule.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <div className="bg-[#0D1527] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Table Top Controls */}
      <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-lg">
            <button
              onClick={() => {
                setViewMode('yearly');
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition cursor-pointer ${
                viewMode === 'yearly'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Yearly Summary ({yearlySchedule.length} Years)
            </button>
            <button
              onClick={() => {
                setViewMode('monthly');
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition cursor-pointer ${
                viewMode === 'monthly'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Monthly Breakdown ({monthlySchedule.length} Months)
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-lg transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        {viewMode === 'yearly' ? (
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead className="bg-[#121C33] text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Year</th>
                <th className="py-3 px-4 text-right">Beginning Balance</th>
                <th className="py-3 px-4 text-right">Total Payment</th>
                <th className="py-3 px-4 text-right">Principal Paid</th>
                <th className="py-3 px-4 text-right">Interest Paid</th>
                <th className="py-3 px-4 text-right">Ending Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono tabular-nums">
              {yearlySchedule.map((row) => (
                <tr key={row.year} className="hover:bg-slate-800/30 transition">
                  <td className="py-3 px-4 font-semibold text-slate-200">
                    Year {row.year}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-400">
                    {formatSgdRound(row.beginningBalance)}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-slate-200">
                    {formatSgdRound(row.totalPayment)}
                  </td>
                  <td className="py-3 px-4 text-right text-emerald-400 font-medium">
                    {formatSgdRound(row.principalPaid)}
                  </td>
                  <td className="py-3 px-4 text-right text-amber-300 font-medium">
                    {formatSgdRound(row.interestPaid)}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-slate-100">
                    {formatSgdRound(row.endingBalance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead className="bg-[#121C33] text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Month</th>
                <th className="py-3 px-4">Repayment Date</th>
                <th className="py-3 px-4 text-right">Beginning Balance</th>
                <th className="py-3 px-4 text-right">Instalment</th>
                <th className="py-3 px-4 text-right">Principal</th>
                <th className="py-3 px-4 text-right">Interest</th>
                <th className="py-3 px-4 text-right">Ending Balance</th>
                <th className="py-3 px-4 text-right">Cumul. Interest</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono tabular-nums">
              {displayedMonthlyRows.map((row) => (
                <tr key={row.month} className="hover:bg-slate-800/30 transition">
                  <td className="py-2.5 px-4 font-semibold text-slate-200">
                    M{row.month}
                  </td>
                  <td className="py-2.5 px-4 text-slate-400">
                    {row.date}
                  </td>
                  <td className="py-2.5 px-4 text-right text-slate-400">
                    {formatSgd(row.beginningBalance)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-medium text-slate-100">
                    {formatSgd(row.payment)}
                  </td>
                  <td className="py-2.5 px-4 text-right text-emerald-400">
                    {formatSgd(row.principal)}
                  </td>
                  <td className="py-2.5 px-4 text-right text-amber-300">
                    {formatSgd(row.interest)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-medium text-slate-200">
                    {formatSgd(row.endingBalance)}
                  </td>
                  <td className="py-2.5 px-4 text-right text-slate-400">
                    {formatSgd(row.cumulativeInterest)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination for monthly view */}
      {viewMode === 'monthly' && totalMonthlyPages > 1 && (
        <div className="p-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>
            Showing {(page - 1) * rowsPerPage + 1} to {Math.min(page * rowsPerPage, monthlySchedule.length)} of {monthlySchedule.length} months
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono text-slate-200">
              Page {page} of {totalMonthlyPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalMonthlyPages, p + 1))}
              disabled={page === totalMonthlyPages}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
