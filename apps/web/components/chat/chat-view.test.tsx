import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ChatView } from '@/components/chat/chat-view';

describe('ChatView', () => {
  it('fills the composer from a suggested prompt and renders a simulated reply', async () => {
    render(<ChatView />);

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Summarize the Q3 launch plan and its milestones.',
      }),
    );

    const composer = screen.getByLabelText('Message DocuMind') as HTMLTextAreaElement;
    expect(composer.value).toBe('Summarize the Q3 launch plan and its milestones.');

    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));

    expect(
      screen.getByText('Summarize the Q3 launch plan and its milestones.'),
    ).toBeInTheDocument();

    expect(
      await screen.findByText(/This is a simulated answer for/, {}, { timeout: 3000 }),
    ).toBeInTheDocument();
    expect(screen.getByText('Agent activity')).toBeInTheDocument();
    expect(screen.getByText('Simulated')).toBeInTheDocument();
    expect(screen.getByText('Sources')).toBeInTheDocument();
  });

  it('renders an existing mock conversation with citations', () => {
    render(
      <ChatView
        conversation={{
          id: 'conv-test',
          title: 'Test conversation',
          preview: 'Preview',
          updatedAt: new Date().toISOString(),
          messages: [
            {
              id: 'msg-user',
              role: 'user',
              createdAt: new Date().toISOString(),
              content: 'What is the timeline?',
            },
            {
              id: 'msg-assistant',
              role: 'assistant',
              createdAt: new Date().toISOString(),
              simulated: true,
              blocks: [{ type: 'paragraph', text: 'A simulated answer.' }],
              citations: [
                {
                  id: 'cit-test',
                  documentId: 'doc-1',
                  documentName: 'Q3 Product Launch Plan.pdf',
                  location: 'page 4',
                  excerpt: 'Mock excerpt',
                },
              ],
            },
          ],
        }}
      />,
    );

    expect(screen.getByText('Test conversation')).toBeInTheDocument();
    expect(screen.getByText('What is the timeline?')).toBeInTheDocument();
    expect(screen.getByText('A simulated answer.')).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: /Open source 1: Q3 Product Launch Plan.pdf, page 4/,
      }),
    ).toBeInTheDocument();
  });
});
