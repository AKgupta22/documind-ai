// TODO: REMOVE MOCK — Replace with actual backend API response.
import type { DashboardStats, DocumentRecord, Conversation } from '@/lib/types';
import { mockDocuments } from '@/mocks/documents';
import { mockConversations } from '@/mocks/conversations';

export const STORAGE_QUOTA_BYTES = 100 * 1024 * 1024;

export function deriveDashboardStats(
  documents: DocumentRecord[] = mockDocuments,
  conversations: Conversation[] = mockConversations,
): DashboardStats {
  return {
    documentCount: documents.length,
    conversationCount: conversations.length,
    storageBytes: documents.reduce((total, document) => total + document.sizeBytes, 0),
    storageQuotaBytes: STORAGE_QUOTA_BYTES,
  };
}

export function getRecentDocuments(limit = 4): DocumentRecord[] {
  return [...mockDocuments]
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
    .slice(0, limit);
}

export function getRecentConversations(limit = 4): Conversation[] {
  return [...mockConversations]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, limit);
}
