import { Brain, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function MemorySection() {
  return (
    <div className="flex flex-col gap-4">
      {/* TODO: REMOVE MOCK — Replace with actual memory controls. */}
      <div className="rounded-lg border border-dashed border-border bg-surface-secondary p-4">
        <div className="flex items-center gap-2">
          <Brain className="size-4 text-foreground-muted" aria-hidden="true" />
          <p className="text-sm font-medium">Memory controls are not available yet</p>
          <Badge variant="secondary" className="ml-auto">
            Placeholder
          </Badge>
        </div>
        <p className="mt-2 text-xs leading-5 text-foreground-secondary">
          Future controls will let you review, edit, and clear what DocuMind remembers
          between conversations. This prototype does not store memory.
        </p>
      </div>

      <div className="flex items-start gap-2 text-xs text-foreground-muted">
        <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        <p>No memory is persisted. Conversations exist only in the current prototype data.</p>
      </div>
    </div>
  );
}
