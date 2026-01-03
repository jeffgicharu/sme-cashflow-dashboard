import { auth } from '@clerk/nextjs/server';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

import { PageHeader } from '@/components/shared/page-header';
import { SettingsContent } from '@/components/settings';
import { db } from '@/lib/db';
import { userSettings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export default async function SettingsPage() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId) {
    redirect('/sign-in');
  }

  // Get user settings
  const settings = await db.query.userSettings.findFirst({
    where: eq(userSettings.userId, userId),
  });

  const settingsData = {
    businessName: settings?.businessName || null,
    lowBalanceThreshold: settings?.lowBalanceThreshold || 5000,
    tillNumber: settings?.tillNumber || null,
    pushNotificationsEnabled: settings?.pushNotificationsEnabled || false,
    emailAlertsEnabled: settings?.emailAlertsEnabled || false,
  };

  const userEmail = user?.emailAddresses[0]?.emailAddress || 'N/A';

  return (
    <div className="p-4 md:p-0">
      <PageHeader title="Settings" />
      <div className="md:max-w-2xl">
        <SettingsContent settings={settingsData} userEmail={userEmail} />
      </div>
    </div>
  );
}
