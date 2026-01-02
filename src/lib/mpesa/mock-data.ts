/**
 * Mock M-Pesa transaction generator
 *
 * This module generates realistic mock transactions for demo purposes.
 * It simulates common transaction patterns for a small online business.
 */

import { db } from '@/lib/db';
import { transactions, categories } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { findMatchingCategoryRule } from '@/lib/actions/transactions';

// Sample customer names (common Kenyan names)
const CUSTOMER_NAMES = [
  'Jane Wanjiku',
  'Mary Kemunto',
  'Peter Ochieng',
  'Grace Muthoni',
  'John Kamau',
  'Alice Nyambura',
  'David Kiprop',
  'Sarah Njeri',
  'Michael Otieno',
  'Faith Akinyi',
  'James Kibet',
  'Ann Wairimu',
  'Joseph Mwangi',
  'Rose Chebet',
  'Paul Onyango',
];

// Sample phone numbers (format: 07XX XXX XXX)
const generatePhone = () => {
  const prefixes = ['0712', '0722', '0733', '0700', '0711', '0723', '0734'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, '0');
  return `${prefix}${suffix}`;
};

// Sample expense descriptions
const EXPENSE_DESCRIPTIONS = [
  { name: 'Supplier Payment', category: 'Inventory/Stock' },
  { name: 'Boda Rider', category: 'Transport' },
  { name: 'Internet Bill', category: 'Utilities' },
  { name: 'Rent Payment', category: 'Rent' },
  { name: 'Airtime Purchase', category: 'Airtime' },
  { name: 'Packaging Materials', category: 'Operating Expenses' },
  { name: 'Marketing Ads', category: 'Marketing' },
  { name: 'Personal Withdrawal', category: 'Personal' },
];

interface MockTransaction {
  type: 'income' | 'expense';
  amount: number;
  senderName: string | null;
  senderPhone: string | null;
  description: string | null;
  date: Date;
  categoryName?: string;
}

/**
 * Generate a random income amount (typical for online sales)
 * Range: 500 - 15000 KES
 */
function generateIncomeAmount(): number {
  const ranges = [
    { min: 500, max: 2000, weight: 30 },
    { min: 2000, max: 5000, weight: 40 },
    { min: 5000, max: 10000, weight: 20 },
    { min: 10000, max: 15000, weight: 10 },
  ];

  const rand = Math.random() * 100;
  let cumulative = 0;

  for (const range of ranges) {
    cumulative += range.weight;
    if (rand <= cumulative) {
      return Math.floor(Math.random() * (range.max - range.min) + range.min);
    }
  }

  return 2500;
}

/**
 * Generate a random expense amount
 * Range: 100 - 20000 KES
 */
function generateExpenseAmount(category: string): number {
  const categoryRanges: Record<string, { min: number; max: number }> = {
    'Inventory/Stock': { min: 5000, max: 20000 },
    Transport: { min: 100, max: 1000 },
    Utilities: { min: 1000, max: 5000 },
    Rent: { min: 10000, max: 25000 },
    Airtime: { min: 100, max: 1000 },
    'Operating Expenses': { min: 500, max: 3000 },
    Marketing: { min: 1000, max: 10000 },
    Personal: { min: 1000, max: 10000 },
  };

  const range = categoryRanges[category] || { min: 500, max: 5000 };
  return Math.floor(Math.random() * (range.max - range.min) + range.min);
}

/**
 * Generate mock transactions for a given number of days
 */
function generateMockTransactions(days: number): MockTransaction[] {
  const transactions: MockTransaction[] = [];
  const now = new Date();

  for (let d = 0; d < days; d++) {
    const date = new Date(now);
    date.setDate(date.getDate() - d);

    // Generate 5-15 income transactions per day (online sales)
    const incomeCount = Math.floor(Math.random() * 11) + 5;
    for (let i = 0; i < incomeCount; i++) {
      const hour = Math.floor(Math.random() * 14) + 8; // 8 AM to 10 PM
      const minute = Math.floor(Math.random() * 60);
      date.setHours(hour, minute, 0, 0);

      transactions.push({
        type: 'income',
        amount: generateIncomeAmount(),
        senderName:
          CUSTOMER_NAMES[Math.floor(Math.random() * CUSTOMER_NAMES.length)],
        senderPhone: generatePhone(),
        description: null,
        date: new Date(date),
        categoryName: 'Sales Revenue',
      });
    }

    // Generate 1-4 expense transactions per day
    const expenseCount = Math.floor(Math.random() * 4) + 1;
    for (let i = 0; i < expenseCount; i++) {
      const expense =
        EXPENSE_DESCRIPTIONS[
          Math.floor(Math.random() * EXPENSE_DESCRIPTIONS.length)
        ];
      const hour = Math.floor(Math.random() * 14) + 8;
      const minute = Math.floor(Math.random() * 60);
      date.setHours(hour, minute, 0, 0);

      transactions.push({
        type: 'expense',
        amount: generateExpenseAmount(expense.category),
        senderName: expense.name,
        senderPhone: null,
        description: expense.name,
        date: new Date(date),
        categoryName: expense.category,
      });
    }
  }

  return transactions;
}

