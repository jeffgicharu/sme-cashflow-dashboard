'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { MonthOption } from '@/lib/db/queries/reports';

interface MonthSelectorProps {
  months: MonthOption[];
  selected: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function MonthSelector({
  months,
  selected,
  onChange,
  disabled = false,
}: MonthSelectorProps) {
  if (months.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
        No months with transactions available
      </div>
    );
  }

  return (
    <Select value={selected} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="h-12 w-full">
        <SelectValue placeholder="Select a month" />
      </SelectTrigger>
      <SelectContent>
        {months.map((month) => (
          <SelectItem key={month.value} value={month.value}>
            {month.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
