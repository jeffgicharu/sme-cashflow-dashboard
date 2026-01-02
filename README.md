# SME Cash Flow Dashboard

A cash flow analytics dashboard for Kenyan online sellers using M-Pesa. Track income and expenses, categorize transactions, visualize spending patterns, and predict cash flow gaps.

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

| Command              | Description               |
| -------------------- | ------------------------- |
| `npm run dev`        | Start development server  |
| `npm run build`      | Build for production      |
| `npm run start`      | Run production build      |
| `npm run lint`       | Run ESLint                |
| `npm run lint:fix`   | Fix ESLint issues         |
| `npm run type-check` | Run TypeScript compiler   |
| `npm run format`     | Format code with Prettier |

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

## License

MIT
