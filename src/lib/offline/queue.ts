const QUEUE_KEY = 'offline-transaction-queue';

export interface OfflineTransaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  categoryId: string | null;
  date: string;
  createdAt: string;
  synced: boolean;
}

export interface OfflineQueue {
  transactions: OfflineTransaction[];
  lastSyncAttempt: string | null;
}

function getQueue(): OfflineQueue {
  if (typeof window === 'undefined') {
    return { transactions: [], lastSyncAttempt: null };
  }

  try {
    const stored = localStorage.getItem(QUEUE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    console.error('Failed to parse offline queue');
  }

  return { transactions: [], lastSyncAttempt: null };
}

function saveQueue(queue: OfflineQueue): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    console.error('Failed to save offline queue');
  }
}

export function addToQueue(
  transaction: Omit<OfflineTransaction, 'id' | 'createdAt' | 'synced'>
): OfflineTransaction {
  const queue = getQueue();

  const newTransaction: OfflineTransaction = {
    ...transaction,
    id: `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    synced: false,
  };

  queue.transactions.push(newTransaction);
  saveQueue(queue);

  return newTransaction;
}

export function getUnsynced(): OfflineTransaction[] {
  const queue = getQueue();
  return queue.transactions.filter((t) => !t.synced);
}

export function markAsSynced(ids: string[]): void {
  const queue = getQueue();
  queue.transactions = queue.transactions.map((t) =>
    ids.includes(t.id) ? { ...t, synced: true } : t
  );
  queue.lastSyncAttempt = new Date().toISOString();
  saveQueue(queue);
}

export function removeFromQueue(ids: string[]): void {
  const queue = getQueue();
  queue.transactions = queue.transactions.filter((t) => !ids.includes(t.id));
  saveQueue(queue);
}

export function clearSynced(): void {
  const queue = getQueue();
  queue.transactions = queue.transactions.filter((t) => !t.synced);
  saveQueue(queue);
}

export function getQueueStats(): {
  pending: number;
  synced: number;
  total: number;
} {
  const queue = getQueue();
  const synced = queue.transactions.filter((t) => t.synced).length;
  const pending = queue.transactions.filter((t) => !t.synced).length;
  return { pending, synced, total: queue.transactions.length };
}
