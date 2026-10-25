import React from 'react';
import { Customer, Settings } from '../types';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import { History, Phone, UserCheck } from 'lucide-react';

interface CustomersViewProps {
  customers: Customer[];
  settings: Settings;
  onFilterHistoryByCustomer: (customerName: string) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  settings,
  onFilterHistoryByCustomer,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-[18px]">
          Customers • {customers.length} Unique Guests
        </h2>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {customers.map((c) => (
          <div
            key={c.name}
            className={`rounded-2xl border p-4 flex flex-col justify-between transition ${
              settings.darkMode
                ? 'bg-[#111d33] border-white/10'
                : 'bg-white border-slate-200'
            }`}
          >
            <div>
              <div className="flex justify-between items-start">
                <div className="font-bold text-[15px]">{c.name}</div>
                <span
                  className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold ${
                    settings.darkMode ? 'bg-white/10 text-white/80' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {c.visits} {c.visits === 1 ? 'visit' : 'visits'}
                </span>
              </div>

              <div className="text-[12px] opacity-70 mt-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 opacity-60 shrink-0" />
                <span>{c.phone || 'No phone recorded'}</span>
              </div>

              <div className="text-[11px] opacity-60 mt-1">
                Last Visit: {formatDateTime(c.last)}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/10 flex justify-between items-end">
              <div>
                <div className="text-[11px] opacity-60">Total Spent</div>
                <div className="font-bold text-[16px] text-[#2563eb]">
                  {formatCurrency(c.spent)}
                </div>
              </div>

              <button
                onClick={() => onFilterHistoryByCustomer(c.name)}
                className="h-8 px-3 rounded-lg bg-[#2563eb] text-white text-[12px] font-medium flex items-center gap-1 hover:bg-blue-600 transition"
              >
                <History className="w-3.5 h-3.5" />
                <span>History</span>
              </button>
            </div>
          </div>
        ))}

        {customers.length === 0 && (
          <div className="col-span-full p-8 text-center opacity-60 text-[13px]">
            No customer records available yet. Completed sessions will generate guest profiles automatically.
          </div>
        )}
      </div>
    </div>
  );
};
