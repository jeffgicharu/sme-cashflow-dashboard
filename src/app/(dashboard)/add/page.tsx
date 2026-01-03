import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCategories } from '@/lib/db/queries/transactions';
import { PageHeader } from '@/components/shared/page-header';
import { AddTransactionForm } from '@/components/transactions/add-transaction-form';

export default async function AddTransactionPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const categories = await getCategories(userId);

  return (
    <div className="p-4 md:p-0">
      <PageHeader title="Add Transaction" showBack />
      <div className="md:max-w-xl">
        <AddTransactionForm categories={categories} />
      </div>
    </div>
  );
}
