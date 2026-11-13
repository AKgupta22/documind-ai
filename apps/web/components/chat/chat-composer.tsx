'use client';

import { FileText, Loader2, Paperclip, Send, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ChatComposerProps {
  value: string;
  onValueChange: (value: string) => void;
  onSend: () => void;
  onAttach: () => void;
  pending: boolean;
  attachments?: string[];
  onRemoveAttachment?: (name: string) => void;
  placeholder?: string;
}

export function ChatComposer({
  value,
  onValueChange,
  onSend,
  onAttach,
  pending,
  attachments = [],
  onRemoveAttachment,
  placeholder = 'Ask a question about your documents…',
}: ChatComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
  }, [value]);

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      onSend();
    }
  }

  const canSend = value.trim().length > 0 && !pending;

  return (
    <div className="flex flex-col gap-2">
      {attachments.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {attachments.map((name) => (
            <li key={name}>
              <span className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-border bg-surface-secondary px-2 py-1 text-xs text-foreground-secondary">
                <FileText className="size-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">{name}</span>
                {onRemoveAttachment ? (
                  <button
                    type="button"
                    onClick={() => onRemoveAttachment(name)}
                    className="rounded-sm text-foreground-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <X className="size-3.5" aria-hidden="true" />
                    <span className="sr-only">Remove {name}</span>
                  </button>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSend();
        }}
        className="rounded-lg border border-border bg-surface p-2 shadow-sm focus-within:border-border-strong focus-within:ring-2 focus-within:ring-ring"
      >
        <label htmlFor="chat-composer" className="sr-only">
          Message DocuMind
        </label>
        <Textarea
          ref={textareaRef}
          id="chat-composer"
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          className="min-h-9 resize-none border-0 bg-transparent p-2 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />

        <div className="flex items-center justify-between gap-2 px-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onAttach}
            aria-label="Attach a document"
          >
            <Paperclip className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Attach</span>
          </Button>

          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-foreground-muted sm:inline">
              Responses are simulated
            </span>
            <Button type="submit" size="icon" disabled={!canSend} aria-label="Send message">
              {pending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="size-4" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>
      </form>

      <p className="text-center text-xs text-foreground-muted">
        Enter to send · Shift+Enter for a new line
      </p>
    </div>
  );
}
