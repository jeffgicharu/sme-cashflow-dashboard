'use client';

import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface UpcomingExpense {
  id: string;
  name: string;
  amount: number;
  date: Date;
  categoryName?: string;
  categoryColor?: string;
}

interface UpcomingExpensesProps {
  expenses: UpcomingExpense[];
}

export function UpcomingExpenses({ expenses }: UpcomingExpensesProps) {
  const router = useRouter();

  if (expenses.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4 text-center">
        <p className="text-sm text-slate-400">No upcoming recurring expenses</p>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-KE', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
      {expenses.map((expense) => (
        <button
          key={expense.id}
          onClick={() => router.push(`/transactions/${expense.id}`)}
          className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50"
        >
          <RefreshCw className="h-4 w-4 text-slate-400" />
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-900">{expense.name}</p>
            <p className="text-xs text-slate-500">{formatDate(expense.date)}</p>
          </div>
          <span className="text-sm font-medium text-red-600 tabular-nums">
            -{formatCurrency(expense.amount)}
          </span>
        </button>
      ))}
    </div>
  );
}
