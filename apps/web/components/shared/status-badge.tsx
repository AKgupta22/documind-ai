import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { DocumentStatus, ToolStatus } from '@/lib/types';

type StatusValue = DocumentStatus | ToolStatus;
type StatusVariant = 'success' | 'warning' | 'danger' | 'info' | 'secondary';

const STATUS_CONFIG: Record<StatusValue, { label: string; variant: StatusVariant }> = {
  indexed: { label: 'Indexed', variant: 'success' },
  processing: { label: 'Processing', variant: 'warning' },
  failed: { label: 'Failed', variant: 'danger' },
  pending: { label: 'Pending', variant: 'secondary' },
  running: { label: 'Running', variant: 'info' },
  succeeded: { label: 'Succeeded', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'secondary' },
};

interface StatusBadgeProps {
  status: StatusValue;
  className?: string;
  label?: string;
}

export function StatusBadge({ status, className, label }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const variant = config.variant === 'secondary' ? 'secondary' : config.variant;

  return (
    <Badge variant={variant} className={cn('gap-1.5', className)}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {label ?? config.label}
    </Badge>
  );
}
