'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FilterChips } from './filter-chips';
import { DateRangeSelector } from './date-range-selector';
import { TransactionRow } from '@/components/dashboard/transaction-row';
import { EmptyState } from '@/components/shared/empty-state';
import {
  formatDateHeader,
  groupTransactionsByDate,
} from '@/lib/db/queries/transactions';
import type {
  TransactionFilter,
  DateRange,
} from '@/lib/db/queries/transactions';

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  source: 'mpesa' | 'manual';
  senderName?: string | null;
  description?: string | null;
  date: Date;
  category?: {
    id: string;
    name: string;
    color: string;
  } | null;
}

interface TransactionListProps {
  initialTransactions: Transaction[];
  initialHasMore: boolean;
  uncategorizedCount: number;
}

export function TransactionList({
  initialTransactions,
  initialHasMore,
  uncategorizedCount,
}: TransactionListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [filter, setFilter] = useState<TransactionFilter>(
    (searchParams.get('filter') as TransactionFilter) || 'all'
  );
  const [dateRange, setDateRange] = useState<DateRange>(
    (searchParams.get('range') as DateRange) || 'all'
  );

  const updateUrl = (params: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    startTransition(() => {
      router.push(`/transactions?${newParams.toString()}`);
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl({ search, filter, range: dateRange });
  };

  const handleFilterChange = (newFilter: TransactionFilter) => {
    setFilter(newFilter);
    updateUrl({ search, filter: newFilter, range: dateRange });
  };

  const handleDateRangeChange = (newRange: DateRange) => {
    setDateRange(newRange);
    updateUrl({ search, filter, range: newRange });
  };

  // Group transactions by date
  const groupedTransactions = groupTransactionsByDate(initialTransactions);
  const sortedDates = Array.from(groupedTransactions.keys()).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="flex flex-col">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-4">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="search"
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </form>

      {/* Filter Chips */}
      <div className="mb-4">
        <FilterChips
          selected={filter}
          onChange={handleFilterChange}
          uncategorizedCount={uncategorizedCount}
        />
      </div>

      {/* Date Range */}
      <div className="mb-4 flex justify-end">
        <DateRangeSelector
          selected={dateRange}
          onChange={handleDateRangeChange}
        />
      </div>

      {/* Transaction List */}
      {isPending ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
        </div>
      ) : initialTransactions.length === 0 ? (
        <EmptyState
          variant="transactions"
          title={
            filter === 'uncategorized'
              ? 'No uncategorized transactions'
              : 'No transactions found'
          }
          description={
            search
              ? 'Try adjusting your search or filters'
              : 'Add your first transaction to get started'
          }
          actionLabel="Add Transaction"
          actionHref="/add"
        />
      ) : (
        <div className="space-y-4">
          {sortedDates.map((dateKey) => (
            <div key={dateKey}>
              {/* Date Header */}
              <div className="mb-2 text-xs font-medium tracking-wide text-slate-500 uppercase">
                {formatDateHeader(dateKey)}
              </div>
              {/* Transactions for this date */}
              <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white px-4">
                {groupedTransactions.get(dateKey)?.map((transaction) => (
                  <TransactionRow
                    key={transaction.id}
                    id={transaction.id}
                    amount={transaction.amount}
                    type={transaction.type}
                    source={transaction.source}
                    senderName={transaction.senderName}
                    description={transaction.description}
                    categoryName={transaction.category?.name}
                    categoryColor={transaction.category?.color}
                    date={transaction.date}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Load More */}
          {initialHasMore && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  const newOffset = initialTransactions.length;
                  updateUrl({
                    search,
                    filter,
                    range: dateRange,
                    offset: String(newOffset),
                  });
                }}
              >
                Load more...
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
