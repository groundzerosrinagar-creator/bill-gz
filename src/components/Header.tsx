import React from 'react';
import { Settings, AlarmBanner } from '../types';
import { Sun, Moon, Plus, Menu, Bell } from 'lucide-react';

interface HeaderProps {
  settings: Settings;
  onToggleDarkMode: () => void;
  onOpenStartModal: () => void;
  onOpenMobileSidebar: () => void;
  alarmBanner: AlarmBanner | null;
  onStopAlarm: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onToggleDarkMode,
  onOpenStartModal,
  onOpenMobileSidebar,
  alarmBanner,
  onStopAlarm,
}) => {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });
  const timeStr = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <header className={`sticky top-[var(--safe-area-inset-top)] z-30 backdrop-blur-xl border-b transition-colors ${
      settings.darkMode ? 'bg-[#0f172a]/90 border-white/10' : 'bg-white/90 border-slate-200'
    }`}>
      <div className="flex items-center justify-between px-4 lg:px-6 h-[64px]">
        {/* Left branding & menu button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden w-10 h-10 grid place-items-center rounded-xl bg-[var(--primary)] text-white hover:opacity-90 active:scale-95 transition"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="w-9 h-9 rounded-xl bg-[#2563eb] grid place-items-center text-white font-bold shadow-md shadow-blue-500/20">
            G
          </div>
          
          <div>
            <div className="font-bold leading-none text-[15px]">
              {settings.businessName || 'GameHub Pro'}
            </div>
            <div className={`text-[11px] mt-0.5 ${settings.darkMode ? 'text-white/60' : 'text-slate-500'}`}>
              Gaming Cafe Manager • {dateStr} {timeStr}
            </div>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Active Alarm Banner Pill */}
          {alarmBanner && alarmBanner.active && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500 text-white text-[12px] font-medium animate-pulse shadow-lg shadow-red-500/30">
              <Bell className="w-3.5 h-3.5 animate-bounce" />
              <span>{alarmBanner.msg}</span>
              <button
                onClick={onStopAlarm}
                className="ml-2 bg-white text-red-600 rounded-full px-2 py-0.5 text-[11px] font-bold hover:bg-red-50 transition"
              >
                Stop Alarm
              </button>
            </div>
          )}

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className={`w-10 h-10 rounded-xl grid place-items-center border transition ${
              settings.darkMode
                ? 'bg-white/10 border-white/10 text-amber-300 hover:bg-white/20'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
            title="Toggle theme"
          >
            {settings.darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Start Session Button */}
          <button
            onClick={onOpenStartModal}
            className="h-10 px-4 rounded-xl bg-[#2563eb] hover:bg-blue-600 text-white font-semibold text-[13px] flex items-center gap-1.5 shadow-md shadow-blue-500/20 active:scale-95 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Start Session</span>
          </button>
        </div>
      </div>
    </header>
  );
};
