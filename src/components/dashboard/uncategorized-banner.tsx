import Link from 'next/link';
import { ChevronRight, AlertCircle } from 'lucide-react';

interface UncategorizedBannerProps {
  count: number;
}

export function UncategorizedBanner({ count }: UncategorizedBannerProps) {
  if (count === 0) return null;

  return (
    <Link href="/transactions?filter=uncategorized">
      <div className="flex items-center justify-between rounded-lg bg-amber-50 p-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <div>
            <p className="text-sm font-medium text-amber-700">
              {count} transaction{count !== 1 ? 's' : ''} need
              {count === 1 ? 's' : ''} category
            </p>
            <p className="text-xs text-slate-500">Tap to categorize</p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-amber-600" />
      </div>
    </Link>
  );
}
