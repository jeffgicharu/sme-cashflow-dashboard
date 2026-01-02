'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronDown,
  Smartphone,
  PenLine,
  Trash2,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CategoryPicker } from './category-picker';
import {
  updateTransaction,
  deleteTransaction,
  createCategoryRule,
} from '@/lib/actions/transactions';
import { formatCurrency, formatDate, formatTime, cn } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string | null;
  isIncome: boolean;
}

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  source: 'mpesa' | 'manual';
  senderName?: string | null;
  senderPhone?: string | null;
  description?: string | null;
  reference?: string | null;
  isRecurring: boolean;
  isPersonal: boolean;
  date: Date;
  category?: {
    id: string;
    name: string;
    color: string;
  } | null;
}

interface TransactionDetailFormProps {
  transaction: Transaction;
  categories: Category[];
}

export function TransactionDetailForm({
  transaction,
  categories,
}: TransactionDetailFormProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [selectedCategoryId, setSelectedCategoryId] = useState(
    transaction.category?.id || ''
  );
  const [applyToAll, setApplyToAll] = useState(false);
  const [isRecurring, setIsRecurring] = useState(transaction.isRecurring);
  const [frequency, setFrequency] = useState<'weekly' | 'monthly'>('monthly');
  const [isPersonal, setIsPersonal] = useState(transaction.isPersonal);

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  const handleCategoryChange = async (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setIsUpdating(true);

    try {
      const result = await updateTransaction(transaction.id, { categoryId });

      if (result.success) {
        toast.success('Category updated');

        // If "apply to all" is checked and we have a sender identifier
        if (applyToAll && transaction.senderPhone) {
          const ruleResult = await createCategoryRule(
            transaction.senderPhone,
            categoryId
          );
          if (ruleResult.success) {
            toast.success('Rule created for future transactions');
          }
        }
      } else {
        toast.error(result.error || 'Failed to update category');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRecurringChange = async (recurring: boolean) => {
    setIsRecurring(recurring);
    setIsUpdating(true);

    try {
      const result = await updateTransaction(transaction.id, {
        isRecurring: recurring,
        frequency: recurring ? frequency : undefined,
      });

      if (result.success) {
        toast.success(recurring ? 'Marked as recurring' : 'Marked as one-time');
      } else {
        toast.error(result.error || 'Failed to update');
        setIsRecurring(!recurring);
      }
    } catch {
      toast.error('Something went wrong');
      setIsRecurring(!recurring);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePersonalChange = async (personal: boolean) => {
    setIsPersonal(personal);
    setIsUpdating(true);

    try {
      const result = await updateTransaction(transaction.id, {
        isPersonal: personal,
      });

      if (result.success) {
        toast.success(personal ? 'Marked as personal' : 'Marked as business');
      } else {
        toast.error(result.error || 'Failed to update');
        setIsPersonal(!personal);
      }
    } catch {
      toast.error('Something went wrong');
      setIsPersonal(!personal);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const result = await deleteTransaction(transaction.id);

      if (result.success) {
        toast.success('Transaction deleted');
        router.push('/transactions');
      } else {
        toast.error(result.error || 'Failed to delete');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Amount Display */}
      <div className="text-center">
        <p
          className={cn(
            'text-3xl font-bold tabular-nums',
            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
          )}
        >
          {transaction.type === 'income' ? '+' : '-'}
          {formatCurrency(transaction.amount)}
        </p>
        <span
          className={cn(
            'mt-2 inline-block rounded-full px-3 py-1 text-xs font-medium uppercase',
            transaction.type === 'income'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          )}
        >
          {transaction.type}
        </span>
      </div>

      {/* Transaction Details */}
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="space-y-3 text-sm">
          {transaction.senderName && (
            <div className="flex justify-between">
              <span className="text-slate-500">From</span>
              <span className="font-medium text-slate-900">
                {transaction.senderName}
              </span>
            </div>
          )}
          {transaction.senderPhone && (
            <div className="flex justify-between">
              <span className="text-slate-500">Phone</span>
              <span className="font-medium text-slate-900">
                {transaction.senderPhone}
              </span>
            </div>
          )}
          {transaction.reference && (
            <div className="flex justify-between">
              <span className="text-slate-500">Reference</span>
              <span className="font-mono text-slate-900">
                {transaction.reference}
              </span>
            </div>
          )}
          {transaction.description && (
            <div className="flex justify-between">
              <span className="text-slate-500">Description</span>
              <span className="font-medium text-slate-900">
                {transaction.description}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-slate-500">Date</span>
            <span className="font-medium text-slate-900">
              {formatDate(transaction.date)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Time</span>
            <span className="font-medium text-slate-900">
              {formatTime(transaction.date)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Source</span>
            <span className="flex items-center gap-1 font-medium text-slate-900">
              {transaction.source === 'mpesa' ? (
                <>
                  <Smartphone className="h-4 w-4" />
                  M-Pesa Till
                </>
              ) : (
                <>
                  <PenLine className="h-4 w-4" />
                  Manual Entry
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Category Selector */}
      <div>
        <Label className="mb-2 block text-sm font-medium">Category</Label>
        <CategoryPicker
          categories={categories}
          selectedId={selectedCategoryId}
          onSelect={handleCategoryChange}
          trigger={
            <Button
              variant="outline"
              className="w-full justify-between"
              disabled={isUpdating}
            >
              {selectedCategory ? (
                <div className="flex items-center gap-2">
                  <div
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: selectedCategory.color }}
                  />
                  {selectedCategory.name}
                </div>
              ) : (
                <span className="text-slate-500">Select category</span>
              )}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          }
        />

        {/* Apply to all checkbox */}
        {transaction.senderPhone && (
          <div className="mt-3 flex items-start gap-2">
            <Checkbox
              id="apply-all"
              checked={applyToAll}
              onCheckedChange={(checked) => setApplyToAll(!!checked)}
            />
            <Label htmlFor="apply-all" className="text-sm text-slate-600">
              Apply to all transactions from{' '}
              {transaction.senderName || transaction.senderPhone}
            </Label>
          </div>
        )}
      </div>

      <hr className="border-slate-200" />

      {/* Recurring Toggle */}
      <div>
        <Label className="mb-3 block text-sm font-medium">Recurring</Label>
        <RadioGroup
          value={isRecurring ? 'recurring' : 'one-time'}
          onValueChange={(value) =>
            handleRecurringChange(value === 'recurring')
          }
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="one-time" id="one-time" />
            <Label htmlFor="one-time">One-time</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="recurring" id="recurring" />
            <Label htmlFor="recurring">Recurring</Label>
          </div>
        </RadioGroup>

        {isRecurring && (
          <div className="mt-3">
            <Select
              value={frequency}
              onValueChange={(value) =>
                setFrequency(value as 'weekly' | 'monthly')
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <hr className="border-slate-200" />

      {/* Business/Personal Toggle */}
      <div>
        <Label className="mb-3 block text-sm font-medium">Type</Label>
        <RadioGroup
          value={isPersonal ? 'personal' : 'business'}
          onValueChange={(value) => handlePersonalChange(value === 'personal')}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="business" id="business" />
            <Label htmlFor="business">Business</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="personal" id="personal" />
            <Label htmlFor="personal">Personal</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Delete Button (only for manual entries) */}
      {transaction.source === 'manual' && (
        <>
          <hr className="border-slate-200" />
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Transaction
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Transaction</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this transaction? This action
                  cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteDialog(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
