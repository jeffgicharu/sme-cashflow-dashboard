import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { userSettings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { DashboardSkeleton } from '@/components/shared/skeleton';
import { Suspense } from 'react';

async function DashboardContent() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Check if user has completed onboarding
  const settings = await db.query.userSettings.findFirst({
    where: eq(userSettings.userId, userId),
  });

  if (!settings?.onboardingCompleted) {
    redirect('/onboarding');
  }

  // TODO: Fetch actual dashboard data in Phase 3
  return (
    <div className="p-4">
      {/* Header */}
      <header className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Welcome back</p>
          <h1 className="text-xl font-semibold text-slate-900">
            {settings.businessName}
          </h1>
        </div>
        <p className="text-sm text-slate-500">
          {new Date().toLocaleDateString('en-KE', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
      </header>

      {/* Balance Card Placeholder */}
      <div className="mb-4 rounded-lg border border-slate-200 bg-white p-6">
        <p className="mb-1 text-sm text-slate-500">Current Balance</p>
        <p className="text-3xl font-bold text-slate-900 tabular-nums">KES 0</p>
        <p className="mt-1 text-sm text-slate-500">No transactions yet</p>
      </div>

      {/* Today's Summary Placeholder */}
      <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4">
        <p className="mb-3 text-sm font-medium text-slate-900">
          Today&apos;s Summary
        </p>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-slate-500">Income</p>
            <p className="text-lg font-semibold text-green-600 tabular-nums">
              +0
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Expenses</p>
            <p className="text-lg font-semibold text-red-600 tabular-nums">
              -0
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Net</p>
            <p className="text-lg font-semibold text-slate-900 tabular-nums">
              0
            </p>
          </div>
        </div>
      </div>

      {/* Empty State */}
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <svg
            className="h-8 w-8 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <h3 className="mb-1 text-lg font-semibold text-slate-900">
          No transactions yet
        </h3>
        <p className="mb-4 text-sm text-slate-500">
          Add your first transaction to start tracking your cash flow.
        </p>
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
