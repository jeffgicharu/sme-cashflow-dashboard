import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { CategoriesList } from '@/components/categories/categories-list';
import { getAllCategories } from '@/lib/actions/categories';

export default async function CategoriesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const { defaultCategories, customCategories } = await getAllCategories();

  return (
    <div className="p-4">
      <PageHeader title="Categories" backHref="/settings" />
      <CategoriesList
        defaultCategories={defaultCategories}
        customCategories={customCategories}
      />
    </div>
  );
}
