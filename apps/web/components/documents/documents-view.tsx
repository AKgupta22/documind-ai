'use client';

import { FilePlus2, FileText, Upload } from 'lucide-react';
import { useState } from 'react';
import { DocumentDetailSheet } from '@/components/documents/document-detail-sheet';
import { DocumentList } from '@/components/documents/document-list';
import { UploadDialog } from '@/components/documents/upload-dialog';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { EmptyState } from '@/components/shared/empty-state';
import { PageContainer } from '@/components/shared/page-container';
import { PageHeading } from '@/components/shared/page-heading';
import { SearchInput } from '@/components/shared/search-input';
import { StatusMessage } from '@/components/shared/status-message';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { mockDocuments } from '@/mocks/documents';
import type { DocumentRecord, DocumentStatus, DocumentType } from '@/lib/types';

type TypeFilter = 'all' | DocumentType;
type StatusFilter = 'all' | DocumentStatus;

interface DocumentsViewProps {
  initialQuery?: string;
}

export function DocumentsView({ initialQuery = '' }: DocumentsViewProps) {
  const [documents, setDocuments] = useState<DocumentRecord[]>(mockDocuments);
  const [query, setQuery] = useState(initialQuery);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [detail, setDetail] = useState<DocumentRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DocumentRecord | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = documents.filter((document) => {
    const matchesQuery =
      !normalizedQuery ||
      document.name.toLowerCase().includes(normalizedQuery) ||
      document.summary.toLowerCase().includes(normalizedQuery);
    const matchesType = typeFilter === 'all' || document.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || document.status === statusFilter;
    return matchesQuery && matchesType && matchesStatus;
  });

  function resetFilters() {
    setQuery('');
    setTypeFilter('all');
    setStatusFilter('all');
  }

  function handleRetry(document: DocumentRecord) {
    // TODO: REMOVE MOCK — Replace simulated retry with backend integration.
    setDocuments((current) =>
      current.map((item) =>
        item.id === document.id ? { ...item, status: 'processing' } : item,
      ),
    );
    setNotice(`Simulated indexing retry started for ${document.name}.`);

    window.setTimeout(() => {
      setDocuments((current) =>
        current.map((item) =>
          item.id === document.id
            ? {
                ...item,
                status: 'indexed',
                summary: 'Simulated indexing completed. No processing pipeline ran.',
              }
            : item,
        ),
      );
      setNotice(`Simulated indexing completed for ${document.name}.`);
    }, 1600);
  }

  function handleDelete() {
    if (!deleteTarget) {
      return;
    }
    // TODO: REMOVE MOCK — Replace simulated deletion with backend integration.
    setDocuments((current) => current.filter((item) => item.id !== deleteTarget.id));
    setNotice(`${deleteTarget.name} was removed from this prototype session.`);
    setDeleteTarget(null);
  }

  return (
    <PageContainer className="flex flex-col gap-6">
      <PageHeading
        title="Knowledge Base"
        description="Manage the documents DocuMind can search, summarize, and cite."
        actions={
          <Button type="button" onClick={() => setUploadOpen(true)}>
            <Upload className="size-4" aria-hidden="true" />
            Upload documents
          </Button>
        }
      />

      {notice ? <StatusMessage tone="info">{notice}</StatusMessage> : null}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <SearchInput
          value={query}
          onValueChange={setQuery}
          label="Search documents"
          placeholder="Search by name or summary"
          className="lg:max-w-sm lg:flex-1"
        />

        <div className="grid grid-cols-2 gap-3 sm:flex sm:items-end">
          <div className="flex flex-col gap-1">
            <label htmlFor="type-filter" className="text-xs font-medium text-foreground-secondary">
              File type
            </label>
            <Select
              id="type-filter"
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value as TypeFilter)}
              className="min-w-28"
            >
              <option value="all">All types</option>
              <option value="pdf">PDF</option>
              <option value="txt">TXT</option>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="status-filter" className="text-xs font-medium text-foreground-secondary">
              Status
            </label>
            <Select
              id="status-filter"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              className="min-w-32"
            >
              <option value="all">All statuses</option>
              <option value="indexed">Indexed</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
            </Select>
          </div>
          <Button type="button" variant="ghost" onClick={resetFilters} className="self-end">
            Reset
          </Button>
        </div>
      </div>

      <p className="text-xs text-foreground-secondary" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? 'document' : 'documents'} shown
      </p>

      {filtered.length > 0 ? (
        <DocumentList
          documents={filtered}
          onView={setDetail}
          onDelete={setDeleteTarget}
          onRetry={handleRetry}
        />
      ) : documents.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No documents yet"
          description="Upload a PDF or TXT file to start asking questions about it."
          action={
            <Button type="button" onClick={() => setUploadOpen(true)}>
              <FilePlus2 className="size-4" aria-hidden="true" />
              Upload your first document
            </Button>
          }
        />
      ) : (
        <EmptyState
          icon={FileText}
          title="No matching documents"
          description="Try a different search term or reset the filters."
          action={
            <Button type="button" variant="secondary" onClick={resetFilters}>
              Clear filters
            </Button>
          }
        />
      )}

      <UploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUploaded={(document) => {
          setDocuments((current) => [document, ...current]);
          setNotice(`${document.name} was added in this prototype session only.`);
        }}
      />

      <DocumentDetailSheet document={detail} onOpenChange={(open) => !open && setDetail(null)} />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete document"
        description={`Delete “${deleteTarget?.name ?? 'this document'}”? This removes it from the prototype list only.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </PageContainer>
  );
}
