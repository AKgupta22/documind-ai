import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DocumentsView } from '@/components/documents/documents-view';

describe('DocumentsView', () => {
  it('renders the mock document list', () => {
    render(<DocumentsView />);
    expect(screen.getByText('Q3 Product Launch Plan.pdf')).toBeInTheDocument();
    expect(screen.getByText('Legacy Architecture Diagram.pdf')).toBeInTheDocument();
    expect(screen.getByText('8 documents shown')).toBeInTheDocument();
  });

  it('filters by search text', () => {
    render(<DocumentsView />);
    fireEvent.change(screen.getByLabelText('Search documents'), {
      target: { value: 'vendor' },
    });

    expect(screen.getByText('Vendor Agreement — Northwind.pdf')).toBeInTheDocument();
    expect(screen.queryByText('Q3 Product Launch Plan.pdf')).not.toBeInTheDocument();
    expect(screen.getByText('1 document shown')).toBeInTheDocument();
  });

  it('filters by status', () => {
    render(<DocumentsView />);
    fireEvent.change(screen.getByLabelText('Status'), {
      target: { value: 'failed' },
    });

    expect(screen.getByText('Legacy Architecture Diagram.pdf')).toBeInTheDocument();
    expect(screen.queryByText('Q3 Product Launch Plan.pdf')).not.toBeInTheDocument();
  });

  it('shows the no-results empty state and clears filters', () => {
    render(<DocumentsView />);
    fireEvent.change(screen.getByLabelText('Search documents'), {
      target: { value: 'no-such-document' },
    });

    expect(screen.getByText('No matching documents')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }));

    expect(screen.getByText('Q3 Product Launch Plan.pdf')).toBeInTheDocument();
  });
});
