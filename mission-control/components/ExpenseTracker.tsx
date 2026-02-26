'use client';

import { Expense } from '@/lib/models';

interface ExpenseTrackerProps {
  expenses: Expense[];
}

export function ExpenseTracker({ expenses }: ExpenseTrackerProps) {
  const totalSpend = expenses.reduce((sum, e) => sum + e.amount, 0);
  const budget = 200;
  const percentUsed = (totalSpend / budget) * 100;
  
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-4">Budget Tracker</h2>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-400">Monthly Spend</span>
          <span>${totalSpend.toFixed(2)} / ${budget}</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all ${percentUsed > 80 ? 'bg-red-500' : percentUsed > 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
            style={{ width: `${Math.min(percentUsed, 100)}%` }}
          />
        </div>
      </div>
      
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {expenses.slice(0, 5).map((expense) => (
          <div key={expense.id} className="flex justify-between text-sm">
            <span className="text-gray-300">{expense.description}</span>
            <span className="text-gray-400">${expense.amount.toFixed(4)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
