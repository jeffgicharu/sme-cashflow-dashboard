import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TransactionRow } from './transaction-row';

describe('TransactionRow', () => {
  const baseProps = {
    id: 'tx-123',
    amount: 5000,
    type: 'income' as const,
    source: 'mpesa' as const,
    senderName: 'John Doe',
    date: new Date('2025-01-15T14:30:00'),
  };

  it('displays sender name', () => {
    render(<TransactionRow {...baseProps} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('displays description when senderName is not provided', () => {
    render(
      <TransactionRow
        {...baseProps}
        senderName={null}
        description="Office supplies"
      />
    );
    expect(screen.getByText('Office supplies')).toBeInTheDocument();
  });

  it('displays "Unknown" when neither senderName nor description', () => {
    render(
      <TransactionRow {...baseProps} senderName={null} description={null} />
    );
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });

  it('shows income with green color and plus sign', () => {
    render(<TransactionRow {...baseProps} type="income" />);
    const amount = screen.getByText(/\+5,000/);
    expect(amount).toHaveClass('text-green-600');
  });

  it('shows expense with red color and minus sign', () => {
    render(<TransactionRow {...baseProps} type="expense" />);
    const amount = screen.getByText(/-5,000/);
    expect(amount).toHaveClass('text-red-600');
  });

  it('displays category badge when category is provided', () => {
    render(
      <TransactionRow
        {...baseProps}
        categoryName="Sales"
        categoryColor="#10b981"
      />
    );
    expect(screen.getByText('Sales')).toBeInTheDocument();
  });

  it('displays "Uncategorized" when no category', () => {
    render(
      <TransactionRow {...baseProps} categoryName={null} categoryColor={null} />
    );
    expect(screen.getByText('Uncategorized')).toBeInTheDocument();
  });

  it('displays formatted time', () => {
    render(<TransactionRow {...baseProps} />);
    expect(screen.getByText('14:30')).toBeInTheDocument();
  });

  it('links to transaction detail page', () => {
    render(<TransactionRow {...baseProps} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/transactions/tx-123');
  });

  it('handles M-Pesa source', () => {
    render(<TransactionRow {...baseProps} source="mpesa" />);
    // M-Pesa shows smartphone icon - just verify component renders
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('handles manual source', () => {
    render(<TransactionRow {...baseProps} source="manual" />);
    // Manual shows pen icon - just verify component renders
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('formats large amounts correctly', () => {
    render(<TransactionRow {...baseProps} amount={1234567} />);
    expect(screen.getByText(/1,234,567/)).toBeInTheDocument();
  });
});
