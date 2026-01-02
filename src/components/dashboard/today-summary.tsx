import { formatAmount } from '@/lib/utils';

interface TodaySummaryProps {
  income: number;
  expenses: number;
}

export function TodaySummary({ income, expenses }: TodaySummaryProps) {
  const net = income - expenses;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="mb-3 text-sm font-medium text-slate-900">
        Today&apos;s Summary
      </p>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-xs text-slate-500">Income</p>
          <p className="text-lg font-semibold text-green-600 tabular-nums">
            +{formatAmount(income)}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Expenses</p>
          <p className="text-lg font-semibold text-red-600 tabular-nums">
            -{formatAmount(expenses)}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Net</p>
          <p
            className={`text-lg font-semibold tabular-nums ${
              net >= 0 ? 'text-slate-900' : 'text-red-600'
            }`}
          >
            {formatAmount(net, true)}
          </p>
        </div>
      </div>
    </div>
  );
}
