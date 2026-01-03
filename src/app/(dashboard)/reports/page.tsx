import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { PageHeader } from '@/components/shared/page-header';
import { ReportsContent } from '@/components/reports';
import { getAvailableMonths, getReportData } from '@/lib/db/queries/reports';
import { getReportDataAction } from '@/lib/actions/reports';

async function ReportsData() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const availableMonths = await getAvailableMonths(userId);

  // Get initial data for the most recent month
  let initialData = null;
  let initialMonth = '';

  if (availableMonths.length > 0) {
    initialMonth = availableMonths[0].value;
    initialData = await getReportData(userId, initialMonth);
  }

  return (
    <ReportsContent
      availableMonths={availableMonths}
      initialData={initialData}
      initialMonth={initialMonth}
      onMonthChange={getReportDataAction}
    />
  );
}

function ReportsLoading() {
  return (
    <div className="space-y-6">
      {/* Month selector skeleton */}
      <div>
        <div className="mb-2 h-4 w-24 animate-pulse rounded bg-slate-100" />
        <div className="h-12 animate-pulse rounded-lg border border-slate-200 bg-slate-100" />
      </div>

      {/* Preview skeleton */}
      <div>
        <div className="mb-2 h-4 w-16 animate-pulse rounded bg-slate-100" />
        <div className="h-[400px] animate-pulse rounded-lg border border-slate-200 bg-slate-100" />
      </div>

      {/* Button skeletons */}
      <div className="space-y-3">
        <div className="h-11 animate-pulse rounded-md bg-slate-200" />
        <div className="h-11 animate-pulse rounded-md bg-slate-100" />
      </div>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <div className="p-4 md:p-0">
      <PageHeader title="Monthly Report" showBack />
      <div className="md:max-w-3xl">
        <Suspense fallback={<ReportsLoading />}>
          <ReportsData />
        </Suspense>
      </div>
    </div>
  );
}
