import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

interface PageHeaderProps {
  title: string;
  backHref?: string;
  rightElement?: React.ReactNode;
}

export function PageHeader({ title, backHref, rightElement }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {backHref && (
            <Link
              href={backHref}
              className="flex h-10 w-10 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-slate-100"
              aria-label="Go back"
            >
              <ChevronLeft className="h-6 w-6" />
            </Link>
          )}
          <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
        </div>
        {rightElement && <div>{rightElement}</div>}
      </div>
    </header>
  );
}
