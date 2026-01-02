'use client';

import { Check } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string | null;
  isIncome: boolean;
}

interface CategoryPickerProps {
  categories: Category[];
  selectedId?: string | null;
  onSelect: (categoryId: string) => void;
  filterType?: 'income' | 'expense' | 'all';
  trigger: React.ReactNode;
}

export function CategoryPicker({
  categories,
  selectedId,
  onSelect,
  filterType = 'all',
  trigger,
}: CategoryPickerProps) {
  const filteredCategories = categories.filter((cat) => {
    if (filterType === 'all') return true;
    if (filterType === 'income') return cat.isIncome;
    return !cat.isIncome;
  });

  const incomeCategories = filteredCategories.filter((c) => c.isIncome);
  const expenseCategories = filteredCategories.filter((c) => !c.isIncome);

  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="bottom" className="h-[80vh]">
        <SheetHeader>
          <SheetTitle>Select Category</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-6 overflow-y-auto">
          {(filterType === 'all' || filterType === 'income') &&
            incomeCategories.length > 0 && (
              <div>
                <h3 className="mb-2 text-xs font-medium tracking-wide text-slate-500 uppercase">
                  Income
                </h3>
                <div className="space-y-1">
                  {incomeCategories.map((category) => (
                    <CategoryItem
                      key={category.id}
                      category={category}
                      isSelected={selectedId === category.id}
                      onSelect={() => onSelect(category.id)}
                    />
                  ))}
                </div>
              </div>
            )}

          {(filterType === 'all' || filterType === 'expense') &&
            expenseCategories.length > 0 && (
              <div>
                <h3 className="mb-2 text-xs font-medium tracking-wide text-slate-500 uppercase">
                  Expenses
                </h3>
                <div className="space-y-1">
                  {expenseCategories.map((category) => (
                    <CategoryItem
                      key={category.id}
                      category={category}
                      isSelected={selectedId === category.id}
                      onSelect={() => onSelect(category.id)}
                    />
                  ))}
                </div>
              </div>
            )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

interface CategoryItemProps {
  category: Category;
  isSelected: boolean;
  onSelect: () => void;
}

function CategoryItem({ category, isSelected, onSelect }: CategoryItemProps) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'flex w-full items-center justify-between rounded-lg p-3 transition-colors',
        isSelected ? 'bg-slate-100' : 'hover:bg-slate-50'
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full text-lg"
          style={{
            backgroundColor: `${category.color}20`,
            color: category.color,
          }}
        >
          {category.icon || category.name.charAt(0)}
        </div>
        <span className="font-medium text-slate-900">{category.name}</span>
      </div>
      {isSelected && <Check className="h-5 w-5 text-green-600" />}
    </button>
  );
}
