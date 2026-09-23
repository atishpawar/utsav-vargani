import React from 'react';
import { useApp } from '../context/AppContext';
import { formatINR, numberToWordsIndian, formatDate } from '../data/utils';
import { Printer, Download, X, Flame, ShieldCheck } from 'lucide-react';

export default function ReceiptPreview() {
  const { previewReceipt, setPreviewReceipt, settings, addToast } = useApp();

  if (!previewReceipt) return null;

  const handlePrint = () => {
    addToast('Opening print dialog...', 'info');
    window.print();
  };

  const handleDownload = () => {
    addToast(`Receipt PDF downloaded for ${previewReceipt.receiptNo}!`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-sm overflow-y-auto no-print">
      <div className="bg-white rounded-2xl shadow-2xl border border-amber-200 max-w-lg w-full overflow-hidden my-8 animate-fade-in relative">
        
        {/* Action Header bar */}
        <div className="bg-stone-900 text-white px-6 py-4 flex items-center justify-between no-print border-b border-stone-800">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <span className="font-semibold text-sm">Receipt Preview</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={() => setPreviewReceipt(null)}
              className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE RECEIPT CONTAINER */}
        <div id="printable-receipt" className="p-8 bg-amber-50/20 text-stone-900 relative">
          {/* Subtle Decorative Floral Border Frame */}
          <div className="border-2 border-dashed border-amber-400 p-6 rounded-xl bg-white shadow-sm relative overflow-hidden">
            
            {/* Top Marathi Festival Watermark Emblem */}
            <div className="text-center pb-4 border-b border-amber-200/80 mb-6">
              <div className="inline-flex items-center justify-center space-x-2 text-amber-600 mb-1">
                <Flame className="w-5 h-5 fill-amber-500 text-amber-600" />
                <span className="font-bold tracking-widest uppercase text-xs text-amber-700">
                  {settings.orgName || 'Shree Ganesh Utsav Mandal'}
                </span>
                <Flame className="w-5 h-5 fill-amber-500 text-amber-600" />
              </div>
              <h1 className="text-2xl font-black text-rose-950 tracking-tight">
                {settings.orgName ? 'UTSAV VARGANI' : 'UTSAV VARGANI'}
              </h1>
              <p className="text-xs font-semibold text-amber-700 mt-1 tracking-wider">
                {settings.festivalSubtitle || 'गणपती • दहीहंडी • नवरात्र'}
              </p>
              <div className="text-[11px] text-stone-500 mt-1">{settings.address}</div>
            </div>

            {/* Receipt Title Banner */}
            <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-900 text-white text-center py-1.5 px-4 rounded-lg font-bold text-xs uppercase tracking-widest shadow-sm mb-6 flex justify-between items-center">
              <span>VARGANI RECEIPT</span>
              <span className="text-[11px] opacity-90">{settings.year}</span>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs mb-6 bg-amber-50/50 p-4 rounded-lg border border-amber-100">
              <div>
                <span className="text-stone-500 block uppercase font-medium text-[10px]">Receipt No</span>
                <span className="font-bold text-stone-900 text-sm">{previewReceipt.receiptNo}</span>
              </div>
              <div className="text-right">
                <span className="text-stone-500 block uppercase font-medium text-[10px]">Date</span>
                <span className="font-bold text-stone-900 text-sm">{formatDate(previewReceipt.date)}</span>
              </div>
            </div>

            {/* Donor & Amount Details */}
            <div className="space-y-3 text-xs mb-6">
              <div className="border-b border-stone-100 pb-2">
                <span className="text-stone-500 text-[11px] font-medium block">Received From:</span>
                <span className="text-base font-bold text-stone-900">{previewReceipt.name}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b border-stone-100 pb-2">
                <div>
                  <span className="text-stone-500 text-[11px] font-medium block">Mobile:</span>
                  <span className="font-semibold text-stone-800">{previewReceipt.mobile}</span>
                </div>
                <div>
                  <span className="text-stone-500 text-[11px] font-medium block">Address:</span>
                  <span className="font-semibold text-stone-800">{previewReceipt.address || 'Pune, Maharashtra'}</span>
                </div>
              </div>

              <div className="bg-amber-100/60 p-3 rounded-lg border border-amber-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-amber-900 font-bold uppercase text-[11px]">Amount Collected:</span>
                  <span className="text-lg font-black text-rose-950">{formatINR(previewReceipt.amount)}</span>
                </div>
                <div className="text-[11px] font-medium text-amber-950 italic">
                  "{numberToWordsIndian(previewReceipt.amount)}"
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 text-[11px]">
                <div>
                  <span className="text-stone-500 block">Payment Method</span>
                  <span className="font-bold text-stone-800">{previewReceipt.paymentMethod}</span>
                </div>
                <div>
                  <span className="text-stone-500 block">Status</span>
                  <span className={`font-bold inline-block px-2 py-0.5 rounded text-[10px] ${
                    previewReceipt.status === 'Paid' 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    {previewReceipt.status.toUpperCase()}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-stone-500 block">Received By</span>
                  <span className="font-bold text-stone-800">{previewReceipt.receiver}</span>
                </div>
              </div>
            </div>

            {/* Bottom Footer Signature area */}
            <div className="border-t border-dashed border-amber-300 pt-6 mt-6">
              <div className="flex justify-between items-end">
                <div className="text-[11px] text-stone-500 max-w-[200px]">
                  <p className="font-semibold text-amber-900 mb-1">Thank you for your generous contribution!</p>
                  <p className="text-[10px]">May the festival bring joy and prosperity.</p>
                </div>
                <div className="text-center">
                  <div className="w-28 border-b border-stone-400 mb-1"></div>
                  <span className="text-[10px] font-semibold text-stone-600 block uppercase">Authorized Receiver</span>
                  <span className="text-[11px] font-bold text-rose-950">{previewReceipt.receiver}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Close Footer */}
        <div className="bg-stone-50 px-6 py-3 border-t border-stone-200 flex justify-end no-print">
          <button
            onClick={() => setPreviewReceipt(null)}
            className="px-5 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold text-xs rounded-xl transition-colors"
          >
            Close Preview
          </button>
        </div>

      </div>
    </div>
  );
}
