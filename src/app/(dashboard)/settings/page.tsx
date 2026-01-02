import { auth } from '@clerk/nextjs/server';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronRight,
  Folder,
  RefreshCw,
  Tag,
  HelpCircle,
  LogOut,
} from 'lucide-react';
import { SignOutButton } from '@clerk/nextjs';

import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
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

  return (
    <div className="p-4">
      <PageHeader title="Settings" />

      <div className="space-y-6">
        {/* Business Section */}
        <div>
          <h2 className="mb-2 text-xs font-medium tracking-wide text-slate-500 uppercase">
            BUSINESS
          </h2>
          <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-slate-500">Business Name</span>
              <span className="text-sm font-medium text-slate-900">
                {settings?.businessName || 'Not set'}
              </span>
            </div>
          </div>
        </div>

        {/* Alerts Section */}
        <div>
          <h2 className="mb-2 text-xs font-medium tracking-wide text-slate-500 uppercase">
            ALERTS
          </h2>
          <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-slate-500">
                Low Balance Threshold
              </span>
              <span className="text-sm font-medium text-slate-900">
                KES {(settings?.lowBalanceThreshold || 5000).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Data Management Section */}
        <div>
          <h2 className="mb-2 text-xs font-medium tracking-wide text-slate-500 uppercase">
            DATA MANAGEMENT
          </h2>
          <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
            <Link
              href="/settings/categories"
              className="flex items-center justify-between px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <Folder className="h-4 w-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-900">
                  Manage Categories
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </Link>
            <Link
              href="/settings/recurring"
              className="flex items-center justify-between px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <RefreshCw className="h-4 w-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-900">
                  Recurring Transactions
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </Link>
            <Link
              href="/settings/rules"
              className="flex items-center justify-between px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <Tag className="h-4 w-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-900">
                  Category Rules
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </Link>
          </div>
        </div>

        {/* Account Section */}
        <div>
          <h2 className="mb-2 text-xs font-medium tracking-wide text-slate-500 uppercase">
            ACCOUNT
          </h2>
          <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-slate-500">Connected Till</span>
              <span className="text-sm font-medium text-slate-900">
                {settings?.tillNumber || 'Not connected'}
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-slate-500">Email</span>
              <span className="text-sm font-medium text-slate-900">
                {user?.emailAddresses[0]?.emailAddress || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div>
          <h2 className="mb-2 text-xs font-medium tracking-wide text-slate-500 uppercase">
            SUPPORT
          </h2>
          <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
            <button className="flex w-full items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <HelpCircle className="h-4 w-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-900">
                  Help & FAQ
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-4">
          <SignOutButton>
            <Button variant="outline" className="w-full">
              <LogOut className="mr-2 h-4 w-4" />
              Log Out
            </Button>
          </SignOutButton>
        </div>
      </div>
    </div>
  );
}
