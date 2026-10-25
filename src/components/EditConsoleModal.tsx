import React, { useState } from 'react';
import { Console, Settings } from '../types';
import { X, Save } from 'lucide-react';

interface EditConsoleModalProps {
  consoleToEdit: Console | null;
  existingCount: number;
  settings: Settings;
  onClose: () => void;
  onSaveConsole: (c: Console) => void;
}

export const EditConsoleModal: React.FC<EditConsoleModalProps> = ({
  consoleToEdit,
  existingCount,
  settings,
  onClose,
  onSaveConsole,
}) => {
  const isEditing = !!consoleToEdit;

  const [formData, setFormData] = useState<Console>(() => {
    if (consoleToEdit) return { ...consoleToEdit };
    return {
      id: Math.random().toString(36).slice(2),
      name: 'PS5',
      stationNumber: `Station ${existingCount + 1}`,
      hourlyRate: 200,
      rates: { 5: 20, 10: 35, 15: 50, 30: 100, 45: 150, 60: 200 },
      perMinuteRate: 3.5,
      enabled: true,
    };
  });

  const handleRateChange = (mins: number, val: number) => {
    setFormData((prev) => ({
      ...prev,
      rates: {
        ...prev.rates,
        [mins]: val,
      },
    }));
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.stationNumber.trim()) return;
    onSaveConsole(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs"
        onClick={onClose}
      />

      <div
        className={`relative w-full md:max-w-[560px] rounded-t-[20px] md:rounded-[16px] border p-5 max-h-[90vh] overflow-auto scrollbar transition-colors ${
          settings.darkMode ? 'bg-[#111d33] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-[16px]">
            {isEditing ? 'Edit Console' : 'Add New Console'}
          </h4>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-black/10 dark:bg-white/10 grid place-items-center"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <label className="text-[11px] font-medium block">
            Console Type / Name *
            <select
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="mt-1 w-full h-10 rounded-xl border px-3 bg-white text-black border-slate-200 outline-none text-[13px]"
            >
              <option value="PS5">PS5</option>
              <option value="PS4">PS4</option>
              <option value="Xbox">Xbox</option>
              <option value="Xbox Series X">Xbox Series X</option>
              <option value="Gaming PC">Gaming PC</option>
              <option value="Racing Simulator">Racing Simulator</option>
            </select>
          </label>

          <label className="text-[11px] font-medium block">
            Station Number / Identifier *
            <input
              type="text"
              value={formData.stationNumber}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, stationNumber: e.target.value }))
              }
              placeholder="e.g. Station 1, Rig 2"
              className="mt-1 w-full h-10 rounded-xl border px-3 bg-white text-black border-slate-200 outline-none text-[13px]"
            />
          </label>

          <label className="text-[11px] font-medium block">
            Hourly Base Rate (₹)
            <input
              type="number"
              value={formData.hourlyRate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, hourlyRate: Number(e.target.value) }))
              }
              className="mt-1 w-full h-10 rounded-xl border px-3 bg-white text-black border-slate-200 outline-none text-[13px]"
            />
          </label>

          <label className="text-[11px] font-medium block">
            Per Minute Rate (₹)
            <input
              type="number"
              step="0.1"
              value={formData.perMinuteRate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, perMinuteRate: Number(e.target.value) }))
              }
              className="mt-1 w-full h-10 rounded-xl border px-3 bg-white text-black border-slate-200 outline-none text-[13px]"
            />
          </label>

          {[5, 10, 15, 30, 45, 60].map((mins) => (
            <label key={mins} className="text-[11px] font-medium block">
              {mins}m Preset Rate (₹)
              <input
                type="number"
                value={formData.rates[mins] || 0}
                onChange={(e) => handleRateChange(mins, Number(e.target.value))}
                className="mt-1 w-full h-10 rounded-xl border px-3 bg-white text-black border-slate-200 outline-none text-[13px]"
              />
            </label>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            onClick={onClose}
            className="h-11 rounded-xl border border-slate-200 bg-white text-slate-700 text-[13px] font-medium hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!formData.name.trim() || !formData.stationNumber.trim()}
            className="h-11 rounded-xl bg-[#2563eb] text-white font-semibold text-[13px] flex items-center justify-center gap-1.5 hover:bg-blue-600 disabled:opacity-40 transition shadow-md shadow-blue-500/20"
          >
            <Save className="w-4 h-4" />
            <span>Save Console</span>
          </button>
        </div>
      </div>
    </div>
  );
};
