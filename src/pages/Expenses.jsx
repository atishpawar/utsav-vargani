import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import StatCard from '../components/StatCard';
import ExpenseModal from '../components/ExpenseModal';
import { formatINR, formatDate } from '../data/utils';
import { Wallet, PlusCircle, Trash2, Tag, Calendar, Search } from 'lucide-react';

export default function Expenses() {
  const { expenses, totalExpenses, deleteExpense } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch =
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase()) ||
      e.paidBy.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === 'All' || e.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Calculate distinct categories count
  const categoriesCount = new Set(expenses.map((e) => e.category)).size;

  const categoryColor = (cat) => {
    switch (cat) {
      case 'Mandap':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Sound System':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Decoration':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Lighting':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Prasad':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Security':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      default:
        return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Top Stat Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Festival Expenses"
          value={formatINR(totalExpenses)}
          icon={Wallet}
          color="rose"
          subtitle={`${expenses.length} total payouts recorded`}
        />
        <StatCard
          title="This Month Payouts"
          value={formatINR(totalExpenses)}
          icon={Calendar}
          color="amber"
          subtitle="Ganesh Utsav 2026 Season"
        />
        <StatCard
          title="Active Categories"
          value={categoriesCount.toString()}
          icon={Tag}
          color="sky"
          subtitle="Mandap, Sound, Prasad, etc."
        />
      </div>

      {/* Main Expense Table Container */}
      <div className="bg-white rounded-3xl border border-amber-200/80 shadow-xs p-6 space-y-6">
        
        {/* Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-stone-900 tracking-tight">Expense Records</h2>
            <p className="text-xs text-stone-500">Track and manage mandap & event expenditures</p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-rose-900 hover:from-amber-700 hover:to-rose-950 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
          >
            <PlusCircle className="w-4 h-4 text-amber-300" />
            <span>+ Add Expense</span>
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search expense description, vendor, or payer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold"
            >
              <option value="All">All Categories</option>
              <option value="Decoration">Decoration</option>
              <option value="Sound System">Sound System</option>
              <option value="Mandap">Mandap</option>
              <option value="Lighting">Lighting</option>
              <option value="Prasad">Prasad</option>
              <option value="Advertisement">Advertisement</option>
              <option value="Security">Security</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 font-semibold uppercase text-[10px] tracking-wider bg-stone-50">
                <th className="py-3 px-4">Expense ID</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Paid By</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredExpenses.map((e) => (
                <tr key={e.id} className="hover:bg-rose-50/20 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-stone-900">{e.id}</td>
                  <td className="py-3.5 px-4 text-stone-600">{formatDate(e.date)}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${categoryColor(
                        e.category
                      )}`}
                    >
                      {e.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-stone-900">{e.description}</td>
                  <td className="py-3.5 px-4 font-black text-rose-950 text-sm">
                    {formatINR(e.amount)}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-stone-700">{e.paidBy}</td>
                  <td className="py-3.5 px-4 text-stone-600 text-[11px]">{e.paymentMethod}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => deleteExpense(e.id)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Expense"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-stone-100">
          {filteredExpenses.map((e) => (
            <div key={e.id} className="py-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-stone-400 font-bold">{e.id}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${categoryColor(
                    e.category
                  )}`}
                >
                  {e.category}
                </span>
              </div>

              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-sm text-stone-900">{e.description}</h4>
                  <p className="text-xs text-stone-500">Paid by {e.paidBy} • {formatDate(e.date)}</p>
                </div>
                <span className="text-base font-black text-rose-950">{formatINR(e.amount)}</span>
              </div>
            </div>
          ))}
        </div>

        {filteredExpenses.length === 0 && (
          <div className="p-12 text-center text-stone-500">
            <Wallet className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="font-bold text-sm text-stone-800">No expense records found</h3>
          </div>
        )}

      </div>

      {/* Expense Addition Modal */}
      <ExpenseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

    </div>
  );
}
