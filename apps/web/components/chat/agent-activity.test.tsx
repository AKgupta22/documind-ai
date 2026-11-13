import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AgentActivity } from '@/components/chat/agent-activity';
import { mockToolExecutions } from '@/mocks/agent';

describe('AgentActivity', () => {
  it('expands to show tool inputs and outputs', () => {
    render(<AgentActivity executions={mockToolExecutions} />);

    fireEvent.click(screen.getByRole('button', { name: /Agent activity/ }));

    expect(screen.getByText('search_documents')).toBeInTheDocument();
    expect(screen.getByText('summarize_document')).toBeInTheDocument();
    expect(screen.getByText('extract_action_items')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /search_documents/ }));

    expect(screen.getByText(/query: "Q3 launch timeline/)).toBeInTheDocument();
    expect(screen.getByText(/4 relevant passages found/)).toBeInTheDocument();
  });

  it('shows a safe error message for a failed execution', () => {
    render(<AgentActivity executions={mockToolExecutions} />);
    fireEvent.click(screen.getByRole('button', { name: /Agent activity/ }));

    expect(
      screen.getAllByText(/The document section was too large for this prototype pass/).length,
    ).toBeGreaterThan(0);
    expect(screen.getByText('Technical details')).toBeInTheDocument();
  });
});
