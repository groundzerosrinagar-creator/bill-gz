import React from 'react';
import { Settings } from '../types';
import { LayoutDashboard, Gamepad2, Receipt, Users, Settings as SettingsIcon, X } from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  settings: Settings;
  activeCount: number;
  availableCount: number;
  totalConsoles: number;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  settings,
  activeCount,
  availableCount,
  totalConsoles,
  mobileOpen,
  onCloseMobile,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'gaming', label: 'Gaming Stations', icon: Gamepad2 },
    { id: 'history', label: 'History & Billing', icon: Receipt },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const percentUsed = totalConsoles > 0 ? (activeCount / totalConsoles) * 100 : 0;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col w-[240px] shrink-0 sticky top-[64px] h-[calc(100vh-64px)] p-4 gap-2 border-r transition-colors ${
          settings.darkMode
            ? 'bg-[#0f172a] border-white/10'
            : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex flex-col gap-1.5 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-3 px-3 h-11 rounded-xl text-[13.5px] font-medium transition ${
                  isActive
                    ? 'bg-[#2563eb] text-white shadow-md shadow-blue-500/20'
                    : settings.darkMode
                    ? 'hover:bg-white/10 text-white/70 hover:text-white'
                    : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* System Usage Footer */}
        <div
          className={`p-3 rounded-xl ${
            settings.darkMode ? 'bg-white/5' : 'bg-slate-50'
          }`}
        >
          <div className="text-[11px] font-semibold opacity-60">SYSTEM STATUS</div>
          <div className="mt-1 text-[12px] font-medium">
            Active: {activeCount} • Avail: {availableCount}
          </div>
          <div className="mt-2 w-full h-2 rounded-full bg-black/10 overflow-hidden">
            <div
              className="h-full bg-[#2563eb] transition-all duration-500"
              style={{ width: `${percentUsed}%` }}
            />
          </div>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div
            className={`absolute left-0 top-0 bottom-0 w-[78%] max-w-[300px] p-4 flex flex-col gap-2 shadow-2xl ${
              settings.darkMode ? 'bg-[#0f172a] text-white' : 'bg-white text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-black/5 dark:border-white/10">
              <div className="font-bold text-[16px]">{settings.businessName}</div>
              <button
                onClick={onCloseMobile}
                className="w-8 h-8 rounded-full bg-black/10 dark:bg-white/10 grid place-items-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-1.5 flex-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectTab(item.id);
                      onCloseMobile();
                    }}
                    className={`flex items-center gap-3 px-4 h-11 rounded-xl text-left font-medium transition ${
                      isActive
                        ? 'bg-[#2563eb] text-white shadow'
                        : settings.darkMode
                        ? 'hover:bg-white/10 text-white/80'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <Icon className="w-4.5 h-4.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
