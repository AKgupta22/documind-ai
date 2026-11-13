import type { Metadata } from 'next';
import Link from 'next/link';
import { ChatView } from '@/components/chat/chat-view';
import { PageContainer } from '@/components/shared/page-container';
import { Button } from '@/components/ui/button';
// TODO: REMOVE MOCK — Replace with actual backend API response.
import { getConversationById } from '@/mocks/conversations';

export const metadata: Metadata = {
  title: 'Chat — DocuMind AI',
};

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  const conversation = getConversationById(conversationId);

  if (!conversation) {
    return (
      <PageContainer className="flex flex-col items-start gap-4">
        <h1 className="type-title">Conversation not found</h1>
        <p className="text-sm text-foreground-secondary">
          This prototype does not have a conversation with that identifier.
        </p>
        <Button asChild>
          <Link href="/chat">Start a new conversation</Link>
        </Button>
      </PageContainer>
    );
  }

  return <ChatView key={conversation.id} conversation={conversation} />;
}
