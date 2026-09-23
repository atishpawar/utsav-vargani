import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Settings as SettingsIcon, Save, QrCode, Building, Receipt, Sun, Moon, Check } from 'lucide-react';

export default function Settings() {
  const { settings, setSettings, addToast } = useApp();

  const [formData, setFormData] = useState({ ...settings });
  const [activeTab, setActiveTab] = useState('general');

  const handleSubmit = (e) => {
    e.preventDefault();
    setSettings(formData);
    addToast('Festival settings saved successfully!');
  };

  const handleQrUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, qrImage: reader.result });
        addToast('QR Code image uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      
      {/* Page Title */}
      <div className="bg-white p-6 rounded-3xl border border-amber-200/80 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-stone-900 tracking-tight flex items-center space-x-2">
            <SettingsIcon className="w-5 h-5 text-amber-600" />
            <span>Settings & Preferences</span>
          </h1>
          <p className="text-xs text-stone-500">
            Configure Mandal identity, receipt numbering, UPI QR code, and defaults
          </p>
        </div>

        <button
          onClick={handleSubmit}
          className="px-5 py-2.5 bg-gradient-to-r from-amber-600 via-orange-600 to-rose-900 hover:from-amber-700 hover:to-rose-950 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2"
        >
          <Save className="w-4 h-4 text-amber-300" />
          <span>Save Changes</span>
        </button>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-amber-200/80 shadow-xs p-6 sm:p-8 space-y-8">
        
        {/* Section 1: Festival & Organization Details */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-rose-950 mb-4 pb-2 border-b border-amber-200 flex items-center space-x-2">
            <Building className="w-4 h-4 text-amber-600" />
            <span>Festival & Organization Details</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                Organization Name
              </label>
              <input
                type="text"
                value={formData.orgName}
                onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                Festival Name & Season
              </label>
              <input
                type="text"
                value={formData.festivalName}
                onChange={(e) => setFormData({ ...formData, festivalName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                Marathi Subtitle Accent
              </label>
              <input
                type="text"
                value={formData.festivalSubtitle}
                onChange={(e) => setFormData({ ...formData, festivalSubtitle: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                Official UPI ID (for QR Code)
              </label>
              <input
                type="text"
                value={formData.upiId}
                onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-bold font-mono text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                Contact Phone Number
              </label>
              <input
                type="text"
                value={formData.contactNumber}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                Contact Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                Mandal Full Address (Printed on Receipts)
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Receipt Settings */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-rose-950 mb-4 pb-2 border-b border-amber-200 flex items-center space-x-2">
            <Receipt className="w-4 h-4 text-amber-600" />
            <span>Receipt Configuration</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                Receipt Prefix
              </label>
              <input
                type="text"
                value={formData.receiptPrefix}
                onChange={(e) => setFormData({ ...formData, receiptPrefix: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                Starting Receipt Number
              </label>
              <input
                type="number"
                value={formData.startingReceiptNo}
                onChange={(e) => setFormData({ ...formData, startingReceiptNo: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                Default Authorized Receiver
              </label>
              <select
                value={formData.defaultReceiver}
                onChange={(e) => setFormData({ ...formData, defaultReceiver: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {formData.receivers.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: QR Code Image Replacement */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-rose-950 mb-4 pb-2 border-b border-amber-200 flex items-center space-x-2">
            <QrCode className="w-4 h-4 text-amber-600" />
            <span>UPI QR Code Image Manager</span>
          </h3>

          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 p-4 bg-amber-50/50 rounded-2xl border border-amber-200">
            <div className="p-3 bg-white border border-amber-300 rounded-xl shadow-xs">
              <img
                src={formData.qrImage || '/assets/qr-code.png'}
                alt="Current QR Code"
                className="w-28 h-28 object-contain mx-auto"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/assets/qr-code.svg';
                }}
              />
            </div>

            <div className="space-y-2 text-center sm:text-left">
              <p className="text-xs font-bold text-stone-800">
                Replace UPI QR Code Image
              </p>
              <p className="text-[11px] text-stone-500 max-w-sm">
                Upload your Mandal's official QR code image (PhonePe, GPay, Paytm) for automatic QR payment popups.
              </p>

              <label className="inline-block px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs">
                <span>Upload QR Image</span>
                <input type="file" accept="image/*" onChange={handleQrUpload} className="hidden" />
              </label>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-stone-100 flex justify-end">
          <button
            type="submit"
            className="px-8 py-3 bg-gradient-to-r from-amber-600 via-orange-600 to-rose-900 hover:from-amber-700 hover:to-rose-950 text-white font-extrabold text-sm rounded-xl shadow-lg transition-all"
          >
            Save All Settings
          </button>
        </div>

      </form>

    </div>
  );
}
