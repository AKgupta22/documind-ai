export type DocumentStatus = 'indexed' | 'processing' | 'failed';

export type DocumentType = 'pdf' | 'txt';

export interface DocumentRecord {
  id: string;
  name: string;
  type: DocumentType;
  sizeBytes: number;
  status: DocumentStatus;
  uploadedAt: string;
  pages?: number;
  summary: string;
}

export type ToolName =
  | 'search_documents'
  | 'summarize_document'
  | 'extract_action_items';

export type ToolStatus = 'pending' | 'running' | 'succeeded' | 'failed' | 'cancelled';

export interface ToolExecution {
  id: string;
  tool: ToolName;
  status: ToolStatus;
  description: string;
  durationMs: number;
  input: string;
  output: string;
  error?: string;
}

export interface Citation {
  id: string;
  documentId: string;
  documentName: string;
  location: string;
  excerpt: string;
}

export type MessageBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'code'; language: string; code: string };

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  createdAt: string;
  content?: string;
  blocks?: MessageBlock[];
  citations?: Citation[];
  toolExecutionIds?: string[];
  simulated?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  preview: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export interface DashboardStats {
  documentCount: number;
  conversationCount: number;
  storageBytes: number;
  storageQuotaBytes: number;
}
