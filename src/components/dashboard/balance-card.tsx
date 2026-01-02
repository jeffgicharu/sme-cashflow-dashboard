import { ArrowDown, ArrowUp } from 'lucide-react';
import { formatCurrency, formatAmount } from '@/lib/utils';

interface BalanceCardProps {
  balance: number;
  todayChange: number;
}

export function BalanceCard({ balance, todayChange }: BalanceCardProps) {
  const isPositive = todayChange >= 0;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <p className="mb-1 text-sm text-slate-500">Current Balance</p>
      <p className="text-3xl font-bold text-slate-900 tabular-nums">
        {formatCurrency(balance)}
      </p>
      <div className="mt-2 flex items-center gap-1">
        {isPositive ? (
          <ArrowUp className="h-4 w-4 text-green-600" />
        ) : (
          <ArrowDown className="h-4 w-4 text-red-600" />
        )}
        <span
          className={`text-sm font-medium tabular-nums ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {formatAmount(todayChange, true)} today
        </span>
      </div>
    </div>
  );
}
