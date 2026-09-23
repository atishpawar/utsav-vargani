import React from 'react';
import { useApp } from '../context/AppContext';
import { AlertTriangle, Info, CheckCircle, X } from 'lucide-react';

export default function ConfirmModal() {
  const { confirmModalData, setConfirmModalData } = useApp();

  if (!confirmModalData) return null;

  const { title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'warning', onConfirm } = confirmModalData;

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    setConfirmModalData(null);
  };

  let iconHeader = <AlertTriangle className="w-6 h-6 text-amber-600" />;
  let btnClass = 'bg-amber-600 hover:bg-amber-700 text-white';

  if (type === 'danger') {
    iconHeader = <AlertTriangle className="w-6 h-6 text-rose-600" />;
    btnClass = 'bg-rose-600 hover:bg-rose-700 text-white';
  } else if (type === 'success') {
    iconHeader = <CheckCircle className="w-6 h-6 text-emerald-600" />;
    btnClass = 'bg-emerald-600 hover:bg-emerald-700 text-white';
  } else if (type === 'info') {
    iconHeader = <Info className="w-6 h-6 text-sky-600" />;
    btnClass = 'bg-sky-600 hover:bg-sky-700 text-white';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-md w-full p-6 relative overflow-hidden">
        {/* Top subtle festive strip */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-900" />
        
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-stone-100 rounded-xl">
              {iconHeader}
            </div>
            <h3 className="text-lg font-bold text-stone-900">{title}</h3>
          </div>
          <button
            onClick={() => setConfirmModalData(null)}
            className="text-stone-400 hover:text-stone-600 p-1 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-stone-600 mb-6 leading-relaxed">{message}</p>

        <div className="flex items-center justify-end space-x-3">
          <button
            onClick={() => setConfirmModalData(null)}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`px-5 py-2 rounded-xl text-sm font-semibold shadow-md transition-all ${btnClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
