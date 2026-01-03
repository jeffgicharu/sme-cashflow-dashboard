'use client';

import { useSyncExternalStore } from 'react';

// Track offline history outside of React state
let wasEverOffline = false;

function getOnlineStatus() {
  const online = typeof navigator !== 'undefined' ? navigator.onLine : true;
  if (!online) {
    wasEverOffline = true;
  }
  return online;
}

function getWasOffline() {
  return wasEverOffline;
}

function subscribe(callback: () => void) {
  const handleOnline = () => {
    if (wasEverOffline) {
      window.dispatchEvent(new CustomEvent('app:back-online'));
    }
    callback();
  };

  const handleOffline = () => {
    wasEverOffline = true;
    callback();
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

// Empty subscribe for wasOffline (static value)
function subscribeNoop() {
  return () => {};
}

export function useOnlineStatus() {
  const isOnline = useSyncExternalStore(
    subscribe,
    getOnlineStatus,
    () => true // Server-side default
  );

  const wasOffline = useSyncExternalStore(
    subscribeNoop,
    getWasOffline,
    () => false // Server-side default
  );

  return { isOnline, wasOffline };
}
