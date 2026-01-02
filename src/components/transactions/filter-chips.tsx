'use client';

import { cn } from '@/lib/utils';
import type { TransactionFilter } from '@/lib/db/queries/transactions';

interface FilterChipsProps {
  selected: TransactionFilter;
  onChange: (filter: TransactionFilter) => void;
  uncategorizedCount?: number;
}

const filters: { value: TransactionFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expenses' },
  { value: 'uncategorized', label: 'Uncategorized' },
];

export function FilterChips({
  selected,
  onChange,
  uncategorizedCount,
}: FilterChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onChange(filter.value)}
          className={cn(
            'shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
            selected === filter.value
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          )}
        >
          {filter.label}
          {filter.value === 'uncategorized' && uncategorizedCount ? (
            <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-xs text-white">
              {uncategorizedCount > 9 ? '9+' : uncategorizedCount}
            </span>
          ) : null}
        </button>
      ))}
    </div>
  );
}
