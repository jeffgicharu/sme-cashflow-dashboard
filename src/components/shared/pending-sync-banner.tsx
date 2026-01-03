'use client';

import { useOfflineQueue } from '@/hooks/use-offline-queue';
import { Cloud, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PendingSyncBanner() {
  const { isOnline, isSyncing, stats, syncQueue } = useOfflineQueue();

  if (stats.pending === 0) {
    return null;
  }

  return (
    <div className="mx-4 mb-4 flex items-center justify-between rounded-lg bg-amber-50 px-4 py-3 text-sm">
      <div className="flex items-center gap-2">
        <Cloud className="h-4 w-4 text-amber-600" />
        <span className="text-amber-800">
          {stats.pending} transaction{stats.pending !== 1 ? 's' : ''} pending
          sync
        </span>
      </div>
      {isOnline && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => syncQueue()}
          disabled={isSyncing}
          className="h-7 text-amber-700 hover:bg-amber-100 hover:text-amber-800"
        >
          {isSyncing ? (
            <>
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              Syncing...
            </>
          ) : (
            'Sync now'
          )}
        </Button>
      )}
    </div>
  );
}
