'use client';

import { FileText } from 'lucide-react';
import type { Citation } from '@/lib/types';

interface SourceCitationProps {
  citation: Citation;
  index: number;
  onOpen: (citation: Citation) => void;
}

export function SourceCitation({ citation, index, onOpen }: SourceCitationProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen(citation)}
      aria-label={`Open source ${index + 1}: ${citation.documentName}, ${citation.location}`}
      className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-border bg-primary-subtle px-2 py-1 text-left text-xs text-primary transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="font-semibold tabular-nums">{index + 1}</span>
      <FileText className="size-3.5 shrink-0" aria-hidden="true" />
      <span className="truncate">
        {citation.documentName} · {citation.location}
      </span>
    </button>
  );
}
