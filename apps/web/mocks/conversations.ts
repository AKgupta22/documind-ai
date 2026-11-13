// TODO: REMOVE MOCK — Replace with actual backend API response.
import type { ChatMessage, Conversation } from '@/lib/types';
import { daysAgoIso } from '@/lib/format';

export const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    title: 'Q3 launch timeline',
    preview: 'Milestones, owners, and the risks worth watching before launch.',
    updatedAt: daysAgoIso(0, 2),
    messages: [
      {
        id: 'msg-1-1',
        role: 'user',
        createdAt: daysAgoIso(0, 3),
        content: 'What is the launch timeline for Q3, and who owns each milestone?',
      },
      {
        id: 'msg-1-2',
        role: 'assistant',
        createdAt: daysAgoIso(0, 2),
        simulated: true,
        toolExecutionIds: ['exec-1', 'exec-2', 'exec-3'],
        blocks: [
          {
            type: 'paragraph',
            text: 'The launch plan is organized into three phases: beta, general availability, and post-launch follow-up. The simulated summary below is grounded in the mock source documents.',
          },
          { type: 'heading', text: 'Milestones' },
          {
            type: 'list',
            items: [
              'Beta readiness review — owned by Product, targeted for week 4.',
              'General availability — owned by Engineering, targeted for week 8.',
              'Post-launch follow-up — owned by Support and Customer Success, week 10.',
            ],
          },
          {
            type: 'paragraph',
            text: 'Three dependencies are called out explicitly: final vendor sign-off, the onboarding checklist refresh, and the support runbook.',
          },
        ],
        citations: [
          {
            id: 'cit-1',
            documentId: 'doc-1',
            documentName: 'Q3 Product Launch Plan.pdf',
            location: 'page 4',
            excerpt:
              'Mock excerpt: Beta readiness depends on vendor sign-off and a refreshed onboarding checklist.',
          },
          {
            id: 'cit-2',
            documentId: 'doc-3',
            documentName: 'Sprint Planning Notes.txt',
            location: 'section 2',
            excerpt:
              'Mock excerpt: The team flagged support capacity as the largest launch-week risk.',
          },
        ],
      },
      {
        id: 'msg-1-3',
        role: 'user',
        createdAt: daysAgoIso(0, 2),
        content: 'What are the biggest risks?',
      },
      {
        id: 'msg-1-4',
        role: 'assistant',
        createdAt: daysAgoIso(0, 1),
        simulated: true,
        blocks: [
          {
            type: 'list',
            items: [
              'Vendor sign-off may slip past the beta readiness review.',
              'Support coverage is thin during the launch week.',
              'The vendor agreement renewal window overlaps with general availability.',
            ],
          },
          {
            type: 'paragraph',
            text: 'This is a simulated answer for the wireframe. No model, retrieval, or tool execution actually ran.',
          },
        ],
        citations: [
          {
            id: 'cit-3',
            documentId: 'doc-2',
            documentName: 'Vendor Agreement — Northwind.pdf',
            location: 'page 7',
            excerpt:
              'Mock excerpt: The renewal window opens 14 days before general availability.',
          },
        ],
      },
    ],
  },
  {
    id: 'conv-2',
    title: 'Summarize the vendor agreement',
    preview: 'Renewal terms, service levels, and termination clauses at a glance.',
    updatedAt: daysAgoIso(0, 5),
    messages: [
      {
        id: 'msg-2-1',
        role: 'user',
        createdAt: daysAgoIso(0, 6),
        content: 'Summarize the key terms in the Northwind vendor agreement.',
      },
      {
        id: 'msg-2-2',
        role: 'assistant',
        createdAt: daysAgoIso(0, 5),
        simulated: true,
        toolExecutionIds: ['exec-2'],
        blocks: [
          {
            type: 'paragraph',
            text: 'The agreement covers a twelve-month term with an automatic renewal window, a 99.9% availability target, and a 30-day termination notice period.',
          },
          {
            type: 'list',
            items: [
              'Renewal notice: 14 days before the term ends.',
              'Service credit threshold: below 99.9% monthly availability.',
              'Termination: 30 days written notice for convenience.',
            ],
          },
        ],
        citations: [
          {
            id: 'cit-4',
            documentId: 'doc-2',
            documentName: 'Vendor Agreement — Northwind.pdf',
            location: 'page 3',
            excerpt:
              'Mock excerpt: Either party may terminate with thirty days written notice.',
          },
        ],
      },
    ],
  },
  {
    id: 'conv-3',
    title: 'Action items from sprint planning',
    preview: 'Owners and follow-ups captured in the planning notes.',
    updatedAt: daysAgoIso(1, 1),
    messages: [
      {
        id: 'msg-3-1',
        role: 'user',
        createdAt: daysAgoIso(1, 2),
        content: 'Extract the action items from the sprint planning notes.',
      },
      {
        id: 'msg-3-2',
        role: 'assistant',
        createdAt: daysAgoIso(1, 1),
        simulated: true,
        toolExecutionIds: ['exec-1', 'exec-3'],
        blocks: [
          { type: 'heading', text: 'Action items' },
          {
            type: 'list',
            items: [
              'Confirm the vendor sign-off date — Product, by Friday.',
              'Refresh the onboarding checklist — Documentation, next sprint.',
              'Add launch-week support coverage — Support, before beta.',
            ],
          },
          {
            type: 'paragraph',
            text: 'The action-item extraction step failed in this prototype, so the list above is illustrative mock content.',
          },
        ],
        citations: [
          {
            id: 'cit-5',
            documentId: 'doc-3',
            documentName: 'Sprint Planning Notes.txt',
            location: 'section 3',
            excerpt:
              'Mock excerpt: Confirm vendor sign-off before the beta readiness review.',
          },
        ],
      },
    ],
  },
  {
    id: 'conv-4',
    title: 'Compare onboarding documents',
    preview: 'Differences between the onboarding checklist and the team handbook.',
    updatedAt: daysAgoIso(3, 2),
    messages: [
      {
        id: 'msg-4-1',
        role: 'user',
        createdAt: daysAgoIso(3, 3),
        content: 'How does the onboarding checklist differ from the team handbook?',
      },
      {
        id: 'msg-4-2',
        role: 'assistant',
        createdAt: daysAgoIso(3, 2),
        simulated: true,
        blocks: [
          {
            type: 'paragraph',
            text: 'The checklist is task-oriented and covers accounts, access, and first-week checkpoints. The handbook focuses on team norms and long-term expectations.',
          },
          {
            type: 'list',
            items: [
              'Checklist: setup tasks with explicit owners.',
              'Handbook: culture, communication, and review expectations.',
              'Overlap: both documents describe the first-week check-in.',
            ],
          },
        ],
        citations: [
          {
            id: 'cit-6',
            documentId: 'doc-4',
            documentName: 'Onboarding Checklist.pdf',
            location: 'page 1',
            excerpt:
              'Mock excerpt: Complete account setup before the first-week check-in.',
          },
        ],
      },
    ],
  },
  {
    id: 'conv-5',
    title: 'API error response conventions',
    preview: 'How the API shapes errors and versioning decisions.',
    updatedAt: daysAgoIso(6, 4),
    messages: [
      {
        id: 'msg-5-1',
        role: 'user',
        createdAt: daysAgoIso(6, 5),
        content: 'What does the API design note say about error responses?',
      },
      {
        id: 'msg-5-2',
        role: 'assistant',
        createdAt: daysAgoIso(6, 4),
        simulated: true,
        blocks: [
          {
            type: 'paragraph',
            text: 'Errors use a stable envelope with a code, a human-readable message, and an optional request identifier. Internal details stay out of the response body.',
          },
          {
            type: 'code',
            language: 'json',
            code: '{\n  "error": {\n    "code": "not_found",\n    "message": "The requested resource does not exist."\n  }\n}',
          },
        ],
        citations: [
          {
            id: 'cit-7',
            documentId: 'doc-5',
            documentName: 'API Design Notes.pdf',
            location: 'page 11',
            excerpt:
              'Mock excerpt: Never return stack traces or internal identifiers to clients.',
          },
        ],
      },
    ],
  },
];

