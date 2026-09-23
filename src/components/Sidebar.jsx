import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  FilePlus2,
  Receipt,
  Users,
  Clock,
  Wallet,
  TrendingUp,
  BarChart3,
  Settings,
  LogOut,
  Flame,
  X,
  ChevronRight,
} from 'lucide-react';

export default function Sidebar({ isOpen, setIsOpen }) {
  const { activePage, setActivePage, logout, user, settings } = useApp();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'new-receipt', label: 'New Vargani Receipt', icon: FilePlus2, highlight: true },
    { id: 'donations', label: 'Donation List', icon: Receipt },
    { id: 'donors', label: 'Donors Directory', icon: Users },
    { id: 'pending', label: 'Pending Collections', icon: Clock },
    { id: 'expenses', label: 'Expenses', icon: Wallet },
    { id: 'income', label: 'Income / Collection', icon: TrendingUp },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNav = (id) => {
    setActivePage(id);
    if (setIsOpen) setIsOpen(false); // Close mobile drawer on navigation
  };

  const SidebarContent = (
    <div className="flex flex-col h-full bg-stone-900 text-stone-200 border-r border-stone-800 shadow-xl">
      {/* Top Brand Logo Section */}
      <div className="p-5 border-b border-stone-800/80 bg-stone-950/50 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-400 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-stone-900 rounded-[10px] flex items-center justify-center">
                <Flame className="w-5 h-5 text-amber-500 fill-amber-500/30" />
              </div>
            </div>
            <div>
              <h1 className="font-extrabold text-lg text-white tracking-tight leading-none flex items-center gap-1.5">
                <span>Utsav Vargani</span>
              </h1>
              <p className="text-[10px] font-semibold text-amber-500 mt-1 tracking-wider uppercase">
                {settings.tagline || 'Simple • Transparent • Organized'}
              </p>
            </div>
          </div>

          {/* Close button for mobile */}
          {setIsOpen && (
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Subtle Marathi Subtitle Pill */}
        <div className="mt-3 py-1 px-2.5 bg-rose-950/60 border border-rose-900/60 rounded-lg text-center text-[10px] font-medium text-amber-200/90 tracking-wider">
          {settings.festivalSubtitle || 'गणपती • दहीहंडी • नवरात्र'}
        </div>
      </div>

      {/* Menu Links */}
      <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold text-stone-500 uppercase tracking-widest">
          Main Menu
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 group ${
                isActive
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold shadow-md shadow-amber-600/20'
                  : item.highlight
                  ? 'bg-stone-800/80 text-amber-400 hover:bg-amber-600/20 hover:text-amber-300 border border-amber-500/20'
                  : 'text-stone-300 hover:bg-stone-800/70 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon
                  className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    isActive
                      ? 'text-white'
                      : item.highlight
                      ? 'text-amber-400'
                      : 'text-stone-400 group-hover:text-amber-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-4 h-4 text-amber-200" />}
            </button>
          );
        })}
      </div>

      {/* User Profile & Logout at Bottom */}
      <div className="p-3 m-3 bg-stone-950/70 border border-stone-800/80 rounded-2xl flex items-center justify-between">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-amber-600/20 border border-amber-500/40 text-amber-400 font-bold flex items-center justify-center text-sm flex-shrink-0">
            {user.name.charAt(0)}
          </div>
          <div className="truncate">
            <h4 className="text-xs font-bold text-white truncate">{user.name}</h4>
            <p className="text-[10px] text-amber-400/80 font-medium truncate">{user.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          title="Logout"
          className="p-2 text-stone-400 hover:text-rose-400 hover:bg-rose-950/50 rounded-xl transition-colors flex-shrink-0"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed) */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 flex-shrink-0 z-30">
        {SidebarContent}
      </aside>

      {/* Mobile Backdrop & Drawer */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative w-72 max-w-xs h-full z-10 animate-slide-in">
            {SidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
