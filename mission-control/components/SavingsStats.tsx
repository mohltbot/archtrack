'use client';

import { TrendingDown } from 'lucide-react';

interface SavingsStatsProps {
  delay: number;
}

export function SavingsStats({ delay }: SavingsStatsProps) {
  // Calculate estimated savings based on default vs optimized routing
  // Default: GPT-4o at $0.01/1K tokens
  // Optimized: Mix of DeepSeek ($0.0002), Minimax ($0.0002), GLM-5 ($0.0003)
  // Average savings: ~85%
  
  const estimatedSavings = 85; // 85% savings with automatic routing
  const monthlyBudget = 200;
  const withoutOptimization = monthlyBudget; // Would spend full budget
  const withOptimization = monthlyBudget * 0.15; // Only 15% of budget
  const dollarsSaved = withoutOptimization - withOptimization;

  return (
    <div 
      className="glass-card p-4 md:p-5 transition-all duration-300 hover:scale-[1.02] group slide-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
          <TrendingDown className="w-5 h-5 text-white" />
        </div>
        <div className="flex items-center gap-1 text-xs font-medium text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 status-pulse" />
          Auto
        </div>
      </div>
      
      <div className="space-y-1">
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Cost Savings</p>
        <p className="text-2xl md:text-3xl font-bold text-white">{estimatedSavings}%</p>
        <p className="text-slate-500 text-xs">${dollarsSaved.toFixed(0)}/mo saved</p>
      </div>

      <div className="mt-3 h-1 bg-slate-700/50 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-emerald-400 to-teal-600 rounded-full transition-all duration-1000"
          style={{ width: `${estimatedSavings}%` }}
        />
      </div>
      
      <p className="mt-2 text-[10px] text-slate-500">
        Automatic model routing active
      </p>
    </div>
  );
}
