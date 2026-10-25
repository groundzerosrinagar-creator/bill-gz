import React from 'react';
import { Console, Settings } from '../types';
import { Plus, Edit2, Trash2, Bell, Shield, Building, DollarSign, RotateCcw } from 'lucide-react';

interface SettingsViewProps {
  consoles: Console[];
  settings: Settings;
  activeSubTab: string;
  onSubTabChange: (subTab: string) => void;
  onUpdateSettings: (newSettings: Settings | ((prev: Settings) => Settings)) => void;
  onUpdateConsoles: (newConsoles: Console[] | ((prev: Console[]) => Console[])) => void;
  onOpenEditConsoleModal: (c?: Console) => void;
  onTestSound: (type: 'warn' | 'expired') => void;
  onResetAllData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  consoles,
  settings,
  activeSubTab,
  onSubTabChange,
  onUpdateSettings,
  onUpdateConsoles,
  onOpenEditConsoleModal,
  onTestSound,
  onResetAllData,
}) => {
  const subTabs = [
    { id: 'consoles', label: 'Consoles' },
    { id: 'pricing', label: 'Pricing Rules' },
    { id: 'business', label: 'Business' },
    { id: 'alarms', label: 'Alarms' },
  ];

  return (
    <div className="space-y-4 max-w-[1100px]">
      <h2 className="font-bold text-[18px]">Settings</h2>

      {/* Subtab navigation buttons */}
      <div className="flex gap-2 border-b border-black/5 dark:border-white/10 pb-2">
        {subTabs.map((st) => (
          <button
            key={st.id}
            onClick={() => onSubTabChange(st.id)}
            className={`h-9 px-4 rounded-xl text-[12px] font-semibold transition border ${
              activeSubTab === st.id
                ? 'bg-[#2563eb] text-white border-[#2563eb] shadow-xs'
                : settings.darkMode
                ? 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {st.label}
          </button>
        ))}
      </div>

      {/* Consoles Tab */}
      {activeSubTab === 'consoles' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-[14px]">Console Management</h3>
            <button
              onClick={() => onOpenEditConsoleModal()}
              className="h-9 px-4 rounded-xl bg-[#2563eb] text-white text-[12px] font-semibold flex items-center gap-1 hover:bg-blue-600 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Console</span>
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            {consoles.map((c) => (
              <div
                key={c.id}
                className={`rounded-2xl border p-4 flex justify-between items-start transition ${
                  settings.darkMode
                    ? 'bg-[#111d33] border-white/10'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div>
                  <div className="font-bold text-[14px]">
                    {c.name} {c.stationNumber}{' '}
                    {!c.enabled && <span className="text-red-500 text-[11px]">(Disabled)</span>}
                  </div>
                  <div className="text-[11px] opacity-70 mt-1 space-y-0.5">
                    <div>
                      ₹{c.hourlyRate}/hr • 5m ₹{c.rates[5]} • 30m ₹{c.rates[30]} • 60m ₹{c.rates[60]}
                    </div>
                    <div>Per-minute rate: ₹{c.perMinuteRate}</div>
                  </div>
                  <div className="text-[10px] opacity-50 mt-1.5 font-mono">
                    ID: {c.id}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 shrink-0">
                  <button
                    onClick={() => onOpenEditConsoleModal(c)}
                    className="h-7 px-2.5 rounded-lg border text-[11px] font-medium hover:bg-slate-50 dark:hover:bg-white/10 transition"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      onUpdateConsoles((prev) =>
                        prev.map((item) => (item.id === c.id ? { ...item, enabled: !item.enabled } : item))
                      )
                    }
                    className={`h-7 px-2.5 rounded-lg text-[11px] font-bold transition ${
                      c.enabled
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-white/60'
                    }`}
                  >
                    {c.enabled ? 'Enabled' : 'Disabled'}
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Delete console ${c.name} ${c.stationNumber}?`)) {
                        onUpdateConsoles((prev) => prev.filter((item) => item.id !== c.id));
                      }
                    }}
                    className="h-7 w-7 rounded-lg bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400 grid place-items-center hover:bg-red-100 transition self-end"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pricing Rules Tab */}
      {activeSubTab === 'pricing' && (
        <div
          className={`rounded-2xl border p-5 space-y-4 ${
            settings.darkMode ? 'bg-[#111d33] border-white/10' : 'bg-white border-slate-200'
          }`}
        >
          <h3 className="font-semibold text-[14px]">Global Pricing Rules</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {consoles.map((c) => (
              <div
                key={c.id}
                className={`p-3.5 rounded-xl border ${
                  settings.darkMode ? 'border-white/10 bg-white/5' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="font-bold text-[13px]">
                  {c.name} {c.stationNumber}
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {[5, 10, 15, 30, 45, 60].map((mins) => (
                    <label key={mins} className="text-[11px] font-medium block">
                      {mins}m Rate
                      <input
                        type="number"
                        value={c.rates[mins] || 0}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          onUpdateConsoles((prev) =>
                            prev.map((item) =>
                              item.id === c.id
                                ? { ...item, rates: { ...item.rates, [mins]: val } }
                                : item
                            )
                          );
                        }}
                        className="mt-1 w-full h-8 rounded-lg border px-2 text-[12px] bg-white text-black outline-none"
                      />
                    </label>
                  ))}
                  <label className="text-[11px] font-medium block">
                    Hourly
                    <input
                      type="number"
                      value={c.hourlyRate}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        onUpdateConsoles((prev) =>
                          prev.map((item) => (item.id === c.id ? { ...item, hourlyRate: val } : item))
                        );
                      }}
                      className="mt-1 w-full h-8 rounded-lg border px-2 text-[12px] bg-white text-black outline-none"
                    />
                  </label>
                  <label className="text-[11px] font-medium block">
                    Per-min
                    <input
                      type="number"
                      step="0.1"
                      value={c.perMinuteRate}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        onUpdateConsoles((prev) =>
                          prev.map((item) => (item.id === c.id ? { ...item, perMinuteRate: val } : item))
                        );
                      }}
                      className="mt-1 w-full h-8 rounded-lg border px-2 text-[12px] bg-white text-black outline-none"
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Business Details Tab */}
      {activeSubTab === 'business' && (
        <div
          className={`rounded-2xl border p-5 space-y-4 max-w-[700px] ${
            settings.darkMode ? 'bg-[#111d33] border-white/10' : 'bg-white border-slate-200'
          }`}
        >
          <div className="space-y-3">
            {[
              { k: 'businessName' as const, label: 'Business Name' },
              { k: 'address' as const, label: 'Address' },
              { k: 'phone' as const, label: 'Phone Number' },
              { k: 'logoUrl' as const, label: 'Logo URL (optional)' },
              { k: 'billFooter' as const, label: 'Bill Footer Note' },
            ].map((field) => (
              <label key={field.k} className="block text-[12px] font-medium">
                {field.label}
                <input
                  value={settings[field.k] as string}
                  onChange={(e) =>
                    onUpdateSettings((prev) => ({ ...prev, [field.k]: e.target.value }))
                  }
                  className={`mt-1 w-full h-10 rounded-xl border px-3 text-[13px] outline-none ${
                    settings.darkMode
                      ? 'bg-[#0b1220] border-white/10 text-white focus:border-[#2563eb]'
                      : 'bg-white border-slate-200 text-slate-900 focus:border-[#2563eb]'
                  }`}
                />
              </label>
            ))}

            <div className="grid grid-cols-3 gap-3 pt-2">
              <label className="text-[12px] font-medium">
                Tax %
                <input
                  type="number"
                  value={settings.taxPercent}
                  onChange={(e) =>
                    onUpdateSettings((prev) => ({ ...prev, taxPercent: Number(e.target.value) }))
                  }
                  className={`mt-1 w-full h-10 rounded-xl border px-3 text-[13px] outline-none ${
                    settings.darkMode
                      ? 'bg-[#0b1220] border-white/10 text-white focus:border-[#2563eb]'
                      : 'bg-white border-slate-200 text-slate-900 focus:border-[#2563eb]'
                  }`}
                />
              </label>

              <label className="text-[12px] font-medium">
                Discount %
                <input
                  type="number"
                  value={settings.discountPercent}
                  onChange={(e) =>
                    onUpdateSettings((prev) => ({
                      ...prev,
                      discountPercent: Number(e.target.value),
                    }))
                  }
                  className={`mt-1 w-full h-10 rounded-xl border px-3 text-[13px] outline-none ${
                    settings.darkMode
                      ? 'bg-[#0b1220] border-white/10 text-white focus:border-[#2563eb]'
                      : 'bg-white border-slate-200 text-slate-900 focus:border-[#2563eb]'
                  }`}
                />
              </label>

              <label className="text-[12px] font-medium">
                Default Min
                <input
                  type="number"
                  value={settings.defaultDuration}
                  onChange={(e) =>
                    onUpdateSettings((prev) => ({
                      ...prev,
                      defaultDuration: Number(e.target.value),
                    }))
                  }
                  className={`mt-1 w-full h-10 rounded-xl border px-3 text-[13px] outline-none ${
                    settings.darkMode
                      ? 'bg-[#0b1220] border-white/10 text-white focus:border-[#2563eb]'
                      : 'bg-white border-slate-200 text-slate-900 focus:border-[#2563eb]'
                  }`}
                />
              </label>
            </div>

            <div className="pt-3 border-t border-black/5 dark:border-white/10 flex items-center justify-between">
              <button
                onClick={onResetAllData}
                className="h-10 px-4 rounded-xl border border-red-200 text-red-600 dark:border-red-900/50 dark:text-red-400 text-[12px] font-medium hover:bg-red-50 dark:hover:bg-red-950/50 transition flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Local Storage Data</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alarms Tab */}
      {activeSubTab === 'alarms' && (
        <div
          className={`rounded-2xl border p-5 space-y-4 max-w-[600px] ${
            settings.darkMode ? 'bg-[#111d33] border-white/10' : 'bg-white border-slate-200'
          }`}
        >
          <h3 className="font-semibold text-[14px]">Timer Audio & Alarm Settings</h3>

          <div className="space-y-2">
            {[
              { k: 'alarm5' as const, label: '5 minutes warning beep + desktop notification' },
              { k: 'alarm1' as const, label: '1 minute warning sound' },
              { k: 'alarmExpired' as const, label: 'Session expired alarm sound + active alert banner' },
            ].map((item) => (
              <label
                key={item.k}
                className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${
                  settings.darkMode
                    ? 'border-white/10 bg-white/5 hover:bg-white/10'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="text-[13px] font-medium">{item.label}</span>
                <input
                  type="checkbox"
                  checked={settings[item.k]}
                  onChange={(e) =>
                    onUpdateSettings((prev) => ({ ...prev, [item.k]: e.target.checked }))
                  }
                  className="w-5 h-5 rounded border-slate-300 text-[#2563eb] focus:ring-[#2563eb]"
                />
              </label>
            ))}
          </div>

          <div className="pt-2 flex gap-2">
            <button
              onClick={() => onTestSound('warn')}
              className="h-10 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[12px] font-semibold transition flex items-center gap-1.5"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Test Warning Tone</span>
            </button>

            <button
              onClick={() => onTestSound('expired')}
              className="h-10 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[12px] font-semibold transition flex items-center gap-1.5"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Test Expired Alarm</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
