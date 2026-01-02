import { z } from 'zod';

export const addTransactionSchema = z.object({
  type: z.enum(['income', 'expense'], {
    message: 'Please select a transaction type',
  }),
  amount: z
    .number({
      message: 'Amount must be a number',
    })
    .positive('Amount must be greater than 0'),
  date: z.date({
    message: 'Date is required',
  }),
  categoryId: z
    .string({
      message: 'Please select a category',
    })
    .min(1, 'Please select a category'),
  description: z
    .string()
    .max(200, 'Description must be less than 200 characters')
    .optional(),
  isRecurring: z.boolean().default(false),
  frequency: z.enum(['weekly', 'monthly', 'custom']).optional(),
});

export const updateTransactionSchema = z.object({
  categoryId: z.string().min(1).optional(),
  isRecurring: z.boolean().optional(),
  frequency: z.enum(['weekly', 'monthly', 'custom']).optional(),
  expectedAmount: z.number().positive().optional(),
  isPersonal: z.boolean().optional(),
});

export const createCategoryRuleSchema = z.object({
  transactionId: z.string().min(1),
  categoryId: z.string().min(1),
  senderIdentifier: z.string().min(1),
});

export type AddTransactionInput = z.infer<typeof addTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type CreateCategoryRuleInput = z.infer<typeof createCategoryRuleSchema>;
