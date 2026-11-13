// TODO: REMOVE MOCK — Replace with actual backend API response.
import type { ToolExecution } from '@/lib/types';

export const mockToolExecutions: ToolExecution[] = [
  {
    id: 'exec-1',
    tool: 'search_documents',
    status: 'succeeded',
    description: 'Searched the knowledge base for launch milestones.',
    durationMs: 1_180,
    input: 'query: "Q3 launch timeline and milestone owners"\nscope: all indexed documents',
    output:
      '4 relevant passages found in Q3 Product Launch Plan.pdf and Sprint Planning Notes.txt.',
  },
  {
    id: 'exec-2',
    tool: 'summarize_document',
    status: 'succeeded',
    description: 'Summarized the launch plan sections covering milestones.',
    durationMs: 2_420,
    input: 'document: Q3 Product Launch Plan.pdf\nsections: 2–4',
    output:
      'Milestones are grouped into beta, general availability, and post-launch follow-up. The summary highlights three dependencies and two unresolved risks.',
  },
  {
    id: 'exec-3',
    tool: 'extract_action_items',
    status: 'failed',
    description: 'Could not produce a structured action list for the full document.',
    durationMs: 940,
    input: 'document: Q3 Product Launch Plan.pdf\nformat: checklist',
    output: 'No structured output was returned.',
    error:
      'The document section was too large for this prototype pass. Try a smaller section and run the step again.',
  },
];

export function getToolExecutions(ids: string[]): ToolExecution[] {
  return ids
    .map((id) => mockToolExecutions.find((execution) => execution.id === id))
    .filter((execution): execution is ToolExecution => execution !== undefined);
}
