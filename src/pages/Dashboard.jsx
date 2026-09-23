import React from 'react';
import { useApp } from '../context/AppContext';
import StatCard from '../components/StatCard';
import { formatINR, formatDate } from '../data/utils';
import {
  IndianRupee,
  Receipt,
  Wallet,
  Clock,
  PlusCircle,
  Eye,
  CheckCircle,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react';

export default function Dashboard() {
  const {
    totalCollection,
    pendingCollection,
    totalExpenses,
    availableBalance,
    receipts,
    setActivePage,
    setPreviewReceipt,
    markAsPaid,
  } = useApp();

  const recentReceipts = receipts.slice(0, 6);

  // Simple Collection Breakdown Data for Visual Chart
  const dailyData = [
    { day: '15 Sep', amount: 13100 },
    { day: '16 Sep', amount: 5850 },
    { day: '17 Sep', amount: 4501 },
    { day: '18 Sep', amount: 15000 },
    { day: '19 Sep', amount: 4001 },
    { day: '20 Sep', amount: 5502 },
    { day: '21 Sep', amount: 3200 },
  ];

  const maxAmount = Math.max(...dailyData.map((d) => d.amount));

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Quick Banner Callout */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="relative z-10 max-w-xl">
          <div className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-amber-200 mb-2 border border-white/10">
            Festival Festival Collection 2026
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome to Utsav Vargani Portal
          </h1>
          <p className="text-xs sm:text-sm text-amber-100 mt-1 leading-relaxed opacity-90">
            Track daily receipts, instant UPI QR payments, pending follow-ups, and mandap expenses with transparency.
          </p>
        </div>

        <div className="relative z-10 flex items-center space-x-3 w-full md:w-auto">
          <button
            onClick={() => setActivePage('new-receipt')}
            className="flex-1 md:flex-initial px-5 py-3 bg-white text-rose-950 font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg hover:bg-amber-50 transition-all transform active:scale-95 flex items-center justify-center space-x-2"
          >
            <PlusCircle className="w-4 h-4 text-amber-600" />
            <span>Create New Receipt</span>
          </button>
        </div>

        {/* Decorative backdrop shapes */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Summary Stat Widgets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Collection"
          value={formatINR(totalCollection)}
          icon={IndianRupee}
          color="amber"
          subtitle="Total paid donations"
          onClick={() => setActivePage('donations')}
        />
        <StatCard
          title="Total Expenses"
          value={formatINR(totalExpenses)}
          icon={Wallet}
          color="rose"
          subtitle="Stage, Mandap & Prasad"
          onClick={() => setActivePage('expenses')}
        />
        <StatCard
          title="Available Balance"
          value={formatINR(availableBalance)}
          icon={TrendingUp}
          color="emerald"
          subtitle="Net available in treasury"
        />
        <StatCard
          title="Pending Collection"
          value={formatINR(pendingCollection)}
          icon={Clock}
          color="sky"
          subtitle="Pledged & pending follow-ups"
          onClick={() => setActivePage('pending')}
        />
      </div>

      {/* Main Grid: Chart & Recent Donations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Collection Overview Bar Chart */}
        <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-amber-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-stone-900">Collection Overview</h3>
                <p className="text-xs text-stone-500">Daily receipt trend (Last 7 Days)</p>
              </div>
              <span className="p-2 bg-amber-50 text-amber-700 rounded-xl">
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </div>

            {/* Custom Visual Bar Chart */}
            <div className="h-44 flex items-end justify-between gap-2 pt-6 pb-2 px-1">
              {dailyData.map((item, idx) => {
                const heightPercent = Math.round((item.amount / maxAmount) * 100);
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center group relative">
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-stone-900 text-white text-[10px] py-1 px-2 rounded font-bold whitespace-nowrap z-10 pointer-events-none shadow-md">
                      {formatINR(item.amount)}
                    </div>
                    
                    <div className="w-full bg-amber-100 rounded-t-lg h-36 flex items-end overflow-hidden">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full bg-gradient-to-t from-amber-600 via-orange-500 to-amber-400 group-hover:from-amber-700 group-hover:to-orange-600 transition-all rounded-t-md"
                      />
                    </div>
                    <span className="text-[10px] font-semibold text-stone-500 mt-2 rotate-[-25deg] origin-top-left sm:rotate-0">
                      {item.day.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500 font-medium">
            <span>Average Daily: {formatINR(8100)}</span>
            <button
              onClick={() => setActivePage('reports')}
              className="text-amber-700 font-bold hover:underline"
            >
              Full Reports →
            </button>
          </div>
        </div>

        {/* Recent Donations Table Container */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-amber-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-stone-900">Recent Vargani Receipts</h3>
              <p className="text-xs text-stone-500">Latest contributions recorded</p>
            </div>
            <button
              onClick={() => setActivePage('donations')}
              className="text-xs font-bold text-amber-700 hover:text-amber-800 transition-colors"
            >
              View All Records ({receipts.length}) →
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 font-semibold uppercase text-[10px] tracking-wider bg-stone-50/60">
                  <th className="py-3 px-3">Receipt No</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Donor Name</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Payment</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {recentReceipts.map((item) => (
                  <tr key={item.id} className="hover:bg-amber-50/40 transition-colors">
                    <td className="py-3 px-3 font-bold text-stone-900 font-mono">
                      {item.receiptNo}
                    </td>
                    <td className="py-3 px-3 text-stone-600">{formatDate(item.date)}</td>
                    <td className="py-3 px-3 font-semibold text-stone-900">
                      <div>{item.name}</div>
                      <div className="text-[10px] text-stone-400">{item.mobile}</div>
                    </td>
                    <td className="py-3 px-3 font-black text-stone-900">
                      {formatINR(item.amount)}
                    </td>
                    <td className="py-3 px-3 font-medium text-stone-700">
                      <span className="inline-block px-2 py-0.5 bg-stone-100 rounded text-[11px]">
                        {item.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          item.status === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right space-x-1">
                      <button
                        onClick={() => setPreviewReceipt(item)}
                        title="View Receipt"
                        className="p-1.5 text-stone-500 hover:text-amber-700 hover:bg-amber-100 rounded-lg transition-colors inline-block"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {item.status === 'Pending' && (
                        <button
                          onClick={() => markAsPaid(item.id)}
                          title="Mark as Paid"
                          className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors inline-block"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
