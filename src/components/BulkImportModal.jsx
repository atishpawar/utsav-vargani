import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import { X, Upload, FileText, Download, CheckCircle, AlertCircle } from 'lucide-react';

export default function BulkImportModal({ isOpen, onClose }) {
  const { receipts, setReceipts, addToast, refreshActivityLogs } = useApp();

  const [csvText, setCsvText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCsvText(event.target.result);
        addToast('CSV file loaded. Review and click Import!');
      };
      reader.readAsText(file);
    }
  };

  const parseCSV = (text) => {
    const lines = text.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, '').toLowerCase());
    const items = [];

    for (let i = 1; i < lines.length; i++) {
      // Regex handling quotes in CSV
      const row = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
      if (!row || row.length < 2) continue;

      const cleanRow = row.map((val) => val.trim().replace(/^"|"$/g, ''));
      const obj = {};

      headers.forEach((h, idx) => {
        obj[h] = cleanRow[idx] || '';
      });

      // Normalize object keys
      const date = obj.date || obj.year ? `${obj.year || '2025'}-09-15` : new Date().toISOString().split('T')[0];
      const name = obj.name || obj.donorname || obj.donor || '';
      const amount = Number(obj.amount || obj.vargani || 0);

      if (name && amount > 0) {
        items.push({
          date,
          name,
          mobile: obj.mobile || obj.phone || '',
          amount,
          paymentMethod: obj.paymentmethod || obj.payment || 'Cash',
          status: obj.status || 'Paid',
          receiptNo: obj.receiptno || obj.receipt || '',
          address: obj.address || '',
          receiver: obj.receiver || 'Admin',
        });
      }
    }

    return items;
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!csvText.trim()) {
      addToast('Please upload a CSV file or paste CSV text first!', 'error');
      return;
    }

    const items = parseCSV(csvText);
    if (items.length === 0) {
      addToast('No valid records found in CSV text! Ensure columns include Name and Amount.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.bulkImportReceipts(items);
      addToast(res.message || `Successfully imported ${items.length} past records!`, 'success');
      
      // Sync fresh receipts list
      const freshReceipts = await api.getReceipts().catch(() => null);
      if (freshReceipts) setReceipts(freshReceipts);
      
      refreshActivityLogs();
      onClose();
      setCsvText('');
    } catch (err) {
      addToast(err.message || 'Failed to import past receipts', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadSampleCSV = () => {
    const sample = `ReceiptNo,Date,Name,Mobile,Amount,PaymentMethod,Status,Address,Receiver
VR-2025-1001,2025-09-15,"Rajesh Patil",9876543210,1100,Cash,Paid,"Kothrud Pune",Amit
VR-2025-1002,2025-09-16,"Sneha Kulkarni",9823456789,2100,UPI / QR,Paid,"Deccan Pune",Rahul
VR-2025-1003,2025-09-17,"Vikram Joshi",9898989898,501,Cash,Pending,"Shivajinagar Pune",Sagar`;

    const blob = new Blob([sample], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Sample_Past_Year_Vargani_Import.csv';
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-amber-200/80 space-y-6 relative max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-100 rounded-2xl text-amber-800">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-stone-900 tracking-tight">
                Bulk Import Past Year Donations
              </h2>
              <p className="text-xs text-stone-500">
                Upload CSV or paste past year paper receipt records into database
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Instructions & Sample Download */}
        <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <span className="font-bold text-amber-950 block">CSV Format Standard:</span>
            <span className="text-stone-600 block">
              ReceiptNo, Date, Name, Mobile, Amount, PaymentMethod, Status, Address, Receiver
            </span>
          </div>

          <button
            type="button"
            onClick={downloadSampleCSV}
            className="px-3.5 py-1.5 bg-white hover:bg-amber-100 text-amber-900 font-extrabold rounded-xl border border-amber-300 transition-colors flex items-center space-x-1 whitespace-nowrap shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Sample CSV</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleImportSubmit} className="space-y-4">
          
          {/* File Upload Box */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
              Select CSV File from Computer
            </label>
            <label className="flex items-center justify-center p-4 bg-stone-50 hover:bg-amber-50/50 border-2 border-dashed border-stone-300 hover:border-amber-400 rounded-2xl cursor-pointer transition-colors text-center space-x-2">
              <Upload className="w-5 h-5 text-amber-600" />
              <span className="text-xs font-bold text-stone-700">Click to Browse & Upload CSV File</span>
              <input type="file" accept=".csv,text/csv" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Or Paste Text Area */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
              Or Paste CSV Data Text
            </label>
            <textarea
              rows="6"
              placeholder={`ReceiptNo,Date,Name,Mobile,Amount,PaymentMethod,Status\nVR-2025-1001,2025-09-15,"Rahul Patil",9876543210,1100,Cash,Paid`}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-600 via-orange-600 to-rose-900 hover:from-amber-700 hover:to-rose-950 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4 text-amber-300" />
              <span>{isSubmitting ? 'Importing...' : 'Import Past Year Data'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
