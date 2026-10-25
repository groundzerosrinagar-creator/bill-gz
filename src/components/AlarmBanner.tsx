import React from 'react';
import { AlarmBanner as AlarmBannerType } from '../types';
import { Bell, Volume2 } from 'lucide-react';

interface AlarmBannerProps {
  alarm: AlarmBannerType | null;
  onStop: () => void;
}

export const AlarmBannerComponent: React.FC<AlarmBannerProps> = ({
  alarm,
  onStop,
}) => {
  if (!alarm || !alarm.active) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:w-[380px] z-[75] rounded-2xl bg-red-600 text-white p-4 shadow-2xl flex justify-between items-center animate-bounce">
      <div className="flex items-center gap-2.5 text-[13px] font-medium pr-2">
        <Volume2 className="w-5 h-5 shrink-0 text-white animate-pulse" />
        <span>{alarm.msg}</span>
      </div>

      <button
        onClick={onStop}
        className="shrink-0 h-8 px-3 rounded-full bg-white text-red-600 text-[12px] font-bold hover:bg-red-50 transition shadow-md"
      >
        Stop
      </button>
    </div>
  );
};
