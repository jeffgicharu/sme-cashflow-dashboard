// Client-safe transaction utilities (no db imports)

export type TransactionFilter = 'all' | 'income' | 'expense' | 'uncategorized';
export type DateRange = 'today' | 'week' | 'month' | 'all';

// Group transactions by date for display
export function groupTransactionsByDate<T extends { date: Date }>(
  transactions: T[]
): Map<string, T[]> {
  const groups = new Map<string, T[]>();

  for (const transaction of transactions) {
    const dateKey = transaction.date.toISOString().split('T')[0];
    const existing = groups.get(dateKey) || [];
    existing.push(transaction);
    groups.set(dateKey, existing);
  }

  return groups;
}

export function formatDateHeader(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (dateStr === today.toISOString().split('T')[0]) {
    return `Today, ${date.toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })}`;
  }
  if (dateStr === yesterday.toISOString().split('T')[0]) {
    return `Yesterday, ${date.toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })}`;
  }
  return date.toLocaleDateString('en-KE', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}
