export interface ConsoleRates {
  [minutes: number]: number;
}

export interface Console {
  id: string;
  name: string;
  stationNumber: string;
  hourlyRate: number;
  rates: ConsoleRates;
  perMinuteRate: number;
  enabled: boolean;
}

export type SessionStatus = 'running' | 'paused' | 'expired' | 'completed';
export type PaymentStatus = 'Paid' | 'Pending';

export interface Session {
  id: string;
  consoleId: string;
  customerName: string;
  phone: string;
  startAt: number;
  endAt: number;
  totalDurationSec: number;
  originalDurationSec: number;
  addedDurationSec: number;
  price: number;
  totalPrice: number;
  status: SessionStatus;
  pausedAt: number | null;
  remainingWhenPaused: number | null;
  invoiceNo: string;
}

export interface HistorySession extends Session {
  completedAt: number;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  tax: number;
  discount: number;
}

export interface Settings {
  businessName: string;
  logoUrl: string;
  address: string;
  phone: string;
  taxPercent: number;
  discountPercent: number;
  defaultDuration: number;
  billFooter: string;
  alarm5: boolean;
  alarm1: boolean;
  alarmExpired: boolean;
  darkMode: boolean;
}

export interface Customer {
  name: string;
  phone: string;
  visits: number;
  spent: number;
  last: number;
}

export interface Toast {
  id: string;
  msg: string;
  type: 'success' | 'warn' | 'error';
}

export interface AlarmBanner {
  active: boolean;
  msg: string;
}
