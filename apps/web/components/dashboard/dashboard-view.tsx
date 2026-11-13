'use client';

import {
  ArrowRight,
  FileText,
  MessageSquare,
  MessageSquarePlus,
  Upload,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { DocumentDetailSheet } from '@/components/documents/document-detail-sheet';
import { UploadDialog } from '@/components/documents/upload-dialog';
import { PageContainer } from '@/components/shared/page-container';
import { StatusBadge } from '@/components/shared/status-badge';
import { StatusMessage } from '@/components/shared/status-message';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { formatBytes, formatDate, formatTime } from '@/lib/format';
import type { DocumentRecord } from '@/lib/types';
import { mockConversations } from '@/mocks/conversations';
import { deriveDashboardStats } from '@/mocks/dashboard';
import { mockDocuments } from '@/mocks/documents';

export function DashboardView() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocumentRecord[]>(mockDocuments);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [detail, setDetail] = useState<DocumentRecord | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const conversations = mockConversations;
  const stats = deriveDashboardStats(documents, conversations);
  const storagePercent = Math.min(
    100,
    Math.round((stats.storageBytes / stats.storageQuotaBytes) * 100),
  );

  const recentDocuments = [...documents]
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
    .slice(0, 4);

  const recentConversations = [...conversations]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4);

  return (
    <PageContainer className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="type-title">Welcome back, {user?.name.split(' ')[0] ?? 'there'}</h1>
          <p className="mt-1 text-sm text-foreground-secondary">
            Here is a snapshot of your documents and conversations. This prototype uses
            fixed sample data.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={() => setUploadOpen(true)}>
            <Upload className="size-4" aria-hidden="true" />
            Upload documents
          </Button>
          <Button asChild>
            <Link href="/chat">
              <MessageSquarePlus className="size-4" aria-hidden="true" />
              Ask AI
            </Link>
          </Button>
        </div>
      </div>

      {notice ? <StatusMessage tone="info">{notice}</StatusMessage> : null}

      <section aria-label="Usage summary" className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="text-xs font-medium text-foreground-secondary">Documents</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{stats.documentCount}</p>
          <p className="mt-0.5 text-xs text-foreground-muted">In the knowledge base</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="text-xs font-medium text-foreground-secondary">Conversations</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{stats.conversationCount}</p>
          <p className="mt-0.5 text-xs text-foreground-muted">Across all history</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="text-xs font-medium text-foreground-secondary">Storage</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">
            {formatBytes(stats.storageBytes)}
          </p>
          <div className="mt-2">
            <Progress
              value={storagePercent}
              aria-label={`Storage used: ${storagePercent}% of quota`}
            />
          </div>
          <p className="mt-1 text-xs text-foreground-muted">
            {storagePercent}% of {formatBytes(stats.storageQuotaBytes)}
          </p>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="flex flex-col rounded-lg border border-border bg-surface">
          <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
            <h2 className="type-heading">Recent documents</h2>
            <Button asChild variant="link" size="sm" className="h-auto px-0">
              <Link href="/documents">
                View all
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </Button>
          </div>
          {recentDocuments.length > 0 ? (
            <ul className="divide-y divide-border">
              {recentDocuments.map((document) => (
                <li key={document.id}>
                  <button
                    type="button"
                    onClick={() => setDetail(document)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-surface-secondary text-foreground-secondary">
                      <FileText className="size-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{document.name}</span>
                      <span className="block text-xs text-foreground-muted">
                        {formatBytes(document.sizeBytes)} · {formatDate(document.uploadedAt)}
                      </span>
                    </span>
                    <StatusBadge status={document.status} />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-8 text-center text-sm text-foreground-secondary">
              No documents yet. Upload a file to get started.
            </p>
          )}
        </section>

        <section className="flex flex-col rounded-lg border border-border bg-surface">
          <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
            <h2 className="type-heading">Recent conversations</h2>
            <Button asChild variant="link" size="sm" className="h-auto px-0">
              <Link href="/history">
                View all
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </Button>
          </div>
          {recentConversations.length > 0 ? (
            <ul className="divide-y divide-border">
              {recentConversations.map((conversation) => (
                <li key={conversation.id}>
                  <Link
                    href={`/chat/${conversation.id}`}
                    className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-surface-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-surface-secondary text-foreground-secondary">
                      <MessageSquare className="size-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {conversation.title}
                      </span>
                      <span className="block truncate text-xs text-foreground-muted">
                        {conversation.preview}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs text-foreground-muted">
                      {formatTime(conversation.updatedAt)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-8 text-center text-sm text-foreground-secondary">
              No conversations yet. Start a new chat.
            </p>
          )}
        </section>
      </div>

      <UploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUploaded={(document) => {
          setDocuments((current) => [document, ...current]);
          setNotice(`${document.name} was added in this prototype session only.`);
        }}
      />

      <DocumentDetailSheet document={detail} onOpenChange={(open) => !open && setDetail(null)} />
    </PageContainer>
  );
}
