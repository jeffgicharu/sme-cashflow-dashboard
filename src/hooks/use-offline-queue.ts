'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getUnsynced,
  getQueueStats,
  addToQueue,
  markAsSynced,
  removeFromQueue,
  clearSynced,
  type OfflineTransaction,
} from '@/lib/offline/queue';
import { useOnlineStatus } from './use-online-status';
import { syncOfflineTransactions } from '@/lib/actions/transactions';
import { toast } from 'sonner';

export function useOfflineQueue() {
  const { isOnline } = useOnlineStatus();
  const [isSyncing, setIsSyncing] = useState(false);
  const [stats, setStats] = useState({ pending: 0, synced: 0, total: 0 });

  const refreshStats = useCallback(() => {
    setStats(getQueueStats());
  }, []);

  const addTransaction = useCallback(
    (transaction: Omit<OfflineTransaction, 'id' | 'createdAt' | 'synced'>) => {
      const added = addToQueue(transaction);
      refreshStats();
      return added;
    },
    [refreshStats]
  );

  const syncQueue = useCallback(async () => {
    if (!isOnline || isSyncing) return;

    const unsynced = getUnsynced();
    if (unsynced.length === 0) return;

    setIsSyncing(true);

    try {
      const result = await syncOfflineTransactions(unsynced);

      if (result.success && result.syncedIds) {
        markAsSynced(result.syncedIds);
        clearSynced();
        refreshStats();

        toast.success(
          `Synced ${result.syncedIds.length} offline transaction(s)`
        );
      } else if (result.error) {
        toast.error(`Sync failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Failed to sync offline transactions:', error);
      toast.error('Failed to sync offline transactions');
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, refreshStats]);

  const removePending = useCallback(
    (ids: string[]) => {
      removeFromQueue(ids);
      refreshStats();
    },
    [refreshStats]
  );

  // Refresh stats on mount and when online status changes
  useEffect(() => {
    refreshStats();
  }, [refreshStats, isOnline]);

  // Auto-sync when coming back online
  useEffect(() => {
    const handleBackOnline = () => {
      // Small delay to ensure network is stable
      setTimeout(() => {
        syncQueue();
      }, 1000);
    };

    window.addEventListener('app:back-online', handleBackOnline);
    return () =>
      window.removeEventListener('app:back-online', handleBackOnline);
  }, [syncQueue]);

  return {
    isOnline,
    isSyncing,
    stats,
    addTransaction,
    syncQueue,
    removePending,
    getUnsynced,
    refreshStats,
  };
}
