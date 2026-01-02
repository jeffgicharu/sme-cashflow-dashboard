'use client';

import { formatCurrency } from '@/lib/utils';
import type { ReportData } from '@/lib/db/queries/reports';

interface ReportPreviewProps {
  data: ReportData;
}

export function ReportPreview({ data }: ReportPreviewProps) {
  const { businessName, month, year, summary, categoryBreakdown, generatedAt } =
    data;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      {/* Paper-like preview container */}
      <div className="mx-auto aspect-[1/1.4] max-h-[400px] overflow-hidden rounded border border-slate-300 bg-white shadow-inner">
        <div className="h-full overflow-y-auto p-4">
          {/* Header */}
          <div className="mb-4 text-center">
            <h2 className="text-lg font-bold text-slate-900">{businessName}</h2>
            <p className="text-sm text-slate-500">Cash Flow Report</p>
            <p className="text-sm text-slate-500">
              {month} {year}
            </p>
          </div>

          {/* Divider */}
          <div className="mb-4 border-b border-slate-200" />

          {/* Summary */}
          <div className="mb-4">
            <h3 className="mb-2 text-xs font-semibold text-slate-500 uppercase">
              Summary
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded bg-slate-50 p-2 text-center">
                <p className="text-[10px] text-slate-500">Revenue</p>
                <p className="text-sm font-bold text-green-600">
                  {formatCurrency(summary.totalRevenue)}
                </p>
              </div>
              <div className="rounded bg-slate-50 p-2 text-center">
                <p className="text-[10px] text-slate-500">Expenses</p>
                <p className="text-sm font-bold text-red-600">
                  {formatCurrency(summary.totalExpenses)}
                </p>
              </div>
              <div className="rounded bg-slate-50 p-2 text-center">
                <p className="text-[10px] text-slate-500">Net Profit</p>
                <p
                  className={`text-sm font-bold ${
                    summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {formatCurrency(summary.netProfit)}
                </p>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          {categoryBreakdown.length > 0 && (
            <div className="mb-4">
              <h3 className="mb-2 text-xs font-semibold text-slate-500 uppercase">
                Expenses by Category
              </h3>
              <div className="space-y-1">
                {categoryBreakdown.slice(0, 5).map((category) => (
                  <div
                    key={category.categoryId}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-1">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: category.categoryColor }}
                      />
                      <span className="text-slate-700">
                        {category.categoryName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">
                        {category.percentage}%
                      </span>
                      <span className="font-medium text-slate-900">
                        {formatCurrency(category.amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transaction Stats */}
          <div className="mb-4">
            <h3 className="mb-2 text-xs font-semibold text-slate-500 uppercase">
              Transaction Stats
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500">Total: </span>
                <span className="font-medium text-slate-900">
                  {summary.transactionCount}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Avg Size: </span>
                <span className="font-medium text-slate-900">
                  {formatCurrency(summary.avgTransactionSize)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 pt-2 text-center text-[10px] text-slate-400">
            Generated on{' '}
            {generatedAt.toLocaleDateString('en-KE', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
