import { describe, it, expect } from 'vitest';
import { calculateProjection, type TransactionData } from './projection';

describe('calculateProjection', () => {
  const referenceDate = new Date('2025-01-15');

  function createExpense(amount: number, daysAgo: number): TransactionData {
    const date = new Date(referenceDate);
    date.setDate(date.getDate() - daysAgo);
    return { type: 'expense', amount, date };
  }

  function createIncome(amount: number, daysAgo: number): TransactionData {
    const date = new Date(referenceDate);
    date.setDate(date.getDate() - daysAgo);
    return { type: 'income', amount, date };
  }

  describe('critical status', () => {
    it('returns critical when balance is below threshold', () => {
      const result = calculateProjection(5000, 10000, [], referenceDate);
      expect(result.status).toBe('critical');
      expect(result.daysUntilThreshold).toBe(0);
    });

    it('returns critical when balance equals threshold', () => {
      const result = calculateProjection(10000, 10000, [], referenceDate);
      expect(result.status).toBe('critical');
      expect(result.daysUntilThreshold).toBe(0);
    });

    it('returns critical when will reach threshold in 7 days or less', () => {
      // Balance: 17000, Threshold: 10000, Daily spend: 1000
      // Days until threshold: (17000 - 10000) / 1000 = 7 days
      const expenses = Array.from({ length: 7 }, (_, i) =>
        createExpense(1000, i + 1)
      );
      const result = calculateProjection(17000, 10000, expenses, referenceDate);
      expect(result.status).toBe('critical');
      expect(result.daysUntilThreshold).toBe(7);
    });
  });

  describe('warning status', () => {
    it('returns warning when will reach threshold in 8-14 days', () => {
      // Balance: 20000, Threshold: 10000, Daily spend: 1000
      // Days until threshold: (20000 - 10000) / 1000 = 10 days
      const expenses = Array.from({ length: 10 }, (_, i) =>
        createExpense(1000, i + 1)
      );
      const result = calculateProjection(20000, 10000, expenses, referenceDate);
      expect(result.status).toBe('warning');
      expect(result.daysUntilThreshold).toBe(10);
    });

    it('returns warning at exactly 14 days', () => {
      // Balance: 24000, Threshold: 10000, Daily spend: 1000
      // Days until threshold: (24000 - 10000) / 1000 = 14 days
      const expenses = Array.from({ length: 14 }, (_, i) =>
        createExpense(1000, i + 1)
      );
      const result = calculateProjection(24000, 10000, expenses, referenceDate);
      expect(result.status).toBe('warning');
      expect(result.daysUntilThreshold).toBe(14);
    });
  });

  describe('healthy status', () => {
    it('returns healthy when will reach threshold in more than 14 days', () => {
      // Balance: 30000, Threshold: 10000, Daily spend: 1000
      // Days until threshold: (30000 - 10000) / 1000 = 20 days
      const expenses = Array.from({ length: 20 }, (_, i) =>
        createExpense(1000, i + 1)
      );
      const result = calculateProjection(30000, 10000, expenses, referenceDate);
      expect(result.status).toBe('healthy');
      expect(result.daysUntilThreshold).toBe(20);
    });

    it('returns healthy with no spending history', () => {
      const result = calculateProjection(50000, 10000, [], referenceDate);
      expect(result.status).toBe('healthy');
      expect(result.daysUntilThreshold).toBe(999);
    });

    it('returns healthy when only income transactions exist', () => {
      const incomes = [
        createIncome(5000, 1),
        createIncome(3000, 5),
        createIncome(2000, 10),
      ];
      const result = calculateProjection(50000, 10000, incomes, referenceDate);
      expect(result.status).toBe('healthy');
      expect(result.daysUntilThreshold).toBe(999);
    });
  });

  describe('threshold date calculation', () => {
    it('calculates correct threshold date', () => {
      const expenses = Array.from({ length: 10 }, (_, i) =>
        createExpense(1000, i + 1)
      );
      const result = calculateProjection(20000, 10000, expenses, referenceDate);

      expect(result.thresholdDate).toBeDefined();
      const expectedDate = new Date(referenceDate);
      expectedDate.setDate(expectedDate.getDate() + 10);
      expect(result.thresholdDate?.toDateString()).toBe(
        expectedDate.toDateString()
      );
    });

    it('does not set threshold date when already critical', () => {
      const result = calculateProjection(5000, 10000, [], referenceDate);
      expect(result.thresholdDate).toBeUndefined();
    });
  });

  describe('average daily expense calculation', () => {
    it('ignores expenses older than 30 days', () => {
      const oldExpenses = [createExpense(10000, 35)];
      const recentExpenses = [createExpense(1000, 5)];

      const result = calculateProjection(
        50000,
        10000,
        [...oldExpenses, ...recentExpenses],
        referenceDate
      );

      // Should only count recent expense
      expect(result.status).toBe('healthy');
    });

    it('handles mixed transactions correctly', () => {
      const transactions = [
        createExpense(1000, 1),
        createIncome(5000, 2),
        createExpense(1000, 3),
        createIncome(3000, 4),
        createExpense(1000, 5),
      ];

      const result = calculateProjection(
        20000,
        10000,
        transactions,
        referenceDate
      );

      // Only expenses should be counted for daily average
      // 3000 in expenses over 5 days = 600/day
      // (20000 - 10000) / 600 = 16.66 -> 16 days = healthy
      expect(result.status).toBe('healthy');
    });
  });

  describe('edge cases', () => {
    it('handles zero threshold', () => {
      // Balance: 10000, Threshold: 0, Daily spend: 1000
      // Days until threshold: 10000 / 1000 = 10 days = warning
      const expenses = [createExpense(1000, 1)];
      const result = calculateProjection(10000, 0, expenses, referenceDate);
      expect(result.status).toBe('warning');
      expect(result.daysUntilThreshold).toBe(10);
    });

    it('handles very large numbers', () => {
      const result = calculateProjection(
        1000000000,
        100000000,
        [createExpense(1000000, 1)],
        referenceDate
      );
      expect(result.status).toBe('healthy');
    });

    it('handles very small daily expenses', () => {
      const expenses = [createExpense(1, 1)];
      const result = calculateProjection(10000, 5000, expenses, referenceDate);
      expect(result.status).toBe('healthy');
    });
  });
});
