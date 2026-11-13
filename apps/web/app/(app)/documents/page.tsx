import type { Metadata } from 'next';
import { DocumentsView } from '@/components/documents/documents-view';

export const metadata: Metadata = {
  title: 'Knowledge Base — DocuMind AI',
};

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  return <DocumentsView initialQuery={params.q ?? ''} />;
}
