'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { removeRecurringMark } from '@/lib/actions/categories';
import { formatCurrency } from '@/lib/utils';

interface RecurringTransaction {
  id: string;
  amount: number;
  senderName: string | null;
  description: string | null;
  category: {
    id: string;
    name: string;
    color: string;
  } | null;
  date: Date;
}

interface RecurringListProps {
  income: RecurringTransaction[];
  expenses: RecurringTransaction[];
}

export function RecurringList({ income, expenses }: RecurringListProps) {
  const router = useRouter();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = async () => {
    if (!removingId) return;

    setIsRemoving(true);
    try {
      const result = await removeRecurringMark(removingId);
      if (result.success) {
        toast.success('Recurring mark removed');
        setRemovingId(null);
      } else {
        toast.error(result.error || 'Failed to update');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsRemoving(false);
    }
  };

  const hasData = income.length > 0 || expenses.length > 0;

  if (!hasData) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
        <p className="text-sm text-slate-500">No recurring transactions yet</p>
        <p className="mt-2 text-xs text-slate-400">
          Mark transactions as recurring from the transaction detail page.
        </p>
      </div>
    );
  }

  const TransactionItem = ({ txn }: { txn: RecurringTransaction }) => (
    <div className="flex items-center gap-3 px-4 py-3">
      <button
        onClick={() => router.push(`/transactions/${txn.id}`)}
        className="flex flex-1 items-center gap-3"
      >
        {txn.category && (
          <div
            className="h-4 w-4 rounded-full"
            style={{ backgroundColor: txn.category.color }}
          />
        )}
        <div className="flex-1 text-left">
          <p className="text-sm font-medium text-slate-900">
            {txn.senderName || txn.description || 'Transaction'}
          </p>
          {txn.category && (
            <p className="text-xs text-slate-500">{txn.category.name}</p>
          )}
        </div>
        <span className="text-sm font-medium text-slate-900 tabular-nums">
          {formatCurrency(txn.amount)}
        </span>
        <ChevronRight className="h-4 w-4 text-slate-400" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setRemovingId(txn.id);
        }}
        className="p-1 text-slate-400 hover:text-red-600"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Expenses */}
      {expenses.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-medium text-slate-500">EXPENSES</h2>
          <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
            {expenses.map((txn) => (
              <TransactionItem key={txn.id} txn={txn} />
            ))}
          </div>
        </div>
      )}

      {/* Income */}
      {income.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-medium text-slate-500">INCOME</h2>
          <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
            {income.map((txn) => (
              <TransactionItem key={txn.id} txn={txn} />
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-slate-400">
        Tap any item to edit or view details.
      </p>

      {/* Remove Confirmation Dialog */}
      <Dialog
        open={!!removingId}
        onOpenChange={(open) => !open && setRemovingId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Recurring Mark</DialogTitle>
            <DialogDescription>
              This transaction will no longer be marked as recurring. It will
              still appear in your transaction history.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRemovingId(null)}
              disabled={isRemoving}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemove}
              disabled={isRemoving}
            >
              {isRemoving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
