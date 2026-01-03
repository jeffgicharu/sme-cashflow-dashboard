# SME Cash Flow Dashboard

[![CI](https://github.com/jeffgicharu/sme-cashflow-dashboard/actions/workflows/ci.yml/badge.svg)](https://github.com/jeffgicharu/sme-cashflow-dashboard/actions/workflows/ci.yml)

A cash flow analytics dashboard for Kenyan online sellers using M-Pesa. Track income and expenses, categorize transactions, visualize spending patterns, and predict cash flow gaps.

**Live Demo:** [sme-cashflow-dashboard.vercel.app](https://sme-cashflow-dashboard.vercel.app)

## Features

- **M-Pesa Integration** - Automatic transaction syncing via Daraja API
- **Smart Categorization** - Auto-categorize transactions with learning rules
- **Cash Flow Projections** - 30-day forecast with low balance alerts
- **Analytics Dashboard** - Visual insights into income vs expenses
- **PDF Reports** - Professional monthly reports for loan applications
- **Offline Support** - PWA with offline transaction entry

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict mode)
- **Database**: Neon (PostgreSQL) + Drizzle ORM
- **Auth**: Clerk
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: Zustand + TanStack Query
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts

## Getting Started

### Prerequisites

- Node.js 20+
- npm or pnpm
- Accounts for: [Clerk](https://clerk.com), [Neon](https://neon.tech), [Safaricom Developer](https://developer.safaricom.co.ke)

### Installation

1. Clone the repository:

   ```bash
   git clone git@github.com:jeffgicharu/sme-cashflow-dashboard.git
   cd sme-cashflow-dashboard
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your credentials
   ```

4. Run the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Scripts

| Command              | Description                 |
| -------------------- | --------------------------- |
| `npm run dev`        | Start development server    |
| `npm run build`      | Build for production        |
| `npm run start`      | Run production build        |
| `npm run lint`       | Run ESLint                  |
| `npm run type-check` | Run TypeScript compiler     |
| `npm run test`       | Run unit tests (watch mode) |
| `npm run test:run`   | Run unit tests (single run) |
| `npm run test:e2e`   | Run Playwright E2E tests    |
| `npm run db:push`    | Push schema to database     |
| `npm run db:studio`  | Open Drizzle Studio         |
| `npm run db:seed`    | Seed demo data              |

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (sign-in, sign-up)
│   ├── (dashboard)/       # Main app pages
│   ├── api/               # API routes (webhooks)
│   └── onboarding/        # Onboarding flow
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── dashboard/         # Dashboard-specific
│   ├── transactions/      # Transaction-specific
│   ├── charts/            # Chart components
│   └── shared/            # Shared components
├── lib/
│   ├── db/                # Database (schema, queries)
│   ├── actions/           # Server Actions
│   ├── mpesa/             # M-Pesa client
│   └── validations/       # Zod schemas
├── hooks/                 # Custom hooks
├── stores/                # Zustand stores
└── types/                 # TypeScript types
```

## Environment Variables

See `.env.example` for required environment variables.

### Required Variables

| Variable                            | Description                    |
| ----------------------------------- | ------------------------------ |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key               |
| `CLERK_SECRET_KEY`                  | Clerk secret key               |
| `DATABASE_URL`                      | Neon PostgreSQL connection URL |
| `MPESA_CONSUMER_KEY`                | Safaricom Daraja consumer key  |
| `MPESA_CONSUMER_SECRET`             | Safaricom Daraja secret        |
| `MPESA_PASSKEY`                     | M-Pesa API passkey             |
| `MPESA_SHORTCODE`                   | M-Pesa Till number             |

## Deployment

The app is deployed on [Vercel](https://vercel.com). Push to `main` triggers automatic deployment.

### Manual Deployment

```bash
npm run build
npm run start
```

## Testing

```bash
# Run all unit tests
npm run test:run

# Run tests in watch mode
npm run test

# Run E2E tests (requires build first)
npm run build && npm run test:e2e
```

## License

MIT
