import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-slate-200', className)}
      aria-hidden="true"
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <Skeleton className="mb-2 h-4 w-24" />
      <Skeleton className="h-8 w-32" />
    </div>
  );
}

export function TransactionRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-4">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1">
        <Skeleton className="mb-1 h-4 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-5 w-20" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {/* Balance card skeleton */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <Skeleton className="mb-2 h-4 w-32" />
        <Skeleton className="mb-2 h-10 w-40" />
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Summary card skeleton */}
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <Skeleton className="mb-4 h-4 w-28" />
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Skeleton className="mb-1 h-3 w-14" />
            <Skeleton className="h-6 w-20" />
          </div>
          <div>
            <Skeleton className="mb-1 h-3 w-14" />
            <Skeleton className="h-6 w-20" />
          </div>
          <div>
            <Skeleton className="mb-1 h-3 w-14" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
      </div>

      {/* Recent transactions skeleton */}
      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-4 py-3">
          <Skeleton className="h-5 w-40" />
        </div>
        <TransactionRowSkeleton />
        <TransactionRowSkeleton />
        <TransactionRowSkeleton />
      </div>
    </div>
  );
}
