import React from 'react';
import { Console, HistorySession, Settings } from '../types';
import { formatCurrency, formatFullDateTime } from '../utils/formatters';
import { FileSpreadsheet, Trash2, Eye, CheckCircle2, Search } from 'lucide-react';

interface HistoryViewProps {
  consoles: Console[];
  history: HistorySession[];
  settings: Settings;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  consoleFilter: string;
  onConsoleFilterChange: (c: string) => void;
  dateFilter: string;
  onDateFilterChange: (d: string) => void;
  statusFilter: string;
  onStatusFilterChange: (s: string) => void;
  onViewInvoice: (session: HistorySession) => void;
  onTogglePaymentStatus: (id: string) => void;
  onDeleteHistoryRecord: (id: string) => void;
  onExportCSV: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  consoles,
  history,
  settings,
  searchQuery,
  onSearchChange,
  consoleFilter,
  onConsoleFilterChange,
  dateFilter,
  onDateFilterChange,
  statusFilter,
  onStatusFilterChange,
  onViewInvoice,
  onTogglePaymentStatus,
  onDeleteHistoryRecord,
  onExportCSV,
}) => {
  const getConsoleName = (consoleId: string) => {
    const c = consoles.find((item) => item.id === consoleId);
    return c ? `${c.name} ${c.stationNumber}` : 'Unknown Console';
  };

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <h2 className="font-bold text-[18px]">
          History & Billing • {history.length} Records
        </h2>

        <div className="flex flex-wrap gap-2 items-center">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search customer, invoice, console..."
              className={`h-10 pl-9 pr-3 w-[220px] rounded-xl border text-[13px] outline-none transition ${
                settings.darkMode
                  ? 'bg-[#111d33] border-white/10 text-white placeholder-white/40 focus:border-[#2563eb]'
                  : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#2563eb]'
              }`}
            />
          </div>

          {/* Console Filter */}
          <select
            value={consoleFilter}
            onChange={(e) => onConsoleFilterChange(e.target.value)}
            className={`h-10 rounded-xl border px-3 text-[12px] font-medium outline-none transition ${
              settings.darkMode
                ? 'bg-[#111d33] border-white/10 text-white'
                : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <option value="all">All Consoles</option>
            {consoles.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.stationNumber}
              </option>
            ))}
          </select>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => onDateFilterChange(e.target.value)}
            className={`h-10 rounded-xl border px-3 text-[12px] font-medium outline-none transition ${
              settings.darkMode
                ? 'bg-[#111d33] border-white/10 text-white'
                : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="week">Last 7 days</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className={`h-10 rounded-xl border px-3 text-[12px] font-medium outline-none transition ${
              settings.darkMode
                ? 'bg-[#111d33] border-white/10 text-white'
                : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="expired">Expired</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
          </select>

          {/* Export CSV Button */}
          <button
            onClick={onExportCSV}
            className="h-10 px-4 rounded-xl bg-slate-900 dark:bg-white/20 hover:bg-black text-white text-[12px] font-medium flex items-center gap-1.5 transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* History Table */}
      <div
        className={`rounded-2xl border overflow-hidden shadow-sm ${
          settings.darkMode ? 'bg-[#111d33] border-white/10' : 'bg-white border-slate-200'
        }`}
      >
        <div className="overflow-auto scrollbar">
          <table className="w-full text-[12px]">
            <thead
              className={`text-[11px] uppercase tracking-wide border-b border-black/5 dark:border-white/10 ${
                settings.darkMode ? 'bg-white/5 text-white/60' : 'bg-slate-50 text-slate-500'
              }`}
            >
              <tr>
                <th className="text-left p-3.5 font-semibold">Invoice #</th>
                <th className="text-left p-3.5 font-semibold">Customer</th>
                <th className="text-left p-3.5 font-semibold">Console</th>
                <th className="text-left p-3.5 font-semibold">Start / End</th>
                <th className="text-left p-3.5 font-semibold">Duration</th>
                <th className="text-left p-3.5 font-semibold">Charges</th>
                <th className="text-left p-3.5 font-semibold">Payment</th>
                <th className="text-left p-3.5 font-semibold">Status</th>
                <th className="text-left p-3.5 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center opacity-60">
                    No records found matching filters.
                  </td>
                </tr>
              ) : (
                history.map((record) => (
                  <tr
                    key={record.id}
                    className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition"
                  >
                    <td className="p-3.5 font-mono font-bold text-[#2563eb]">
                      {record.invoiceNo}
                    </td>

                    <td className="p-3.5">
                      <div className="font-semibold text-[13px]">{record.customerName}</div>
                      <div className="text-[11px] opacity-60">{record.phone || 'No phone'}</div>
                    </td>

                    <td className="p-3.5 font-medium">
                      {getConsoleName(record.consoleId)}
                    </td>

                    <td className="p-3.5 text-[11px]">
                      <div>{formatFullDateTime(record.startAt)}</div>
                      <div className="opacity-60">{formatFullDateTime(record.completedAt)}</div>
                    </td>

                    <td className="p-3.5">
                      <span className="font-medium">
                        {Math.round(record.totalDurationSec / 60)}m
                      </span>{' '}
                      {record.addedDurationSec > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 font-bold ml-1">
                          +{Math.round(record.addedDurationSec / 60)}m
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 font-bold text-[13px]">
                      {formatCurrency(record.totalPrice)}
                    </td>

                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          record.paymentStatus === 'Paid'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                        }`}
                      >
                        {record.paymentStatus} • {record.paymentMethod}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          record.status === 'expired'
                            ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400'
                            : 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-white/80'
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onViewInvoice(record)}
                          className="h-8 px-2.5 rounded-lg bg-[#2563eb] text-white text-[11px] font-medium flex items-center gap-1 hover:bg-blue-600 transition"
                          title="View Invoice"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>

                        <button
                          onClick={() => onTogglePaymentStatus(record.id)}
                          className="h-8 px-2.5 rounded-lg border text-[11px] font-medium flex items-center gap-1 hover:bg-slate-50 dark:hover:bg-white/10 transition"
                          title="Toggle Paid/Pending"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{record.paymentStatus === 'Paid' ? 'Mark Pending' : 'Mark Paid'}</span>
                        </button>

                        <button
                          onClick={() => {
                            if (confirm('Delete history record?')) {
                              onDeleteHistoryRecord(record.id);
                            }
                          }}
                          className="h-8 w-8 rounded-lg border border-red-200 text-red-600 dark:border-red-900/50 dark:text-red-400 grid place-items-center hover:bg-red-50 dark:hover:bg-red-950/50 transition"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
