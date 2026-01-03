'use client';

import { useOnlineStatus } from '@/hooks/use-online-status';
import { WifiOff, Wifi } from 'lucide-react';
import { useSyncExternalStore, useEffect, useCallback } from 'react';

// Track reconnection display state outside React
let showingReconnected = false;
const reconnectedSubscribers = new Set<() => void>();

function getShowReconnected() {
  return showingReconnected;
}

function subscribeReconnected(callback: () => void) {
  reconnectedSubscribers.add(callback);
  return () => {
    reconnectedSubscribers.delete(callback);
  };
}

function notifyReconnectedChange() {
  reconnectedSubscribers.forEach((cb) => cb());
}

export function OfflineIndicator() {
  const { isOnline, wasOffline } = useOnlineStatus();

  const showReconnected = useSyncExternalStore(
    subscribeReconnected,
    getShowReconnected,
    () => false
  );

  // Handle the reconnection display timing
  const handleBackOnline = useCallback(() => {
    showingReconnected = true;
    notifyReconnectedChange();

    setTimeout(() => {
      showingReconnected = false;
      notifyReconnectedChange();
    }, 3000);
  }, []);

  // Listen for back-online events
  useEffect(() => {
    window.addEventListener('app:back-online', handleBackOnline);
    return () => {
      window.removeEventListener('app:back-online', handleBackOnline);
    };
  }, [handleBackOnline]);

  // Don't show anything when online and not recently reconnected
  if (isOnline && !wasOffline && !showReconnected) {
    return null;
  }

  // Show reconnected message briefly
  if (isOnline && (wasOffline || showReconnected)) {
    return (
      <div
        className="fixed bottom-20 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-green-500 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all duration-300"
        role="status"
        aria-live="polite"
      >
        <Wifi className="h-4 w-4" />
        <span>Back online</span>
      </div>
    );
  }

  // Show offline indicator
  if (!isOnline) {
    return (
      <div
        className="fixed bottom-20 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all duration-300"
        role="status"
        aria-live="polite"
      >
        <WifiOff className="h-4 w-4" />
        <span>You&apos;re offline</span>
      </div>
    );
  }

  return null;
}
