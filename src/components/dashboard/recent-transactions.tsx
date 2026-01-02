import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { TransactionRow } from './transaction-row';

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  source: 'mpesa' | 'manual';
  senderName?: string | null;
  description?: string | null;
  date: Date;
  category?: {
    name: string;
    color: string;
  } | null;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  if (transactions.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-4 py-3">
        <h3 className="text-sm font-medium text-slate-900">
          Recent Transactions
        </h3>
      </div>
      <div className="divide-y divide-slate-100 px-4">
        {transactions.map((transaction) => (
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
      <Link
        href="/transactions"
        className="flex items-center justify-center gap-1 border-t border-slate-100 py-3 text-sm font-medium text-blue-600"
      >
        See all transactions
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
