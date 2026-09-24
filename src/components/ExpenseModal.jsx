import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Receipt, PlusCircle } from 'lucide-react';

export default function ExpenseModal({ isOpen, onClose }) {
  const { addExpense, settings, selectedYear } = useApp();

  const getDefaultDate = () => {
    if (selectedYear && selectedYear !== 'All' && selectedYear !== new Date().getFullYear().toString()) {
      return `${selectedYear}-09-15`;
    }
    return new Date().toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    date: getDefaultDate(),
    category: 'Decoration',
    description: '',
    amount: '',
    paidBy: 'Admin',
    paymentMethod: 'Cash',
    notes: '',
  });

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const categories = [
    'Decoration',
    'Sound System',
    'Mandap',
    'Lighting',
    'Prasad',
    'Advertisement',
    'Security',
    'Other',
  ];

  const validate = () => {
    const newErrors = {};
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.amount || Number(formData.amount) <= 0) newErrors.amount = 'Valid amount is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    addExpense(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-lg w-full overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-stone-900 text-white p-5 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-rose-950 text-amber-400 rounded-xl">
              <Receipt className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base">Record Festival Expense</h3>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
              Expense Description *
            </label>
            <input
              type="text"
              placeholder="e.g. Stage Decoration Flowers & Lights"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`w-full px-3.5 py-2.5 bg-stone-50 border ${
                errors.description ? 'border-rose-500' : 'border-stone-300'
              } rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500`}
            />
            {errors.description && (
              <span className="text-xs text-rose-600 mt-1 block">{errors.description}</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                Amount (₹) *
              </label>
              <input
                type="number"
                placeholder="e.g. 5000"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className={`w-full px-3.5 py-2.5 bg-stone-50 border ${
                  errors.amount ? 'border-rose-500' : 'border-stone-300'
                } rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500`}
              />
              {errors.amount && (
                <span className="text-xs text-rose-600 mt-1 block">{errors.amount}</span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                Paid By *
              </label>
              <select
                value={formData.paidBy}
                onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {settings.receivers.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                Payment Method
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="Cash">Cash</option>
                <option value="UPI / QR">UPI / QR</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                Notes / Reference
              </label>
              <input
                type="text"
                placeholder="Vendor name or bill #"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-rose-950 hover:bg-rose-900 text-white rounded-xl text-sm font-semibold transition-colors shadow-md flex items-center space-x-2"
            >
              <PlusCircle className="w-4 h-4 text-amber-400" />
              <span>Save Expense</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
