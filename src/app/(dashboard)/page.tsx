import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { getDashboardData } from '@/lib/db/queries/dashboard';
import { DashboardSkeleton } from '@/components/shared/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { PendingSyncBanner } from '@/components/shared/pending-sync-banner';
import {
  BalanceCard,
  TodaySummary,
  ProjectionBanner,
  UncategorizedBanner,
  RecentTransactions,
} from '@/components/dashboard';
import { formatDate } from '@/lib/utils';

async function DashboardContent() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const data = await getDashboardData(userId);

  if (!data) {
    redirect('/onboarding');
  }

  const {
    settings,
    balance,
    today,
    uncategorizedCount,
    recentTransactions,
    projection,
  } = data;
  const hasTransactions = recentTransactions.length > 0;

  return (
    <div className="p-4 md:p-0">
      {/* Header */}
      <header className="mb-4 flex items-center justify-between md:mb-6">
        <div>
          <p className="text-sm text-slate-500">Welcome back</p>
          <h1 className="text-xl font-semibold text-slate-900 md:text-2xl">
            {settings.businessName}
          </h1>
        </div>
        <p className="text-sm text-slate-500">{formatDate(new Date())}</p>
      </header>

      {/* Pending Sync Banner */}
      <PendingSyncBanner />

      {/* Main Grid - 2 columns on desktop */}
      <div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
        {/* Balance Card - spans full width on mobile, 1 col on desktop */}
        <div className="md:col-span-1 lg:col-span-1">
          <BalanceCard
            balance={balance.current}
            todayChange={balance.todayChange}
          />
        </div>

        {/* Today's Summary */}
        <div className="md:col-span-1 lg:col-span-1">
          <TodaySummary income={today.income} expenses={today.expenses} />
        </div>

        {/* Projection Banner - only show if has transactions */}
        {hasTransactions && (
          <div className="md:col-span-1 lg:col-span-1">
            <ProjectionBanner
              status={projection.status}
              daysUntilThreshold={projection.daysUntilThreshold}
              thresholdDate={projection.thresholdDate}
            />
          </div>
        )}

        {/* Uncategorized Banner */}
        {uncategorizedCount > 0 && (
          <div className="md:col-span-1 lg:col-span-1">
            <UncategorizedBanner count={uncategorizedCount} />
          </div>
        )}
      </div>

      {/* Recent Transactions or Empty State - full width section */}
      <div className="mt-6">
        {hasTransactions ? (
          <RecentTransactions transactions={recentTransactions} />
        ) : (
          <EmptyState
            variant="transactions"
            title="No transactions yet"
            description="Add your first transaction to start tracking your cash flow."
            actionLabel="Add Transaction"
            actionHref="/add"
          />
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
