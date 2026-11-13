'use client';

import { useEffect } from 'react';
import { ErrorState } from '@/components/shared/error-state';
import { PageContainer } from '@/components/shared/page-container';

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <PageContainer>
      <ErrorState
        title="This view could not be displayed"
        description="An unexpected error occurred. No data was changed."
        onRetry={reset}
      />
    </PageContainer>
  );
}
