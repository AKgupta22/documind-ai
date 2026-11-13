'use client';

import { ChevronDown, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { StatusBadge } from '@/components/shared/status-badge';
import { StatusMessage } from '@/components/shared/status-message';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { formatDuration } from '@/lib/format';
import type { ToolExecution, ToolStatus } from '@/lib/types';

function summaryStatus(executions: ToolExecution[]): ToolStatus {
  if (executions.some((execution) => execution.status === 'failed')) {
    return 'failed';
  }
  if (executions.some((execution) => execution.status === 'running')) {
    return 'running';
  }
  if (executions.every((execution) => execution.status === 'succeeded')) {
    return 'succeeded';
  }
  return 'pending';
}

function ToolExecutionItem({ execution }: { execution: ToolExecution }) {
  const [open, setOpen] = useState(execution.status === 'failed');

  return (
    <li className="p-3">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex w-full items-start gap-2 rounded-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <code className="type-code text-xs font-medium text-foreground">
                  {execution.tool}
                </code>
                <StatusBadge status={execution.status} />
                <span className="text-xs tabular-nums text-foreground-muted">
                  {formatDuration(execution.durationMs)}
                </span>
              </div>
              <p className="mt-1 text-xs text-foreground-secondary">
                {execution.description}
              </p>
            </div>
            <ChevronDown
              className={`mt-0.5 size-4 shrink-0 text-foreground-muted transition-transform ${open ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-2 flex flex-col gap-2">
          <div>
            <p className="text-xs font-medium text-foreground-secondary">Input</p>
            <pre className="mt-1 overflow-x-auto whitespace-pre-wrap rounded-md border border-border bg-surface p-2 type-code text-xs">
              {execution.input}
            </pre>
          </div>
          <div>
            <p className="text-xs font-medium text-foreground-secondary">Output</p>
            <pre className="mt-1 overflow-x-auto whitespace-pre-wrap rounded-md border border-border bg-surface p-2 type-code text-xs">
              {execution.output}
            </pre>
          </div>
          {execution.error ? (
            <>
              <StatusMessage tone="error">{execution.error}</StatusMessage>
              <details className="text-xs text-foreground-secondary">
                <summary className="cursor-pointer rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  Technical details
                </summary>
                <pre className="mt-1 overflow-x-auto whitespace-pre-wrap rounded-md border border-border bg-surface p-2 type-code text-xs">
                  {execution.error}
                </pre>
              </details>
            </>
          ) : null}
        </CollapsibleContent>
      </Collapsible>
    </li>
  );
}

export function AgentActivity({ executions }: { executions: ToolExecution[] }) {
  const [open, setOpen] = useState(false);

  if (executions.length === 0) {
    return null;
  }

  const totalDuration = executions.reduce(
    (total, execution) => total + execution.durationMs,
    0,
  );

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="rounded-md border border-border bg-surface-secondary">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex w-full flex-wrap items-center gap-2 rounded-md px-3 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Sparkles className="size-4 text-primary" aria-hidden="true" />
            <span className="text-xs font-medium">Agent activity</span>
            <span className="text-xs text-foreground-muted">
              {executions.length} {executions.length === 1 ? 'step' : 'steps'} ·{' '}
              {formatDuration(totalDuration)}
            </span>
            <span className="ml-auto flex items-center gap-2">
              <StatusBadge status={summaryStatus(executions)} />
              <ChevronDown
                className={`size-4 text-foreground-muted transition-transform ${open ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </span>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <ul className="divide-y divide-border border-t border-border">
            {executions.map((execution) => (
              <ToolExecutionItem key={execution.id} execution={execution} />
            ))}
          </ul>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
