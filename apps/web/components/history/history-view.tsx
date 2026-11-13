'use client';

import { MessageSquare, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { EmptyState } from '@/components/shared/empty-state';
import { PageContainer } from '@/components/shared/page-container';
import { PageHeading } from '@/components/shared/page-heading';
import { SearchInput } from '@/components/shared/search-input';
import { Button } from '@/components/ui/button';
import { formatDate, formatTime, groupConversationDate } from '@/lib/format';
import type { Conversation } from '@/lib/types';
import { mockConversations } from '@/mocks/conversations';

const GROUP_ORDER = ['Today', 'Yesterday', 'Previous 7 days', 'Older'] as const;

export function HistoryView() {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [query, setQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Conversation | null>(null);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return conversations;
    }
    return conversations.filter(
      (conversation) =>
        conversation.title.toLowerCase().includes(normalized) ||
        conversation.preview.toLowerCase().includes(normalized),
    );
  }, [conversations, query]);

  const groups = useMemo(() => {
    return GROUP_ORDER.map((label) => ({
      label,
      conversations: filtered
        .filter((conversation) => groupConversationDate(conversation.updatedAt) === label)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    })).filter((group) => group.conversations.length > 0);
  }, [filtered]);

  function handleDelete() {
    if (!deleteTarget) {
      return;
    }
    // TODO: REMOVE MOCK — Replace simulated conversation deletion with backend integration.
    setConversations((current) =>
      current.filter((conversation) => conversation.id !== deleteTarget.id),
    );
    setDeleteTarget(null);
  }

  return (
    <PageContainer className="flex flex-col gap-6">
      <PageHeading
        title="History"
        description="Review and reopen past conversations."
        actions={
          <Button asChild>
            <Link href="/chat">
              <Plus className="size-4" aria-hidden="true" />
              New conversation
            </Link>
          </Button>
        }
      />

      <SearchInput
        value={query}
        onValueChange={setQuery}
        label="Search conversations"
        placeholder="Search by title or preview"
        className="max-w-md"
      />

      <p className="text-xs text-foreground-secondary" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? 'conversation' : 'conversations'}
      </p>

      {groups.length > 0 ? (
        <div className="flex flex-col gap-6">
          {groups.map((group) => {
            const headingId = `history-${group.label.replace(/\s+/g, '-').toLowerCase()}`;
            return (
            <section key={group.label} aria-labelledby={headingId}>
              <h2
                id={headingId}
                className="mb-2 text-xs font-medium uppercase tracking-wide text-foreground-muted"
              >
                {group.label}
              </h2>
              <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
                {group.conversations.map((conversation) => (
                  <li
                    key={conversation.id}
                    className="flex items-start gap-2 px-4 py-3 transition-colors hover:bg-surface-secondary"
                  >
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-surface-secondary text-foreground-secondary">
                      <MessageSquare className="size-4" aria-hidden="true" />
                    </span>
                    <Link
                      href={`/chat/${conversation.id}`}
                      className="min-w-0 flex-1 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className="block truncate text-sm font-medium">
                        {conversation.title}
                      </span>
                      <span className="block truncate text-xs text-foreground-muted">
                        {conversation.preview}
                      </span>
                      <span className="mt-0.5 block text-xs text-foreground-muted">
                        {formatDate(conversation.updatedAt)} · {formatTime(conversation.updatedAt)}
                      </span>
                    </Link>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteTarget(conversation)}
                      aria-label={`Delete conversation ${conversation.title}`}
                      className="shrink-0 text-foreground-muted hover:text-danger"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </Button>
                  </li>
                ))}
              </ul>
            </section>
            );
          })}
        </div>
      ) : conversations.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No conversations yet"
          description="Start a conversation and it will appear here."
          action={
            <Button asChild>
              <Link href="/chat">Start a conversation</Link>
            </Button>
          }
        />
      ) : (
        <EmptyState
          icon={MessageSquare}
          title="No matching conversations"
          description="Try a different search term."
          action={
            <Button variant="secondary" onClick={() => setQuery('')}>
              Clear search
            </Button>
          }
        />
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete conversation"
        description={`Delete “${deleteTarget?.title ?? 'this conversation'}”? This removes it from the prototype history only.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </PageContainer>
  );
}
