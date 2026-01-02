import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { RecurringList } from '@/components/categories/recurring-list';
import { getRecurringTransactions } from '@/lib/actions/categories';

export default async function RecurringPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const { income, expenses } = await getRecurringTransactions();

  return (
    <div className="p-4">
      <PageHeader title="Recurring Transactions" backHref="/settings" />
      <RecurringList income={income} expenses={expenses} />
    </div>
  );
}
