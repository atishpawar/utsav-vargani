import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Settings as SettingsIcon, Save, QrCode, Building, Receipt, UserCheck, Plus, Trash2 } from 'lucide-react';

export default function Settings() {
  const { settings, setSettings, addReceiver, deleteReceiver, addToast } = useApp();

  const [formData, setFormData] = useState({ ...settings });
  const [newReceiverName, setNewReceiverName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setSettings(formData);
    addToast('Festival settings saved successfully!');
  };

  const handleAddReceiverSubmit = (e) => {
    e.preventDefault();
    if (!newReceiverName.trim()) return;
    addReceiver(newReceiverName.trim());
    setNewReceiverName('');
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

  const currentReceivers = settings.receivers || [];

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
            Configure Mandal identity, receipt numbering, receivers list, and UPI QR code
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

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-200/80 shadow-xs space-y-8">
        
        {/* Section 1: Organization & Festival Info */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-rose-950 mb-4 pb-2 border-b border-amber-200 flex items-center space-x-2">
            <Building className="w-4 h-4 text-amber-600" />
            <span>Mandal & Festival Information</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                Organization / Mandal Name
              </label>
              <input
                type="text"
                value={formData.orgName || ''}
                onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                Festival Main Title
              </label>
              <input
                type="text"
                value={formData.festivalName || ''}
                onChange={(e) => setFormData({ ...formData, festivalName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                Festival Subtitle (Marathi / English)
              </label>
              <input
                type="text"
                value={formData.festivalSubtitle || ''}
                onChange={(e) => setFormData({ ...formData, festivalSubtitle: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                Festival Year
              </label>
              <input
                type="text"
                value={formData.year || ''}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                Official Contact Phone Number
              </label>
              <input
                type="text"
                value={formData.contactNumber || ''}
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
                value={formData.email || ''}
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
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Authorized Receivers (Separate Table) */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-rose-950 mb-4 pb-2 border-b border-amber-200 flex items-center space-x-2">
            <UserCheck className="w-4 h-4 text-amber-600" />
            <span>Authorized Receivers (Separate Database Table)</span>
          </h3>

          <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-200 space-y-4">
            <p className="text-xs text-stone-600">
              Add authorized volunteer or admin names who accept cash/online vargani donations.
            </p>

            {/* Add New Receiver Input */}
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Enter new receiver name..."
                value={newReceiverName}
                onChange={(e) => setNewReceiverName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddReceiverSubmit(e);
                  }
                }}
                className="flex-1 px-3.5 py-2 bg-white border border-amber-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={handleAddReceiverSubmit}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add Receiver</span>
              </button>
            </div>

            {/* Receiver List Chips */}
            {currentReceivers.length === 0 ? (
              <p className="text-xs italic text-stone-400 py-2">
                No receivers added yet. Add receiver names above to populate donation form dropdowns.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2 pt-2">
                {currentReceivers.map((rec) => (
                  <div
                    key={rec}
                    className="flex items-center space-x-2 px-3 py-1.5 bg-white border border-amber-300 rounded-xl text-xs font-bold text-stone-800 shadow-2xs"
                  >
                    <span>{rec}</span>
                    <button
                      type="button"
                      onClick={() => deleteReceiver(rec)}
                      className="text-stone-400 hover:text-rose-600 transition-colors"
                      title="Remove Receiver"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Year-Wise Receipt Settings */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-rose-950 mb-4 pb-2 border-b border-amber-200 flex items-center space-x-2">
            <Receipt className="w-4 h-4 text-amber-600" />
            <span>Year-Wise Receipt Configuration</span>
          </h3>

          <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-200 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Festival Year
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2026"
                  value={formData.year || ''}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-amber-300 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Annual Receipt Prefix
                </label>
                <input
                  type="text"
                  placeholder="e.g. VR-2026- or VR-"
                  value={formData.receiptPrefix || ''}
                  onChange={(e) => setFormData({ ...formData, receiptPrefix: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-amber-300 rounded-xl text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Annual Starting Number
                </label>
                <input
                  type="number"
                  placeholder="e.g. 1001"
                  value={formData.startingReceiptNo || 1001}
                  onChange={(e) => setFormData({ ...formData, startingReceiptNo: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-white border border-amber-300 rounded-xl text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Live Receipt Preview */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-white rounded-xl border border-amber-200 text-xs">
              <span className="font-bold text-stone-700">
                Preview First Receipt Number for {formData.year || 'Current Year'}:
              </span>
              <span className="font-mono font-black text-amber-900 bg-amber-100 px-3 py-1 rounded-lg border border-amber-300 text-sm mt-2 sm:mt-0 inline-block">
                {(formData.receiptPrefix || 'VR-') + String(formData.startingReceiptNo || 1001).padStart(4, '0')}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Default Authorized Receiver
                </label>
                <select
                  value={formData.defaultReceiver || ''}
                  onChange={(e) => setFormData({ ...formData, defaultReceiver: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">-- Select Default Receiver --</option>
                  {currentReceivers.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: QR Code Image Replacement */}
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
