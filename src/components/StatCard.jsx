import React from 'react';

export default function StatCard({ title, value, icon: Icon, color = 'amber', subtitle, onClick }) {
  const colorMap = {
    amber: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      iconBg: 'bg-amber-500 text-white',
      accent: 'text-amber-700',
      glow: 'shadow-amber-500/5',
    },
    emerald: {
      bg: 'bg-emerald-50/60',
      border: 'border-emerald-200',
      iconBg: 'bg-emerald-600 text-white',
      accent: 'text-emerald-700',
      glow: 'shadow-emerald-500/5',
    },
    rose: {
      bg: 'bg-rose-50/60',
      border: 'border-rose-200',
      iconBg: 'bg-rose-950 text-amber-400',
      accent: 'text-rose-900',
      glow: 'shadow-rose-500/5',
    },
    sky: {
      bg: 'bg-sky-50/60',
      border: 'border-sky-200',
      iconBg: 'bg-sky-600 text-white',
      accent: 'text-sky-700',
      glow: 'shadow-sky-500/5',
    },
    maroon: {
      bg: 'bg-stone-900 text-white',
      border: 'border-stone-800',
      iconBg: 'bg-rose-900 text-amber-400',
      accent: 'text-amber-400',
      glow: 'shadow-stone-900/10',
    },
  };

  const currentTheme = colorMap[color] || colorMap.amber;

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl p-5 border shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
        currentTheme.bg
      } ${currentTheme.border} ${currentTheme.glow} ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider opacity-70">
          {title}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-xl shadow-xs ${currentTheme.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline space-x-2">
        <h3 className="text-2xl sm:text-3xl font-black tracking-tight">{value}</h3>
      </div>

      {subtitle && (
        <p className="text-xs mt-2 font-medium opacity-75 flex items-center space-x-1">
          <span>{subtitle}</span>
        </p>
      )}
    </div>
  );
}
