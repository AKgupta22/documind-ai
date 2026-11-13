'use client';

import { Check, Copy, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { AgentActivity } from '@/components/chat/agent-activity';
import { MessageBlocks } from '@/components/chat/message-blocks';
import { SourceCitation } from '@/components/chat/source-citation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatTime } from '@/lib/format';
import type { ChatMessage, Citation } from '@/lib/types';
// TODO: REMOVE MOCK — Replace with actual backend API response.
import { getToolExecutions } from '@/mocks/agent';

interface ChatMessageItemProps {
  message: ChatMessage;
  onOpenCitation: (citation: Citation) => void;
}

function blocksToText(message: ChatMessage): string {
  if (message.content) {
    return message.content;
  }

  return (message.blocks ?? [])
    .map((block) => {
      if (block.type === 'list') {
        return block.items.map((item) => `- ${item}`).join('\n');
      }
      if (block.type === 'code') {
        return block.code;
      }
      return block.text;
    })
    .join('\n\n');
}

export function ChatMessageItem({ message, onOpenCitation }: ChatMessageItemProps) {
  const [copied, setCopied] = useState(false);
  const executions = getToolExecutions(message.toolExecutionIds ?? []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(blocksToText(message));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  if (message.role === 'user') {
    return (
      <article aria-label="Your message" className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-2 text-xs text-foreground-muted">
          <span>You</span>
          <time dateTime={message.createdAt}>{formatTime(message.createdAt)}</time>
        </div>
        <div className="max-w-[90%] whitespace-pre-wrap rounded-lg border border-border bg-surface-secondary px-4 py-2.5 text-sm leading-6 text-foreground sm:max-w-[80%]">
          {message.content}
        </div>
      </article>
    );
  }

  return (
    <article aria-label="DocuMind response" className="flex gap-3">
      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-primary">
        <Sparkles className="size-3.5" aria-hidden="true" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">DocuMind</span>
          {message.simulated ? (
            <>
              {/* TODO: REMOVE MOCK — Replace with actual application data. */}
              <Badge variant="secondary">Simulated</Badge>
            </>
          ) : null}
          <time className="text-xs text-foreground-muted" dateTime={message.createdAt}>
            {formatTime(message.createdAt)}
          </time>
        </div>

        <div className="mt-2 text-sm leading-6 text-foreground">
          {message.blocks ? <MessageBlocks blocks={message.blocks} /> : null}
        </div>

        {executions.length > 0 ? (
          <div className="mt-3">
            <AgentActivity executions={executions} />
          </div>
        ) : null}

        {message.citations && message.citations.length > 0 ? (
          <div className="mt-3">
            <p className="mb-1.5 text-xs font-medium text-foreground-secondary">Sources</p>
            <ul className="flex flex-wrap gap-2">
              {message.citations.map((citation, index) => (
                <li key={citation.id} className="max-w-full">
                  <SourceCitation
                    citation={citation}
                    index={index}
                    onOpen={onOpenCitation}
                  />
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-2">
          <Button type="button" variant="ghost" size="sm" onClick={handleCopy} className="h-7 px-2">
            {copied ? (
              <Check className="size-3.5" aria-hidden="true" />
            ) : (
              <Copy className="size-3.5" aria-hidden="true" />
            )}
            {copied ? 'Copied' : 'Copy response'}
          </Button>
        </div>
      </div>
    </article>
  );
}
