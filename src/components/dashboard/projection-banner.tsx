import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type ProjectionStatus = 'healthy' | 'warning' | 'critical';

interface ProjectionBannerProps {
  status: ProjectionStatus;
  daysUntilThreshold: number;
  thresholdDate?: Date;
}

const statusConfig: Record<
  ProjectionStatus,
  {
    bg: string;
    text: string;
    icon: string;
    getMessage: (days: number, date?: Date) => string;
  }
> = {
  healthy: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    icon: 'text-green-600',
    getMessage: (days) => `Balance healthy for ${days} days`,
  },
  warning: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    icon: 'text-amber-600',
    getMessage: (days, date) =>
      date
        ? `May drop below threshold by ${date.toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })}`
        : `May drop below threshold in ${days} days`,
  },
  critical: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    icon: 'text-red-600',
    getMessage: (days, date) =>
      date
        ? `Projected to run out by ${date.toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })}`
        : `Projected to run out in ${days} days`,
  },
};

export function ProjectionBanner({
  status,
  daysUntilThreshold,
  thresholdDate,
}: ProjectionBannerProps) {
  const config = statusConfig[status];

  return (
    <Link href="/insights">
      <div
        className={cn(
          'flex items-center justify-between rounded-lg p-4',
          config.bg
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full',
              status === 'healthy' && 'bg-green-100',
              status === 'warning' && 'bg-amber-100',
              status === 'critical' && 'bg-red-100'
            )}
          >
            <span className="text-lg">
              {status === 'healthy' && '✓'}
              {status === 'warning' && '!'}
              {status === 'critical' && '!!'}
            </span>
          </div>
          <div>
            <p className={cn('text-sm font-medium', config.text)}>
              {config.getMessage(daysUntilThreshold, thresholdDate)}
            </p>
            <p className="text-xs text-slate-500">Tap to see projection</p>
          </div>
        </div>
        <ChevronRight className={cn('h-5 w-5', config.icon)} />
      </div>
    </Link>
  );
}
