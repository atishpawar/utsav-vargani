import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast() {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-3 max-w-sm w-full px-4 sm:px-0">
      {toasts.map((toast) => {
        let bgColor = 'bg-stone-900 text-white border-stone-800';
        let Icon = CheckCircle2;
        let iconColor = 'text-amber-400';

        if (toast.type === 'error') {
          bgColor = 'bg-rose-950 text-rose-50 border-rose-800';
          Icon = AlertCircle;
          iconColor = 'text-rose-400';
        } else if (toast.type === 'info') {
          bgColor = 'bg-slate-900 text-slate-50 border-slate-700';
          Icon = Info;
          iconColor = 'text-sky-400';
        }

        return (
          <div
            key={toast.id}
            className={`flex items-start justify-between p-4 rounded-xl shadow-xl border backdrop-blur-md transition-all duration-300 transform translate-y-0 ${bgColor}`}
          >
            <div className="flex items-start space-x-3">
              <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconColor}`} />
              <p className="text-sm font-medium leading-snug">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-4 text-stone-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
