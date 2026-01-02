import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return `KES ${amount.toLocaleString('en-KE')}`;
}

export function formatAmount(amount: number, showSign = false): string {
  const formatted = Math.abs(amount).toLocaleString('en-KE');
  if (showSign) {
    return amount >= 0 ? `+${formatted}` : `-${formatted}`;
  }
  return formatted;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-KE', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-KE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}
