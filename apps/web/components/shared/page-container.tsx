import { cn } from '@/lib/utils';

interface PageContainerProps extends React.ComponentProps<'div'> {
  width?: 'default' | 'wide' | 'full';
}

export function PageContainer({
  className,
  width = 'default',
  ...props
}: PageContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-4 py-6 sm:px-6 lg:px-8',
        width === 'default' && 'max-w-5xl',
        width === 'wide' && 'max-w-6xl',
        width === 'full' && 'max-w-none',
        className,
      )}
      {...props}
    />
  );
}
