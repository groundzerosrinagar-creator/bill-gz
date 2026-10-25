import React, { useState } from 'react';
import { Settings } from '../types';
import { X, Clock, Plus } from 'lucide-react';

interface AddCustomTimeModalProps {
  sessionId: string;
  settings: Settings;
  onClose: () => void;
  onAddCustomTime: (sessionId: string, totalMins: number) => void;
}

export const AddCustomTimeModal: React.FC<AddCustomTimeModalProps> = ({
  sessionId,
  settings,
  onClose,
  onAddCustomTime,
}) => {
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');

  const handleAdd = () => {
    const h = Number(hours) || 0;
    const m = Number(minutes) || 0;
    const total = h * 60 + m;
    if (total <= 0) return;
    onAddCustomTime(sessionId, total);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs"
        onClick={onClose}
      />

      <div
        className={`relative w-full md:max-w-[360px] rounded-t-[20px] md:rounded-[16px] border p-5 shadow-2xl transition-colors ${
          settings.darkMode ? 'bg-[#111d33] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#2563eb]" />
            <h4 className="font-bold text-[14px]">Add Custom Time</h4>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-black/10 dark:bg-white/10 grid place-items-center"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[11px] opacity-70 mb-1 block">Hours</label>
            <input
              type="number"
              placeholder="0"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className={`w-full h-11 rounded-xl border px-3 text-[13px] outline-none ${
                settings.darkMode
                  ? 'bg-[#0b1220] border-white/10 text-white focus:border-[#2563eb]'
                  : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#2563eb]'
              }`}
            />
          </div>

          <div>
            <label className="text-[11px] opacity-70 mb-1 block">Minutes</label>
            <input
              type="number"
              placeholder="0"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              className={`w-full h-11 rounded-xl border px-3 text-[13px] outline-none ${
                settings.darkMode
                  ? 'bg-[#0b1220] border-white/10 text-white focus:border-[#2563eb]'
                  : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#2563eb]'
              }`}
            />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            onClick={onClose}
            className={`h-11 rounded-xl border text-[13px] font-medium ${
              settings.darkMode ? 'border-white/10 hover:bg-white/5' : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={(Number(hours) || 0) * 60 + (Number(minutes) || 0) <= 0}
            className="h-11 rounded-xl bg-[#2563eb] text-white font-semibold text-[13px] flex items-center justify-center gap-1 hover:bg-blue-600 disabled:opacity-40 transition shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Time</span>
          </button>
        </div>
      </div>
    </div>
  );
};
