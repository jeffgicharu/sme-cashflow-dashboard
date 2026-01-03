'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FileText } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { SummaryCards } from './summary-cards';
import { PeriodSelector } from './period-selector';
import { UpcomingExpenses } from './upcoming-expenses';
import { IncomeExpenseChart } from '@/components/charts/income-expense-chart';
import { CategoryBreakdown } from '@/components/charts/category-breakdown';
import { ProjectionChart } from '@/components/charts/projection-chart';
import { formatCurrency } from '@/lib/utils';
import type {
  InsightsSummary,
  DailyData,
  CategoryBreakdown as CategoryBreakdownType,
  ProjectionPoint,
  UpcomingExpense,
} from '@/lib/db/queries/insights';

interface InsightsContentProps {
  initialData: {
    summary: InsightsSummary;
    dailyData: DailyData[];
    categoryBreakdown: CategoryBreakdownType[];
    avgDailySpend: number;
    projectionData: ProjectionPoint[];
    upcomingExpenses: UpcomingExpense[];
    currentBalance: number;
    threshold: number;
  };
  initialPeriod: 'week' | 'month';
}

export function InsightsContent({
  initialData,
  initialPeriod,
}: InsightsContentProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [period, setPeriod] = useState<'week' | 'month'>(initialPeriod);

  const handlePeriodChange = (newPeriod: 'week' | 'month') => {
    setPeriod(newPeriod);
    startTransition(() => {
      router.push(`/insights?period=${newPeriod}`);
    });
  };

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <PeriodSelector selected={period} onChange={handlePeriodChange} />

      {/* Summary Cards */}
      {isPending ? (
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-lg border border-slate-200 bg-slate-100"
            />
          ))}
        </div>
      ) : (
        <SummaryCards {...initialData.summary} />
      )}

      {/* Charts Grid - 2 columns on large screens */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Income vs Expenses Chart */}
        <section>
          <h2 className="mb-3 text-sm font-medium tracking-wide text-slate-500 uppercase">
            Income vs Expenses
          </h2>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            {isPending ? (
              <div className="h-64 animate-pulse rounded bg-slate-100" />
            ) : (
              <IncomeExpenseChart data={initialData.dailyData} />
            )}
          </div>
        </section>

        {/* Category Breakdown */}
        <section>
          <h2 className="mb-3 text-sm font-medium tracking-wide text-slate-500 uppercase">
            Expenses by Category
          </h2>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            {isPending ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-8 animate-pulse rounded bg-slate-100"
                  />
                ))}
              </div>
            ) : (
              <CategoryBreakdown data={initialData.categoryBreakdown} />
            )}
          </div>
        </section>
      </div>

      {/* 30-Day Projection - full width */}
      <section>
        <h2 className="mb-3 text-sm font-medium tracking-wide text-slate-500 uppercase">
          30-Day Cash Flow Projection
        </h2>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          {isPending ? (
            <div className="h-64 animate-pulse rounded bg-slate-100" />
          ) : (
            <ProjectionChart
              data={initialData.projectionData}
              threshold={initialData.threshold}
              currentBalance={initialData.currentBalance}
            />
          )}
        </div>
      </section>

      {/* Bottom section - 2 columns on large screens */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Known Expenses */}
        <section>
          <h2 className="mb-3 text-sm font-medium tracking-wide text-slate-500 uppercase">
            Upcoming Known Expenses
          </h2>
          {isPending ? (
            <div className="h-32 animate-pulse rounded-lg border border-slate-200 bg-slate-100" />
          ) : (
            <UpcomingExpenses expenses={initialData.upcomingExpenses} />
          )}
        </section>

        {/* Average Daily Spend + Report Button */}
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-center">
            <p className="text-sm text-slate-500">Average daily spend</p>
            <p className="mt-1 text-xl font-bold text-slate-900">
              {formatCurrency(initialData.avgDailySpend)}
            </p>
          </div>

          {/* Generate Report Button */}
          <Link href="/reports">
            <Button variant="outline" className="w-full">
              <FileText className="mr-2 h-4 w-4" />
              Generate Monthly Report
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
