'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { categories, categoryRules, transactions } from '@/lib/db/schema';
import { eq, and, or } from 'drizzle-orm';

interface CreateCategoryInput {
  name: string;
  color: string;
  isIncome: boolean;
}

export async function createCategory(input: CreateCategoryInput) {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const [category] = await db
      .insert(categories)
      .values({
        userId,
        name: input.name,
        color: input.color,
        isIncome: input.isIncome,
        isDefault: false,
      })
      .returning();

    revalidatePath('/settings/categories');
    revalidatePath('/transactions');
    revalidatePath('/add');

    return { success: true, category };
  } catch (error) {
    console.error('Failed to create category:', error);
    return { success: false, error: 'Failed to create category' };
  }
}

interface UpdateCategoryInput {
  name?: string;
  color?: string;
}

export async function updateCategory(
  categoryId: string,
  input: UpdateCategoryInput
) {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Check if category belongs to user and is not default
    const existing = await db.query.categories.findFirst({
      where: and(
        eq(categories.id, categoryId),
        eq(categories.userId, userId),
        eq(categories.isDefault, false)
      ),
    });

    if (!existing) {
      return {
        success: false,
        error: 'Category not found or cannot be edited',
      };
    }

    await db.update(categories).set(input).where(eq(categories.id, categoryId));

    revalidatePath('/settings/categories');
    revalidatePath('/transactions');

    return { success: true };
  } catch (error) {
    console.error('Failed to update category:', error);
    return { success: false, error: 'Failed to update category' };
  }
}

export async function deleteCategory(
  categoryId: string,
  reassignToCategoryId?: string
) {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Check if category belongs to user and is not default
    const existing = await db.query.categories.findFirst({
      where: and(
        eq(categories.id, categoryId),
        eq(categories.userId, userId),
        eq(categories.isDefault, false)
      ),
    });

    if (!existing) {
      return {
        success: false,
        error: 'Category not found or cannot be deleted',
      };
    }

    // If reassignment category provided, update transactions
    if (reassignToCategoryId) {
      await db
        .update(transactions)
        .set({ categoryId: reassignToCategoryId })
        .where(
          and(
            eq(transactions.userId, userId),
            eq(transactions.categoryId, categoryId)
          )
        );
    }

    // Delete the category (transactions will have categoryId set to null if not reassigned)
    await db.delete(categories).where(eq(categories.id, categoryId));

    revalidatePath('/settings/categories');
    revalidatePath('/transactions');

    return { success: true };
  } catch (error) {
    console.error('Failed to delete category:', error);
    return { success: false, error: 'Failed to delete category' };
  }
}

export async function getCategoryRules() {
  const { userId } = await auth();
  if (!userId) {
    return [];
  }

  try {
    const rules = await db.query.categoryRules.findMany({
      where: eq(categoryRules.userId, userId),
      with: {
        category: true,
      },
      orderBy: categoryRules.createdAt,
    });

    return rules.map((rule) => ({
      id: rule.id,
      senderIdentifier: rule.senderIdentifier,
      category: {
        id: rule.category.id,
        name: rule.category.name,
        color: rule.category.color,
      },
      createdAt: rule.createdAt,
    }));
  } catch (error) {
    console.error('Failed to get category rules:', error);
    return [];
  }
}

export async function deleteCategoryRule(ruleId: string) {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await db
      .delete(categoryRules)
      .where(
        and(eq(categoryRules.id, ruleId), eq(categoryRules.userId, userId))
      );

    revalidatePath('/settings/rules');

    return { success: true };
  } catch (error) {
    console.error('Failed to delete category rule:', error);
    return { success: false, error: 'Failed to delete rule' };
  }
}

export async function getRecurringTransactions() {
  const { userId } = await auth();
  if (!userId) {
    return { income: [], expenses: [] };
  }

  try {
    // Get transactions marked as recurring
    const recurringTxns = await db.query.transactions.findMany({
      where: and(
        eq(transactions.userId, userId),
        eq(transactions.isRecurring, true)
      ),
      with: {
        category: true,
      },
      orderBy: transactions.date,
    });

    const income = recurringTxns
      .filter((t) => t.type === 'income')
      .map((t) => ({
        id: t.id,
        amount: t.amount,
        senderName: t.senderName,
        description: t.description,
        category: t.category
          ? {
              id: t.category.id,
              name: t.category.name,
              color: t.category.color,
            }
          : null,
        date: t.date,
      }));

    const expenses = recurringTxns
      .filter((t) => t.type === 'expense')
      .map((t) => ({
        id: t.id,
        amount: t.amount,
        senderName: t.senderName,
        description: t.description,
        category: t.category
          ? {
              id: t.category.id,
              name: t.category.name,
              color: t.category.color,
            }
          : null,
        date: t.date,
      }));

    return { income, expenses };
  } catch (error) {
    console.error('Failed to get recurring transactions:', error);
    return { income: [], expenses: [] };
  }
}

export async function removeRecurringMark(transactionId: string) {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await db
      .update(transactions)
      .set({ isRecurring: false })
      .where(
        and(eq(transactions.id, transactionId), eq(transactions.userId, userId))
      );

    revalidatePath('/settings/recurring');

    return { success: true };
  } catch (error) {
    console.error('Failed to remove recurring mark:', error);
    return { success: false, error: 'Failed to update transaction' };
  }
}

export async function getAllCategories() {
  const { userId } = await auth();
  if (!userId) {
    return { defaultCategories: [], customCategories: [] };
  }

  try {
    const allCategories = await db.query.categories.findMany({
      where: or(eq(categories.isDefault, true), eq(categories.userId, userId)),
      orderBy: categories.name,
    });

    const defaultCategories = allCategories
      .filter((c) => c.isDefault)
      .map((c) => ({
        id: c.id,
        name: c.name,
        color: c.color,
        icon: c.icon,
        isIncome: c.isIncome,
      }));

    const customCategories = allCategories
      .filter((c) => !c.isDefault && c.userId === userId)
      .map((c) => ({
        id: c.id,
        name: c.name,
        color: c.color,
        icon: c.icon,
        isIncome: c.isIncome,
      }));

    return { defaultCategories, customCategories };
  } catch (error) {
    console.error('Failed to get categories:', error);
    return { defaultCategories: [], customCategories: [] };
  }
}
