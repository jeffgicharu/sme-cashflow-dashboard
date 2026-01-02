import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { categories } from '../src/lib/db/schema';

// Default categories for Kenyan SME/M-Pesa business
const defaultCategories = [
  // Income categories
  {
    name: 'Sales',
    icon: 'shopping-bag',
    color: '#10B981', // Green
    isDefault: true,
    isIncome: true,
  },
  {
    name: 'Refunds Received',
    icon: 'rotate-ccw',
    color: '#06B6D4', // Cyan
    isDefault: true,
    isIncome: true,
  },
  {
    name: 'Other Income',
    icon: 'plus-circle',
    color: '#8B5CF6', // Purple
    isDefault: true,
    isIncome: true,
  },

  // Expense categories
  {
    name: 'Inventory/Stock',
    icon: 'package',
    color: '#F59E0B', // Amber
    isDefault: true,
    isIncome: false,
  },
  {
    name: 'Transport/Delivery',
    icon: 'truck',
    color: '#3B82F6', // Blue
    isDefault: true,
    isIncome: false,
  },
  {
    name: 'Airtime/Data',
    icon: 'smartphone',
    color: '#EF4444', // Red
    isDefault: true,
    isIncome: false,
  },
  {
    name: 'Marketing',
    icon: 'megaphone',
    color: '#EC4899', // Pink
    isDefault: true,
    isIncome: false,
  },
  {
    name: 'Personal',
    icon: 'user',
    color: '#6366F1', // Indigo
    isDefault: true,
    isIncome: false,
  },
  {
    name: 'Rent',
    icon: 'home',
    color: '#14B8A6', // Teal
    isDefault: true,
    isIncome: false,
  },
  {
    name: 'Utilities',
    icon: 'zap',
    color: '#F97316', // Orange
    isDefault: true,
    isIncome: false,
  },
  {
    name: 'Supplies',
    icon: 'box',
    color: '#84CC16', // Lime
    isDefault: true,
    isIncome: false,
  },
  {
    name: 'Other Expenses',
    icon: 'more-horizontal',
    color: '#64748B', // Slate
    isDefault: true,
    isIncome: false,
  },
];

async function seed() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  console.warn('Seeding database...');

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql);

  // Insert default categories (userId is null for defaults)
  console.warn('Inserting default categories...');

  for (const category of defaultCategories) {
    await db.insert(categories).values({
      name: category.name,
      icon: category.icon,
      color: category.color,
      isDefault: category.isDefault,
      isIncome: category.isIncome,
      userId: null, // Default categories have no user
    });
    console.warn(`  Added: ${category.name}`);
  }

  console.warn('Seeding complete!');
}

seed().catch((error) => {
  console.error('Error seeding database:', error);
  process.exit(1);
});
