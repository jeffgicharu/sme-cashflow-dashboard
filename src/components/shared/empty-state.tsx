import { Inbox, Plus, TrendingUp, FileText } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type EmptyStateVariant =
  | 'transactions'
  | 'insights'
  | 'reports'
  | 'categories'
  | 'default';

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}

const variants: Record<
  EmptyStateVariant,
  {
    icon: typeof Inbox;
    defaultTitle: string;
    defaultDescription: string;
    defaultAction: { label: string; href: string } | null;
  }
> = {
  transactions: {
    icon: Inbox,
    defaultTitle: 'No transactions yet',
    defaultDescription:
      'Your M-Pesa transactions will appear here once connected, or add them manually.',
    defaultAction: { label: 'Add Transaction', href: '/add' },
  },
  insights: {
    icon: TrendingUp,
    defaultTitle: 'Not enough data',
    defaultDescription:
      'Add more transactions to see your spending insights and projections.',
    defaultAction: { label: 'Add Transaction', href: '/add' },
  },
  reports: {
    icon: FileText,
    defaultTitle: 'No reports available',
    defaultDescription:
      'Reports will be available once you have transactions for a full month.',
    defaultAction: null,
  },
  categories: {
    icon: Inbox,
    defaultTitle: 'No custom categories',
    defaultDescription:
      'Create custom categories to better organize your transactions.',
    defaultAction: null,
  },
  default: {
    icon: Inbox,
    defaultTitle: 'Nothing here yet',
    defaultDescription: 'Get started by adding some data.',
    defaultAction: null,
  },
};

export function EmptyState({
  variant = 'default',
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  const config = variants[variant];
  const Icon = config.icon;

  const finalTitle = title || config.defaultTitle;
  const finalDescription = description || config.defaultDescription;
  const finalAction = actionHref
    ? { label: actionLabel || 'Get Started', href: actionHref }
    : config.defaultAction;

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
        <Icon className="h-8 w-8 text-slate-400" />
      </div>
      <h3 className="mb-1 text-lg font-semibold text-slate-900">
        {finalTitle}
      </h3>
      <p className="mb-4 max-w-sm px-4 text-sm text-slate-500">
        {finalDescription}
      </p>
      {finalAction && (
        <Button asChild>
          <Link href={finalAction.href}>
            <Plus className="mr-2 h-4 w-4" />
            {finalAction.label}
          </Link>
        </Button>
      )}
    </div>
  );
}
