import Link from 'next/link';
import { Smartphone, PenLine } from 'lucide-react';
import { formatAmount, formatTime, cn } from '@/lib/utils';

interface TransactionRowProps {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  source: 'mpesa' | 'manual';
  senderName?: string | null;
  description?: string | null;
  categoryName?: string | null;
  categoryColor?: string | null;
  date: Date;
}

export function TransactionRow({
  id,
  amount,
  type,
  source,
  senderName,
  description,
  categoryName,
  categoryColor,
  date,
}: TransactionRowProps) {
  const isIncome = type === 'income';
  const displayName = senderName || description || 'Unknown';

  return (
    <Link href={`/transactions/${id}`}>
      <div className="flex items-center justify-between py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
            {source === 'mpesa' ? (
              <Smartphone className="h-5 w-5 text-slate-600" />
            ) : (
              <PenLine className="h-5 w-5 text-slate-600" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">{displayName}</p>
            <div className="flex items-center gap-2">
              {categoryName ? (
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{
                    backgroundColor: categoryColor
                      ? `${categoryColor}20`
                      : '#f1f5f9',
                    color: categoryColor || '#64748b',
                  }}
                >
                  {categoryName}
                </span>
              ) : (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                  Uncategorized
                </span>
              )}
              <span className="text-xs text-slate-400">{formatTime(date)}</span>
            </div>
          </div>
        </div>
        <p
          className={cn(
            'text-sm font-semibold tabular-nums',
            isIncome ? 'text-green-600' : 'text-red-600'
          )}
        >
          {isIncome ? '+' : '-'}
          {formatAmount(amount)}
        </p>
      </div>
    </Link>
  );
}
