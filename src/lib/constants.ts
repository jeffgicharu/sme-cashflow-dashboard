// App constants

export const APP_NAME = 'SME Cash Flow Dashboard';

export const DEFAULT_LOW_BALANCE_THRESHOLD = 5000;

export const DEFAULT_CATEGORIES = [
  { name: 'Revenue', icon: 'TrendingUp', color: 'green-500', isIncome: true },
  { name: 'Other Income', icon: 'Wallet', color: 'teal-500', isIncome: true },
  {
    name: 'Inventory/Stock',
    icon: 'Package',
    color: 'violet-500',
    isIncome: false,
  },
  {
    name: 'Delivery/Transport',
    icon: 'Truck',
    color: 'sky-500',
    isIncome: false,
  },
  {
    name: 'Operating Expenses',
    icon: 'Building',
    color: 'orange-500',
    isIncome: false,
  },
  { name: 'Marketing', icon: 'Megaphone', color: 'pink-500', isIncome: false },
  {
    name: 'Personal/Owner Drawings',
    icon: 'User',
    color: 'rose-500',
    isIncome: false,
  },
  { name: 'Other', icon: 'HelpCircle', color: 'gray-500', isIncome: false },
] as const;

export const TRANSACTION_FILTERS = [
  'all',
  'income',
  'expense',
  'uncategorized',
] as const;

export const DATE_RANGES = ['today', 'week', 'month', 'custom'] as const;

export const FREQUENCIES = ['weekly', 'monthly', 'custom'] as const;

export const PROJECTION_DAYS = 30;

export const PROJECTION_STATUS = {
  HEALTHY: 14, // More than 14 days runway
  WARNING: 7, // 7-14 days runway
  CRITICAL: 0, // Less than 7 days runway
} as const;
