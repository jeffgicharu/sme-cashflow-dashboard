import { describe, it, expect } from 'vitest';
import {
  addTransactionSchema,
  updateTransactionSchema,
  createCategoryRuleSchema,
} from './transaction';

describe('addTransactionSchema', () => {
  const validInput = {
    type: 'income' as const,
    amount: 1000,
    date: new Date(),
    categoryId: 'cat-123',
    description: 'Test transaction',
    isRecurring: false,
  };

  it('validates correct income transaction', () => {
    const result = addTransactionSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('validates correct expense transaction', () => {
    const result = addTransactionSchema.safeParse({
      ...validInput,
      type: 'expense',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid transaction type', () => {
    const result = addTransactionSchema.safeParse({
      ...validInput,
      type: 'invalid',
    });
    expect(result.success).toBe(false);
  });

  it('rejects zero amount', () => {
    const result = addTransactionSchema.safeParse({
      ...validInput,
      amount: 0,
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative amount', () => {
    const result = addTransactionSchema.safeParse({
      ...validInput,
      amount: -100,
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty categoryId', () => {
    const result = addTransactionSchema.safeParse({
      ...validInput,
      categoryId: '',
    });
    expect(result.success).toBe(false);
  });

  it('allows optional description', () => {
    const { description: _unused, ...inputWithoutDescription } = validInput;
    void _unused; // Suppress unused variable warning
    const result = addTransactionSchema.safeParse(inputWithoutDescription);
    expect(result.success).toBe(true);
  });

  it('rejects description over 200 characters', () => {
    const result = addTransactionSchema.safeParse({
      ...validInput,
      description: 'a'.repeat(201),
    });
    expect(result.success).toBe(false);
  });

  it('accepts recurring transaction with frequency', () => {
    const result = addTransactionSchema.safeParse({
      ...validInput,
      isRecurring: true,
      frequency: 'monthly',
    });
    expect(result.success).toBe(true);
  });

  it('validates weekly frequency', () => {
    const result = addTransactionSchema.safeParse({
      ...validInput,
      isRecurring: true,
      frequency: 'weekly',
    });
    expect(result.success).toBe(true);
  });
});

describe('updateTransactionSchema', () => {
  it('validates empty update (all optional)', () => {
    const result = updateTransactionSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('validates categoryId update', () => {
    const result = updateTransactionSchema.safeParse({
      categoryId: 'new-category-id',
    });
    expect(result.success).toBe(true);
  });

  it('validates isRecurring update', () => {
    const result = updateTransactionSchema.safeParse({
      isRecurring: true,
      frequency: 'monthly',
    });
    expect(result.success).toBe(true);
  });

  it('validates isPersonal update', () => {
    const result = updateTransactionSchema.safeParse({
      isPersonal: true,
    });
    expect(result.success).toBe(true);
  });

  it('validates expectedAmount update', () => {
    const result = updateTransactionSchema.safeParse({
      expectedAmount: 5000,
    });
    expect(result.success).toBe(true);
  });

  it('rejects non-positive expectedAmount', () => {
    const result = updateTransactionSchema.safeParse({
      expectedAmount: 0,
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty categoryId', () => {
    const result = updateTransactionSchema.safeParse({
      categoryId: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('createCategoryRuleSchema', () => {
  const validInput = {
    transactionId: 'tx-123',
    categoryId: 'cat-456',
    senderIdentifier: '+254712345678',
  };

  it('validates correct input', () => {
    const result = createCategoryRuleSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('rejects empty transactionId', () => {
    const result = createCategoryRuleSchema.safeParse({
      ...validInput,
      transactionId: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty categoryId', () => {
    const result = createCategoryRuleSchema.safeParse({
      ...validInput,
      categoryId: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty senderIdentifier', () => {
    const result = createCategoryRuleSchema.safeParse({
      ...validInput,
      senderIdentifier: '',
    });
    expect(result.success).toBe(false);
  });
});
