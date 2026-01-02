'use server';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users, userSettings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

interface CompleteOnboardingInput {
  businessName: string;
  tillNumber?: string;
  lowBalanceThreshold?: number;
}

interface OnboardingResult {
  success: boolean;
  error?: string;
}

export async function completeOnboarding(
  input: CompleteOnboardingInput
): Promise<OnboardingResult> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Ensure user exists in our database
    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!existingUser) {
      // User should be created by Clerk webhook, but create a placeholder if not
      await db.insert(users).values({
        id: userId,
        email: 'pending@update.com', // Will be updated by webhook
      });
    }

    // Check if settings already exist
    const existingSettings = await db.query.userSettings.findFirst({
      where: eq(userSettings.userId, userId),
    });

    if (existingSettings) {
      // Update existing settings
      await db
        .update(userSettings)
        .set({
          businessName: input.businessName,
          tillNumber: input.tillNumber || null,
          lowBalanceThreshold: input.lowBalanceThreshold || 5000,
          onboardingCompleted: true,
          updatedAt: new Date(),
        })
        .where(eq(userSettings.userId, userId));
    } else {
      // Create new settings
      await db.insert(userSettings).values({
        userId,
        businessName: input.businessName,
        tillNumber: input.tillNumber || null,
        lowBalanceThreshold: input.lowBalanceThreshold || 5000,
        onboardingCompleted: true,
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to complete onboarding:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
