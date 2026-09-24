import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, TrendingUp, Calendar, Tag, User, CreditCard, DollarSign, FileText } from 'lucide-react';

export default function OtherIncomeModal({ isOpen, onClose }) {
  const { settings, addOtherIncome, addToast, selectedYear } = useApp();

  const getDefaultDate = () => {
    if (selectedYear && selectedYear !== 'All' && selectedYear !== new Date().getFullYear().toString()) {
      return `${selectedYear}-09-15`;
    }
    return new Date().toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    date: getDefaultDate(),
    category: 'Advertisement',
    sourceName: '',
    description: '',
    amount: '',
    paymentMethod: 'Cash',
    receivedBy: settings.defaultReceiver || (settings.receivers[0] || 'Admin'),
    notes: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.sourceName.trim()) {
      addToast('Please enter advertiser / sponsor name!', 'error');
      return;
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      addToast('Please enter a valid income amount!', 'error');
      return;
    }

    await addOtherIncome({
      ...formData,
      amount: Number(formData.amount),
    });

    onClose();
    // Reset form
    setFormData({
      date: new Date().toISOString().split('T')[0],
      category: 'Advertisement',
      sourceName: '',
      description: '',
      amount: '',
      paymentMethod: 'Cash',
      receivedBy: settings.defaultReceiver || (settings.receivers[0] || 'Admin'),
      notes: '',
    });
  };

  const categories = [
    'Advertisement',
    'Prize Money / Competition',
    'Sponsorship',
    'Stall Rent / Stall Fee',
    'Mandal Donation / Grant',
    'Other / Miscellaneous',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-amber-200/80 space-y-6 relative max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-100 rounded-2xl text-emerald-800">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-stone-900 tracking-tight">
                Record Additional / Extra Income
              </h2>
              <p className="text-xs text-stone-500">
                Advertisements, prizes, sponsorships, or stall rent
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Income Category & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1 flex items-center space-x-1">
                <Tag className="w-3.5 h-3.5 text-amber-600" />
                <span>Income Category</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                <span>Date</span>
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          {/* Source / Advertiser Name */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase mb-1 flex items-center space-x-1">
              <User className="w-3.5 h-3.5 text-amber-600" />
              <span>Source / Advertiser / Sponsor Name</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Pune Motors, Local Sweet Shop, Competition 1st Prize"
              value={formData.sourceName}
              onChange={(e) => setFormData({ ...formData, sourceName: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          {/* Amount & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1 flex items-center space-x-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>Income Amount (₹)</span>
              </label>
              <input
                type="number"
                placeholder="e.g. 5000"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-emerald-50/50 border border-emerald-300 rounded-xl text-base font-black text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1 flex items-center space-x-1">
                <CreditCard className="w-3.5 h-3.5 text-amber-600" />
                <span>Payment Method</span>
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Cash">Cash</option>
                <option value="UPI / QR">UPI / QR</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
          </div>

          {/* Received By */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase mb-1 flex items-center space-x-1">
              <User className="w-3.5 h-3.5 text-amber-600" />
              <span>Received By</span>
            </label>
            <select
              value={formData.receivedBy}
              onChange={(e) => setFormData({ ...formData, receivedBy: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {(settings.receivers || []).map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
              <option value="Admin">Admin</option>
            </select>
          </div>

          {/* Description & Notes */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase mb-1 flex items-center space-x-1">
              <FileText className="w-3.5 h-3.5 text-amber-600" />
              <span>Description / Details</span>
            </label>
            <textarea
              rows="2"
              placeholder="e.g. Main Arch Flex Banner advertisement sponsorship fee for 10 days"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-4 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-xs rounded-xl shadow-md transition-all"
            >
              Save Extra Income Entry
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
