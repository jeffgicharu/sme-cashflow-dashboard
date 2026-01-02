'use client';

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

import { Button } from '@/components/ui/button';
import { EditableField } from './editable-field';
import { NotificationToggle } from './notification-toggle';
import { ExportDataButton } from './export-data-button';
import {
  updateBusinessName,
  updateThreshold,
  updateNotificationSettings,
} from '@/lib/actions/settings';

interface SettingsContentProps {
  settings: {
    businessName: string | null;
    lowBalanceThreshold: number;
    tillNumber: string | null;
    pushNotificationsEnabled: boolean;
    emailAlertsEnabled: boolean;
  };
  userEmail: string;
}

export function SettingsContent({ settings, userEmail }: SettingsContentProps) {
  const handleBusinessNameSave = async (value: string) => {
    return updateBusinessName(value);
  };

  const handleThresholdSave = async (value: string) => {
    const threshold = parseInt(value, 10);
    if (isNaN(threshold)) {
      return { success: false, error: 'Invalid number' };
    }
    return updateThreshold(threshold);
  };

  const handlePushToggle = async (enabled: boolean) => {
    return updateNotificationSettings(enabled, settings.emailAlertsEnabled);
  };

  const handleEmailToggle = async (enabled: boolean) => {
    return updateNotificationSettings(
      settings.pushNotificationsEnabled,
      enabled
    );
  };

  return (
    <div className="space-y-6">
      {/* Business Section */}
      <div>
        <h2 className="mb-2 text-xs font-medium tracking-wide text-slate-500 uppercase">
          BUSINESS
        </h2>
        <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
          <EditableField
            label="Business Name"
            value={settings.businessName || ''}
            onSave={handleBusinessNameSave}
            placeholder="Enter business name"
          />
        </div>
      </div>

      {/* Alerts Section */}
      <div>
        <h2 className="mb-2 text-xs font-medium tracking-wide text-slate-500 uppercase">
          ALERTS
        </h2>
        <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
          <EditableField
            label="Low Balance Threshold"
            value={settings.lowBalanceThreshold.toString()}
            onSave={handleThresholdSave}
            type="number"
            prefix="KES "
            placeholder="5000"
          />
          <NotificationToggle
            label="Push Notifications"
            description="Get notified when balance is low"
            enabled={settings.pushNotificationsEnabled}
            onToggle={handlePushToggle}
            requiresPermission
          />
          <NotificationToggle
            label="Email Alerts"
            description="Receive email alerts for important events"
            enabled={settings.emailAlertsEnabled}
            onToggle={handleEmailToggle}
          />
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
            className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-slate-50"
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
            className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-slate-50"
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
            className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-slate-50"
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
              {settings.tillNumber || 'Not connected'}
            </span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-slate-500">Email</span>
            <span className="text-sm font-medium text-slate-900">
              {userEmail}
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
          <a
            href="mailto:support@example.com"
            className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-slate-50"
          >
            <div className="flex items-center gap-3">
              <HelpCircle className="h-4 w-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-900">
                Help & FAQ
              </span>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </a>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3 pt-4">
        <ExportDataButton />
        <SignOutButton>
          <Button variant="outline" className="w-full">
            <LogOut className="mr-2 h-4 w-4" />
            Log Out
          </Button>
        </SignOutButton>
      </div>
    </div>
  );
}
