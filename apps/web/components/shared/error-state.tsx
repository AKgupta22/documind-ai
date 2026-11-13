import { TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'The page could not be loaded. Try again or return to the dashboard.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-lg border border-danger bg-danger-subtle px-6 py-12 text-center"
    >
      <TriangleAlert className="mb-3 size-5 text-danger" aria-hidden="true" />
      <h2 className="type-heading">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-foreground-secondary">{description}</p>
      {onRetry ? (
        <Button type="button" variant="secondary" onClick={onRetry} className="mt-4">
          Try again
        </Button>
      ) : null}
    </div>
  );
}
