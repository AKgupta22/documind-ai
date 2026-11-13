'use client';

import { ExternalLink, FileText, X } from 'lucide-react';
import Link from 'next/link';
import { StatusBadge } from '@/components/shared/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useMediaQuery } from '@/hooks/use-media-query';
import { formatBytes } from '@/lib/format';
import type { Citation } from '@/lib/types';
// TODO: REMOVE MOCK — Replace with actual backend API response.
import { mockDocuments } from '@/mocks/documents';

interface SourcePanelProps {
  citation: Citation;
  onClose: () => void;
}

export function SourcePanel({ citation, onClose }: SourcePanelProps) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const document = mockDocuments.find((item) => item.id === citation.documentId);

  const content = (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-xs font-medium text-foreground-muted">Source</p>
        <h2 className="type-heading mt-0.5">{citation.documentName}</h2>
        <p className="text-xs text-foreground-secondary">{citation.location}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {document ? <Badge variant="outline">{document.type.toUpperCase()}</Badge> : null}
        {document ? <StatusBadge status={document.status} /> : null}
        {document ? (
          <span className="text-xs text-foreground-muted">
            {formatBytes(document.sizeBytes)}
          </span>
        ) : null}
      </div>

      <blockquote className="rounded-md border-l-2 border-primary bg-primary-subtle p-3 text-sm leading-6 text-foreground">
        {citation.excerpt}
        {/* TODO: REMOVE MOCK — Replace with actual document excerpt. */}
        <footer className="mt-2 text-xs text-foreground-secondary">
          Mock excerpt · {citation.location}
        </footer>
      </blockquote>

      {document ? (
        <p className="text-xs leading-5 text-foreground-secondary">{document.summary}</p>
      ) : null}

      <Button asChild variant="secondary" size="sm" className="self-start">
        <Link href="/documents">
          <ExternalLink className="size-3.5" aria-hidden="true" />
          Open Knowledge Base
        </Link>
      </Button>

      <p className="text-xs text-foreground-muted">
        Source previews are placeholders. Citations are not connected to real documents in
        this prototype.
      </p>
    </div>
  );

  if (isDesktop) {
    return (
      <aside
        aria-label="Source details"
        className="flex w-80 shrink-0 flex-col border-l border-border bg-surface"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="flex items-center gap-2 text-sm font-medium">
            <FileText className="size-4 text-foreground-secondary" aria-hidden="true" />
            Source details
          </span>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close source details">
            <X className="size-4" aria-hidden="true" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{content}</div>
      </aside>
    );
  }

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" aria-label="Source details">
        <SheetHeader>
          <SheetTitle>{citation.documentName}</SheetTitle>
          <SheetDescription>{citation.location}</SheetDescription>
        </SheetHeader>
        {content}
      </SheetContent>
    </Sheet>
  );
}
