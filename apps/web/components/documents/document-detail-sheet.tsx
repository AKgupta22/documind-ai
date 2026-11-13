'use client';

import { FileText } from 'lucide-react';
import { StatusBadge } from '@/components/shared/status-badge';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { formatBytes, formatDate } from '@/lib/format';
import type { DocumentRecord } from '@/lib/types';

interface DocumentDetailSheetProps {
  document: DocumentRecord | null;
  onOpenChange: (open: boolean) => void;
}

export function DocumentDetailSheet({ document, onOpenChange }: DocumentDetailSheetProps) {
  return (
    <Sheet open={document !== null} onOpenChange={onOpenChange}>
      <SheetContent side="right">
        {document ? (
          <>
            <SheetHeader>
              <SheetTitle className="pr-6">{document.name}</SheetTitle>
              <SheetDescription>
                Document details from the prototype dataset.
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{document.type.toUpperCase()}</Badge>
              <StatusBadge status={document.status} />
              <span className="text-xs text-foreground-muted">
                {formatBytes(document.sizeBytes)}
              </span>
              {document.pages ? (
                <span className="text-xs text-foreground-muted">{document.pages} pages</span>
              ) : null}
            </div>

            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs text-foreground-muted">Uploaded</dt>
                <dd className="mt-0.5">{formatDate(document.uploadedAt)}</dd>
              </div>
              <div>
                <dt className="text-xs text-foreground-muted">Document ID</dt>
                <dd className="mt-0.5 font-mono text-xs">{document.id}</dd>
              </div>
            </dl>

            <div>
              <h3 className="type-label">Summary</h3>
              <p className="mt-1 text-sm text-foreground-secondary">{document.summary}</p>
            </div>

            <div className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-surface-secondary p-6 text-center">
              {/* TODO: REMOVE MOCK — Replace with actual document preview. */}
              <FileText className="size-6 text-foreground-muted" aria-hidden="true" />
              <p className="text-sm font-medium">Preview not available</p>
              <p className="max-w-xs text-xs text-foreground-muted">
                Document previews require the real file storage and rendering pipeline.
              </p>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
