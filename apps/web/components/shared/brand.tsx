import { FileText } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface BrandProps {
  className?: string;
  showText?: boolean;
  href?: string;
}

export function Brand({ className, showText = true, href = '/dashboard' }: BrandProps) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
      aria-label="DocuMind AI"
    >
      <span className="flex size-8 items-center justify-center rounded-md bg-primary-subtle text-primary">
        <FileText className="size-4" aria-hidden="true" />
      </span>
      {showText ? <span className="text-sm font-semibold text-foreground">DocuMind AI</span> : null}
    </Link>
  );
}
