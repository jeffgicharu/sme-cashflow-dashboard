import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { PageHeader } from '@/components/shared/page-header';
import { InsightsContent } from '@/components/insights';
import { getInsightsData } from '@/lib/db/queries/insights';

interface PageProps {
  searchParams: Promise<{
    period?: string;
  }>;
}

type InsightPeriod = 'week' | 'month';

async function InsightsData({ period }: { period: InsightPeriod }) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const data = await getInsightsData(userId, period);

  return <InsightsContent initialData={data} initialPeriod={period} />;
}

function InsightsLoading() {
  return (
    <div className="space-y-6">
      {/* Period selector skeleton */}
      <div className="h-12 animate-pulse rounded-lg bg-slate-100" />

      {/* Summary cards skeleton */}
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-lg border border-slate-200 bg-slate-100"
          />
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="h-64 animate-pulse rounded-lg border border-slate-200 bg-slate-100" />

      {/* Category breakdown skeleton */}
      <div className="h-48 animate-pulse rounded-lg border border-slate-200 bg-slate-100" />
    </div>
  );
}

export default async function InsightsPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const period = (
    searchParams.period === 'month' ? 'month' : 'week'
  ) as InsightPeriod;

  return (
    <div className="p-4 md:p-0">
      <PageHeader title="Insights" />
      <Suspense fallback={<InsightsLoading />}>
        <InsightsData period={period} />
      </Suspense>
    </div>
  );
}
