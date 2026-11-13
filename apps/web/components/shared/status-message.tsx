import { AlertCircle, CheckCircle2, Info, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

type StatusTone = 'error' | 'success' | 'info' | 'warning';

const TONES: Record<
  StatusTone,
  { icon: typeof Info; container: string; iconClass: string }
> = {
  error: {
    icon: AlertCircle,
    container: 'border-danger bg-danger-subtle text-danger',
    iconClass: 'text-danger',
  },
  success: {
    icon: CheckCircle2,
    container: 'border-success bg-success-subtle text-success',
    iconClass: 'text-success',
  },
  info: {
    icon: Info,
    container: 'border-info bg-info-subtle text-info',
    iconClass: 'text-info',
  },
  warning: {
    icon: TriangleAlert,
    container: 'border-warning bg-warning-subtle text-warning',
    iconClass: 'text-warning',
  },
};

interface StatusMessageProps {
  tone: StatusTone;
  children: React.ReactNode;
  className?: string;
}

export function StatusMessage({ tone, children, className }: StatusMessageProps) {
  const config = TONES[tone];
  const Icon = config.icon;

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'flex items-start gap-2 rounded-md border px-3 py-2 text-sm',
        config.container,
        className,
      )}
    >
      <Icon className={cn('mt-0.5 size-4 shrink-0', config.iconClass)} aria-hidden="true" />
      <span className="min-w-0">{children}</span>
    </div>
  );
}
