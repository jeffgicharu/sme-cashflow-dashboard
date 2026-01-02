// Type definitions for the SME Cash Flow Dashboard

export type TransactionType = 'income' | 'expense';

export type TransactionSource = 'mpesa' | 'manual';

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: TransactionType;
  source: TransactionSource;
  categoryId: string | null;
  description: string | null;
  reference: string | null;
  senderName: string | null;
  senderPhone: string | null;
  isRecurring: boolean;
  isPersonal: boolean;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  userId: string | null; // null for default categories
  name: string;
  icon: string | null;
  color: string;
  isDefault: boolean;
  createdAt: Date;
}

export interface CategoryRule {
  id: string;
  userId: string;
  senderIdentifier: string;
  categoryId: string;
  createdAt: Date;
}

export interface UserSettings {
  id: string;
  userId: string;
  businessName: string;
  tillNumber: string | null;
  lowBalanceThreshold: number;
  pushNotificationsEnabled: boolean;
  emailAlertsEnabled: boolean;
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecurringTransaction {
  id: string;
  userId: string;
  transactionId: string;
  frequency: 'weekly' | 'monthly' | 'custom';
  expectedAmount: number;
  nextOccurrence: Date;
  createdAt: Date;
}
