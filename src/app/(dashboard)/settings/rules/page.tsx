import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { RulesList } from '@/components/categories/rules-list';
import { getCategoryRules } from '@/lib/actions/categories';

export default async function RulesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const rules = await getCategoryRules();

  return (
    <div className="p-4">
      <PageHeader title="Category Rules" backHref="/settings" />
      <RulesList rules={rules} />
    </div>
  );
}
