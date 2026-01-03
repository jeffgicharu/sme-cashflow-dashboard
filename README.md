# SME Cash Flow Dashboard

[![CI](https://github.com/jeffgicharu/sme-cashflow-dashboard/actions/workflows/ci.yml/badge.svg)](https://github.com/jeffgicharu/sme-cashflow-dashboard/actions/workflows/ci.yml)

Cash flow tracking for Kenyan online sellers using M-Pesa. Connect your Till, see where your money goes, and get alerts before you run low.

**Demo:** [sme-cashflow-dashboard.vercel.app](https://sme-cashflow-dashboard.vercel.app)

## What it does

- Syncs transactions from M-Pesa via Daraja API
- Auto-categorizes spending based on rules you set
- Shows a 30-day cash flow projection
- Generates PDF reports (useful for loan applications)
- Works offline as a PWA

## Setup

You'll need accounts on [Clerk](https://clerk.com), [Neon](https://neon.tech), and [Safaricom Developer Portal](https://developer.safaricom.co.ke).

```bash
git clone git@github.com:jeffgicharu/sme-cashflow-dashboard.git
cd sme-cashflow-dashboard
npm install
cp .env.example .env.local
# Fill in your credentials
npm run dev
```

Push the database schema with `npm run db:push`, then seed demo data with `npm run db:seed`.

## Stack

Next.js 15 (App Router), TypeScript, Neon/Drizzle, Clerk auth, Tailwind/shadcn, Recharts for charts.

## Testing

```bash
npm run test:run      # unit tests
npm run test:e2e      # playwright (build first)
```

## License

MIT