/**
 * Seed the database with mock transactions for a user
 */
export async function seedMockTransactions(
  userId: string,
  days: number = 30
): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const mockTxns = generateMockTransactions(days);

    // Get all categories for the user
    const userCategories = await db.query.categories.findMany({
      where: eq(categories.userId, userId),
    });

    // Also get default categories
    const defaultCategories = await db.query.categories.findMany({
      where: eq(categories.isDefault, true),
    });

    const allCategories = [...userCategories, ...defaultCategories];

    // Create category lookup
    const categoryLookup = new Map(allCategories.map((c) => [c.name, c.id]));

    // Insert transactions in batches
    const batchSize = 50;
    let inserted = 0;

    for (let i = 0; i < mockTxns.length; i += batchSize) {
      const batch = mockTxns.slice(i, i + batchSize);

      const values = await Promise.all(
        batch.map(async (txn) => {
          // Try to find category by name, or by rule
          let categoryId = txn.categoryName
            ? categoryLookup.get(txn.categoryName)
            : null;

          if (!categoryId) {
            categoryId = await findMatchingCategoryRule(
              userId,
              txn.senderPhone,
              txn.senderName
            );
          }

          return {
            userId,
            amount: txn.amount,
            type: txn.type as 'income' | 'expense',
            source: 'mpesa' as const,
            categoryId: categoryId || null,
            senderName: txn.senderName,
            senderPhone: txn.senderPhone,
            description: txn.description,
            date: txn.date,
            isRecurring: false,
            isPersonal: false,
          };
        })
      );

      await db.insert(transactions).values(values);
      inserted += batch.length;
    }

    return { success: true, count: inserted };
  } catch (error) {
    console.error('Error seeding mock transactions:', error);
    return {
      success: false,
      count: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Generate a single mock transaction (for real-time demo)
 */
export async function generateSingleMockTransaction(
  userId: string
): Promise<{
  success: boolean;
  transaction?: MockTransaction;
  error?: string;
}> {
  try {
    const isIncome = Math.random() > 0.3; // 70% chance of income
    const now = new Date();

    let txn: MockTransaction;

    if (isIncome) {
      txn = {
        type: 'income',
        amount: generateIncomeAmount(),
        senderName:
          CUSTOMER_NAMES[Math.floor(Math.random() * CUSTOMER_NAMES.length)],
        senderPhone: generatePhone(),
        description: null,
        date: now,
        categoryName: 'Sales Revenue',
      };
    } else {
      const expense =
        EXPENSE_DESCRIPTIONS[
          Math.floor(Math.random() * EXPENSE_DESCRIPTIONS.length)
        ];
      txn = {
        type: 'expense',
        amount: generateExpenseAmount(expense.category),
        senderName: expense.name,
        senderPhone: null,
        description: expense.name,
        date: now,
        categoryName: expense.category,
      };
    }

    // Get category ID
    const userCategories = await db.query.categories.findMany({
      where: eq(categories.userId, userId),
    });
    const defaultCategories = await db.query.categories.findMany({
      where: eq(categories.isDefault, true),
    });

    const allCategories = [...userCategories, ...defaultCategories];
    const categoryLookup = new Map(allCategories.map((c) => [c.name, c.id]));

    let categoryId = txn.categoryName
      ? categoryLookup.get(txn.categoryName)
      : null;
    if (!categoryId) {
      categoryId = await findMatchingCategoryRule(
        userId,
        txn.senderPhone,
        txn.senderName
      );
    }

    // Insert the transaction
    await db.insert(transactions).values({
      userId,
      amount: txn.amount,
      type: txn.type,
      source: 'mpesa',
      categoryId: categoryId || null,
      senderName: txn.senderName,
      senderPhone: txn.senderPhone,
      description: txn.description,
      date: txn.date,
      isRecurring: false,
      isPersonal: false,
    });

    return { success: true, transaction: txn };
  } catch (error) {
    console.error('Error generating mock transaction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
