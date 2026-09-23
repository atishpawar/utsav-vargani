import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { numberToWordsIndian, generateNextReceiptNo } from '../data/utils';
import { api } from '../api/client';
import {
  Flame,
  Save,
  RotateCcw,
  Eye,
  Plus,
  Calendar,
  IndianRupee,
  QrCode,
  UserCheck,
  Building,
} from 'lucide-react';

export default function NewReceipt() {
  const { addReceipt, settings, receipts, addReceiver, setPreviewReceipt } = useApp();

  // Year-wise next receipt number calculation
  const autoReceiptNo = generateNextReceiptNo(receipts, settings);

  const [formData, setFormData] = useState({
    receiptNo: autoReceiptNo,
    donorId: null,
    date: new Date().toISOString().split('T')[0],
    name: '',
    mobile: '',
    email: '',
    address: 'Pune, Maharashtra',
    paymentMethod: 'Cash',
    amount: '',
    status: 'Paid',
    expectedPaymentOption: 'After 2 Days',
    expectedPaymentDate: '',
    receiver: settings.defaultReceiver || 'Amit',
    notes: '',
  });

  const [amountInWords, setAmountInWords] = useState('Zero Rupees Only');
  const [showAddReceiverInput, setShowAddReceiverInput] = useState(false);
  const [newReceiverName, setNewReceiverName] = useState('');
  const [errors, setErrors] = useState({});
  const [donorSuggestions, setDonorSuggestions] = useState([]);

  // Fast donor lookup auto-suggest
  const handleDonorSearch = async (query) => {
    const q = (query || '').trim();
    if (q.length < 2) {
      setDonorSuggestions([]);
      return;
    }
    try {
      const results = await api.searchDonors(q);
      setDonorSuggestions(results || []);
    } catch {
      // Fallback local search from receipts
      const matches = receipts.filter(
        (r) =>
          r.name.toLowerCase().includes(q.toLowerCase()) ||
          (r.mobile && r.mobile.includes(q))
      );
      const unique = [];
      const seen = new Set();
      matches.forEach((m) => {
        if (!seen.has(m.mobile || m.name)) {
          seen.add(m.mobile || m.name);
          unique.push(m);
        }
      });
      setDonorSuggestions(unique.slice(0, 5));
    }
  };

  const selectDonorSuggestion = (donor) => {
    setFormData((prev) => ({
      ...prev,
      donorId: donor.id || null,
      name: donor.name || prev.name,
      mobile: donor.mobile || prev.mobile,
      email: donor.email || prev.email,
      address: donor.address || prev.address,
    }));
    setDonorSuggestions([]);
  };

  // Auto generate amount in words whenever amount changes
  useEffect(() => {
    const num = Number(formData.amount);
    if (!isNaN(num) && num > 0) {
      setAmountInWords(numberToWordsIndian(num));
    } else {
      setAmountInWords('Zero Rupees Only');
    }
  }, [formData.amount]);

  // Update expectedPaymentDate based on dropdown selection
  useEffect(() => {
    if (formData.status === 'Pending') {
      const today = new Date();
      let days = 2;
      if (formData.expectedPaymentOption === 'After 2 Days') days = 2;
      else if (formData.expectedPaymentOption === 'After 4 Days') days = 4;
      else if (formData.expectedPaymentOption === 'After 7 Days') days = 7;
      else if (formData.expectedPaymentOption === 'After 15 Days') days = 15;

      if (formData.expectedPaymentOption !== 'Custom Date') {
        const target = new Date(today);
        target.setDate(target.getDate() + days);
        setFormData((prev) => ({
          ...prev,
          expectedPaymentDate: target.toISOString().split('T')[0],
        }));
      }
    }
  }, [formData.status, formData.expectedPaymentOption]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full Name is required';
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile Number is required';
    } else if (!/^\d{10}$/.test(formData.mobile.trim())) {
      newErrors.mobile = 'Enter valid 10-digit mobile number';
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      newErrors.amount = 'Valid collection amount is required';
    }
    if (formData.status === 'Pending' && !formData.expectedPaymentDate) {
      newErrors.expectedPaymentDate = 'Expected payment date is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    addReceipt(formData);

    // Reset form for next entry
    handleReset();
  };

  const handleReset = () => {
    setFormData({
      receiptNo: generateNextReceiptNo(receipts, settings),
      donorId: null,
      date: new Date().toISOString().split('T')[0],
      name: '',
      mobile: '',
      email: '',
      address: 'Pune, Maharashtra',
      paymentMethod: 'Cash',
      amount: '',
      status: 'Paid',
      expectedPaymentOption: 'After 2 Days',
      expectedPaymentDate: '',
      receiver: settings.defaultReceiver || (settings.receivers[0] || 'Admin'),
      notes: '',
    });
    setErrors({});
  };

  const handleAddNewReceiver = (e) => {
    e.preventDefault();
    if (newReceiverName.trim()) {
      addReceiver(newReceiverName.trim());
      setFormData({ ...formData, receiver: newReceiverName.trim() });
      setNewReceiverName('');
      setShowAddReceiverInput(false);
    }
  };

  const handlePreview = () => {
    if (!formData.name || !formData.amount) {
      setErrors({
        name: !formData.name ? 'Full Name required for preview' : '',
        amount: !formData.amount ? 'Amount required for preview' : '',
      });
      return;
    }
    setPreviewReceipt({
      receiptNo: formData.receiptNo,
      date: formData.date,
      name: formData.name,
      mobile: formData.mobile || 'N/A',
      address: formData.address || 'Pune, Maharashtra',
      amount: Number(formData.amount),
      paymentMethod: formData.paymentMethod,
      status: formData.status,
      receiver: formData.receiver,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      
      {/* Traditional Receipt Frame Outer */}
      <div className="bg-white rounded-3xl shadow-xl border-2 border-amber-300/80 overflow-hidden relative">
        
        {/* Top Traditional Marathi Vargani Receipt Header */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-900 text-white p-6 sm:p-8 text-center relative">
          <div className="flex items-center justify-center space-x-2 text-amber-300 mb-1">
            <Flame className="w-5 h-5 fill-amber-400" />
            <span className="font-extrabold tracking-widest text-xs uppercase">
              {settings.orgName || 'Shree Ganesh Utsav Mandal'}
            </span>
            <Flame className="w-5 h-5 fill-amber-400" />
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
            VARGANI RECEIPT
          </h1>
          
          <p className="text-xs font-semibold text-amber-200 mt-1 tracking-wider">
            {settings.festivalSubtitle || 'गणपती • दहीहंडी • नवरात्र'}
          </p>

          <div className="mt-4 pt-4 border-t border-white/20 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/20 font-bold font-mono">
              Receipt No: {formData.receiptNo}
            </div>
            <div className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/20 font-semibold flex items-center space-x-1.5">
              <Calendar className="w-4 h-4 text-amber-300" />
              <span>Date: {formData.date}</span>
            </div>
          </div>
        </div>

        {/* Receipt Form Inputs */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 bg-amber-50/10">
          
          {/* Section 1: Donor Information */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-rose-950 mb-4 pb-1 border-b border-amber-200 flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-amber-600" />
              <span>Donor Information</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative">
              
              {/* Donor Name with Auto-Suggest */}
              <div className="relative">
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Patil (Start typing to search existing donors...)"
                  value={formData.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({ ...formData, name: val });
                    handleDonorSearch(val);
                  }}
                  onFocus={() => {
                    if (formData.name.trim().length >= 2) handleDonorSearch(formData.name);
                  }}
                  className={`w-full px-3.5 py-2.5 bg-white border ${
                    errors.name ? 'border-rose-500' : 'border-stone-300'
                  } rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold`}
                />
                {errors.name && <span className="text-xs text-rose-600 mt-1 block">{errors.name}</span>}

                {/* Auto-Suggestion Dropdown */}
                {donorSuggestions.length > 0 && (
                  <div className="absolute z-30 left-0 right-0 top-full mt-1 bg-white border border-amber-300 rounded-2xl shadow-xl max-h-48 overflow-y-auto divide-y divide-stone-100">
                    <div className="px-3 py-1.5 bg-amber-50 text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                      Matching Donors Found (Click to Auto-fill)
                    </div>
                    {donorSuggestions.map((d) => (
                      <button
                        key={d.id || d.mobile}
                        type="button"
                        onClick={() => selectDonorSuggestion(d)}
                        className="w-full px-3.5 py-2.5 text-left hover:bg-amber-100/70 transition-colors flex items-center justify-between"
                      >
                        <div>
                          <span className="block text-xs font-bold text-stone-900">{d.name}</span>
                          <span className="block text-[10px] text-stone-500">{d.address || 'Pune'}</span>
                        </div>
                        <span className="text-xs font-mono font-semibold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                          {d.mobile}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  maxLength={10}
                  value={formData.mobile}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setFormData({ ...formData, mobile: val });
                    if (val.length >= 3) handleDonorSearch(val);
                  }}
                  className={`w-full px-3.5 py-2.5 bg-white border ${
                    errors.mobile ? 'border-rose-500' : 'border-stone-300'
                  } rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono`}
                />
                {errors.mobile && <span className="text-xs text-rose-600 mt-1 block">{errors.mobile}</span>}
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  placeholder="e.g. donor@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kothrud, Pune, Maharashtra"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Amount & Payment Details */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-rose-950 mb-4 pb-1 border-b border-amber-200 flex items-center space-x-2">
              <IndianRupee className="w-4 h-4 text-amber-600" />
              <span>Contribution Details</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Payment Method *
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI / QR">UPI / QR Code</option>
                  <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                  <option value="Cheque">Cheque</option>
                </select>
                {formData.paymentMethod === 'UPI / QR' && (
                  <div className="mt-1.5 flex items-center space-x-1.5 text-xs text-amber-700 font-semibold">
                    <QrCode className="w-3.5 h-3.5" />
                    <span>UPI QR popup will appear after saving</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  placeholder="e.g. 1501"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className={`w-full px-3.5 py-2.5 bg-white border ${
                    errors.amount ? 'border-rose-500' : 'border-stone-300'
                  } rounded-xl text-lg font-black text-rose-950 focus:outline-none focus:ring-2 focus:ring-amber-500`}
                />
                {errors.amount && <span className="text-xs text-rose-600 mt-1 block">{errors.amount}</span>}
              </div>

            </div>

            {/* AUTOMATIC AMOUNT IN WORDS */}
            <div className="mt-4 p-3.5 bg-amber-100/70 rounded-2xl border border-amber-300">
              <span className="text-[11px] font-extrabold uppercase text-amber-900 tracking-wider block">
                Amount in Words:
              </span>
              <p className="text-sm font-bold text-amber-950 italic mt-0.5">
                "{amountInWords}"
              </p>
            </div>
          </div>

          {/* Section 3: Status & Receiver */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                Collection Status *
              </label>
              <div className="flex space-x-4 pt-1">
                <label className="flex items-center space-x-2 cursor-pointer font-bold text-sm">
                  <input
                    type="radio"
                    name="status"
                    value="Paid"
                    checked={formData.status === 'Paid'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-emerald-800">PAID</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer font-bold text-sm">
                  <input
                    type="radio"
                    name="status"
                    value="Pending"
                    checked={formData.status === 'Pending'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-amber-800">PENDING</span>
                </label>
              </div>
            </div>

            {/* If Status = Pending: Expected Payment Dropdown */}
            {formData.status === 'Pending' && (
              <div className="animate-fade-in space-y-3 bg-amber-50 p-4 rounded-2xl border border-amber-200">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Expected Payment Timeline
                  </label>
                  <select
                    value={formData.expectedPaymentOption}
                    onChange={(e) => setFormData({ ...formData, expectedPaymentOption: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-sm font-semibold"
                  >
                    <option value="After 2 Days">After 2 Days</option>
                    <option value="After 4 Days">After 4 Days</option>
                    <option value="After 7 Days">After 7 Days</option>
                    <option value="After 15 Days">After 15 Days</option>
                    <option value="Custom Date">Custom Date</option>
                  </select>
                </div>

                {formData.expectedPaymentOption === 'Custom Date' ? (
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                      Pick Custom Date *
                    </label>
                    <input
                      type="date"
                      value={formData.expectedPaymentDate}
                      onChange={(e) => setFormData({ ...formData, expectedPaymentDate: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-sm"
                      required
                    />
                  </div>
                ) : (
                  <div className="text-xs text-amber-800 font-semibold">
                    Target Date: <span className="font-bold">{formData.expectedPaymentDate}</span>
                  </div>
                )}
              </div>
            )}

            {/* Receiver Dropdown & Add New Receiver */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-stone-700 uppercase">
                  Received By (Authorized Person) *
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddReceiverInput(!showAddReceiverInput)}
                  className="text-[11px] font-bold text-amber-700 hover:text-amber-800 flex items-center space-x-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add New Receiver</span>
                </button>
              </div>

              {showAddReceiverInput ? (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Enter name"
                    value={newReceiverName}
                    onChange={(e) => setNewReceiverName(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white border border-stone-300 rounded-xl text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleAddNewReceiver}
                    className="px-3 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold"
                  >
                    Add
                  </button>
                </div>
              ) : (
                <select
                  value={formData.receiver}
                  onChange={(e) => setFormData({ ...formData, receiver: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {settings.receivers.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              )}
            </div>

          </div>

          {/* Action Buttons Bar */}
          <div className="pt-6 border-t border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handlePreview}
              className="w-full sm:w-auto px-5 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-extrabold text-xs rounded-xl transition-colors flex items-center justify-center space-x-2"
            >
              <Eye className="w-4 h-4 text-amber-700" />
              <span>Preview Receipt</span>
            </button>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 sm:flex-initial px-5 py-3 bg-stone-100 hover:bg-stone-200 text-stone-600 font-extrabold text-xs rounded-xl transition-colors flex items-center justify-center space-x-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>

              <button
                type="submit"
                className="flex-1 sm:flex-initial px-7 py-3 bg-gradient-to-r from-amber-600 via-orange-600 to-rose-900 hover:from-amber-700 hover:to-rose-950 text-white font-black text-sm rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Save className="w-4 h-4 text-amber-300" />
                <span>Save Receipt</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
