import React from 'react';
import { Console, HistorySession, Settings } from '../types';
import { formatCurrency, formatFullDateTime } from '../utils/formatters';
import { X, Printer, CheckCircle } from 'lucide-react';

interface InvoiceModalProps {
  session: HistorySession;
  consoles: Console[];
  settings: Settings;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  session,
  consoles,
  settings,
  onClose,
}) => {
  const consoleObj = consoles.find((c) => c.id === session.consoleId);
  const consoleTitle = consoleObj
    ? `${consoleObj.name} ${consoleObj.stationNumber}`
    : 'Gaming Station';

  const origMins = Math.round(session.originalDurationSec / 60);
  const addMins = Math.round(session.addedDurationSec / 60);
  const totalMins = Math.round(session.totalDurationSec / 60);

  const subtotal = session.totalPrice;
  const tax = Math.round((subtotal * settings.taxPercent) / 100);
  const discount = Math.round((subtotal * settings.discountPercent) / 100);
  const grandTotal = subtotal + tax - discount;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs no-print"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        className={`relative w-full max-w-[560px] rounded-[20px] border shadow-2xl overflow-hidden transition-colors ${
          settings.darkMode ? 'bg-[#111d33] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="p-6 print-area" id="invoice-print">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <div className="font-bold text-[18px]">
                {settings.businessName || 'GameHub Pro'}
              </div>
              <div className="text-[11px] opacity-70 mt-1 leading-relaxed">
                {settings.address}
                <br />
                Phone: {settings.phone}
              </div>
            </div>

            <div className="text-right">
              <div className="font-mono font-bold text-[14px] text-[#2563eb]">
                {session.invoiceNo}
              </div>
              <div
                className={`text-[11px] px-2.5 py-0.5 rounded-full mt-1 inline-block font-bold ${
                  session.paymentStatus === 'Paid'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                }`}
              >
                {session.paymentStatus} • {session.paymentMethod}
              </div>
            </div>
          </div>

          {/* Customer & Session Information */}
          <div className="mt-6 grid grid-cols-2 gap-4 text-[12px] pt-4 border-t border-black/5 dark:border-white/10">
            <div>
              <div className="opacity-60 text-[11px] font-semibold uppercase tracking-wider">
                BILL TO
              </div>
              <div className="font-bold text-[13px] mt-1">{session.customerName}</div>
              <div className="opacity-70">{session.phone || 'No phone'}</div>
            </div>

            <div className="text-right">
              <div className="opacity-60 text-[11px] font-semibold uppercase tracking-wider">
                STATION & TIMINGS
              </div>
              <div className="font-bold text-[13px] mt-1">{consoleTitle}</div>
              <div className="opacity-70 text-[11px] mt-0.5">
                {formatFullDateTime(session.startAt)}
                <br />
                to {formatFullDateTime(session.completedAt)}
              </div>
            </div>
          </div>

          {/* Billing Breakdown Table / Box */}
          <div
            className={`mt-6 rounded-xl border p-4 space-y-2 ${
              settings.darkMode ? 'border-white/10 bg-white/5' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex justify-between text-[12px]">
              <span>Base Session ({origMins} mins)</span>
              <span className="font-medium">{formatCurrency(session.price)}</span>
            </div>

            {addMins > 0 && (
              <div className="flex justify-between text-[12px]">
                <span>Time Extensions (+{addMins} mins)</span>
                <span className="font-medium">+{formatCurrency(session.totalPrice - session.price)}</span>
              </div>
            )}

            <div className="flex justify-between text-[12px] pt-2 border-t border-black/5 dark:border-white/10">
              <span className="font-medium">Subtotal ({totalMins} mins total)</span>
              <span className="font-semibold">{formatCurrency(subtotal)}</span>
            </div>

            {settings.taxPercent > 0 && (
              <div className="flex justify-between text-[11px] opacity-70">
                <span>Tax ({settings.taxPercent}%)</span>
                <span>+{formatCurrency(tax)}</span>
              </div>
            )}

            {settings.discountPercent > 0 && (
              <div className="flex justify-between text-[11px] opacity-70">
                <span>Discount ({settings.discountPercent}%)</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            )}

            <div className="flex justify-between font-bold text-[16px] pt-2.5 border-t border-black/5 dark:border-white/10 text-[#2563eb]">
              <span>Grand Total</span>
              <span>{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-5 text-[11px] opacity-60 text-center italic">
            {settings.billFooter || 'Thank you for gaming with us! Visit again.'}
          </div>
        </div>

        {/* Modal Buttons (Hidden during printing) */}
        <div className="p-4 flex gap-2 no-print border-t border-black/5 dark:border-white/10 bg-slate-50 dark:bg-black/20">
          <button
            onClick={handlePrint}
            className="flex-1 h-11 rounded-xl bg-[#2563eb] text-white font-semibold text-[13px] flex items-center justify-center gap-1.5 hover:bg-blue-600 transition shadow-md shadow-blue-500/20"
          >
            <Printer className="w-4 h-4" />
            <span>Print Invoice</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 h-11 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/10 text-slate-700 dark:text-white text-[13px] font-medium hover:bg-slate-50 dark:hover:bg-white/20 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
