import { db } from '@/lib/db';
import { transactions, userSettings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export interface MonthOption {
  value: string; // Format: YYYY-MM
  label: string; // Format: "January 2026"
}

export interface ReportSummary {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  transactionCount: number;
  incomeCount: number;
  expenseCount: number;
  avgTransactionSize: number;
}

export interface ReportCategoryBreakdown {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  amount: number;
  percentage: number;
  count: number;
}

export interface ReportDailyData {
  date: string;
  income: number;
  expense: number;
}

export interface ReportData {
  businessName: string;
  month: string;
  year: number;
  summary: ReportSummary;
  categoryBreakdown: ReportCategoryBreakdown[];
  dailyData: ReportDailyData[];
  generatedAt: Date;
}

/**
 * Get available months that have transactions
 */
export async function getAvailableMonths(
  userId: string
): Promise<MonthOption[]> {
  const allTransactions = await db.query.transactions.findMany({
    where: eq(transactions.userId, userId),
    columns: { date: true },
  });

  if (allTransactions.length === 0) {
    return [];
  }

  // Get unique months from transactions
  const monthsSet = new Set<string>();
  for (const t of allTransactions) {
    const date = new Date(t.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthsSet.add(monthKey);
  }

  // Convert to array and sort descending (newest first)
  const months = Array.from(monthsSet).sort().reverse();

  // Format for display
  return months.map((monthKey) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return {
      value: monthKey,
      label: date.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      }),
    };
  });
}

/**
 * Get report data for a specific month
 */
export async function getReportData(
  userId: string,
  monthKey: string // Format: YYYY-MM
): Promise<ReportData> {
  // Parse month
  const [yearStr, monthStr] = monthKey.split('-');
  const year = parseInt(yearStr);
  const month = parseInt(monthStr) - 1; // JS months are 0-indexed

  // Calculate month range
  const startDate = new Date(year, month, 1, 0, 0, 0);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59); // Last day of month

  // Get user settings
  const settings = await db.query.userSettings.findFirst({
    where: eq(userSettings.userId, userId),
  });

  const businessName = settings?.businessName || 'My Business';

  // Get all transactions for the month
  const monthTransactions = await db.query.transactions.findMany({
    where: eq(transactions.userId, userId),
    with: { category: true },
  });

  // Filter to specific month
  const filteredTransactions = monthTransactions.filter(
    (t) => t.date >= startDate && t.date <= endDate
  );

  // Calculate summary
  const incomeTransactions = filteredTransactions.filter(
    (t) => t.type === 'income'
  );
  const expenseTransactions = filteredTransactions.filter(
    (t) => t.type === 'expense'
  );

  const totalRevenue = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = expenseTransactions.reduce(
    (sum, t) => sum + t.amount,
    0
  );
  const netProfit = totalRevenue - totalExpenses;
  const transactionCount = filteredTransactions.length;
  const avgTransactionSize =
    transactionCount > 0
      ? (totalRevenue + totalExpenses) / transactionCount
      : 0;

  // Calculate category breakdown (expenses only)
  const categoryMap = new Map<
    string,
    { name: string; color: string; amount: number; count: number }
  >();

  for (const t of expenseTransactions) {
    const id = t.category?.id || 'uncategorized';
    const name = t.category?.name || 'Uncategorized';
    const color = t.category?.color || '#94A3B8';

    const existing = categoryMap.get(id);
    if (existing) {
      existing.amount += t.amount;
      existing.count += 1;
    } else {
      categoryMap.set(id, { name, color, amount: t.amount, count: 1 });
    }
  }

  const categoryBreakdown: ReportCategoryBreakdown[] = Array.from(
    categoryMap.entries()
  )
    .map(([id, data]) => ({
      categoryId: id,
      categoryName: data.name,
      categoryColor: data.color,
      amount: data.amount,
      percentage:
        totalExpenses > 0 ? Math.round((data.amount / totalExpenses) * 100) : 0,
      count: data.count,
    }))
    .sort((a, b) => b.amount - a.amount);

  // Calculate daily data for trend
  const dailyMap = new Map<string, { income: number; expense: number }>();

  // Initialize all days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${yearStr}-${monthStr}-${String(day).padStart(2, '0')}`;
    dailyMap.set(dateStr, { income: 0, expense: 0 });
  }

  // Aggregate transactions by day
  for (const t of filteredTransactions) {
    const dateStr = t.date.toISOString().split('T')[0];
    const existing = dailyMap.get(dateStr);
    if (existing) {
      if (t.type === 'income') {
        existing.income += t.amount;
      } else {
        existing.expense += t.amount;
      }
    }
  }

  const dailyData: ReportDailyData[] = Array.from(dailyMap.entries())
    .map(([date, data]) => ({
      date,
      income: data.income,
      expense: data.expense,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Format month name
  const monthName = new Date(year, month, 1).toLocaleDateString('en-US', {
    month: 'long',
  });

  return {
    businessName,
    month: monthName,
    year,
    summary: {
      totalRevenue,
      totalExpenses,
      netProfit,
      transactionCount,
      incomeCount: incomeTransactions.length,
      expenseCount: expenseTransactions.length,
      avgTransactionSize: Math.round(avgTransactionSize),
    },
    categoryBreakdown,
    dailyData,
    generatedAt: new Date(),
  };
}
