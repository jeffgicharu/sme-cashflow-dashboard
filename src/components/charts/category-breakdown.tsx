'use client';

import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';

interface CategoryData {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  amount: number;
  percentage: number;
}

interface CategoryBreakdownProps {
  data: CategoryData[];
}

export function CategoryBreakdown({ data }: CategoryBreakdownProps) {
  const router = useRouter();

  if (data.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-slate-400">
        No expense data available
      </div>
    );
  }

  const handleCategoryClick = (categoryId: string) => {
    // Navigate to transactions filtered by category
    if (categoryId !== 'uncategorized') {
      router.push(`/transactions?category=${categoryId}`);
    } else {
      router.push('/transactions?filter=uncategorized');
    }
  };

  return (
    <div className="space-y-3">
      {data.map((category) => (
        <button
          key={category.categoryId}
          onClick={() => handleCategoryClick(category.categoryId)}
          className="w-full text-left transition-opacity hover:opacity-80"
        >
          <div className="mb-1 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: category.categoryColor }}
              />
              <span className="text-sm font-medium text-slate-700">
                {category.categoryName}
              </span>
            </div>
            <span className="text-sm text-slate-500">
              {category.percentage}%
            </span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
              style={{
                width: `${category.percentage}%`,
                backgroundColor: category.categoryColor,
              }}
            />
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {formatCurrency(category.amount)}
          </p>
        </button>
      ))}
    </div>
  );
}
