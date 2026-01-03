import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import {
  transactions,
  categories,
  userSettings,
  categoryRules,
} from '../src/lib/db/schema';

// Realistic Kenyan names for M-Pesa transactions
const customerNames = [
  'JOHN KAMAU',
  'MARY WANJIKU',
  'PETER OCHIENG',
  'GRACE MUTHONI',
  'DAVID KIPCHOGE',
  'FAITH AKINYI',
  'SAMUEL MWANGI',
  'ESTHER NJERI',
  'JAMES OTIENO',
  'LUCY WAMBUI',
  'MICHAEL KIBET',
  'ANNE CHEBET',
  'JOSEPH MUTUA',
  'SARAH NAFULA',
  'DANIEL KORIR',
  'CAROLINE ACHIENG',
  'PATRICK NJOROGE',
  'BEATRICE KEMUNTO',
  'GEORGE WAFULA',
  'JOYCE MORAA',
];

const supplierNames = [
  'MAMA LUCY WHOLESALE',
  'NAIROBI TRADERS LTD',
  'QUICK DELIVERY SERVICES',
  'SAFARICOM PLC',
  'KENYA POWER',
  'MOMBASA IMPORTS',
  'EASTLEIGH SUPPLIERS',
  'GIKOMBA MARKET',
  'KARIUKI HARDWARE',
  'DOWNTOWN LOGISTICS',
];

