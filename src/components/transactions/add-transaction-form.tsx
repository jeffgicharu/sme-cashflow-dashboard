'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CalendarIcon,
  ChevronDown,
  TrendingDown,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CategoryPicker } from './category-picker';
import { addTransaction } from '@/lib/actions/transactions';
import { addTransactionSchema } from '@/lib/validations/transaction';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string | null;
  isIncome: boolean;
}

interface AddTransactionFormProps {
  categories: Category[];
}

interface FormErrors {
  type?: string;
  amount?: string;
  date?: string;
  categoryId?: string;
  description?: string;
  frequency?: string;
}

export function AddTransactionForm({ categories }: AddTransactionFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Form state
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<Date>(new Date());
  const [categoryId, setCategoryId] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [frequency, setFrequency] = useState<'weekly' | 'monthly' | undefined>(
    undefined
  );

  const selectedCategory = categories.find((c) => c.id === categoryId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Build data object
    const formData = {
      type,
      amount: amount ? parseFloat(amount) : undefined,
      date,
      categoryId,
      description: description || undefined,
      isRecurring,
      frequency: isRecurring ? frequency : undefined,
    };

    // Validate with Zod
    const result = addTransactionSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof FormErrors;
        if (field) {
          fieldErrors[field] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    // Submit
    setIsSubmitting(true);
    try {
      const submitResult = await addTransaction(result.data);

      if (submitResult.success) {
        toast.success('Transaction added successfully');
        router.push('/transactions');
      } else {
        toast.error(submitResult.error || 'Failed to add transaction');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Type Selector */}
      <div className="space-y-2">
        <Label>Type</Label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={cn(
              'flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors',
              type === 'expense'
                ? 'border-red-500 bg-red-50'
                : 'border-slate-200 hover:border-slate-300'
            )}
          >
            <TrendingDown
              className={cn(
                'h-6 w-6',
                type === 'expense' ? 'text-red-600' : 'text-slate-400'
              )}
            />
            <span
              className={cn(
                'text-sm font-medium',
                type === 'expense' ? 'text-red-600' : 'text-slate-600'
              )}
            >
              Expense
            </span>
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={cn(
              'flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors',
              type === 'income'
                ? 'border-green-500 bg-green-50'
                : 'border-slate-200 hover:border-slate-300'
            )}
          >
            <TrendingUp
              className={cn(
                'h-6 w-6',
                type === 'income' ? 'text-green-600' : 'text-slate-400'
              )}
            />
            <span
              className={cn(
                'text-sm font-medium',
                type === 'income' ? 'text-green-600' : 'text-slate-600'
              )}
            >
              Income
            </span>
          </button>
        </div>
        {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <Label htmlFor="amount">Amount *</Label>
        <div className="relative">
          <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-slate-500">
            KES
          </span>
          <Input
            id="amount"
            type="number"
            placeholder="0"
            className="pl-12 text-lg"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        {errors.amount && (
          <p className="text-sm text-red-500">{errors.amount}</p>
        )}
      </div>

      {/* Date */}
      <div className="space-y-2">
        <Label>Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              type="button"
              className={cn(
                'w-full justify-start text-left font-normal',
                !date && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, 'PPP') : 'Select date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => d && setDate(d)}
              disabled={(d) => d > new Date()}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label>Category *</Label>
        <CategoryPicker
          categories={categories}
          selectedId={categoryId}
          onSelect={setCategoryId}
          filterType={type}
          trigger={
            <Button
              variant="outline"
              className="w-full justify-between"
              type="button"
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
        {errors.categoryId && (
          <p className="text-sm text-red-500">{errors.categoryId}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Add a note..."
          className="resize-none"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description}</p>
        )}
      </div>

      {/* Recurring */}
      <div className="flex flex-row items-start space-y-0 space-x-3 rounded-lg border border-slate-200 p-4">
        <Checkbox
          id="isRecurring"
          checked={isRecurring}
          onCheckedChange={(checked) => setIsRecurring(!!checked)}
        />
        <Label htmlFor="isRecurring" className="cursor-pointer">
          This is a recurring {type}
        </Label>
      </div>

      {/* Frequency (if recurring) */}
      {isRecurring && (
        <div className="space-y-2">
          <Label>Frequency</Label>
          <Select
            value={frequency}
            onValueChange={(value) =>
              setFrequency(value as 'weekly' | 'monthly')
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
          {errors.frequency && (
            <p className="text-sm text-red-500">{errors.frequency}</p>
          )}
        </div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          'Save Transaction'
        )}
      </Button>
    </form>
  );
}
