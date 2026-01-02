import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { getTransactions } from '@/lib/db/queries/transactions';
import { db } from '@/lib/db';
import { transactions } from '@/lib/db/schema';
import { eq, isNull, and } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { TransactionList } from '@/components/transactions/transaction-list';
import { PageHeader } from '@/components/shared/page-header';
import { TransactionRowSkeleton } from '@/components/shared/skeleton';
import type {
  TransactionFilter,
  DateRange,
} from '@/lib/db/queries/transactions';

interface PageProps {
  searchParams: Promise<{
    filter?: string;
    range?: string;
    search?: string;
    offset?: string;
  }>;
}

async function TransactionsContent({ searchParams }: PageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const params = await searchParams;
  const filter = (params.filter as TransactionFilter) || 'all';
  const dateRange = (params.range as DateRange) || 'all';
  const search = params.search || '';
  const offset = parseInt(params.offset || '0', 10);

  const { transactions: txns, hasMore } = await getTransactions({
    userId,
    filter,
    dateRange,
    search,
    limit: 20,
    offset,
  });

  // Get uncategorized count for filter chip badge
  const uncategorizedResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(transactions)
    .where(
      and(eq(transactions.userId, userId), isNull(transactions.categoryId))
    );

  const uncategorizedCount = Number(uncategorizedResult[0]?.count || 0);

  return (
    <TransactionList
      initialTransactions={txns}
      initialHasMore={hasMore}
      uncategorizedCount={uncategorizedCount}
    />
  );
}

function TransactionsLoading() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <TransactionRowSkeleton key={i} />
      ))}
    </div>
  );
}

export default async function TransactionsPage(props: PageProps) {
  return (
    <div className="p-4">
      <PageHeader title="Transactions" />
      <Suspense fallback={<TransactionsLoading />}>
        <TransactionsContent searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}
