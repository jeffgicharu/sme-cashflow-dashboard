import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BalanceCard } from './balance-card';

describe('BalanceCard', () => {
  it('displays formatted balance', () => {
    render(<BalanceCard balance={12400} todayChange={0} />);
    expect(screen.getByText('KES 12,400')).toBeInTheDocument();
  });

  it('displays "Current Balance" label', () => {
    render(<BalanceCard balance={12400} todayChange={0} />);
    expect(screen.getByText('Current Balance')).toBeInTheDocument();
  });

  it('shows positive change with green styling and up arrow', () => {
    render(<BalanceCard balance={50000} todayChange={5000} />);
    const changeText = screen.getByText(/\+5,000 today/);
    expect(changeText).toBeInTheDocument();
    expect(changeText).toHaveClass('text-green-600');
  });

  it('shows negative change with red styling and down arrow', () => {
    render(<BalanceCard balance={50000} todayChange={-3000} />);
    const changeText = screen.getByText(/-3,000 today/);
    expect(changeText).toBeInTheDocument();
    expect(changeText).toHaveClass('text-red-600');
  });

  it('treats zero change as positive', () => {
    render(<BalanceCard balance={50000} todayChange={0} />);
    const changeText = screen.getByText(/\+0 today/);
    expect(changeText).toHaveClass('text-green-600');
  });

  it('handles large balance amounts', () => {
    render(<BalanceCard balance={1234567} todayChange={0} />);
    expect(screen.getByText('KES 1,234,567')).toBeInTheDocument();
  });

  it('handles negative balance', () => {
    render(<BalanceCard balance={-5000} todayChange={-1000} />);
    expect(screen.getByText('KES -5,000')).toBeInTheDocument();
  });
});
