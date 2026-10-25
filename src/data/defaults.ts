import { Console, Settings } from '../types';

export const DEFAULT_CONSOLES: Console[] = [
  {
    id: "c1",
    name: "PS5",
    stationNumber: "Station 1",
    hourlyRate: 200,
    rates: { 5: 20, 10: 35, 15: 50, 30: 100, 45: 150, 60: 200 },
    perMinuteRate: 3.5,
    enabled: true
  },
  {
    id: "c2",
    name: "PS5",
    stationNumber: "Station 2",
    hourlyRate: 200,
    rates: { 5: 20, 10: 35, 15: 50, 30: 100, 45: 150, 60: 200 },
    perMinuteRate: 3.5,
    enabled: true
  },
  {
    id: "c3",
    name: "PS4",
    stationNumber: "Station 1",
    hourlyRate: 150,
    rates: { 5: 15, 10: 28, 15: 40, 30: 75, 45: 110, 60: 150 },
    perMinuteRate: 2.8,
    enabled: true
  },
  {
    id: "c4",
    name: "Xbox Series X",
    stationNumber: "Station 1",
    hourlyRate: 180,
    rates: { 5: 18, 10: 32, 15: 45, 30: 90, 45: 135, 60: 180 },
    perMinuteRate: 3.2,
    enabled: true
  },
  {
    id: "c5",
    name: "Gaming PC",
    stationNumber: "Rig 1",
    hourlyRate: 250,
    rates: { 5: 25, 10: 45, 15: 65, 30: 125, 45: 185, 60: 250 },
    perMinuteRate: 4.5,
    enabled: true
  },
  {
    id: "c6",
    name: "Racing Simulator",
    stationNumber: "Track 1",
    hourlyRate: 300,
    rates: { 5: 35, 10: 60, 15: 85, 30: 160, 45: 230, 60: 300 },
    perMinuteRate: 5.5,
    enabled: true
  }
];

export const DEFAULT_SETTINGS: Settings = {
  businessName: "GameHub Pro",
  logoUrl: "",
  address: "MG Road, Bengaluru - 560001",
  phone: "+91 98765 43210",
  taxPercent: 5,
  discountPercent: 0,
  defaultDuration: 30,
  billFooter: "Thank you for gaming with us! Visit again.",
  alarm5: true,
  alarm1: true,
  alarmExpired: true,
  darkMode: false
};
