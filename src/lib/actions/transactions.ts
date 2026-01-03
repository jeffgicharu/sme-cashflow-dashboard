'use server';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import {
  transactions,
  categoryRules,
  recurringTransactions,
} from '@/lib/db/schema';
import { eq, and, or } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import {
  addTransactionSchema,
  updateTransactionSchema,
  type AddTransactionInput,
  type UpdateTransactionInput,
} from '@/lib/validations/transaction';

interface ActionResult {
  success: boolean;
  error?: string;
  data?: { id: string };
}

/**
 * Find matching category rule for auto-categorization
 * Checks sender phone or sender name against existing rules
 */
export async function findMatchingCategoryRule(
  userId: string,
  senderPhone?: string | null,
  senderName?: string | null
): Promise<string | null> {
  if (!senderPhone && !senderName) return null;

  try {
    const conditions = [];
    if (senderPhone) {
      conditions.push(eq(categoryRules.senderIdentifier, senderPhone));
    }
    if (senderName) {
      conditions.push(eq(categoryRules.senderIdentifier, senderName));
    }

    const rule = await db.query.categoryRules.findFirst({
      where: and(eq(categoryRules.userId, userId), or(...conditions)),
    });

    return rule?.categoryId || null;
  } catch (error) {
    console.error('Failed to find matching category rule:', error);
    return null;
  }
}

/**
 * Add a transaction from M-Pesa with auto-categorization
 * This is used by the M-Pesa webhook
 */
export async function addMpesaTransaction(input: {
  userId: string;
  amount: number;
  type: 'income' | 'expense';
  senderName?: string;
  senderPhone?: string;
  reference?: string;
  date: Date;
}): Promise<ActionResult> {
  try {
    // Find matching category rule for auto-categorization
    const categoryId = await findMatchingCategoryRule(
      input.userId,
      input.senderPhone,
      input.senderName
    );

    const [newTransaction] = await db
      .insert(transactions)
      .values({
        userId: input.userId,
        amount: input.amount,
        type: input.type,
        source: 'mpesa',
        categoryId,
        senderName: input.senderName || null,
        senderPhone: input.senderPhone || null,
        reference: input.reference || null,
        date: input.date,
        isRecurring: false,
        isPersonal: false,
      })
      .returning({ id: transactions.id });

    revalidatePath('/');
    revalidatePath('/transactions');

    return { success: true, data: { id: newTransaction.id } };
  } catch (error) {
    console.error('Failed to add M-Pesa transaction:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to add transaction',
    };
  }
}

export async function addTransaction(
  input: AddTransactionInput
): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const validated = addTransactionSchema.parse(input);

    const [newTransaction] = await db
      .insert(transactions)
      .values({
        userId,
        amount: validated.amount,
        type: validated.type,
        source: 'manual',
        categoryId: validated.categoryId,
        description: validated.description || null,
        isRecurring: validated.isRecurring,
        date: validated.date,
      })
      .returning({ id: transactions.id });

    // If marked as recurring, create recurring transaction record
    if (validated.isRecurring && validated.frequency) {
      const nextOccurrence = new Date(validated.date);
      if (validated.frequency === 'weekly') {
        nextOccurrence.setDate(nextOccurrence.getDate() + 7);
      } else if (validated.frequency === 'monthly') {
        nextOccurrence.setMonth(nextOccurrence.getMonth() + 1);
      }

      await db.insert(recurringTransactions).values({
        userId,
        transactionId: newTransaction.id,
        frequency: validated.frequency,
        expectedAmount: validated.amount,
        nextOccurrence,
      });
    }

    revalidatePath('/');
    revalidatePath('/transactions');

    return { success: true, data: { id: newTransaction.id } };
  } catch (error) {
    console.error('Failed to add transaction:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to add transaction',
    };
  }
}

