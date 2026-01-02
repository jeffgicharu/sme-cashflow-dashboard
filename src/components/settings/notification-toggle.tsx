'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

import { Switch } from '@/components/ui/switch';

interface NotificationToggleProps {
  label: string;
  description?: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => Promise<{ success: boolean; error?: string }>;
  requiresPermission?: boolean;
}

export function NotificationToggle({
  label,
  description,
  enabled,
  onToggle,
  requiresPermission = false,
}: NotificationToggleProps) {
  const [isEnabled, setIsEnabled] = useState(enabled);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      setError('Notifications not supported in this browser');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      setError(
        'Notification permission denied. Please enable in browser settings.'
      );
      return false;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      setError('Notification permission denied');
      return false;
    }

    return true;
  };

  const handleToggle = async (newValue: boolean) => {
    setError(null);
    setIsLoading(true);

    // If enabling and requires permission, request it first
    if (newValue && requiresPermission) {
      const hasPermission = await requestNotificationPermission();
      if (!hasPermission) {
        setIsLoading(false);
        return;
      }
    }

    const result = await onToggle(newValue);

    setIsLoading(false);

    if (result.success) {
      setIsEnabled(newValue);
    } else {
      setError(result.error || 'Failed to update setting');
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-900">{label}</p>
        {description && <p className="text-xs text-slate-500">{description}</p>}
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
      <div className="flex items-center gap-2">
        {isLoading && (
          <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
        )}
        <Switch
          checked={isEnabled}
          onCheckedChange={handleToggle}
          disabled={isLoading}
        />
      </div>
    </div>
  );
}
