import React from 'react';
import { useApp } from '../context/AppContext';
import StatCard from '../components/StatCard';
import { formatINR, formatDate } from '../data/utils';
import { TrendingUp, Calendar, Clock, PlusCircle, Eye } from 'lucide-react';

export default function Income() {
  const { receipts, totalCollection, pendingCollection, setActivePage, setPreviewReceipt } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];
  const todaysIncome = receipts
    .filter((r) => r.status === 'Paid' && r.date === todayStr)
    .reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Top Stat Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Income Collected"
          value={formatINR(totalCollection)}
          icon={TrendingUp}
          color="emerald"
          subtitle="All paid Vargani receipts"
        />
        <StatCard
          title="Today's Collection"
          value={formatINR(todaysIncome)}
          icon={Calendar}
          color="amber"
          subtitle={`${formatDate(todayStr)} collections`}
        />
        <StatCard
          title="Pending Collection"
          value={formatINR(pendingCollection)}
          icon={Clock}
          color="sky"
          subtitle="Uncollected pledges"
          onClick={() => setActivePage('pending')}
        />
      </div>

      {/* Main Income List Container */}
      <div className="bg-white rounded-3xl border border-amber-200/80 shadow-xs p-6 space-y-6">
        
        {/* Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-stone-900 tracking-tight">Vargani Income & Collections</h2>
            <p className="text-xs text-stone-500">All registered festival contribution records</p>
          </div>

          <button
            onClick={() => setActivePage('new-receipt')}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
          >
            <PlusCircle className="w-4 h-4 text-amber-200" />
            <span>+ Record New Vargani</span>
          </button>
        </div>

        {/* Income Table */}
        <div className="overflow-x-auto">
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
        </div>

      </div>

    </div>
  );
}
