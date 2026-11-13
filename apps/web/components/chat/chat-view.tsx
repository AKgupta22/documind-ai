'use client';

import { Loader2, Plus } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ChatComposer } from '@/components/chat/chat-composer';
import { ChatEmptyState } from '@/components/chat/chat-empty-state';
import { ChatMessageItem } from '@/components/chat/chat-message';
import { SourcePanel } from '@/components/chat/source-panel';
import { UploadDialog } from '@/components/documents/upload-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ChatMessage, Citation, Conversation } from '@/lib/types';
// TODO: REMOVE MOCK — Replace simulated conversation data with backend integration.
import { createSimulatedReply } from '@/mocks/conversations';

interface ChatViewProps {
  conversation?: Conversation;
}

export function ChatView({ conversation }: ChatViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(conversation?.messages ?? []);
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState(false);
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);
  const endRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length, pending]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  function handleSend() {
    const text = draft.trim();
    if (!text || pending) {
      return;
    }

    const userMessage: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      createdAt: new Date().toISOString(),
      content: text,
    };

    setMessages((current) => [...current, userMessage]);
    setDraft('');
    setPending(true);

    // TODO: REMOVE MOCK — Replace simulated assistant response with backend integration.
    timeoutRef.current = window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        createSimulatedReply(text, `msg-simulated-${Date.now()}`),
      ]);
      setPending(false);
      timeoutRef.current = null;
    }, 900);
  }

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] min-h-0">
      <section aria-label="Conversation" className="flex min-w-0 flex-1 flex-col">
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border bg-surface px-4 py-2.5 sm:px-6">
          <div className="min-w-0">
            <h1 className="truncate text-sm font-medium">
              {conversation?.title ?? 'New conversation'}
            </h1>
            <p className="text-xs text-foreground-muted">
              {conversation ? 'Prototype conversation' : 'Start a simulated conversation'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Prototype</Badge>
            <Button asChild variant="secondary" size="sm">
              <Link href="/chat">
                <Plus className="size-4" aria-hidden="true" />
                New chat
              </Link>
            </Button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6">
            {messages.length === 0 ? (
              <ChatEmptyState onSelectPrompt={setDraft} />
            ) : (
              <div className="flex flex-col gap-6" role="log" aria-label="Messages">
                {messages.map((message) => (
                  <ChatMessageItem
                    key={message.id}
                    message={message}
                    onOpenCitation={setActiveCitation}
                  />
                ))}
              </div>
            )}

            {pending ? (
              <div
                role="status"
                aria-live="polite"
                className="flex items-center gap-2 text-sm text-foreground-secondary"
              >
                <Loader2 className="size-4 animate-spin text-primary" aria-hidden="true" />
                DocuMind is preparing a simulated response…
              </div>
            ) : null}

            <div ref={endRef} />
          </div>
        </div>

        <div className="shrink-0 border-t border-border bg-surface px-4 py-3 sm:px-6">
          <div className="mx-auto w-full max-w-3xl">
            <ChatComposer
              value={draft}
              onValueChange={setDraft}
              onSend={handleSend}
              onAttach={() => setUploadOpen(true)}
              pending={pending}
              attachments={attachments}
              onRemoveAttachment={(name) =>
                setAttachments((current) => current.filter((item) => item !== name))
              }
            />
          </div>
        </div>
      </section>

      {activeCitation ? (
        <SourcePanel citation={activeCitation} onClose={() => setActiveCitation(null)} />
      ) : null}

      <UploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUploaded={(document) => {
          setAttachments((current) =>
            current.includes(document.name) ? current : [...current, document.name],
          );
        }}
      />
    </div>
  );
}
