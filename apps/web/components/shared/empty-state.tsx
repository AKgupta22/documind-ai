import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface px-6 py-12 text-center',
        className,
      )}
    >
      <span className="mb-4 flex size-10 items-center justify-center rounded-full bg-surface-secondary text-foreground-muted">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <h2 className="type-heading">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-foreground-secondary">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
