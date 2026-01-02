import { db } from '@/lib/db';
import { transactions, userSettings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export type Period = 'week' | 'month' | 'custom';

interface PeriodRange {
  start: Date;
  end: Date;
}

export function getPeriodRange(
  period: Period,
  customStart?: Date,
  customEnd?: Date
): PeriodRange {
  const now = new Date();
  const end = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59
  );

  if (period === 'custom' && customStart && customEnd) {
    return { start: customStart, end: customEnd };
  }

  const start = new Date(end);
  if (period === 'week') {
    start.setDate(start.getDate() - 6);
  } else {
    start.setDate(start.getDate() - 29);
  }
  start.setHours(0, 0, 0, 0);

  return { start, end };
}

export function getPreviousPeriodRange(current: PeriodRange): PeriodRange {
  const duration = current.end.getTime() - current.start.getTime();
  const previousEnd = new Date(current.start.getTime() - 1);
  const previousStart = new Date(previousEnd.getTime() - duration);
  return { start: previousStart, end: previousEnd };
}

export interface InsightsSummary {
  revenue: number;
  expenses: number;
  profit: number;
  revenueChange: number;
  expensesChange: number;
  profitChange: number;
}

export interface DailyData {
  date: string;
  income: number;
  expense: number;
}

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  amount: number;
  percentage: number;
}

export interface ProjectionPoint {
  day: number;
  date: string;
  balance: number;
  status: 'healthy' | 'warning' | 'critical';
}

export interface UpcomingExpense {
  id: string;
  name: string;
  amount: number;
  date: Date;
  categoryName?: string;
  categoryColor?: string;
}

