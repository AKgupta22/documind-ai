'use client';

import {
  Ellipsis,
  FileText,
  MessageSquare,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { StatusBadge } from '@/components/shared/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatBytes, formatDate } from '@/lib/format';
import type { DocumentRecord } from '@/lib/types';

interface DocumentListProps {
  documents: DocumentRecord[];
  onView: (document: DocumentRecord) => void;
  onDelete: (document: DocumentRecord) => void;
  onRetry: (document: DocumentRecord) => void;
}

export function DocumentList({
  documents,
  onView,
  onDelete,
  onRetry,
}: DocumentListProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="hidden grid-cols-[minmax(0,2.4fr)_5rem_7rem_6rem_7rem_2.5rem] items-center gap-3 border-b border-border bg-surface-secondary px-4 py-2 text-xs font-medium text-foreground-secondary md:grid">
        <span>Document</span>
        <span>Type</span>
        <span>Status</span>
        <span>Size</span>
        <span>Uploaded</span>
        <span className="sr-only">Actions</span>
      </div>

      <ul className="divide-y divide-border">
        {documents.map((document) => (
          <li
            key={document.id}
            className="grid gap-3 px-4 py-3 transition-colors hover:bg-surface-secondary md:grid-cols-[minmax(0,2.4fr)_5rem_7rem_6rem_7rem_2.5rem] md:items-center"
          >
            <div className="flex min-w-0 items-start gap-3">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-surface-secondary text-foreground-secondary">
                <FileText className="size-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <button
                  type="button"
                  onClick={() => onView(document)}
                  className="block max-w-full truncate text-left text-sm font-medium hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {document.name}
                </button>
                <p className="mt-0.5 line-clamp-1 text-xs text-foreground-muted">
                  {document.summary}
                </p>
                <div className="mt-1.5 flex items-center gap-2 md:hidden">
                  <Badge variant="outline">{document.type.toUpperCase()}</Badge>
                  <StatusBadge status={document.status} />
                  <span className="text-xs text-foreground-muted">
                    {formatBytes(document.sizeBytes)}
                  </span>
                </div>
              </div>
            </div>

            <span className="hidden md:block">
              <Badge variant="outline">{document.type.toUpperCase()}</Badge>
            </span>
            <span className="hidden md:block">
              <StatusBadge status={document.status} />
            </span>
            <span className="hidden text-xs tabular-nums text-foreground-secondary md:block">
              {formatBytes(document.sizeBytes)}
            </span>
            <span className="hidden text-xs text-foreground-secondary md:block">
              {formatDate(document.uploadedAt)}
            </span>

            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Actions for ${document.name}`}
                  >
                    <Ellipsis className="size-4" aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => onView(document)}>
                    <FileText className="size-4" aria-hidden="true" />
                    View details
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/chat">
                      <MessageSquare className="size-4" aria-hidden="true" />
                      Ask about this document
                    </Link>
                  </DropdownMenuItem>
                  {document.status === 'failed' ? (
                    <DropdownMenuItem onSelect={() => onRetry(document)}>
                      <RotateCcw className="size-4" aria-hidden="true" />
                      Retry indexing
                    </DropdownMenuItem>
                  ) : null}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => onDelete(document)}
                    className="text-danger focus:text-danger"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
