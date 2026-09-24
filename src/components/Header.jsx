import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Menu, Search, Bell, Plus, Flame, CheckCircle2, Clock, Calendar } from 'lucide-react';

export default function Header({ onToggleSidebar }) {
  const {
    activePage,
    setActivePage,
    user,
    receipts,
    pendingCollection,
    setPreviewReceipt,
    selectedYear,
    setSelectedYear,
    availableYears,
    settings,
  } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Page titles map
  const titles = {
    dashboard: 'Dashboard Overview',
    'new-receipt': 'New Vargani Receipt',
    donations: 'Donation Records & Receipts',
    pending: 'Pending Collections',
    expenses: 'Expense Management',
    income: 'Income & Collection',
    reports: 'Financial Reports & Analytics',
    settings: 'Festival & App Settings',
  };

  const pendingCount = receipts.filter((r) => r.status === 'Pending').length;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActivePage('donations');
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-amber-200/60 px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-xs">
      
      {/* Left side: Hamburger & Page Title */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-stone-600 hover:text-stone-900 rounded-xl hover:bg-stone-100 transition-colors"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            <span>{titles[activePage] || 'Utsav Vargani'}</span>
          </h2>
          <p className="text-[11px] text-stone-500 hidden sm:block">
            Shree Ganesh Utsav Mandal Collection Portal
          </p>
        </div>
      </div>

      {/* Center Search Bar (Desktop) */}
      <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center relative max-w-xs w-full">
        <Search className="w-4 h-4 text-stone-400 absolute left-3 pointer-events-none" />
        <input
          type="text"
          placeholder="Search donor name, mobile, receipt #..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-1.5 bg-stone-100/80 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
        />
      </form>

      {/* Right side: Global Festival Year Selector, Quick Action, Notifications, User Avatar */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        
        {/* GLOBAL FESTIVAL YEAR SELECTOR */}
        <div className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 border border-amber-300/80 px-2.5 sm:px-3 py-1.5 rounded-xl shadow-xs">
          <Calendar className="w-4 h-4 text-amber-700 flex-shrink-0" />
          <span className="text-[10px] font-extrabold uppercase text-amber-950 tracking-wider hidden md:inline">
            Year:
          </span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-transparent text-xs font-black text-rose-950 border-none focus:outline-none cursor-pointer pr-1"
          >
            <option value="All" className="text-stone-900 font-bold">All Years</option>
            {availableYears.map((y) => (
              <option key={y} value={y} className="text-stone-900 font-semibold">
                Year {y} {y === (settings.year || '2026') ? '(Current)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Quick New Receipt Button */}
        <button
          onClick={() => setActivePage('new-receipt')}
          className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all hover:shadow-md"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Receipt</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-stone-600 hover:text-stone-900 rounded-xl hover:bg-stone-100 relative transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {pendingCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-amber-500 border-2 border-white rounded-full animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-stone-200 py-3 z-50 animate-fade-in">
              <div className="px-4 pb-2 border-b border-stone-100 flex items-center justify-between">
                <span className="font-bold text-xs text-stone-900">Notifications</span>
                <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                  {pendingCount} Pending
                </span>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-stone-100">
                {receipts.filter((r) => r.status === 'Pending').slice(0, 4).map((r) => (
                  <div
                    key={r.id}
                    onClick={() => {
                      setPreviewReceipt(r);
                      setShowNotifications(false);
                    }}
                    className="p-3 hover:bg-amber-50/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start space-x-2.5">
                      <Clock className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-stone-900">{r.name} - ₹{r.amount}</p>
                        <p className="text-[11px] text-stone-500">Receipt #{r.receiptNo} is Pending</p>
                      </div>
                    </div>
                  </div>
                ))}

                {pendingCount === 0 && (
                  <div className="p-4 text-center text-xs text-stone-500 flex items-center justify-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>All collections are up to date!</span>
                  </div>
                )}
              </div>
              <div className="px-4 pt-2 border-t border-stone-100 text-center">
                <button
                  onClick={() => {
                    setActivePage('pending');
                    setShowNotifications(false);
                  }}
                  className="text-xs font-bold text-amber-700 hover:text-amber-800"
                >
                  View All Pending Collections →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <div className="flex items-center space-x-2 pl-2 border-l border-stone-200">
          <div className="w-8 h-8 rounded-full bg-rose-950 text-amber-400 font-black text-xs flex items-center justify-center shadow-xs border border-amber-500/30">
            {user.name.charAt(0)}
          </div>
          <span className="text-xs font-bold text-stone-800 hidden sm:inline-block">{user.name}</span>
        </div>

      </div>

    </header>
  );
}