export async function getInsightsData(
  userId: string,
  period: Period,
  customStart?: Date,
  customEnd?: Date
) {
  // Get user settings for threshold
  const settings = await db.query.userSettings.findFirst({
    where: eq(userSettings.userId, userId),
  });

  const threshold = settings?.lowBalanceThreshold || 5000;

  // Get period ranges
  const currentRange = getPeriodRange(period, customStart, customEnd);
  const previousRange = getPreviousPeriodRange(currentRange);

  // Get all transactions for the user
  const allTransactions = await db.query.transactions.findMany({
    where: eq(transactions.userId, userId),
    with: { category: true },
  });

  // Calculate current balance
  const totalIncome = allTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = allTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const currentBalance = totalIncome - totalExpenses;

  // Filter transactions by period
  const currentTransactions = allTransactions.filter(
    (t) => t.date >= currentRange.start && t.date <= currentRange.end
  );
  const previousTransactions = allTransactions.filter(
    (t) => t.date >= previousRange.start && t.date <= previousRange.end
  );

  // Calculate summary
  const currentRevenue = currentTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const currentExpenses = currentTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const currentProfit = currentRevenue - currentExpenses;

  const previousRevenue = previousTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const previousExpenses = previousTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const previousProfit = previousRevenue - previousExpenses;

  // Calculate percentage changes
  const revenueChange =
    previousRevenue > 0
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
      : 0;
  const expensesChange =
    previousExpenses > 0
      ? ((currentExpenses - previousExpenses) / previousExpenses) * 100
      : 0;
  const profitChange =
    previousProfit !== 0
      ? ((currentProfit - previousProfit) / Math.abs(previousProfit)) * 100
      : 0;

  // Calculate daily data for chart
  const dailyData = getDailyData(currentTransactions, currentRange);

  // Calculate category breakdown (expenses only)
  const categoryBreakdown = getCategoryBreakdown(currentTransactions);

  // Calculate average daily spend
  const daysInPeriod = Math.ceil(
    (currentRange.end.getTime() - currentRange.start.getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const avgDailySpend = daysInPeriod > 0 ? currentExpenses / daysInPeriod : 0;

  // Get 30-day average for projections
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const last30DaysExpenses = allTransactions
    .filter((t) => t.type === 'expense' && t.date >= thirtyDaysAgo)
    .reduce((sum, t) => sum + t.amount, 0);
  const avgDailyExpense30 = last30DaysExpenses / 30;

  // Generate projection data
  const projectionData = generateProjection(
    currentBalance,
    avgDailyExpense30,
    threshold
  );

  // Get upcoming recurring expenses
  const upcomingExpenses = getUpcomingExpenses(allTransactions);

  return {
    summary: {
      revenue: currentRevenue,
      expenses: currentExpenses,
      profit: currentProfit,
      revenueChange,
      expensesChange,
      profitChange,
    } as InsightsSummary,
    dailyData,
    categoryBreakdown,
    avgDailySpend,
    projectionData,
    upcomingExpenses,
    currentBalance,
    threshold,
  };
}

function getDailyData(
  transactions: { date: Date; type: string; amount: number }[],
  range: PeriodRange
): DailyData[] {
  const dailyMap = new Map<string, { income: number; expense: number }>();

  // Initialize all days in range
  const current = new Date(range.start);
  while (current <= range.end) {
    const dateStr = current.toISOString().split('T')[0];
    dailyMap.set(dateStr, { income: 0, expense: 0 });
    current.setDate(current.getDate() + 1);
  }

  // Aggregate transactions
  for (const t of transactions) {
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

  // Convert to array sorted by date
  return Array.from(dailyMap.entries())
    .map(([date, data]) => ({
      date,
      income: data.income,
      expense: data.expense,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function getCategoryBreakdown(
  transactions: {
    type: string;
    amount: number;
    category?: { id: string; name: string; color: string } | null;
  }[]
): CategoryBreakdown[] {
  const expenses = transactions.filter((t) => t.type === 'expense');
  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);

  if (totalExpenses === 0) return [];

  const categoryMap = new Map<
    string,
    { name: string; color: string; amount: number }
  >();

  for (const t of expenses) {
    const id = t.category?.id || 'uncategorized';
    const name = t.category?.name || 'Uncategorized';
    const color = t.category?.color || '#94A3B8';

    const existing = categoryMap.get(id);
    if (existing) {
      existing.amount += t.amount;
    } else {
      categoryMap.set(id, { name, color, amount: t.amount });
    }
  }

  return Array.from(categoryMap.entries())
    .map(([id, data]) => ({
      categoryId: id,
      categoryName: data.name,
      categoryColor: data.color,
      amount: data.amount,
      percentage: Math.round((data.amount / totalExpenses) * 100),
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5); // Top 5 categories
}

function generateProjection(
  currentBalance: number,
  avgDailyExpense: number,
  threshold: number
): ProjectionPoint[] {
  const points: ProjectionPoint[] = [];
  let balance = currentBalance;

  for (let day = 0; day <= 30; day++) {
    const date = new Date();
    date.setDate(date.getDate() + day);

    let status: 'healthy' | 'warning' | 'critical';
    if (balance <= threshold) {
      status = 'critical';
    } else if (balance <= threshold * 1.5) {
      status = 'warning';
    } else {
      status = 'healthy';
    }

    points.push({
      day,
      date: date.toISOString().split('T')[0],
      balance: Math.max(0, balance),
      status,
    });

    // Subtract average daily expense for next day
    balance -= avgDailyExpense;
  }

  return points;
}

function getUpcomingExpenses(
  transactions: {
    id: string;
    type: string;
    amount: number;
    isRecurring: boolean;
    senderName?: string | null;
    description?: string | null;
    date: Date;
    category?: { name: string; color: string } | null;
  }[]
): UpcomingExpense[] {
  // Get recurring expenses and estimate next occurrence
  const recurringExpenses = transactions
    .filter((t) => t.type === 'expense' && t.isRecurring)
    .map((t) => {
      // Estimate next occurrence (assume monthly)
      const nextDate = new Date(t.date);
      const now = new Date();
      while (nextDate <= now) {
        nextDate.setMonth(nextDate.getMonth() + 1);
      }

      return {
        id: t.id,
        name: t.senderName || t.description || 'Recurring expense',
        amount: t.amount,
        date: nextDate,
        categoryName: t.category?.name,
        categoryColor: t.category?.color,
      };
    })
    .filter((e) => {
      // Only show expenses in the next 30 days
      const thirtyDaysLater = new Date();
      thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
      return e.date <= thirtyDaysLater;
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  return recurringExpenses;
}
