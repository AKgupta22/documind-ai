import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  label?: string;
  className?: string;
}

export function LoadingState({ label = 'Loading', className }: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn('flex items-center justify-center gap-2 py-8 text-sm text-foreground-secondary', className)}
    >
      <Loader2 className="size-4 animate-spin text-primary" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
