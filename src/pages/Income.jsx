import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import StatCard from '../components/StatCard';
import OtherIncomeModal from '../components/OtherIncomeModal';
import { formatINR, formatDate } from '../data/utils';
import { TrendingUp, Calendar, Clock, PlusCircle, Eye, Tag, Trash2, Megaphone, Trophy, Store, Award } from 'lucide-react';

export default function Income() {
  const {
    receipts,
    otherIncome,
    deleteOtherIncome,
    totalDonations,
    totalOtherIncome,
    totalCollection,
    pendingCollection,
    setActivePage,
    setPreviewReceipt,
  } = useApp();

  const [activeTab, setActiveTab] = useState('vargani'); // 'vargani' | 'extra'
  const [isOtherIncomeModalOpen, setIsOtherIncomeModalOpen] = useState(false);

  const getCategoryBadge = (category) => {
    switch (category) {
      case 'Advertisement':
        return { bg: 'bg-purple-100 text-purple-800 border-purple-300', icon: Megaphone };
      case 'Prize Money / Competition':
        return { bg: 'bg-amber-100 text-amber-800 border-amber-300', icon: Trophy };
      case 'Sponsorship':
        return { bg: 'bg-blue-100 text-blue-800 border-blue-300', icon: Award };
      case 'Stall Rent / Stall Fee':
        return { bg: 'bg-teal-100 text-teal-800 border-teal-300', icon: Store };
      default:
        return { bg: 'bg-stone-100 text-stone-800 border-stone-300', icon: Tag };
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Top Stat Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Festival Income"
          value={formatINR(totalCollection)}
          icon={TrendingUp}
          color="emerald"
          subtitle="Vargani + Banners + Prizes"
        />
        <StatCard
          title="Vargani Donations"
          value={formatINR(totalDonations)}
          icon={Calendar}
          color="amber"
          subtitle="Direct donor receipts"
        />
        <StatCard
          title="Extra Income (Ad / Prizes)"
          value={formatINR(totalOtherIncome)}
          icon={Megaphone}
          color="sky"
          subtitle="Banners, prizes & stall rent"
        />
        <StatCard
          title="Pending Pledges"
          value={formatINR(pendingCollection)}
          icon={Clock}
          color="rose"
          subtitle="Uncollected pledges"
          onClick={() => setActivePage('pending')}
        />
      </div>

      {/* Main Income List Container */}
      <div className="bg-white rounded-3xl border border-amber-200/80 shadow-xs p-6 space-y-6">
        
        {/* Header & Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div>
            <h2 className="text-xl font-black text-stone-900 tracking-tight">Income & Collections Register</h2>
            <p className="text-xs text-stone-500">Manage Vargani contributions and extra income (banners, prizes, sponsors)</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActivePage('new-receipt')}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-1.5"
            >
              <PlusCircle className="w-4 h-4 text-amber-200" />
              <span>+ Record Vargani Receipt</span>
            </button>

            <button
              onClick={() => setIsOtherIncomeModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-1.5"
            >
              <PlusCircle className="w-4 h-4 text-emerald-200" />
              <span>+ Add Extra Income</span>
            </button>
          </div>
        </div>

        {/* Income Source Tabs */}
        <div className="flex space-x-2 border-b border-stone-200">
          <button
            onClick={() => setActiveTab('vargani')}
            className={`px-4 py-2.5 font-extrabold text-xs rounded-t-2xl transition-all border-b-2 flex items-center space-x-2 ${
              activeTab === 'vargani'
                ? 'border-amber-600 text-amber-900 bg-amber-50/60'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <span>Vargani Receipts</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800">
              {receipts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('extra')}
            className={`px-4 py-2.5 font-extrabold text-xs rounded-t-2xl transition-all border-b-2 flex items-center space-x-2 ${
              activeTab === 'extra'
                ? 'border-emerald-600 text-emerald-900 bg-emerald-50/60'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <span>Extra Income (Banners, Prizes, Sponsors)</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800">
              {otherIncome.length}
            </span>
          </button>
        </div>

        {/* TAB 1: Vargani Receipts Table */}
        {activeTab === 'vargani' && (
          <div className="overflow-x-auto">
            {receipts.length === 0 ? (
              <div className="text-center py-12 text-stone-400 space-y-2">
                <p className="text-sm font-bold text-stone-600">No Vargani receipts recorded yet.</p>
                <p className="text-xs">Click "+ Record Vargani Receipt" above to add a new contribution.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-500 font-semibold uppercase text-[10px] tracking-wider bg-stone-50">
                    <th className="py-3 px-4">Receipt No</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Donor Name</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {receipts.map((item) => (
                    <tr key={item.id} className="hover:bg-amber-50/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-stone-900">{item.receiptNo}</td>
                      <td className="py-3.5 px-4 text-stone-600">{formatDate(item.date)}</td>
                      <td className="py-3.5 px-4 font-bold text-stone-900">{item.name}</td>
                      <td className="py-3.5 px-4 font-black text-stone-900 text-sm">
                        {formatINR(item.amount)}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-stone-700">{item.paymentMethod}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            item.status === 'Paid'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setPreviewReceipt(item)}
                          className="p-1.5 text-stone-500 hover:text-amber-700 hover:bg-amber-100 rounded-lg transition-colors"
                          title="View Receipt"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* TAB 2: Extra / Other Income Table */}
        {activeTab === 'extra' && (
          <div className="overflow-x-auto">
            {otherIncome.length === 0 ? (
              <div className="text-center py-12 text-stone-400 space-y-2">
                <p className="text-sm font-bold text-stone-600">No extra income recorded yet.</p>
                <p className="text-xs">Click "+ Add Extra Income" above to record advertisements, prizes, or stall rent.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-500 font-semibold uppercase text-[10px] tracking-wider bg-stone-50">
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Source / Sponsor</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Received By</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {otherIncome.map((item) => {
                    const badge = getCategoryBadge(item.category);
                    const IconComp = badge.icon;
                    return (
                      <tr key={item.id} className="hover:bg-emerald-50/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-stone-900">{item.id}</td>
                        <td className="py-3.5 px-4 text-stone-600">{formatDate(item.date)}</td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${badge.bg}`}>
                            <IconComp className="w-3 h-3" />
                            <span>{item.category}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-stone-900">{item.sourceName}</td>
                        <td className="py-3.5 px-4 text-stone-600 max-w-xs truncate">{item.description || '-'}</td>
                        <td className="py-3.5 px-4 font-black text-emerald-900 text-sm">
                          {formatINR(item.amount)}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-stone-700">{item.receivedBy}</td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => deleteOtherIncome(item.id)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Income Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

      </div>

      {/* Other Income Modal */}
      <OtherIncomeModal
        isOpen={isOtherIncomeModalOpen}
        onClose={() => setIsOtherIncomeModalOpen(false)}
      />

    </div>
  );
}
