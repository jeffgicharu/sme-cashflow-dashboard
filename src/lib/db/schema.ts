import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  uuid,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const transactionTypeEnum = pgEnum('transaction_type', [
  'income',
  'expense',
]);
export const transactionSourceEnum = pgEnum('transaction_source', [
  'mpesa',
  'manual',
]);
export const frequencyEnum = pgEnum('frequency', [
  'weekly',
  'monthly',
  'custom',
]);

// Users table (synced with Clerk)
export const users = pgTable('users', {
  id: text('id').primaryKey(), // Clerk user ID
  email: text('email').notNull(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Categories table
export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }), // null for default categories
  name: text('name').notNull(),
  icon: text('icon'),
  color: text('color').notNull(),
  isDefault: boolean('is_default').default(false).notNull(),
  isIncome: boolean('is_income').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Transactions table
export const transactions = pgTable('transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  amount: integer('amount').notNull(), // Store in cents/smallest unit
  type: transactionTypeEnum('type').notNull(),
  source: transactionSourceEnum('source').notNull(),
  categoryId: uuid('category_id').references(() => categories.id, {
    onDelete: 'set null',
  }),
  description: text('description'),
  reference: text('reference'), // M-Pesa transaction reference
  senderName: text('sender_name'),
  senderPhone: text('sender_phone'),
  isRecurring: boolean('is_recurring').default(false).notNull(),
  isPersonal: boolean('is_personal').default(false).notNull(),
  date: timestamp('date').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Category rules table (for auto-categorization)
export const categoryRules = pgTable('category_rules', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  senderIdentifier: text('sender_identifier').notNull(), // Phone number or name
  categoryId: uuid('category_id')
    .references(() => categories.id, { onDelete: 'cascade' })
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Recurring transactions table
export const recurringTransactions = pgTable('recurring_transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  transactionId: uuid('transaction_id')
    .references(() => transactions.id, { onDelete: 'cascade' })
    .notNull(),
  frequency: frequencyEnum('frequency').notNull(),
  expectedAmount: integer('expected_amount').notNull(),
  nextOccurrence: timestamp('next_occurrence').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// User settings table
export const userSettings = pgTable('user_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  businessName: text('business_name').notNull(),
  tillNumber: text('till_number'),
  lowBalanceThreshold: integer('low_balance_threshold').default(5000).notNull(),
  pushNotificationsEnabled: boolean('push_notifications_enabled')
    .default(true)
    .notNull(),
  emailAlertsEnabled: boolean('email_alerts_enabled').default(false).notNull(),
  onboardingCompleted: boolean('onboarding_completed').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  transactions: many(transactions),
  categories: many(categories),
  categoryRules: many(categoryRules),
  recurringTransactions: many(recurringTransactions),
  settings: one(userSettings),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, {
    fields: [categories.userId],
    references: [users.id],
  }),
  transactions: many(transactions),
  rules: many(categoryRules),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id],
  }),
}));

export const categoryRulesRelations = relations(categoryRules, ({ one }) => ({
  user: one(users, {
    fields: [categoryRules.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [categoryRules.categoryId],
    references: [categories.id],
  }),
}));

export const recurringTransactionsRelations = relations(
  recurringTransactions,
  ({ one }) => ({
    user: one(users, {
      fields: [recurringTransactions.userId],
      references: [users.id],
    }),
    transaction: one(transactions, {
      fields: [recurringTransactions.transactionId],
      references: [transactions.id],
    }),
  })
);

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.userId],
    references: [users.id],
  }),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;

export type CategoryRule = typeof categoryRules.$inferSelect;
export type NewCategoryRule = typeof categoryRules.$inferInsert;

export type RecurringTransaction = typeof recurringTransactions.$inferSelect;
export type NewRecurringTransaction = typeof recurringTransactions.$inferInsert;

export type UserSettings = typeof userSettings.$inferSelect;
export type NewUserSettings = typeof userSettings.$inferInsert;
