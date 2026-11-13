'use client';

import { FileSearch, ListChecks, MessageSquare, Scale } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const SUGGESTED_PROMPTS = [
  {
    icon: FileSearch,
    label: 'Summarize the Q3 launch plan and its milestones.',
  },
  {
    icon: Scale,
    label: 'Compare the onboarding checklist with the team handbook.',
  },
  {
    icon: ListChecks,
    label: 'Extract action items from the sprint planning notes.',
  },
  {
    icon: MessageSquare,
    label: 'What risks does the vendor agreement mention?',
  },
];

interface ChatEmptyStateProps {
  onSelectPrompt: (prompt: string) => void;
}

export function ChatEmptyState({ onSelectPrompt }: ChatEmptyStateProps) {
  return (
    <div className="flex flex-col gap-6 py-4">
      <div className="text-center">
        <h2 className="type-title">Ask your documents anything</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-foreground-secondary">
          DocuMind searches your knowledge base, summarizes sources, and shows the agent
          steps behind each answer.
        </p>
        {/* TODO: REMOVE MOCK — Replace with actual application data. */}
        <Badge variant="secondary" className="mt-3">
          Prototype responses are simulated
        </Badge>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-foreground-secondary">Suggested prompts</p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {SUGGESTED_PROMPTS.map((prompt) => {
            const Icon = prompt.icon;
            return (
              <li key={prompt.label}>
                <button
                  type="button"
                  onClick={() => onSelectPrompt(prompt.label)}
                  className="flex h-full w-full items-start gap-2.5 rounded-lg border border-border bg-surface p-3 text-left text-sm text-foreground-secondary transition-colors hover:border-border-strong hover:bg-surface-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                  <span>{prompt.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
