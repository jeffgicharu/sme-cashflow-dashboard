'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

interface PageHeaderProps {
  title: string;
  backHref?: string;
  showBack?: boolean;
  rightElement?: React.ReactNode;
}

export function PageHeader({
  title,
  backHref,
  showBack,
  rightElement,
}: PageHeaderProps) {
  const router = useRouter();
  const hasBackNavigation = backHref || showBack;

  const handleBack = () => {
    if (backHref) return;
    router.back();
  };

  return (
    <header className="mb-4">
      <div className="flex items-center gap-2">
        {hasBackNavigation &&
          (backHref ? (
            <Link
              href={backHref}
              className="flex h-10 w-10 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-slate-100"
              aria-label="Go back"
            >
              <ChevronLeft className="h-6 w-6" />
            </Link>
          ) : (
            <button
              onClick={handleBack}
              className="flex h-10 w-10 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-slate-100"
              aria-label="Go back"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          ))}
        <h1 className="flex-1 text-lg font-semibold text-slate-900">{title}</h1>
        {rightElement && <div>{rightElement}</div>}
      </div>
    </header>
  );
}