// Generate realistic phone numbers
function generatePhone(): string {
  const prefixes = ['0722', '0733', '0712', '0723', '0734', '0700', '0710'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = Math.floor(Math.random() * 900000 + 100000);
  return `${prefix}${suffix}`;
}

// Generate M-Pesa reference
function generateReference(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let ref = '';
  for (let i = 0; i < 10; i++) {
    ref += chars[Math.floor(Math.random() * chars.length)];
  }
  return ref;
}

// Get random amount in range
function randomAmount(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// Get random date in past N days
function randomDate(daysAgo: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  date.setHours(
    Math.floor(Math.random() * 12) + 7, // 7 AM to 7 PM
    Math.floor(Math.random() * 60),
    Math.floor(Math.random() * 60)
  );
  return date;
}

async function seedDemoData() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  console.log('🌱 Seeding demo data...\n');

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql);

  // Get the first user from userSettings (the user who completed onboarding)
  const users = await db.select().from(userSettings).limit(1);

  if (users.length === 0) {
    console.error('❌ No users found. Please complete onboarding first.');
    process.exit(1);
  }

  const userId = users[0].userId;
  console.log(`📧 Found user: ${userId}`);
  console.log(`🏪 Business: ${users[0].businessName}\n`);

  // Get default categories
  const defaultCats = await db
    .select()
    .from(categories)
    .where(eq(categories.isDefault, true));

  const categoryMap = new Map<string, string>();
  for (const cat of defaultCats) {
    categoryMap.set(cat.name, cat.id);
  }

  console.log(`📂 Found ${defaultCats.length} default categories\n`);

  // Clear existing transactions for this user (for clean demo)
  await db.delete(transactions).where(eq(transactions.userId, userId));
  await db.delete(categoryRules).where(eq(categoryRules.userId, userId));
  console.log('🧹 Cleared existing transactions and rules\n');

  const txnsToInsert: Array<{
    userId: string;
    amount: number;
    type: 'income' | 'expense';
    source: 'mpesa' | 'manual';
    categoryId: string | null;
    senderName: string;
    senderPhone: string;
    reference: string;
    description: string | null;
    date: Date;
    isRecurring: boolean;
    isPersonal: boolean;
  }> = [];

  // Generate income transactions (sales) - about 60% of transactions
  console.log('💰 Generating income transactions...');
  for (let i = 0; i < 45; i++) {
    const customer =
      customerNames[Math.floor(Math.random() * customerNames.length)];
    const amount = randomAmount(200, 5000); // KES 200 - 5000 per sale
    const date = randomDate(45);

    txnsToInsert.push({
      userId,
      amount,
      type: 'income',
      source: 'mpesa',
      categoryId: categoryMap.get('Sales') || null,
      senderName: customer,
      senderPhone: generatePhone(),
      reference: generateReference(),
      description: null,
      date,
      isRecurring: false,
      isPersonal: false,
    });
  }

  // Generate expense transactions
  console.log('💸 Generating expense transactions...');

  // Inventory purchases (major expense)
  for (let i = 0; i < 8; i++) {
    const supplier = supplierNames[Math.floor(Math.random() * 4)];
    txnsToInsert.push({
      userId,
      amount: randomAmount(5000, 25000),
      type: 'expense',
      source: 'mpesa',
      categoryId: categoryMap.get('Inventory/Stock') || null,
      senderName: supplier,
      senderPhone: generatePhone(),
      reference: generateReference(),
      description: 'Stock purchase',
      date: randomDate(45),
      isRecurring: false,
      isPersonal: false,
    });
  }

  // Transport/Delivery
  for (let i = 0; i < 12; i++) {
    txnsToInsert.push({
      userId,
      amount: randomAmount(100, 800),
      type: 'expense',
      source: 'mpesa',
      categoryId: categoryMap.get('Transport/Delivery') || null,
      senderName: 'QUICK DELIVERY SERVICES',
      senderPhone: '0722123456',
      reference: generateReference(),
      description: 'Delivery fee',
      date: randomDate(45),
      isRecurring: false,
      isPersonal: false,
    });
  }

  // Airtime/Data (recurring)
  for (let i = 0; i < 6; i++) {
    txnsToInsert.push({
      userId,
      amount: randomAmount(100, 500),
      type: 'expense',
      source: 'mpesa',
      categoryId: categoryMap.get('Airtime/Data') || null,
      senderName: 'SAFARICOM PLC',
      senderPhone: '0722000000',
      reference: generateReference(),
      description: 'Airtime purchase',
      date: randomDate(45),
      isRecurring: true,
      isPersonal: false,
    });
  }

  // Marketing (Instagram/Facebook ads)
  for (let i = 0; i < 4; i++) {
    txnsToInsert.push({
      userId,
      amount: randomAmount(500, 2000),
      type: 'expense',
      source: 'mpesa',
      categoryId: categoryMap.get('Marketing') || null,
      senderName: 'META PLATFORMS',
      senderPhone: '0700000000',
      reference: generateReference(),
      description: 'Social media ads',
      date: randomDate(45),
      isRecurring: false,
      isPersonal: false,
    });
  }

  // Rent (monthly, recurring)
  const rentDates = [7, 37]; // About a month apart
  for (const daysAgo of rentDates) {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    date.setHours(10, 0, 0);
    txnsToInsert.push({
      userId,
      amount: 15000,
      type: 'expense',
      source: 'mpesa',
      categoryId: categoryMap.get('Rent') || null,
      senderName: 'KIAMBU PROPERTIES',
      senderPhone: '0733456789',
      reference: generateReference(),
      description: 'Monthly rent',
      date,
      isRecurring: true,
      isPersonal: false,
    });
  }

  // Utilities
  for (let i = 0; i < 2; i++) {
    txnsToInsert.push({
      userId,
      amount: randomAmount(1500, 3500),
      type: 'expense',
      source: 'mpesa',
      categoryId: categoryMap.get('Utilities') || null,
      senderName: 'KENYA POWER',
      senderPhone: '0722222222',
      reference: generateReference(),
      description: 'Electricity bill',
      date: randomDate(30),
      isRecurring: true,
      isPersonal: false,
    });
  }

  // Personal expenses
  for (let i = 0; i < 5; i++) {
    txnsToInsert.push({
      userId,
      amount: randomAmount(500, 3000),
      type: 'expense',
      source: 'mpesa',
      categoryId: categoryMap.get('Personal') || null,
      senderName:
        customerNames[Math.floor(Math.random() * customerNames.length)],
      senderPhone: generatePhone(),
      reference: generateReference(),
      description: null,
      date: randomDate(45),
      isRecurring: false,
      isPersonal: true,
    });
  }

  // Uncategorized transactions (for demo of categorization feature)
  console.log('❓ Generating uncategorized transactions...');
  for (let i = 0; i < 8; i++) {
    const isIncome = Math.random() > 0.5;
    txnsToInsert.push({
      userId,
      amount: randomAmount(300, 2000),
      type: isIncome ? 'income' : 'expense',
      source: 'mpesa',
      categoryId: null, // Uncategorized
      senderName: isIncome
        ? customerNames[Math.floor(Math.random() * customerNames.length)]
        : supplierNames[Math.floor(Math.random() * supplierNames.length)],
      senderPhone: generatePhone(),
      reference: generateReference(),
      description: null,
      date: randomDate(14), // Recent so they show up in uncategorized banner
      isRecurring: false,
      isPersonal: false,
    });
  }

  // Manual transactions (a few)
  console.log('✏️ Generating manual transactions...');
  for (let i = 0; i < 3; i++) {
    txnsToInsert.push({
      userId,
      amount: randomAmount(1000, 5000),
      type: 'expense',
      source: 'manual',
      categoryId: categoryMap.get('Supplies') || null,
      senderName: 'Cash purchase',
      senderPhone: '',
      reference: '',
      description: 'Office supplies from local shop',
      date: randomDate(30),
      isRecurring: false,
      isPersonal: false,
    });
  }

  // Insert all transactions
  console.log(`\n📝 Inserting ${txnsToInsert.length} transactions...`);
  for (const txn of txnsToInsert) {
    await db.insert(transactions).values(txn);
  }

  // Create some category rules
  console.log('\n📋 Creating category rules...');
  const rules = [
    {
      userId,
      senderIdentifier: 'SAFARICOM PLC',
      categoryId: categoryMap.get('Airtime/Data')!,
    },
    {
      userId,
      senderIdentifier: 'QUICK DELIVERY SERVICES',
      categoryId: categoryMap.get('Transport/Delivery')!,
    },
    {
      userId,
      senderIdentifier: 'KENYA POWER',
      categoryId: categoryMap.get('Utilities')!,
    },
    {
      userId,
      senderIdentifier: 'META PLATFORMS',
      categoryId: categoryMap.get('Marketing')!,
    },
  ];

  for (const rule of rules) {
    if (rule.categoryId) {
      await db.insert(categoryRules).values(rule);
      console.log(`  ✓ ${rule.senderIdentifier} → category`);
    }
  }

  // Calculate totals for summary
  const incomeTotal = txnsToInsert
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const expenseTotal = txnsToInsert
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const uncategorizedCount = txnsToInsert.filter((t) => !t.categoryId).length;

  console.log('\n✅ Demo data seeded successfully!\n');
  console.log('📊 Summary:');
  console.log(`   Total transactions: ${txnsToInsert.length}`);
  console.log(
    `   Income transactions: ${txnsToInsert.filter((t) => t.type === 'income').length}`
  );
  console.log(
    `   Expense transactions: ${txnsToInsert.filter((t) => t.type === 'expense').length}`
  );
  console.log(`   Uncategorized: ${uncategorizedCount}`);
  console.log(`   Total income: KES ${incomeTotal.toLocaleString()}`);
  console.log(`   Total expenses: KES ${expenseTotal.toLocaleString()}`);
  console.log(`   Net: KES ${(incomeTotal - expenseTotal).toLocaleString()}`);
  console.log(`   Category rules: ${rules.length}`);
}

seedDemoData().catch((error) => {
  console.error('Error seeding demo data:', error);
  process.exit(1);
});