export function getConversationById(conversationId: string): Conversation | undefined {
  return mockConversations.find((conversation) => conversation.id === conversationId);
}

export function createSimulatedReply(question: string, messageId: string): ChatMessage {
  // TODO: REMOVE MOCK — Replace simulated behaviour with backend integration.
  const trimmed = question.trim().slice(0, 160);

  return {
    id: messageId,
    role: 'assistant',
    createdAt: new Date().toISOString(),
    simulated: true,
    toolExecutionIds: ['exec-1'],
    blocks: [
      {
        type: 'paragraph',
        text: `This is a simulated answer for: “${trimmed}”. It is generated from fixed prototype data, not a language model.`,
      },
      { type: 'heading', text: 'What the prototype would show' },
      {
        type: 'list',
        items: [
          'A grounded summary with inline citations.',
          'Expandable agent activity for each tool step.',
          'A path to inspect the cited source document.',
        ],
      },
      {
        type: 'paragraph',
        text: 'Connect a real retrieval and model pipeline to replace this placeholder.',
      },
    ],
    citations: [
      {
        id: `cit-simulated-${messageId}`,
        documentId: 'doc-1',
        documentName: 'Q3 Product Launch Plan.pdf',
        location: 'page 4',
        excerpt:
          'Mock excerpt: Launch readiness depends on vendor sign-off and support coverage.',
      },
    ],
  };
}
