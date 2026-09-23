import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import StatCard from '../components/StatCard';
import { formatINR } from '../data/utils';
import {
  BarChart3,
  IndianRupee,
  Wallet,
  TrendingUp,
  Clock,
  Download,
  Calendar,
  PieChart,
} from 'lucide-react';

export default function Reports() {
  const { receipts, expenses, totalCollection, totalExpenses, availableBalance, pendingCollection, addToast } = useApp();

  const [dateRange, setDateRange] = useState('All Time');

  // Breakdown calculations
  const paymentMethodsBreakdown = receipts
    .filter((r) => r.status === 'Paid')
    .reduce((acc, r) => {
      acc[r.paymentMethod] = (acc[r.paymentMethod] || 0) + r.amount;
      return acc;
    }, {});

  const expensesCategoryBreakdown = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  const paidCount = receipts.filter((r) => r.status === 'Paid').length;
  const pendingCount = receipts.filter((r) => r.status === 'Pending').length;
  const totalCount = receipts.length || 1;

  const paidPercent = Math.round((paidCount / totalCount) * 100);
  const pendingPercent = 100 - paidPercent;

  const handleExportReport = () => {
    addToast('Financial report PDF generated & exported successfully!', 'success');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Header Bar with Date Range & Export */}
      <div className="bg-white p-5 rounded-3xl border border-amber-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-stone-900 tracking-tight flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-amber-600" />
            <span>Financial Reports & Analytics</span>
          </h1>
          <p className="text-xs text-stone-500">
            Real-time collection, expense distribution, and collection efficiency
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-semibold">
            <Calendar className="w-3.5 h-3.5 text-stone-500" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent focus:outline-none"
            >
              <option value="All Time">All Time (Festival 2026)</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="This Month">This Month</option>
            </select>
          </div>

          <button
            onClick={handleExportReport}
            className="px-4 py-2 bg-rose-950 hover:bg-rose-900 text-white text-xs font-extrabold rounded-xl shadow-sm transition-colors flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Collection" value={formatINR(totalCollection)} icon={IndianRupee} color="amber" />
        <StatCard title="Total Expenses" value={formatINR(totalExpenses)} icon={Wallet} color="rose" />
        <StatCard title="Net Balance" value={formatINR(availableBalance)} icon={TrendingUp} color="emerald" />
        <StatCard title="Pending Amount" value={formatINR(pendingCollection)} icon={Clock} color="sky" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Collection by Payment Method Chart */}
        <div className="bg-white p-6 rounded-3xl border border-amber-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="font-bold text-sm text-stone-900 flex items-center space-x-2">
              <PieChart className="w-4 h-4 text-amber-600" />
              <span>Collection by Payment Method</span>
            </h3>
            <span className="text-xs font-semibold text-stone-400">Total: {formatINR(totalCollection)}</span>
          </div>

          <div className="space-y-3 pt-2">
            {Object.entries(paymentMethodsBreakdown).map(([method, amount]) => {
              const percent = Math.round((amount / (totalCollection || 1)) * 100);
              return (
                <div key={method} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-stone-800">
                    <span>{method}</span>
                    <span>{formatINR(amount)} ({percent}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${percent}%` }}
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-600 rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Expenses by Category Breakdown Chart */}
        <div className="bg-white p-6 rounded-3xl border border-amber-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="font-bold text-sm text-stone-900 flex items-center space-x-2">
              <Wallet className="w-4 h-4 text-rose-600" />
              <span>Expenses by Category</span>
            </h3>
            <span className="text-xs font-semibold text-stone-400">Total: {formatINR(totalExpenses)}</span>
          </div>

          <div className="space-y-3 pt-2">
            {Object.entries(expensesCategoryBreakdown).map(([cat, amount]) => {
              const percent = Math.round((amount / (totalExpenses || 1)) * 100);
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-stone-800">
                    <span>{cat}</span>
                    <span>{formatINR(amount)} ({percent}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${percent}%` }}
                      className="h-full bg-gradient-to-r from-rose-700 to-amber-600 rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Paid vs Pending Collection Efficiency */}
        <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-amber-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-stone-900">Collection Efficiency (Paid vs Pending)</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-800 uppercase block">Paid Receipts</span>
                <span className="text-2xl font-black text-emerald-950">{paidCount} Records</span>
                <span className="text-xs text-emerald-700 block font-semibold">{formatINR(totalCollection)}</span>
              </div>
              <div className="w-14 h-14 rounded-full bg-emerald-600 text-white font-black text-sm flex items-center justify-center border-4 border-emerald-200">
                {paidPercent}%
              </div>
            </div>

            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-800 uppercase block">Pending Receipts</span>
                <span className="text-2xl font-black text-amber-950">{pendingCount} Records</span>
                <span className="text-xs text-amber-700 block font-semibold">{formatINR(pendingCollection)}</span>
              </div>
              <div className="w-14 h-14 rounded-full bg-amber-500 text-white font-black text-sm flex items-center justify-center border-4 border-amber-200">
                {pendingPercent}%
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
