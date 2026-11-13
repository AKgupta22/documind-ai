// TODO: REMOVE MOCK — Replace with actual backend API response.
import type { DocumentRecord } from '@/lib/types';
import { daysAgoIso } from '@/lib/format';

export const mockDocuments: DocumentRecord[] = [
  {
    id: 'doc-1',
    name: 'Q3 Product Launch Plan.pdf',
    type: 'pdf',
    sizeBytes: 2_411_520,
    status: 'indexed',
    uploadedAt: daysAgoIso(0, 6),
    pages: 18,
    summary:
      'Launch milestones, owners, and dependencies for the Q3 product release.',
  },
  {
    id: 'doc-2',
    name: 'Vendor Agreement — Northwind.pdf',
    type: 'pdf',
    sizeBytes: 1_180_000,
    status: 'indexed',
    uploadedAt: daysAgoIso(1, 4),
    pages: 12,
    summary:
      'Renewal terms, service levels, and termination clauses for the Northwind contract.',
  },
  {
    id: 'doc-3',
    name: 'Sprint Planning Notes.txt',
    type: 'txt',
    sizeBytes: 42_000,
    status: 'indexed',
    uploadedAt: daysAgoIso(1, 2),
    summary:
      'Sprint goals, capacity notes, and action items captured during planning.',
  },
  {
    id: 'doc-4',
    name: 'Onboarding Checklist.pdf',
    type: 'pdf',
    sizeBytes: 860_000,
    status: 'indexed',
    uploadedAt: daysAgoIso(3),
    pages: 9,
    summary:
      'New hire onboarding steps, required accounts, and first-week checkpoints.',
  },
  {
    id: 'doc-5',
    name: 'API Design Notes.pdf',
    type: 'pdf',
    sizeBytes: 1_540_000,
    status: 'indexed',
    uploadedAt: daysAgoIso(4),
    pages: 22,
    summary:
      'Endpoint conventions, error shapes, and versioning decisions for the API.',
  },
  {
    id: 'doc-6',
    name: 'Research Interview Summary.txt',
    type: 'txt',
    sizeBytes: 28_000,
    status: 'indexed',
    uploadedAt: daysAgoIso(6),
    summary:
      'Themes from five customer interviews about document search and recall.',
  },
  {
    id: 'doc-7',
    name: 'Financial Summary FY26.pdf',
    type: 'pdf',
    sizeBytes: 3_220_000,
    status: 'processing',
    uploadedAt: daysAgoIso(0, 1),
    pages: 34,
    summary: 'Upload received. Indexing is still in progress in this prototype.',
  },
  {
    id: 'doc-8',
    name: 'Legacy Architecture Diagram.pdf',
    type: 'pdf',
    sizeBytes: 5_100_000,
    status: 'failed',
    uploadedAt: daysAgoIso(2),
    pages: 4,
    summary: 'Processing failed before the document could be indexed.',
  },
];
