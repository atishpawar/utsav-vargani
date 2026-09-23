import React from 'react';
import { useApp } from '../context/AppContext';
import { formatINR } from '../data/utils';
import { QrCode, X, Printer, Copy, Check } from 'lucide-react';

export default function QrModal() {
  const { qrModalData, setQrModalData, setPreviewReceipt, settings, addToast } = useApp();
  const [copied, setCopied] = React.useState(false);

  if (!qrModalData) return null;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(settings.upiId);
    setCopied(true);
    addToast('UPI ID copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintReceipt = () => {
    const target = qrModalData;
    setQrModalData(null);
    setPreviewReceipt(target);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-amber-200 max-w-md w-full overflow-hidden relative">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-xs">
              <QrCode className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-none">Scan & Pay</h3>
              <p className="text-xs text-amber-100 mt-1">UPI QR Payment Voucher</p>
            </div>
          </div>
          <button
            onClick={() => setQrModalData(null)}
            className="text-amber-100 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 text-center">
          
          <div className="mb-4">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-1">Receipt Number</span>
            <span className="inline-block px-3 py-1 bg-amber-100 text-amber-900 font-bold text-sm rounded-lg border border-amber-200">
              {qrModalData.receiptNo}
            </span>
          </div>

          <div className="mb-4">
            <span className="text-xs font-medium text-stone-500 block mb-1">Donor Name</span>
            <p className="font-bold text-stone-900 text-base">{qrModalData.name}</p>
          </div>

          {/* Amount Badge */}
          <div className="bg-rose-950 text-white p-3 rounded-xl mb-6 shadow-sm">
            <span className="text-xs text-rose-200 block">Total Amount Payable</span>
            <span className="text-2xl font-black text-amber-400">{formatINR(qrModalData.amount)}</span>
          </div>

          {/* QR Code Container */}
          <div className="inline-block p-4 bg-white border-2 border-amber-300 rounded-2xl shadow-inner mb-5 relative group">
            <img
              src={settings.qrImage || '/assets/qr-code.png'}
              alt="UPI QR Code"
              className="w-48 h-48 object-contain mx-auto"
              onError={(e) => {
                // Fallback if image fails to load
                e.target.onerror = null;
                e.target.src = '/assets/qr-code.svg';
              }}
            />
            <div className="mt-2 text-[11px] font-semibold text-stone-500">
              Accepts GPay, PhonePe, Paytm, BHIM
            </div>
          </div>

          {/* UPI ID Copy Field */}
          <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 flex items-center justify-between mb-6">
            <div className="text-left">
              <span className="text-[10px] text-stone-400 uppercase font-semibold block">Official Mandal UPI ID</span>
              <span className="text-xs font-bold text-stone-800 font-mono">{settings.upiId}</span>
            </div>
            <button
              onClick={handleCopyUpi}
              className="flex items-center space-x-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-200" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setQrModalData(null)}
              className="flex-1 py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-sm rounded-xl transition-colors"
            >
              Close
            </button>
            <button
              onClick={handlePrintReceipt}
              className="flex-1 py-2.5 px-4 bg-rose-950 hover:bg-rose-900 text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center space-x-2 shadow-md"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Print Receipt</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
