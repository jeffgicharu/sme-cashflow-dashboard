'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import {
  userSettings,
  transactions,
  categories,
  categoryRules,
} from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { seedMockTransactions } from '@/lib/mpesa/mock-data';

interface ActionResult {
  success: boolean;
  error?: string;
}

export async function updateBusinessName(name: string): Promise<ActionResult> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  if (!name.trim()) {
    return { success: false, error: 'Business name cannot be empty' };
  }

  if (name.length > 100) {
    return { success: false, error: 'Business name is too long' };
  }

  try {
    await db
      .update(userSettings)
      .set({ businessName: name.trim(), updatedAt: new Date() })
      .where(eq(userSettings.userId, userId));

    revalidatePath('/settings');
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to update business name' };
  }
}

export async function updateThreshold(
  threshold: number
): Promise<ActionResult> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  if (threshold < 0) {
    return { success: false, error: 'Threshold cannot be negative' };
  }

  if (threshold > 10000000) {
    return { success: false, error: 'Threshold is too high' };
  }

  try {
    await db
      .update(userSettings)
      .set({ lowBalanceThreshold: threshold, updatedAt: new Date() })
      .where(eq(userSettings.userId, userId));

    revalidatePath('/settings');
    revalidatePath('/');
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to update threshold' };
  }
}

export async function updateNotificationSettings(
  pushEnabled: boolean,
  emailEnabled: boolean
): Promise<ActionResult> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await db
      .update(userSettings)
      .set({
        pushNotificationsEnabled: pushEnabled,
        emailAlertsEnabled: emailEnabled,
        updatedAt: new Date(),
      })
      .where(eq(userSettings.userId, userId));

    revalidatePath('/settings');
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to update notification settings' };
  }
}

interface ExportData {
  exportedAt: string;
  businessName: string;
  transactions: Array<{
    id: string;
    type: string;
    amount: number;
    date: string;
    description: string | null;
    senderName: string | null;
    senderPhone: string | null;
    categoryName: string | null;
    isRecurring: boolean;
    isPersonal: boolean;
  }>;
  categories: Array<{
    id: string;
    name: string;
    isIncome: boolean;
    color: string;
    isDefault: boolean;
  }>;
  rules: Array<{
    id: string;
    senderIdentifier: string;
    categoryName: string;
  }>;
  settings: {
    lowBalanceThreshold: number;
    tillNumber: string | null;
    pushNotificationsEnabled: boolean;
    emailAlertsEnabled: boolean;
  };
}

export async function exportAllData(): Promise<{
  success: boolean;
  data?: ExportData;
  error?: string;
}> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Get all user data
    const [userTxns, userCategories, userRules, settings] = await Promise.all([
      db.query.transactions.findMany({
        where: eq(transactions.userId, userId),
        with: { category: true },
        orderBy: (t, { desc }) => [desc(t.date)],
      }),
      db.query.categories.findMany({
        where: eq(categories.userId, userId),
      }),
      db.query.categoryRules.findMany({
        where: eq(categoryRules.userId, userId),
        with: { category: true },
      }),
      db.query.userSettings.findFirst({
        where: eq(userSettings.userId, userId),
      }),
    ]);

    const exportData: ExportData = {
      exportedAt: new Date().toISOString(),
      businessName: settings?.businessName || 'My Business',
      transactions: userTxns.map((t) => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        date: t.date.toISOString(),
        description: t.description,
        senderName: t.senderName,
        senderPhone: t.senderPhone,
        categoryName: t.category?.name || null,
        isRecurring: t.isRecurring,
        isPersonal: t.isPersonal,
      })),
      categories: userCategories.map((c) => ({
        id: c.id,
        name: c.name,
        isIncome: c.isIncome,
        color: c.color,
        isDefault: c.isDefault,
      })),
      rules: userRules.map((r) => ({
        id: r.id,
        senderIdentifier: r.senderIdentifier,
        categoryName: r.category?.name || 'Unknown',
      })),
      settings: {
        lowBalanceThreshold: settings?.lowBalanceThreshold || 5000,
        tillNumber: settings?.tillNumber || null,
        pushNotificationsEnabled: settings?.pushNotificationsEnabled || false,
        emailAlertsEnabled: settings?.emailAlertsEnabled || false,
      },
    };

    return { success: true, data: exportData };
  } catch {
    return { success: false, error: 'Failed to export data' };
  }
}

export async function loadDemoData(): Promise<{
  success: boolean;
  count?: number;
  error?: string;
}> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const result = await seedMockTransactions(userId, 30);

    if (result.success) {
      revalidatePath('/');
      revalidatePath('/transactions');
      revalidatePath('/insights');
      return { success: true, count: result.count };
    }

    return { success: false, error: result.error };
  } catch {
    return { success: false, error: 'Failed to load demo data' };
  }
}

export async function updateTillNumber(
  tillNumber: string
): Promise<ActionResult> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  // Validate Till number format (6-digit number)
  if (tillNumber && !/^\d{6}$/.test(tillNumber)) {
    return { success: false, error: 'Till number must be 6 digits' };
  }

  try {
    await db
      .update(userSettings)
      .set({ tillNumber: tillNumber || null, updatedAt: new Date() })
      .where(eq(userSettings.userId, userId));

    revalidatePath('/settings');
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to update Till number' };
  }
}
