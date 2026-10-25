import React, { useState, useMemo } from 'react';
import { Console, Settings } from '../types';
import { formatCurrency, formatTime, formatDateTime } from '../utils/formatters';
import { X, Gamepad2, User, Phone, Clock, ArrowRight, Check } from 'lucide-react';

interface StartSessionModalProps {
  consoles: Console[];
  initialConsoleId: string | null;
  settings: Settings;
  onClose: () => void;
  onStartSession: (data: {
    consoleId: string;
    customerName: string;
    phone: string;
    durationMins: number;
    calculatedPrice: number;
  }) => void;
  calculatePrice: (consoleId: string, durationMins: number) => number;
}

export const StartSessionModal: React.FC<StartSessionModalProps> = ({
  consoles,
  initialConsoleId,
  settings,
  onClose,
  onStartSession,
  calculatePrice,
}) => {
  const availableConsoles = consoles.filter((c) => c.enabled);
  const [selectedConsoleId, setSelectedConsoleId] = useState<string>(
    initialConsoleId || availableConsoles[0]?.id || ''
  );
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [duration, setDuration] = useState<number>(settings.defaultDuration || 30);
  const [customH, setCustomH] = useState('');
  const [customM, setCustomM] = useState('');
  const [step, setStep] = useState<1 | 2>(1);

  const calculatedPrice = useMemo(() => {
    if (!selectedConsoleId || duration <= 0) return 0;
    return calculatePrice(selectedConsoleId, duration);
  }, [selectedConsoleId, duration, calculatePrice]);

  const handleCustomTime = (hStr: string, mStr: string) => {
    const h = Number(hStr) || 0;
    const m = Number(mStr) || 0;
    const total = h * 60 + m;
    if (total > 0) {
      setDuration(total);
    }
  };

  const handleConfirm = () => {
    if (!selectedConsoleId || !customerName.trim()) return;
    onStartSession({
      consoleId: selectedConsoleId,
      customerName: customerName.trim(),
      phone: phone.trim(),
      durationMins: duration,
      calculatedPrice,
    });
  };

  const selectedConsoleObj = consoles.find((c) => c.id === selectedConsoleId);

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className={`relative w-full md:max-w-[520px] rounded-t-[24px] md:rounded-[20px] border shadow-2xl p-5 max-h-[90vh] overflow-auto scrollbar transition-colors ${
          settings.darkMode ? 'bg-[#111d33] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#2563eb] grid place-items-center text-white">
              <Gamepad2 className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-[16px]">Start Gaming Session</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/10 dark:bg-white/10 grid place-items-center hover:opacity-80 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {step === 1 ? (
          <div className="space-y-4">
            {/* Console Selection */}
            <div>
              <label className="block text-[12px] font-medium mb-1">
                Select Gaming Station *
              </label>
              <select
                value={selectedConsoleId}
                onChange={(e) => setSelectedConsoleId(e.target.value)}
                className={`w-full h-11 rounded-xl border px-3 text-[13px] outline-none font-medium ${
                  settings.darkMode
                    ? 'bg-[#0b1220] border-white/10 text-white focus:border-[#2563eb]'
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#2563eb]'
                }`}
              >
                <option value="">Choose available station</option>
                {availableConsoles.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.stationNumber} • {formatCurrency(c.hourlyRate)}/hr
                  </option>
                ))}
              </select>
            </div>

            {/* Customer Name */}
            <div>
              <label className="block text-[12px] font-medium mb-1">
                Customer Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter gamer name"
                  className={`w-full h-11 pl-9 pr-3 rounded-xl border text-[13px] outline-none ${
                    settings.darkMode
                      ? 'bg-[#0b1220] border-white/10 text-white placeholder-white/40 focus:border-[#2563eb]'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#2563eb]'
                  }`}
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-[12px] font-medium mb-1">
                Phone Number (optional)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className={`w-full h-11 pl-9 pr-3 rounded-xl border text-[13px] outline-none ${
                    settings.darkMode
                      ? 'bg-[#0b1220] border-white/10 text-white placeholder-white/40 focus:border-[#2563eb]'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#2563eb]'
                  }`}
                />
              </div>
            </div>

            {/* Duration Presets */}
            <div>
              <div className="text-[12px] font-medium mb-2 flex items-center justify-between">
                <span>Duration Selection</span>
                <span className="text-[11px] opacity-60">Selected: {duration} min</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[5, 10, 15, 30, 45, 60].map((mins) => {
                  const isSelected = duration === mins && !customH && !customM;
                  return (
                    <button
                      key={mins}
                      onClick={() => {
                        setDuration(mins);
                        setCustomH('');
                        setCustomM('');
                      }}
                      className={`h-[44px] rounded-xl border text-[13px] font-semibold transition ${
                        isSelected
                          ? 'bg-[#2563eb] text-white border-[#2563eb] shadow-md shadow-blue-500/20'
                          : settings.darkMode
                          ? 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {mins} mins
                    </button>
                  );
                })}
              </div>

              {/* Custom Hours & Minutes */}
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] opacity-70 mb-1 block">Custom Hours</label>
                  <input
                    type="number"
                    value={customH}
                    onChange={(e) => {
                      setCustomH(e.target.value);
                      handleCustomTime(e.target.value, customM);
                    }}
                    placeholder="HH"
                    className={`w-full h-10 rounded-xl border px-3 text-[12px] outline-none ${
                      settings.darkMode
                        ? 'bg-[#0b1220] border-white/10 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="text-[11px] opacity-70 mb-1 block">Custom Minutes</label>
                  <input
                    type="number"
                    value={customM}
                    onChange={(e) => {
                      setCustomM(e.target.value);
                      handleCustomTime(customH, e.target.value);
                    }}
                    placeholder="MM"
                    className={`w-full h-10 rounded-xl border px-3 text-[12px] outline-none ${
                      settings.darkMode
                        ? 'bg-[#0b1220] border-white/10 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Estimated Price Display */}
            <div
              className={`p-3.5 rounded-xl flex justify-between items-center ${
                settings.darkMode ? 'bg-white/5' : 'bg-slate-50'
              }`}
            >
              <span className="text-[12px] opacity-70">
                Estimated Rate • {duration} min
              </span>
              <span className="font-bold text-[18px] text-[#2563eb]">
                {formatCurrency(calculatedPrice)}
              </span>
            </div>

            {/* Next Step Button */}
            <button
              disabled={!selectedConsoleId || !customerName.trim() || duration <= 0}
              onClick={() => setStep(2)}
              className="w-full h-[48px] rounded-xl bg-[#2563eb] text-white font-semibold text-[14px] flex items-center justify-center gap-2 hover:bg-blue-600 disabled:opacity-40 transition shadow-md shadow-blue-500/20"
            >
              <span>Continue to Confirm</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Step 2: Confirmation */
          <div className="space-y-4">
            <div
              className={`p-4 rounded-xl border ${
                settings.darkMode ? 'border-white/10 bg-white/5' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="text-[13px] font-bold mb-3 border-b border-black/5 dark:border-white/10 pb-2">
                Session Confirmation Summary
              </div>
              <div className="space-y-2 text-[13px]">
                <div className="flex justify-between">
                  <span className="opacity-60">Station</span>
                  <span className="font-semibold">
                    {selectedConsoleObj?.name} {selectedConsoleObj?.stationNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-60">Customer</span>
                  <span className="font-semibold">
                    {customerName} {phone && `• ${phone}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-60">Duration</span>
                  <span className="font-semibold">
                    {duration} minutes ({formatTime(duration * 60)})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-60">Start Time</span>
                  <span>{formatDateTime(Date.now())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-60">End Time</span>
                  <span>{formatDateTime(Date.now() + duration * 60000)}</span>
                </div>
                <div className="flex justify-between border-t border-black/5 dark:border-white/10 pt-2.5 mt-2 font-bold text-[15px]">
                  <span>Total Calculated Price</span>
                  <span className="text-[#2563eb]">{formatCurrency(calculatedPrice)}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setStep(1)}
                className={`h-[44px] rounded-xl border font-medium text-[13px] transition ${
                  settings.darkMode ? 'border-white/10 hover:bg-white/5' : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                Back
              </button>
              <button
                onClick={handleConfirm}
                className="h-[44px] rounded-xl bg-[#2563eb] text-white font-semibold text-[13px] flex items-center justify-center gap-1.5 hover:bg-blue-600 transition shadow-md shadow-blue-500/20"
              >
                <Check className="w-4 h-4" />
                <span>Confirm & Start</span>
              </button>
            </div>

            <div className="text-[11px] opacity-60 text-center">
              Timer starts immediately upon confirmation. Accurate to the second.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
