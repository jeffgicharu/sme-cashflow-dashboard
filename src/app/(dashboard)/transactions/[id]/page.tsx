import { auth } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import {
  getTransactionById,
  getCategories,
} from '@/lib/db/queries/transactions';
import { PageHeader } from '@/components/shared/page-header';
import { TransactionDetailForm } from '@/components/transactions/transaction-detail-form';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TransactionDetailPage({ params }: PageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const { id } = await params;
  const [transaction, categories] = await Promise.all([
    getTransactionById(userId, id),
    getCategories(userId),
  ]);

  if (!transaction) {
    notFound();
  }

  return (
    <div className="p-4">
      <PageHeader title="Transaction Details" showBack />
      <TransactionDetailForm
        transaction={transaction}
        categories={categories}
      />
    </div>
  );
}
