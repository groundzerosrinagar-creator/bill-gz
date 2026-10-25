import React from 'react';
import { Toast } from '../types';
import { CheckCircle2, AlertTriangle, AlertCircle, X } from 'lucide-react';

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onDismiss,
}) => {
  return (
    <div className="fixed bottom-4 right-4 z-[80] space-y-2 w-[300px] pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto px-4 py-3 rounded-xl shadow-xl text-[12.5px] font-medium border flex items-center justify-between gap-2 animate-in slide-in-from-bottom-2 duration-200 ${
            t.type === 'error'
              ? 'bg-red-600 text-white border-red-700 shadow-red-500/20'
              : t.type === 'warn'
              ? 'bg-amber-500 text-white border-amber-600 shadow-amber-500/20'
              : 'bg-slate-900 text-white border-slate-800 shadow-black/30'
          }`}
        >
          <div className="flex items-center gap-2">
            {t.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : t.type === 'warn' ? (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            )}
            <span>{t.msg}</span>
          </div>

          <button
            onClick={() => onDismiss(t.id)}
            className="w-5 h-5 rounded grid place-items-center opacity-80 hover:opacity-100 transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
