export interface ProjectionResult {
  status: 'healthy' | 'warning' | 'critical';
  daysUntilThreshold: number;
  thresholdDate?: Date;
}

export interface TransactionData {
  type: string;
  amount: number;
  date: Date;
}

export function calculateProjection(
  currentBalance: number,
  threshold: number,
  allTransactions: TransactionData[],
  referenceDate: Date = new Date()
): ProjectionResult {
  // If already below threshold
  if (currentBalance <= threshold) {
    return {
      status: 'critical',
      daysUntilThreshold: 0,
    };
  }

  // Calculate average daily spend over the last 30 days
  const thirtyDaysAgo = new Date(referenceDate);
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
        (referenceDate.getTime() - firstTransaction.getTime()) /
          (1000 * 60 * 60 * 24)
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
  const thresholdDate = new Date(referenceDate);
  thresholdDate.setDate(thresholdDate.getDate() + daysUntilThreshold);

  return {
    status,
    daysUntilThreshold,
    thresholdDate,
  };
}
