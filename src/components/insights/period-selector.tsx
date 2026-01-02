'use client';

import { cn } from '@/lib/utils';

type Period = 'week' | 'month';

interface PeriodSelectorProps {
  selected: Period;
  onChange: (period: Period) => void;
}

export function PeriodSelector({ selected, onChange }: PeriodSelectorProps) {
  const options: { value: Period; label: string }[] = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
  ];

  return (
    <div className="flex rounded-lg bg-slate-100 p-1">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors',
            selected === option.value
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
