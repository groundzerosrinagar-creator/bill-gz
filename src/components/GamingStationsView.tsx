import React from 'react';
import { Console, Session, Settings } from '../types';
import { formatCurrency, formatTime, formatDateTime } from '../utils/formatters';
import { Play, Pause, Square, Plus, Settings as SettingsIcon, RotateCcw, Clock } from 'lucide-react';

interface GamingStationsViewProps {
  consoles: Console[];
  sessions: Session[];
  settings: Settings;
  onOpenStartModal: (consoleId?: string) => void;
  onNavigateTab: (tab: string, subTab?: string) => void;
  onPauseSession: (id: string) => void;
  onResumeSession: (id: string) => void;
  onExtendSession: (id: string, mins: number) => void;
  onOpenCustomTimeModal: (sessionId: string) => void;
  onStopSession: (id: string) => void;
  onResetConsoleSession: (id: string) => void;
}

export const GamingStationsView: React.FC<GamingStationsViewProps> = ({
  consoles,
  sessions,
  settings,
  onOpenStartModal,
  onNavigateTab,
  onPauseSession,
  onResumeSession,
  onExtendSession,
  onOpenCustomTimeModal,
  onStopSession,
  onResetConsoleSession,
}) => {
  const getRemainingSec = (session: Session) => {
    if (session.status === 'paused' && session.remainingWhenPaused !== null) {
      return Math.floor(session.remainingWhenPaused / 1000);
    }
    if (session.status === 'expired') return 0;
    return Math.max(0, Math.floor((session.endAt - Date.now()) / 1000));
  };

  const getConsoleBadgeBg = (name: string) => {
    if (name.includes('PS5')) return 'bg-[#2563eb]';
    if (name.includes('PS4')) return 'bg-[#0f172a]';
    if (name.includes('Xbox')) return 'bg-emerald-600';
    if (name.includes('PC')) return 'bg-violet-600';
    return 'bg-orange-600';
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-bold text-[18px]">
          Gaming Stations • {consoles.length} Consoles
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => onOpenStartModal()}
            className="h-10 px-4 rounded-xl bg-[#2563eb] text-white text-[13px] font-semibold hover:bg-blue-600 shadow-md shadow-blue-500/20 active:scale-95 transition"
          >
            + Start Session
          </button>
          <button
            onClick={() => onNavigateTab('settings', 'consoles')}
            className={`h-10 px-4 rounded-xl border text-[13px] font-medium flex items-center gap-1.5 transition ${
              settings.darkMode
                ? 'border-white/20 hover:bg-white/10'
                : 'border-slate-200 bg-white hover:bg-slate-50'
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            <span>Manage Consoles</span>
          </button>
        </div>
      </div>

      {/* Console Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {consoles.map((c) => {
          const activeSession = sessions.find(
            (s) => s.consoleId === c.id && (s.status === 'running' || s.status === 'paused' || s.status === 'expired')
          );
          const isBooked = !!activeSession;
          const rem = activeSession ? getRemainingSec(activeSession) : 0;
          const progressPercent = activeSession
            ? Math.max(0, Math.min(100, (rem / activeSession.totalDurationSec) * 100))
            : 0;
          const status = activeSession ? activeSession.status : 'available';
          const isWarn = rem <= 300 && rem > 60;
          const isCritical = rem <= 60 && rem > 0;

          return (
            <div
              key={c.id}
              className={`rounded-[20px] border shadow-sm p-4 flex flex-col gap-3 transition ${
                !c.enabled ? 'opacity-50' : ''
              } ${
                settings.darkMode
                  ? 'bg-[#111d33] border-white/10'
                  : 'bg-white border-slate-200'
              } ${status === 'expired' ? 'ring-2 ring-red-400' : ''}`}
            >
              {/* Card Header */}
              <div className="flex justify-between items-start">
                <div className="flex gap-3 items-center min-w-0">
                  <div
                    className={`w-11 h-11 rounded-xl grid place-items-center font-bold text-white shadow-xs shrink-0 ${getConsoleBadgeBg(
                      c.name
                    )}`}
                  >
                    {c.name[0]}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-[14px] leading-none truncate">
                      {c.name}{' '}
                      <span className="font-normal opacity-70 text-[13px]">
                        {c.stationNumber}
                      </span>
                    </div>
                    <div className="text-[11px] opacity-60 mt-1">
                      ID {c.id.toUpperCase()} • {formatCurrency(c.hourlyRate)}/hr
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                    status === 'available'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                      : status === 'running'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400'
                      : status === 'paused'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 animate-pulse'
                  }`}
                >
                  {status.toUpperCase()}
                </span>
              </div>

              {/* Card Content */}
              {!isBooked ? (
                <div
                  className={`rounded-xl p-3 text-center transition ${
                    settings.darkMode ? 'bg-white/5' : 'bg-slate-50'
                  }`}
                >
                  <div className="text-[12px] opacity-60">Ready for next gamer</div>
                  <div className="mt-2 flex justify-center flex-wrap gap-1.5 text-[11px] opacity-70">
                    {[5, 15, 30, 60].map((mins) => (
                      <span key={mins} className="px-2 py-1 rounded-full bg-black/5 dark:bg-white/10 font-medium">
                        {mins}m {formatCurrency(c.rates[mins] || Math.round((c.hourlyRate / 60) * mins))}
                      </span>
                    ))}
                  </div>

                  <button
                    disabled={!c.enabled}
                    onClick={() => onOpenStartModal(c.id)}
                    className="mt-3 w-full h-[44px] rounded-xl bg-[#2563eb] text-white font-semibold text-[13px] hover:bg-blue-600 disabled:opacity-40 shadow-xs transition"
                  >
                    Start Session
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Customer details */}
                  <div
                    className={`rounded-xl p-3 text-[12px] ${
                      settings.darkMode ? 'bg-white/[0.04]' : 'bg-slate-50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="opacity-60">Customer</span>
                      <span className="font-semibold truncate max-w-[180px]">
                        {activeSession.customerName}{' '}
                        {activeSession.phone ? `• ${activeSession.phone}` : ''}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] mt-1">
                      <span className="opacity-60">Start</span>
                      <span>{formatDateTime(activeSession.startAt)}</span>
                    </div>
                    <div className="flex justify-between text-[11px] mt-1">
                      <span className="opacity-60">
                        End • {Math.round(activeSession.totalDurationSec / 60)}m{' '}
                        {activeSession.addedDurationSec ? `(+${Math.round(activeSession.addedDurationSec / 60)}m)` : ''}
                      </span>
                      <span>{formatDateTime(activeSession.endAt)}</span>
                    </div>
                  </div>

                  {/* Countdown Timer */}
                  <div className="text-center">
                    <div
                      className={`mono text-[32px] font-bold leading-none tracking-tight ${
                        isCritical
                          ? 'text-red-600 animate-pulse'
                          : isWarn
                          ? 'text-amber-600'
                          : ''
                      }`}
                    >
                      {formatTime(rem)}
                    </div>

                    <div className="mt-2 h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-1000 ${
                          isCritical ? 'bg-red-500' : isWarn ? 'bg-amber-500' : 'bg-[#2563eb]'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>

                    <div className="mt-2 flex justify-between text-[11px]">
                      <span className="opacity-60">
                        {Math.round((activeSession.totalDurationSec - rem) / 60)}m elapsed
                      </span>
                      <span className="font-bold">
                        {formatCurrency(activeSession.totalPrice)}
                      </span>
                    </div>
                  </div>

                  {/* Extensions and Pause/Resume Grid */}
                  <div className="grid grid-cols-5 gap-1">
                    {activeSession.status === 'running' ? (
                      <button
                        onClick={() => onPauseSession(activeSession.id)}
                        className="h-[36px] rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[12px] font-medium grid place-items-center"
                        title="Pause"
                      >
                        <Pause className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => onResumeSession(activeSession.id)}
                        className="h-[36px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] font-medium grid place-items-center"
                        title="Resume"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => onExtendSession(activeSession.id, 5)}
                      className={`h-[36px] rounded-xl border text-[12px] font-medium transition ${
                        settings.darkMode
                          ? 'border-white/10 bg-white/5 hover:bg-white/10'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      +5m
                    </button>

                    <button
                      onClick={() => onExtendSession(activeSession.id, 10)}
                      className={`h-[36px] rounded-xl border text-[12px] font-medium transition ${
                        settings.darkMode
                          ? 'border-white/10 bg-white/5 hover:bg-white/10'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      +10m
                    </button>

                    <button
                      onClick={() => onExtendSession(activeSession.id, 15)}
                      className={`h-[36px] rounded-xl border text-[12px] font-medium transition ${
                        settings.darkMode
                          ? 'border-white/10 bg-white/5 hover:bg-white/10'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      +15m
                    </button>

                    <button
                      onClick={() => onOpenCustomTimeModal(activeSession.id)}
                      className="h-[36px] rounded-xl bg-slate-900 dark:bg-white/20 text-white text-[11px] font-medium hover:bg-black transition"
                    >
                      Custom
                    </button>
                  </div>

                  {/* Stop & Reset Buttons */}
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => onStopSession(activeSession.id)}
                      className="h-[44px] rounded-xl bg-[#2563eb] text-white font-semibold text-[13px] hover:bg-blue-600 transition"
                    >
                      Stop & Bill
                    </button>
                    <button
                      onClick={() => onResetConsoleSession(activeSession.id)}
                      className={`h-[44px] rounded-xl border font-medium text-[13px] flex items-center justify-center gap-1 transition ${
                        settings.darkMode
                          ? 'border-white/10 hover:bg-white/5'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
