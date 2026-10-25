import React from 'react';
import { Console, Session, Settings } from '../types';
import { formatCurrency, formatTime } from '../utils/formatters';
import { Play, Pause, Square, Plus, Monitor, Clock, FileSpreadsheet, History, Settings as SettingsIcon } from 'lucide-react';

interface DashboardViewProps {
  consoles: Console[];
  activeSessions: Session[];
  settings: Settings;
  todayRevenue: number;
  completedTodayCount: number;
  totalCustomersCount: number;
  availableConsoles: Console[];
  upcomingExpirations: (Session & { rem: number })[];
  onOpenStartModal: (consoleId?: string) => void;
  onNavigateTab: (tab: string, subTab?: string) => void;
  onPauseSession: (id: string) => void;
  onResumeSession: (id: string) => void;
  onStopSession: (id: string) => void;
  onExportCSV: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  consoles,
  activeSessions,
  settings,
  todayRevenue,
  completedTodayCount,
  totalCustomersCount,
  availableConsoles,
  upcomingExpirations,
  onOpenStartModal,
  onNavigateTab,
  onPauseSession,
  onResumeSession,
  onStopSession,
  onExportCSV,
}) => {
  const getConsoleName = (consoleId: string) => {
    const c = consoles.find((item) => item.id === consoleId);
    return c ? `${c.name} ${c.stationNumber}` : 'Unknown Console';
  };

  const getRemainingSec = (session: Session) => {
    if (session.status === 'paused' && session.remainingWhenPaused !== null) {
      return Math.floor(session.remainingWhenPaused / 1000);
    }
    if (session.status === 'expired') return 0;
    return Math.max(0, Math.floor((session.endAt - Date.now()) / 1000));
  };

  const statCards = [
    {
      label: 'Active Sessions',
      value: activeSessions.length,
      sub: `${availableConsoles.length} available`,
      color: 'bg-[#2563eb]',
    },
    {
      label: 'Available Consoles',
      value: availableConsoles.length,
      sub: `${consoles.filter((c) => !c.enabled).length} disabled`,
      color: 'bg-emerald-500',
    },
    {
      label: "Today's Revenue",
      value: formatCurrency(todayRevenue),
      sub: `${completedTodayCount} completed`,
      color: 'bg-amber-500',
    },
    {
      label: 'Completed Today',
      value: completedTodayCount,
      sub: 'sessions closed',
      color: 'bg-violet-500',
    },
    {
      label: 'Total Customers',
      value: totalCustomersCount,
      sub: 'unique guests',
      color: 'bg-pink-500',
    },
  ];

  return (
    <div className="space-y-5">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`rounded-2xl p-4 shadow-sm border transition ${
              settings.darkMode
                ? 'bg-[#111d33] border-white/10'
                : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className={`w-8 h-8 rounded-lg grid place-items-center text-white text-[12px] font-bold ${card.color}`}>
                ●
              </div>
              <div
                className={`text-[11px] px-2 py-1 rounded-full font-medium ${
                  settings.darkMode ? 'bg-white/10' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {card.sub}
              </div>
            </div>
            <div className="mt-3 text-[22px] font-bold leading-none">{card.value}</div>
            <div className={`mt-1 text-[12px] ${settings.darkMode ? 'text-white/60' : 'text-slate-500'}`}>
              {card.label}
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Live Sessions + Quick Actions & Expirations */}
      <div className="grid lg:grid-cols-[1.6fr_0.9fr] gap-4">
        {/* Live Sessions List */}
        <div
          className={`rounded-2xl border shadow-sm ${
            settings.darkMode ? 'bg-[#111d33] border-white/10' : 'bg-white border-slate-200'
          }`}
        >
          <div className="p-4 flex items-center justify-between border-b border-black/5 dark:border-white/10">
            <h3 className="font-semibold text-[14px]">
              Live Sessions • {activeSessions.length}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => onOpenStartModal(availableConsoles[0]?.id)}
                className="h-8 px-3 rounded-lg bg-[#2563eb] text-white text-[12px] font-medium hover:bg-blue-600 transition"
              >
                + Start
              </button>
              <button
                onClick={() => onNavigateTab('gaming')}
                className={`h-8 px-3 rounded-lg text-[12px] font-medium border transition ${
                  settings.darkMode ? 'border-white/20 hover:bg-white/10' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                View Stations
              </button>
            </div>
          </div>

          <div className="divide-y divide-black/5 dark:divide-white/5 max-h-[420px] overflow-auto scrollbar">
            {activeSessions.length === 0 ? (
              <div className="p-8 text-center text-[13px] opacity-60">
                No active sessions. Start a session to see live timers.
              </div>
            ) : (
              activeSessions.map((session) => {
                const consoleInfo = consoles.find((c) => c.id === session.consoleId);
                const rem = getRemainingSec(session);
                const isWarn = rem <= 300 && rem > 60;
                const isCritical = rem <= 60 && rem > 0;
                const percentLeft = Math.max(0, Math.min(100, (rem / session.totalDurationSec) * 100));

                return (
                  <div key={session.id} className="p-3 flex items-center gap-3 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition">
                    <div
                      className={`w-10 h-10 rounded-xl grid place-items-center text-white font-bold text-[12px] shrink-0 ${
                        session.status === 'running'
                          ? 'bg-[#2563eb]'
                          : session.status === 'paused'
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      }`}
                    >
                      {consoleInfo?.name.slice(0, 2) || 'GS'}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[13px] truncate">
                          {session.customerName}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                            session.status === 'running'
                              ? 'bg-blue-100 text-blue-700'
                              : session.status === 'paused'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-red-100 text-red-700 animate-pulse'
                          }`}
                        >
                          {session.status.toUpperCase()}
                        </span>
                        <span
                          className={`text-[11px] truncate ${
                            isCritical
                              ? 'text-red-600 font-bold'
                              : isWarn
                              ? 'text-amber-600 font-medium'
                              : 'opacity-60'
                          }`}
                        >
                          {getConsoleName(session.consoleId)}
                        </span>
                      </div>

                      {/* Remaining Progress Bar */}
                      <div className="mt-1.5 h-1.5 w-full rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-1000 ${
                            isCritical ? 'bg-red-500' : isWarn ? 'bg-amber-500' : 'bg-[#2563eb]'
                          }`}
                          style={{ width: `${percentLeft}%` }}
                        />
                      </div>
                    </div>

                    <div
                      className={`mono font-bold text-[15px] min-w-[72px] text-right shrink-0 ${
                        isCritical
                          ? 'text-red-600 animate-pulse'
                          : isWarn
                          ? 'text-amber-600'
                          : ''
                      }`}
                    >
                      {formatTime(rem)}
                    </div>

                    {/* Quick controls */}
                    <div className="hidden md:flex gap-1 shrink-0">
                      {session.status === 'running' && (
                        <button
                          onClick={() => onPauseSession(session.id)}
                          className="w-7 h-7 rounded-lg bg-amber-500 text-white grid place-items-center text-[11px] hover:bg-amber-600 transition"
                          title="Pause"
                        >
                          <Pause className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {session.status === 'paused' && (
                        <button
                          onClick={() => onResumeSession(session.id)}
                          className="w-7 h-7 rounded-lg bg-emerald-500 text-white grid place-items-center text-[11px] hover:bg-emerald-600 transition"
                          title="Resume"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => onStopSession(session.id)}
                        className="w-7 h-7 rounded-lg bg-slate-900 dark:bg-white/20 text-white grid place-items-center text-[11px] hover:bg-black transition"
                        title="Stop & Bill"
                      >
                        <Square className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Sidebar Column: Quick Actions & Expirations */}
        <div className="space-y-4">
          {/* Quick Actions Card */}
          <div
            className={`rounded-2xl border p-4 shadow-sm ${
              settings.darkMode ? 'bg-[#111d33] border-white/10' : 'bg-white border-slate-200'
            }`}
          >
            <h4 className="font-semibold text-[13px] mb-3">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onOpenStartModal(availableConsoles[0]?.id)}
                className={`h-[44px] rounded-xl text-[12px] font-medium border flex items-center justify-center gap-1.5 transition ${
                  settings.darkMode
                    ? 'bg-white/5 border-white/10 hover:bg-white/10'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Start Session</span>
              </button>

              <button
                onClick={() => onNavigateTab('settings', 'consoles')}
                className={`h-[44px] rounded-xl text-[12px] font-medium border flex items-center justify-center gap-1.5 transition ${
                  settings.darkMode
                    ? 'bg-white/5 border-white/10 hover:bg-white/10'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Add Console</span>
              </button>

              <button
                onClick={() => onNavigateTab('gaming')}
                className={`h-[44px] rounded-xl text-[12px] font-medium border flex items-center justify-center gap-1.5 transition ${
                  settings.darkMode
                    ? 'bg-white/5 border-white/10 hover:bg-white/10'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Extend Time</span>
              </button>

              <button
                onClick={() => onNavigateTab('gaming')}
                className={`h-[44px] rounded-xl text-[12px] font-medium border flex items-center justify-center gap-1.5 transition ${
                  settings.darkMode
                    ? 'bg-white/5 border-white/10 hover:bg-white/10'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Square className="w-3.5 h-3.5" />
                <span>Stop Session</span>
              </button>

              <button
                onClick={() => onNavigateTab('history')}
                className={`h-[44px] rounded-xl text-[12px] font-medium border flex items-center justify-center gap-1.5 transition ${
                  settings.darkMode
                    ? 'bg-white/5 border-white/10 hover:bg-white/10'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>View History</span>
              </button>

              <button
                onClick={onExportCSV}
                className={`h-[44px] rounded-xl text-[12px] font-medium border flex items-center justify-center gap-1.5 transition ${
                  settings.darkMode
                    ? 'bg-white/5 border-white/10 hover:bg-white/10'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Upcoming Expirations Widget */}
          <div
            className={`rounded-2xl border p-4 shadow-sm ${
              settings.darkMode ? 'bg-[#111d33] border-white/10' : 'bg-white border-slate-200'
            }`}
          >
            <h4 className="font-semibold text-[13px] mb-3">Upcoming Expirations</h4>
            <div className="space-y-2">
              {upcomingExpirations.length === 0 ? (
                <div className="text-[12px] opacity-60">
                  No expirations in next hour.
                </div>
              ) : (
                upcomingExpirations.map((item) => {
                  const consoleInfo = consoles.find((c) => c.id === item.consoleId);
                  const isSoon = item.rem <= 300;
                  return (
                    <div
                      key={item.id}
                      className={`flex justify-between items-center p-2.5 rounded-xl transition ${
                        isSoon
                          ? 'bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800'
                          : settings.darkMode
                          ? 'bg-white/5'
                          : 'bg-slate-50'
                      }`}
                    >
                      <div className="text-[12px] min-w-0 pr-2">
                        <b className="truncate block">{item.customerName}</b>
                        <span className="text-[11px] opacity-70">
                          {consoleInfo?.name} {consoleInfo?.stationNumber}
                        </span>
                      </div>
                      <div
                        className={`mono text-[12px] font-bold shrink-0 ${
                          isSoon ? 'text-amber-700 dark:text-amber-400' : ''
                        }`}
                      >
                        {formatTime(item.rem)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
