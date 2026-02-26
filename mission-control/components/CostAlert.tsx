'use client';

import { AlertTriangle, TrendingDown, Wallet } from 'lucide-react';

export function CostAlert() {
  // Current trajectory
  const spentToday = 11;
  const dailyAverage = spentToday; // $11/day
  const projectedMonthly = dailyAverage * 30; // $330/month
  const budget = 200;
  const overBudget = projectedMonthly - budget; // $130 over
  
  // With automatic routing (85% savings)
  const optimizedDaily = dailyAverage * 0.15; // $1.65/day
  const optimizedMonthly = optimizedDaily * 30; // $49.50/month
  const savings = projectedMonthly - optimizedMonthly; // $280.50 saved
  
  const isOverBudget = projectedMonthly > budget;

  return (
    <div className={`p-4 rounded-xl border ${isOverBudget ? 'bg-red-500/10 border-red-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
      <div className="flex items-start gap-3">
        {isOverBudget ? (
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
        ) : (
          <TrendingDown className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        )}
        
        <div className="flex-1">
          <h3 className={`font-semibold text-sm ${isOverBudget ? 'text-red-400' : 'text-emerald-400'}`}>
            {isOverBudget ? '⚠️ Budget Alert' : '✅ On Track'}
          </h3>
          
          <div className="mt-2 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Today's Spend:</span>
              <span className="text-slate-200">${spentToday.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-slate-400">Projected Monthly:</span>
              <span className="text-red-400 font-medium">${projectedMonthly.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-slate-400">Budget:</span>
              <span className="text-slate-200">${budget.toFixed(2)}</span>
            </div>
            
            {isOverBudget && (
              <>
                <div className="flex justify-between pt-2 border-t border-white/10">
                  <span className="text-slate-400">With Auto-Routing:</span>
                  <span className="text-emerald-400 font-medium">${optimizedMonthly.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-slate-400">Monthly Savings:</span>
                  <span className="text-emerald-400 font-bold">${savings.toFixed(2)}</span>
                </div>
                
                <p className="mt-2 text-[10px] text-slate-500">
                  💡 Enable automatic model routing to stay under budget
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
