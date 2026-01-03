import { db } from '@/lib/db';
import { transactions, categories } from '@/lib/db/schema';
import { eq, and, gte, lte, isNull, desc, or, ilike, sql } from 'drizzle-orm';
import type { TransactionFilter, DateRange } from '@/lib/utils/transactions';

// Re-export types for backwards compatibility
export type { TransactionFilter, DateRange } from '@/lib/utils/transactions';

interface GetTransactionsOptions {
  userId: string;
  filter?: TransactionFilter;
  dateRange?: DateRange;
  search?: string;
  limit?: number;
  offset?: number;
}

export async function getTransactions({
  userId,
  filter = 'all',
  dateRange = 'all',
  search,
  limit = 20,
  offset = 0,
}: GetTransactionsOptions) {
  const conditions = [eq(transactions.userId, userId)];

  // Apply type filter
  if (filter === 'income') {
    conditions.push(eq(transactions.type, 'income'));
  } else if (filter === 'expense') {
    conditions.push(eq(transactions.type, 'expense'));
  } else if (filter === 'uncategorized') {
    conditions.push(isNull(transactions.categoryId));
  }

  // Apply date range filter
  const now = new Date();
  if (dateRange === 'today') {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    conditions.push(gte(transactions.date, today));
    conditions.push(lte(transactions.date, tomorrow));
  } else if (dateRange === 'week') {
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    conditions.push(gte(transactions.date, weekAgo));
  } else if (dateRange === 'month') {
    const monthAgo = new Date(now);
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    conditions.push(gte(transactions.date, monthAgo));
  }

  // Apply search filter
  if (search && search.trim()) {
    const searchTerm = `%${search.trim()}%`;
    conditions.push(
      or(
        ilike(transactions.senderName, searchTerm),
        ilike(transactions.description, searchTerm),
        ilike(transactions.reference, searchTerm)
      ) ?? sql`true`
    );
  }

  const results = await db.query.transactions.findMany({
    where: and(...conditions),
    with: {
      category: true,
    },
    orderBy: desc(transactions.date),
    limit,
    offset,
  });

  // Get total count for pagination
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(transactions)
    .where(and(...conditions));

  const total = Number(countResult[0]?.count || 0);

  return {
    transactions: results.map((t) => ({
      id: t.id,
      amount: t.amount,
      type: t.type,
      source: t.source,
      senderName: t.senderName,
      senderPhone: t.senderPhone,
      description: t.description,
      reference: t.reference,
      isRecurring: t.isRecurring,
      isPersonal: t.isPersonal,
      date: t.date,
      category: t.category
        ? {
            id: t.category.id,
            name: t.category.name,
            color: t.category.color,
            icon: t.category.icon,
          }
        : null,
    })),
    total,
    hasMore: offset + results.length < total,
  };
}

export async function getTransactionById(
  userId: string,
  transactionId: string
) {
  const result = await db.query.transactions.findFirst({
    where: and(
      eq(transactions.id, transactionId),
      eq(transactions.userId, userId)
    ),
    with: {
      category: true,
    },
  });

  if (!result) return null;

  return {
    id: result.id,
    amount: result.amount,
    type: result.type,
    source: result.source,
    senderName: result.senderName,
    senderPhone: result.senderPhone,
    description: result.description,
    reference: result.reference,
    isRecurring: result.isRecurring,
    isPersonal: result.isPersonal,
    date: result.date,
    createdAt: result.createdAt,
    category: result.category
      ? {
          id: result.category.id,
          name: result.category.name,
          color: result.category.color,
          icon: result.category.icon,
        }
      : null,
  };
}

export async function getCategories(userId: string) {
  // Get default categories and user's custom categories
  const results = await db.query.categories.findMany({
    where: or(eq(categories.isDefault, true), eq(categories.userId, userId)),
    orderBy: [desc(categories.isDefault), categories.name],
  });

  return results.map((c) => ({
    id: c.id,
    name: c.name,
    color: c.color,
    icon: c.icon,
    isDefault: c.isDefault,
    isIncome: c.isIncome,
  }));
}

// Re-export client-safe utilities for backwards compatibility
export {
  groupTransactionsByDate,
  formatDateHeader,
} from '@/lib/utils/transactions';
