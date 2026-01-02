// Formatting utilities for currency and dates

/**
 * Format amount in Kenyan Shillings
 * @param amount - Amount to format
 * @returns Formatted string like "KES 12,400"
 */
export function formatCurrency(amount: number): string {
  return `KES ${amount.toLocaleString('en-KE')}`;
}

/**
 * Format amount with sign for income/expense
 * @param amount - Amount to format (positive for income, negative for expense)
 * @returns Formatted string like "+KES 2,500" or "-KES 1,200"
 */
export function formatCurrencyWithSign(amount: number): string {
  const sign = amount >= 0 ? '+' : '';
  return `${sign}KES ${Math.abs(amount).toLocaleString('en-KE')}`;
}

/**
 * Format date for display
 * @param date - Date to format
 * @returns Formatted string like "Jan 15, 2026"
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-KE', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format time for display
 * @param date - Date to format
 * @returns Formatted string like "10:32 AM"
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-KE', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format date and time for display
 * @param date - Date to format
 * @returns Formatted string like "Jan 15, 2026 at 10:32 AM"
 */
export function formatDateTime(date: Date): string {
  return `${formatDate(date)} at ${formatTime(date)}`;
}

/**
 * Get relative date label (Today, Yesterday, or date)
 * @param date - Date to check
 * @returns "Today", "Yesterday", or formatted date
 */
export function getRelativeDateLabel(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameDay(date, today)) {
    return 'Today';
  }
  if (isSameDay(date, yesterday)) {
    return 'Yesterday';
  }
  return formatDate(date);
}

/**
 * Check if two dates are the same day
 */
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Format percentage with sign
 * @param value - Percentage value
 * @returns Formatted string like "+12%" or "-5%"
 */
export function formatPercentage(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(0)}%`;
}