export async function updateTransaction(
  transactionId: string,
  input: UpdateTransactionInput
): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const validated = updateTransactionSchema.parse(input);

    // Verify transaction belongs to user
    const existing = await db.query.transactions.findFirst({
      where: and(
        eq(transactions.id, transactionId),
        eq(transactions.userId, userId)
      ),
    });

    if (!existing) {
      return { success: false, error: 'Transaction not found' };
    }

    // Update transaction
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (validated.categoryId !== undefined) {
      updateData.categoryId = validated.categoryId;
    }
    if (validated.isRecurring !== undefined) {
      updateData.isRecurring = validated.isRecurring;
    }
    if (validated.isPersonal !== undefined) {
      updateData.isPersonal = validated.isPersonal;
    }

    await db
      .update(transactions)
      .set(updateData)
      .where(eq(transactions.id, transactionId));

    // Handle recurring status change
    if (validated.isRecurring === true && validated.frequency) {
      // Check if recurring record exists
      const existingRecurring = await db.query.recurringTransactions.findFirst({
        where: eq(recurringTransactions.transactionId, transactionId),
      });

      if (!existingRecurring) {
        const nextOccurrence = new Date(existing.date);
        if (validated.frequency === 'weekly') {
          nextOccurrence.setDate(nextOccurrence.getDate() + 7);
        } else if (validated.frequency === 'monthly') {
          nextOccurrence.setMonth(nextOccurrence.getMonth() + 1);
        }

        await db.insert(recurringTransactions).values({
          userId,
          transactionId,
          frequency: validated.frequency,
          expectedAmount: validated.expectedAmount || existing.amount,
          nextOccurrence,
        });
      } else {
        await db
          .update(recurringTransactions)
          .set({
            frequency: validated.frequency,
            expectedAmount: validated.expectedAmount || existing.amount,
          })
          .where(eq(recurringTransactions.transactionId, transactionId));
      }
    } else if (validated.isRecurring === false) {
      // Remove recurring record if exists
      await db
        .delete(recurringTransactions)
        .where(eq(recurringTransactions.transactionId, transactionId));
    }

    revalidatePath('/');
    revalidatePath('/transactions');
    revalidatePath(`/transactions/${transactionId}`);

    return { success: true };
  } catch (error) {
    console.error('Failed to update transaction:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to update transaction',
    };
  }
}

export async function deleteTransaction(
  transactionId: string
): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify transaction belongs to user and is manual
    const existing = await db.query.transactions.findFirst({
      where: and(
        eq(transactions.id, transactionId),
        eq(transactions.userId, userId)
      ),
    });

    if (!existing) {
      return { success: false, error: 'Transaction not found' };
    }

    if (existing.source !== 'manual') {
      return {
        success: false,
        error: 'Only manual transactions can be deleted',
      };
    }

    await db.delete(transactions).where(eq(transactions.id, transactionId));

    revalidatePath('/');
    revalidatePath('/transactions');

    return { success: true };
  } catch (error) {
    console.error('Failed to delete transaction:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to delete transaction',
    };
  }
}

interface SyncResult {
  success: boolean;
  error?: string;
  syncedIds?: string[];
}

interface OfflineTransactionInput {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  categoryId: string | null;
  date: string;
}

export async function syncOfflineTransactions(
  offlineTransactions: OfflineTransactionInput[]
): Promise<SyncResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const syncedIds: string[] = [];

    for (const offlineTx of offlineTransactions) {
      try {
        await db.insert(transactions).values({
          userId,
          amount: offlineTx.amount,
          type: offlineTx.type,
          source: 'manual',
          categoryId: offlineTx.categoryId,
          description: offlineTx.description || null,
          date: new Date(offlineTx.date),
          isRecurring: false,
        });

        syncedIds.push(offlineTx.id);
      } catch (txError) {
        console.error(
          `Failed to sync offline transaction ${offlineTx.id}:`,
          txError
        );
        // Continue with other transactions
      }
    }

    if (syncedIds.length > 0) {
      revalidatePath('/');
      revalidatePath('/transactions');
    }

    return { success: true, syncedIds };
  } catch (error) {
    console.error('Failed to sync offline transactions:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to sync offline transactions',
    };
  }
}

export async function createCategoryRule(
  senderIdentifier: string,
  categoryId: string
): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Check if rule already exists
    const existing = await db.query.categoryRules.findFirst({
      where: and(
        eq(categoryRules.userId, userId),
        eq(categoryRules.senderIdentifier, senderIdentifier)
      ),
    });

    if (existing) {
      // Update existing rule
      await db
        .update(categoryRules)
        .set({ categoryId })
        .where(eq(categoryRules.id, existing.id));
    } else {
      // Create new rule
      await db.insert(categoryRules).values({
        userId,
        senderIdentifier,
        categoryId,
      });
    }

    // Apply rule to existing transactions from this sender
    await db
      .update(transactions)
      .set({ categoryId, updatedAt: new Date() })
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.senderPhone, senderIdentifier)
        )
      );

    revalidatePath('/');
    revalidatePath('/transactions');

    return { success: true };
  } catch (error) {
    console.error('Failed to create category rule:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to create category rule',
    };
  }
}
