import { db } from '@/lib/db';
import { transactions, userSettings } from '@/lib/db/schema';
import { eq, and, gte, lte, isNull, desc, sql } from 'drizzle-orm';

export async function getDashboardData(userId: string) {
  // Get user settings
  const settings = await db.query.userSettings.findFirst({
    where: eq(userSettings.userId, userId),
  });

  if (!settings) {
    return null;
  }

  // Get today's start and end
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Get today's transactions for summary
  const todayTransactions = await db.query.transactions.findMany({
    where: and(
      eq(transactions.userId, userId),
      gte(transactions.date, today),
      lte(transactions.date, tomorrow)
    ),
  });

  // Calculate today's income and expenses
  const todayIncome = todayTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const todayExpenses = todayTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Get all transactions to calculate current balance
  const allTransactions = await db.query.transactions.findMany({
    where: eq(transactions.userId, userId),
  });

  const totalIncome = allTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = allTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const currentBalance = totalIncome - totalExpenses;

  // Get uncategorized count
  const uncategorizedCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(transactions)
    .where(
      and(eq(transactions.userId, userId), isNull(transactions.categoryId))
    );

  // Get recent transactions with category
  const recentTransactions = await db.query.transactions.findMany({
    where: eq(transactions.userId, userId),
    with: {
      category: true,
    },
    orderBy: desc(transactions.date),
    limit: 5,
  });

  // Calculate projection status
  const projectionData = calculateProjection(
    currentBalance,
    settings.lowBalanceThreshold,
    allTransactions
  );

  return {
    settings,
    balance: {
      current: currentBalance,
      todayChange: todayIncome - todayExpenses,
    },
    today: {
      income: todayIncome,
      expenses: todayExpenses,
    },
    uncategorizedCount: Number(uncategorizedCount[0]?.count || 0),
    recentTransactions: recentTransactions.map((t) => ({
      id: t.id,
      amount: t.amount,
      type: t.type,
      source: t.source,
      senderName: t.senderName,
      description: t.description,
      date: t.date,
      category: t.category
        ? {
            name: t.category.name,
            color: t.category.color,
          }
        : null,
    })),
    projection: projectionData,
  };
}

interface ProjectionResult {
  status: 'healthy' | 'warning' | 'critical';
  daysUntilThreshold: number;
  thresholdDate?: Date;
}

function calculateProjection(
  currentBalance: number,
  threshold: number,
  allTransactions: { type: string; amount: number; date: Date }[]
): ProjectionResult {
  // If already below threshold
  if (currentBalance <= threshold) {
    return {
      status: 'critical',
      daysUntilThreshold: 0,
    };
  }

  // Calculate average daily spend over the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentExpenses = allTransactions.filter(
    (t) => t.type === 'expense' && new Date(t.date) >= thirtyDaysAgo
  );

  const totalRecentExpenses = recentExpenses.reduce(
    (sum, t) => sum + t.amount,
    0
  );

  // Calculate days of data we have
  const firstTransaction =
    allTransactions.length > 0
      ? new Date(
          Math.min(...allTransactions.map((t) => new Date(t.date).getTime()))
        )
      : new Date();
  const daysSinceFirst = Math.max(
    1,
    Math.min(
      30,
      Math.ceil(
        (Date.now() - firstTransaction.getTime()) / (1000 * 60 * 60 * 24)
      )
    )
  );

  const avgDailyExpense = totalRecentExpenses / daysSinceFirst;

  // If no spending history, assume healthy
  if (avgDailyExpense === 0) {
    return {
      status: 'healthy',
      daysUntilThreshold: 999,
    };
  }

  // Calculate days until threshold
  const amountAboveThreshold = currentBalance - threshold;
  const daysUntilThreshold = Math.floor(amountAboveThreshold / avgDailyExpense);

  // Determine status
  let status: 'healthy' | 'warning' | 'critical';
  if (daysUntilThreshold > 14) {
    status = 'healthy';
  } else if (daysUntilThreshold > 7) {
    status = 'warning';
  } else {
    status = 'critical';
  }

  // Calculate threshold date
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() + daysUntilThreshold);

  return {
    status,
    daysUntilThreshold,
    thresholdDate,
  };
}
