import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Console, Session, HistorySession, Settings, Toast, AlarmBanner, Customer } from './types';
import { DEFAULT_CONSOLES, DEFAULT_SETTINGS } from './data/defaults';

import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { GamingStationsView } from './components/GamingStationsView';
import { HistoryView } from './components/HistoryView';
import { CustomersView } from './components/CustomersView';
import { SettingsView } from './components/SettingsView';

import { StartSessionModal } from './components/StartSessionModal';
import { AddCustomTimeModal } from './components/AddCustomTimeModal';
import { EditConsoleModal } from './components/EditConsoleModal';
import { InvoiceModal } from './components/InvoiceModal';
import { ToastContainer } from './components/ToastContainer';
import { AlarmBannerComponent } from './components/AlarmBanner';

export const App: React.FC = () => {
  const [, setTick] = useState<number>(0);
  const [consoles, setConsoles] = useState<Console[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [history, setHistory] = useState<HistorySession[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [activeSettingsSubTab, setActiveSettingsSubTab] = useState<string>('consoles');

  // Modals
  const [startModalOpen, setStartModalOpen] = useState<boolean>(false);
  const [startModalConsoleId, setStartModalConsoleId] = useState<string | null>(null);

  const [customTimeModalSessionId, setCustomTimeModalSessionId] = useState<string | null>(null);

  const [editConsoleModalOpen, setEditConsoleModalOpen] = useState<boolean>(false);
  const [consoleToEdit, setConsoleToEdit] = useState<Console | null>(null);

  const [viewInvoiceSession, setViewInvoiceSession] = useState<HistorySession | null>(null);

  // Filters for History
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [consoleFilter, setConsoleFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // UI state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [alarmBanner, setAlarmBanner] = useState<AlarmBanner | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const alarmFiredSet = useRef<Set<string>>(new Set());

  // 1. Initial Load from LocalStorage
  useEffect(() => {
    const savedConsoles = localStorage.getItem('gh_consoles');
    const savedSessions = localStorage.getItem('gh_sessions');
    const savedHistory = localStorage.getItem('gh_history');
    const savedSettings = localStorage.getItem('gh_settings');

    setConsoles(savedConsoles ? JSON.parse(savedConsoles) : DEFAULT_CONSOLES);
    setSessions(savedSessions ? JSON.parse(savedSessions) : []);
    setHistory(savedHistory ? JSON.parse(savedHistory) : []);
    setSettings(savedSettings ? JSON.parse(savedSettings) : DEFAULT_SETTINGS);
  }, []);

  // Sync to LocalStorage
  useEffect(() => {
    if (consoles.length) localStorage.setItem('gh_consoles', JSON.stringify(consoles));
  }, [consoles]);

  useEffect(() => {
    localStorage.setItem('gh_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('gh_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('gh_settings', JSON.stringify(settings));
    // Apply dark mode class to root document element
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  // 1-second interval timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Request Notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Toast Helper
  const addToast = (msg: string, type: 'success' | 'warn' | 'error' = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  // Audio Synth Tone Player
  const playTone = (type: 'warn' | 'expired' = 'warn') => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type === 'expired' ? 'sawtooth' : 'sine';
      osc.frequency.value = type === 'expired' ? 880 : type === 'warn' ? 660 : 440;

      osc.connect(gain);
      gain.connect(ctx.destination);

      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);

      osc.start();
      osc.stop(ctx.currentTime + 0.6);

      if (type === 'expired') {
        setTimeout(() => {
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.frequency.value = 880;
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          gain2.gain.setValueAtTime(0.0001, ctx.currentTime);
          gain2.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.05);
          gain2.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
          osc2.start();
          osc2.stop(ctx.currentTime + 0.6);
        }, 300);
      }
    } catch {
      // Audio autoplay blocked or unsupported
    }
  };

  // Alarm Check Loop (5m warning, 1m warning, expired)
  useEffect(() => {
    sessions.forEach((s) => {
      if (s.status !== 'running') return;

      const remSec = Math.floor((s.endAt - Date.now()) / 1000);
      const key5 = `${s.id}_5`;
      const key1 = `${s.id}_1`;
      const key0 = `${s.id}_0`;

      const cObj = consoles.find((item) => item.id === s.consoleId);
      const consoleTitle = cObj ? `${cObj.name} ${cObj.stationNumber}` : 'Station';

      // 5 Minutes Warning
      if (remSec <= 300 && remSec > 295 && settings.alarm5 && !alarmFiredSet.current.has(key5)) {
        alarmFiredSet.current.add(key5);
        playTone('warn');
        setAlarmBanner({
          active: true,
          msg: `${s.customerName} on ${consoleTitle} - 5 min left`,
        });
        addToast(`5 min left: ${s.customerName} @ ${consoleTitle}`, 'warn');

        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('GameHub - 5 Min Warning', {
            body: `${s.customerName} - ${consoleTitle}`,
          });
        }
      }

      // 1 Minute Warning
      if (remSec <= 60 && remSec > 55 && settings.alarm1 && !alarmFiredSet.current.has(key1)) {
        alarmFiredSet.current.add(key1);
        playTone('warn');
        setAlarmBanner({
          active: true,
          msg: `${s.customerName} on ${consoleTitle} - 1 min left!`,
        });
        addToast(`1 min left: ${s.customerName}`, 'warn');
      }

      // Expired Alarm
      if (remSec <= 0 && !alarmFiredSet.current.has(key0)) {
        alarmFiredSet.current.add(key0);
        if (settings.alarmExpired) {
          playTone('expired');
          setAlarmBanner({
            active: true,
            msg: `Session Expired: ${s.customerName} on ${consoleTitle}`,
          });
        }

        setSessions((prev) =>
          prev.map((item) => (item.id === s.id ? { ...item, status: 'expired' } : item))
        );
        addToast(`Expired: ${s.customerName}`, 'error');
      }
    });
  }, [sessions, consoles, settings]);

  // Price Calculation Logic
  const calculatePrice = (consoleId: string, durationMins: number): number => {
    const cObj = consoles.find((c) => c.id === consoleId);
    if (!cObj) return 0;

    const presetMinutes = [5, 10, 15, 30, 45, 60];
    if (presetMinutes.includes(durationMins) && cObj.rates[durationMins]) {
      return cObj.rates[durationMins];
    }
    return Math.round((cObj.hourlyRate / 60) * durationMins);
  };

  // Active and Available Filters
  const activeSessions = sessions.filter(
    (s) => s.status === 'running' || s.status === 'paused' || s.status === 'expired'
  );

  const availableConsoles = consoles.filter(
    (c) =>
      c.enabled &&
      !sessions.some(
        (s) =>
          (s.status === 'running' || s.status === 'paused' || s.status === 'expired') &&
          s.consoleId === c.id
      )
  );

  // Revenue & Analytics
  const todayRevenue = useMemo(() => {
    const todayStr = new Date().toDateString();
    return history
      .filter((h) => new Date(h.completedAt).toDateString() === todayStr)
      .reduce((acc, h) => acc + h.totalPrice, 0);
  }, [history]);

  const completedTodayCount = useMemo(() => {
    const todayStr = new Date().toDateString();
    return history.filter((h) => new Date(h.completedAt).toDateString() === todayStr).length;
  }, [history]);

  const totalCustomersCount = useMemo(() => {
    const set = new Set<string>();
    history.forEach((h) => set.add(h.customerName.toLowerCase()));
    sessions.forEach((s) => set.add(s.customerName.toLowerCase()));
    return set.size;
  }, [history, sessions]);

  // Upcoming Expirations
  const upcomingExpirations = useMemo(() => {
    return activeSessions
      .filter((s) => s.status === 'running')
      .map((s) => {
        const rem = Math.max(0, Math.floor((s.endAt - Date.now()) / 1000));
        return { ...s, rem };
      })
      .filter((s) => s.rem > 0)
      .sort((a, b) => a.rem - b.rem)
      .slice(0, 5);
  }, [activeSessions]);

  // Unique Customers Derived from History
  const customersList = useMemo<Customer[]>(() => {
    const map = new Map<string, Customer>();
    history.forEach((h) => {
      const key = h.customerName.toLowerCase();
      const existing = map.get(key);
      if (existing) {
        existing.visits++;
        existing.spent += h.totalPrice;
        existing.last = Math.max(existing.last, h.completedAt);
        if (h.phone && !existing.phone) existing.phone = h.phone;
      } else {
        map.set(key, {
          name: h.customerName,
          phone: h.phone,
          visits: 1,
          spent: h.totalPrice,
          last: h.completedAt,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.last - a.last);
  }, [history]);

  // Filtered History
  const filteredHistory = useMemo(() => {
    let list = [...history];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((h) => {
        const cObj = consoles.find((c) => c.id === h.consoleId);
        const cName = cObj ? `${cObj.name} ${cObj.stationNumber}`.toLowerCase() : '';
        return (
          h.customerName.toLowerCase().includes(q) ||
          h.invoiceNo.toLowerCase().includes(q) ||
          cName.includes(q)
        );
      });
    }

    if (consoleFilter !== 'all') {
      list = list.filter((h) => h.consoleId === consoleFilter);
    }

    if (statusFilter !== 'all') {
      list = list.filter((h) => h.status === statusFilter || h.paymentStatus === statusFilter);
    }

    if (dateFilter === 'today') {
      const todayStr = new Date().toDateString();
      list = list.filter((h) => new Date(h.completedAt).toDateString() === todayStr);
    } else if (dateFilter === 'week') {
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      list = list.filter((h) => h.completedAt >= weekAgo);
    }

    return list;
  }, [history, searchQuery, consoleFilter, statusFilter, dateFilter, consoles]);

  // Actions
  const handleStartSession = (data: {
    consoleId: string;
    customerName: string;
    phone: string;
    durationMins: number;
    calculatedPrice: number;
  }) => {
    if (sessions.some((s) => s.consoleId === data.consoleId && (s.status === 'running' || s.status === 'paused' || s.status === 'expired'))) {
      addToast('Console already booked', 'error');
      return;
    }

    const now = Date.now();
    const durSec = data.durationMins * 60;
    const invNo = `GH-${String(history.length + sessions.length + 1).padStart(4, '0')}`;

    const newSession: Session = {
      id: Math.random().toString(36).slice(2),
      consoleId: data.consoleId,
      customerName: data.customerName,
      phone: data.phone,
      startAt: now,
      endAt: now + durSec * 1000,
      totalDurationSec: durSec,
      originalDurationSec: durSec,
      addedDurationSec: 0,
      price: data.calculatedPrice,
      totalPrice: data.calculatedPrice,
      status: 'running',
      pausedAt: null,
      remainingWhenPaused: null,
      invoiceNo: invNo,
    };

    setSessions((prev) => [...prev, newSession]);
    setStartModalOpen(false);
    addToast(`Session started for ${newSession.customerName}`);
  };

  const handlePauseSession = (id: string) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== id || s.status !== 'running') return s;
        return {
          ...s,
          status: 'paused',
          pausedAt: Date.now(),
          remainingWhenPaused: s.endAt - Date.now(),
        };
      })
    );
    addToast('Session paused', 'warn');
  };

  const handleResumeSession = (id: string) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== id || s.status !== 'paused' || s.remainingWhenPaused === null) return s;
        return {
          ...s,
          status: 'running',
          endAt: Date.now() + s.remainingWhenPaused,
          pausedAt: null,
          remainingWhenPaused: null,
        };
      })
    );
    addToast('Session resumed');
  };

  const handleExtendSession = (id: string, mins: number) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const addPrice = calculatePrice(s.consoleId, mins);
        const addSec = mins * 60;
        const addMs = addSec * 1000;

        if (s.status === 'paused' && s.remainingWhenPaused !== null) {
          return {
            ...s,
            remainingWhenPaused: s.remainingWhenPaused + addMs,
            totalDurationSec: s.totalDurationSec + addSec,
            addedDurationSec: s.addedDurationSec + addSec,
            totalPrice: s.totalPrice + addPrice,
          };
        }

        return {
          ...s,
          endAt: s.endAt + addMs,
          totalDurationSec: s.totalDurationSec + addSec,
          addedDurationSec: s.addedDurationSec + addSec,
          totalPrice: s.totalPrice + addPrice,
          status: s.status === 'expired' ? 'running' : s.status,
        };
      })
    );

    // Clear alarm fired tracking for this session
    alarmFiredSet.current.delete(`${id}_5`);
    alarmFiredSet.current.delete(`${id}_1`);
    alarmFiredSet.current.delete(`${id}_0`);

    addToast(`+${mins}m added to session`);
  };

  const handleStopSession = (id: string) => {
    const s = sessions.find((item) => item.id === id);
    if (!s) return;

    const completedAt = Date.now();
    const tax = Math.round((s.totalPrice * settings.taxPercent) / 100);
    const discount = Math.round((s.totalPrice * settings.discountPercent) / 100);

    const historyRecord: HistorySession = {
      ...s,
      completedAt,
      status: s.status === 'expired' ? 'expired' : 'completed',
      paymentStatus: 'Pending',
      paymentMethod: 'Cash',
      tax,
      discount,
    };

    setHistory((prev) => [historyRecord, ...prev]);
    setSessions((prev) => prev.filter((item) => item.id !== id));
    addToast('Session stopped & moved to history');
  };

  const handleResetConsoleSession = (id: string) => {
    if (!confirm('Reset this console? This will clear active session without billing.')) return;
    setSessions((prev) => prev.filter((s) => s.id !== id));
    addToast('Console session reset', 'warn');
  };

  const handleTogglePaymentStatus = (id: string) => {
    setHistory((prev) =>
      prev.map((h) =>
        h.id === id ? { ...h, paymentStatus: h.paymentStatus === 'Paid' ? 'Pending' : 'Paid' } : h
      )
    );
    addToast('Payment status updated');
  };

  const handleDeleteHistoryRecord = (id: string) => {
    setHistory((prev) => prev.filter((h) => h.id !== id));
    addToast('History record removed', 'warn');
  };

  const handleExportCSV = () => {
    const rows = [
      ['Invoice', 'Customer', 'Phone', 'Console', 'Start', 'End', 'Duration(min)', 'Charges', 'Status', 'Payment'],
    ];

    filteredHistory.forEach((h) => {
      const cObj = consoles.find((c) => c.id === h.consoleId);
      const cTitle = cObj ? `${cObj.name} ${cObj.stationNumber}` : 'Console';
      rows.push([
        h.invoiceNo,
        h.customerName,
        h.phone,
        cTitle,
        new Date(h.startAt).toLocaleString(),
        new Date(h.completedAt).toLocaleString(),
        String(Math.round(h.totalDurationSec / 60)),
        String(h.totalPrice),
        h.status,
        h.paymentStatus,
      ]);
    });

    const csvContent = rows
      .map((r) => r.map((field) => `"${field.replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'gamehub_history.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('CSV exported successfully');
  };

  const handleResetAllData = () => {
    if (confirm('Are you sure you want to reset all data? LocalStorage will be cleared.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className={`min-h-screen font-sans ${settings.darkMode ? 'bg-[#0b1220] text-white' : 'bg-[#f5f7fb] text-[#0f172a]'}`}>
      {/* Header */}
      <Header
        settings={settings}
        onToggleDarkMode={() => setSettings((s) => ({ ...s, darkMode: !s.darkMode }))}
        onOpenStartModal={() => {
          setStartModalConsoleId(availableConsoles[0]?.id || null);
          setStartModalOpen(true);
        }}
        onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
        alarmBanner={alarmBanner}
        onStopAlarm={() => setAlarmBanner(null)}
      />

      {/* Main Container */}
      <div className="flex">
        {/* Navigation Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setCurrentTab(tab);
            setMobileSidebarOpen(false);
          }}
          settings={settings}
          activeCount={activeSessions.length}
          availableCount={availableConsoles.length}
          totalConsoles={consoles.length}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* View Router */}
        <main className="flex-1 min-w-0 px-3 lg:px-6 py-4 lg:py-6">
          {currentTab === 'dashboard' && (
            <DashboardView
              consoles={consoles}
              activeSessions={activeSessions}
              settings={settings}
              todayRevenue={todayRevenue}
              completedTodayCount={completedTodayCount}
              totalCustomersCount={totalCustomersCount}
              availableConsoles={availableConsoles}
              upcomingExpirations={upcomingExpirations}
              onOpenStartModal={(cId) => {
                setStartModalConsoleId(cId || availableConsoles[0]?.id || null);
                setStartModalOpen(true);
              }}
              onNavigateTab={(tab, subTab) => {
                setCurrentTab(tab);
                if (subTab) setActiveSettingsSubTab(subTab);
              }}
              onPauseSession={handlePauseSession}
              onResumeSession={handleResumeSession}
              onStopSession={handleStopSession}
              onExportCSV={handleExportCSV}
            />
          )}

          {currentTab === 'gaming' && (
            <GamingStationsView
              consoles={consoles}
              sessions={sessions}
              settings={settings}
              onOpenStartModal={(cId) => {
                setStartModalConsoleId(cId || availableConsoles[0]?.id || null);
                setStartModalOpen(true);
              }}
              onNavigateTab={(tab, subTab) => {
                setCurrentTab(tab);
                if (subTab) setActiveSettingsSubTab(subTab);
              }}
              onPauseSession={handlePauseSession}
              onResumeSession={handleResumeSession}
              onExtendSession={handleExtendSession}
              onOpenCustomTimeModal={(sId) => setCustomTimeModalSessionId(sId)}
              onStopSession={handleStopSession}
              onResetConsoleSession={handleResetConsoleSession}
            />
          )}

          {currentTab === 'history' && (
            <HistoryView
              consoles={consoles}
              history={filteredHistory}
              settings={settings}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              consoleFilter={consoleFilter}
              onConsoleFilterChange={setConsoleFilter}
              dateFilter={dateFilter}
              onDateFilterChange={setDateFilter}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              onViewInvoice={(record) => setViewInvoiceSession(record)}
              onTogglePaymentStatus={handleTogglePaymentStatus}
              onDeleteHistoryRecord={handleDeleteHistoryRecord}
              onExportCSV={handleExportCSV}
            />
          )}

          {currentTab === 'customers' && (
            <CustomersView
              customers={customersList}
              settings={settings}
              onFilterHistoryByCustomer={(custName) => {
                setSearchQuery(custName);
                setCurrentTab('history');
              }}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              consoles={consoles}
              settings={settings}
              activeSubTab={activeSettingsSubTab}
              onSubTabChange={setActiveSettingsSubTab}
              onUpdateSettings={setSettings}
              onUpdateConsoles={setConsoles}
              onOpenEditConsoleModal={(c) => {
                setConsoleToEdit(c || null);
                setEditConsoleModalOpen(true);
              }}
              onTestSound={(type) => {
                playTone(type);
                addToast(`Tested ${type} alarm tone`);
              }}
              onResetAllData={handleResetAllData}
            />
          )}
        </main>
      </div>

      {/* Start Session Modal */}
      {startModalOpen && (
        <StartSessionModal
          consoles={consoles}
          initialConsoleId={startModalConsoleId}
          settings={settings}
          onClose={() => setStartModalOpen(false)}
          onStartSession={handleStartSession}
          calculatePrice={calculatePrice}
        />
      )}

      {/* Add Custom Time Modal */}
      {customTimeModalSessionId && (
        <AddCustomTimeModal
          sessionId={customTimeModalSessionId}
          settings={settings}
          onClose={() => setCustomTimeModalSessionId(null)}
          onAddCustomTime={(id, mins) => handleExtendSession(id, mins)}
        />
      )}

      {/* Edit Console Modal */}
      {editConsoleModalOpen && (
        <EditConsoleModal
          consoleToEdit={consoleToEdit}
          existingCount={consoles.length}
          settings={settings}
          onClose={() => {
            setEditConsoleModalOpen(false);
            setConsoleToEdit(null);
          }}
          onSaveConsole={(updatedConsole) => {
            setConsoles((prev) => {
              const idx = prev.findIndex((c) => c.id === updatedConsole.id);
              if (idx >= 0) {
                const copy = [...prev];
                copy[idx] = updatedConsole;
                return copy;
              }
              return [...prev, updatedConsole];
            });
            addToast('Console saved successfully');
          }}
        />
      )}

      {/* Invoice View Modal */}
      {viewInvoiceSession && (
        <InvoiceModal
          session={viewInvoiceSession}
          consoles={consoles}
          settings={settings}
          onClose={() => setViewInvoiceSession(null)}
        />
      )}

      {/* Alarm Alert Bottom Banner */}
      <AlarmBannerComponent
        alarm={alarmBanner}
        onStop={() => setAlarmBanner(null)}
      />

      {/* Toast Notifications Container */}
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
    </div>
  );
};
