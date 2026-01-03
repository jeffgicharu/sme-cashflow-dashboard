import { describe, it, expect } from 'vitest';
import {
  cn,
  formatCurrency,
  formatAmount,
  formatDate,
  formatTime,
} from './utils';

describe('cn', () => {
  it('merges class names correctly', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2');
  });

  it('handles conditional classes', () => {
    expect(cn('px-4', false && 'py-2', 'text-red-500')).toBe(
      'px-4 text-red-500'
    );
  });

  it('merges conflicting tailwind classes', () => {
    expect(cn('px-4', 'px-2')).toBe('px-2');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('handles undefined and null values', () => {
    expect(cn('px-4', undefined, null, 'py-2')).toBe('px-4 py-2');
  });
});

describe('formatCurrency', () => {
  it('formats positive amounts with KES prefix', () => {
    expect(formatCurrency(1000)).toBe('KES 1,000');
    expect(formatCurrency(12345)).toBe('KES 12,345');
    expect(formatCurrency(1234567)).toBe('KES 1,234,567');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('KES 0');
  });

  it('formats decimal amounts', () => {
    const result = formatCurrency(1234.56);
    expect(result).toMatch(/KES 1,234/);
  });

  it('formats negative amounts', () => {
    expect(formatCurrency(-1000)).toBe('KES -1,000');
  });
});

describe('formatAmount', () => {
  it('formats amounts without sign by default', () => {
    expect(formatAmount(1000)).toBe('1,000');
    expect(formatAmount(-1000)).toBe('1,000');
  });

  it('shows sign when requested', () => {
    expect(formatAmount(1000, true)).toBe('+1,000');
    expect(formatAmount(-1000, true)).toBe('-1,000');
  });

  it('handles zero', () => {
    expect(formatAmount(0)).toBe('0');
    expect(formatAmount(0, true)).toBe('+0');
  });

  it('formats large numbers with commas', () => {
    expect(formatAmount(1234567)).toBe('1,234,567');
    expect(formatAmount(1234567, true)).toBe('+1,234,567');
  });
});

describe('formatDate', () => {
  it('formats date in short format', () => {
    const date = new Date('2025-01-15');
    const result = formatDate(date);
    // Should contain month, day, and year
    expect(result).toMatch(/Jan/);
    expect(result).toMatch(/15/);
    expect(result).toMatch(/2025/);
  });

  it('handles different months', () => {
    const dates = [
      { date: new Date('2025-03-20'), expected: /Mar/ },
      { date: new Date('2025-12-25'), expected: /Dec/ },
      { date: new Date('2025-07-04'), expected: /Jul/ },
    ];

    dates.forEach(({ date, expected }) => {
      expect(formatDate(date)).toMatch(expected);
    });
  });
});

describe('formatTime', () => {
  it('formats time in 24-hour format', () => {
    const date = new Date('2025-01-15T14:30:00');
    const result = formatTime(date);
    expect(result).toBe('14:30');
  });

  it('handles midnight', () => {
    const date = new Date('2025-01-15T00:00:00');
    const result = formatTime(date);
    expect(result).toBe('00:00');
  });

  it('handles noon', () => {
    const date = new Date('2025-01-15T12:00:00');
    const result = formatTime(date);
    expect(result).toBe('12:00');
  });

  it('handles single digit minutes', () => {
    const date = new Date('2025-01-15T09:05:00');
    const result = formatTime(date);
    expect(result).toBe('09:05');
  });
});
