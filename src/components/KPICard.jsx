import React from 'react';
import { TrendingUp, TrendingDown, Info } from 'lucide-react';

/**
 * High-fidelity glassmorphic KPI Card component with premium shimmer loading skeletons.
 * 
 * @param {{
 *   title: string,
 *   value: string|number,
 *   trendText: string,
 *   trendDirection: 'up'|'down'|'neutral',
 *   icon: React.ReactNode,
 *   loading: boolean,
 *   colorClass: string
 * }} props
 */
export default function KPICard({ title, value, trendText, trendDirection, icon, loading, colorClass = 'saffron' }) {
  // Color presets matching our premium design system
  const colorSchemes = {
    saffron: {
      text: 'text-accent-saffron',
      bg: 'bg-accent-saffron/10 dark:bg-accent-saffron/20',
      border: 'hover:border-accent-saffron/30',
      glow: 'shadow-[0_0_20px_rgba(249,115,22,0.06)]'
    },
    indigo: {
      text: 'text-accent-indigo',
      bg: 'bg-accent-indigo/10 dark:bg-accent-indigo/20',
      border: 'hover:border-accent-indigo/30',
      glow: 'shadow-[0_0_20px_rgba(79,70,229,0.06)]'
    },
    emerald: {
      text: 'text-accent-emerald',
      bg: 'bg-accent-emerald/10 dark:bg-accent-emerald/20',
      border: 'hover:border-accent-emerald/30',
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.06)]'
    },
    purple: {
      text: 'text-purple-500',
      bg: 'bg-purple-500/10 dark:bg-purple-500/20',
      border: 'hover:border-purple-500/30',
      glow: 'shadow-[0_0_20px_rgba(168,85,247,0.06)]'
    },
    blue: {
      text: 'text-blue-500',
      bg: 'bg-blue-500/10 dark:bg-blue-500/20',
      border: 'hover:border-blue-500/30',
      glow: 'shadow-[0_0_20px_rgba(59,130,246,0.06)]'
    },
    red: {
      text: 'text-red-500',
      bg: 'bg-red-500/10 dark:bg-red-500/20',
      border: 'hover:border-red-500/30',
      glow: 'shadow-[0_0_20px_rgba(239,68,68,0.06)]'
    }
  };

  const scheme = colorSchemes[colorClass] || colorSchemes.saffron;

  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-white/5 bg-white/45 dark:bg-darkCard backdrop-blur-glass p-5 flex flex-col justify-between h-36">
        {/* Shimmer overlay animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200/20 dark:via-white/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
        
        <div className="flex items-start justify-between">
          <div className="space-y-2.5 w-2/3">
            <div className="h-3.5 bg-gray-200 dark:bg-white/10 rounded-md w-full" />
            <div className="h-7 bg-gray-300 dark:bg-white/20 rounded-lg w-4/5" />
          </div>
          <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-white/10" />
        </div>
        <div className="h-4 bg-gray-200 dark:bg-white/10 rounded-md w-1/2" />
      </div>
    );
  }

  return (
    <div className={`group relative rounded-2xl border border-gray-150 dark:border-white/5 bg-white/70 dark:bg-darkCard backdrop-blur-glass p-5 flex flex-col justify-between h-36 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:hover:bg-darkCard/80 ${scheme.border} ${scheme.glow}`}>
      {/* Icon & Title */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 font-outfit uppercase tracking-wider">
            {title}
          </span>
          <span className="block text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white font-mono tracking-tight group-hover:scale-[1.02] origin-left transition-transform duration-300">
            {value}
          </span>
        </div>
        <div className={`p-2.5 rounded-xl transition-colors duration-300 ${scheme.bg} ${scheme.text}`}>
          {icon}
        </div>
      </div>

      {/* Trend & Info Indicator */}
      <div className="flex items-center gap-1.5 mt-2">
        {trendDirection === 'up' && (
          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500">
            <TrendingUp className="w-3.5 h-3.5" />
            {trendText}
          </span>
        )}
        {trendDirection === 'down' && (
          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-red-500/10 text-red-500">
            <TrendingDown className="w-3.5 h-3.5" />
            {trendText}
          </span>
        )}
        {trendDirection === 'neutral' && (
          <span className="inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-gray-500/10 text-gray-400">
            <Info className="w-3 h-3" />
            {trendText}
          </span>
        )}
        <span className="text-[10px] text-gray-400 dark:text-gray-500">vs dynamic target</span>
      </div>
    </div>
  );
}
