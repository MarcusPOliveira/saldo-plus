# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Saldo+ is a financial tracking application built with Next.js 15, allowing users to manage income and expenses with category tracking and historical analysis. The application is in Portuguese (pt-BR).

## Development Commands

```bash
# Development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint and auto-fix issues
npm run lint
```

## Database

The project uses Prisma with PostgreSQL. After making schema changes:

```bash
# Generate Prisma Client (runs automatically on npm install)
npx prisma generate

# Create and apply migrations
npx prisma migrate dev --name your_migration_name

# View database in Prisma Studio
npx prisma studio
```

## Architecture

### Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Authentication**: Better Auth (Google OAuth)
- **Database**: PostgreSQL via Prisma
- **UI**: Radix UI + Tailwind CSS + shadcn/ui
- **Forms**: React Hook Form + Zod validation
- **State Management**: TanStack Query (React Query)
- **Charts**: Recharts

### Project Structure

```
src/
├── proxy.ts                      # Next.js 16 auth proxy
├── app/                          # Next.js App Router
│   ├── (app)/                    # Authenticated routes
│   │   ├── dashboard/            # Main dashboard with overview
│   │   ├── transactions/         # Transaction history table
│   │   ├── settings/             # User settings (currency, banks, categories)
│   │   └── wizard/               # Initial setup wizard
│   ├── (auth)/                   # Auth routes (sign-in with Google)
│   └── api/                      # API routes
│       ├── auth/[...all]         # Better Auth route handler
│       ├── banks/                # Bank CRUD
│       ├── categories/           # Category CRUD
│       ├── stats/                # Balance and category stats
│       ├── history-data/         # Historical chart data
│       ├── history-periods/      # Available time periods
│       ├── transactions-history/ # Transaction list with formatting
│       ├── user-settings/        # User preferences
│       └── check-session/        # Auth status
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   ├── categories_stats/         # Category breakdown charts
│   ├── currency_combo_box/       # Currency selection
│   ├── datatable/                # Transaction table
│   ├── history/                  # Historical charts
│   ├── navbar/                   # Navigation & UserButton
│   ├── overview/                 # Dashboard stats cards
│   ├── providers/                # Context providers
│   └── stats_cards/              # Balance summary cards
├── hooks/                        # Custom React hooks
├── lib/                          # Utility functions
│   ├── auth.ts                   # Better Auth server configuration & getCurrentUser()
│   ├── auth-client.ts            # Better Auth client configuration & hooks
│   ├── prisma.ts                 # Prisma client singleton
│   ├── helpers.ts                # Date and currency formatters
│   ├── currencies.ts             # Supported currencies list
│   ├── types.ts                  # Shared TypeScript types
│   └── constants.ts              # Global constants
└── schema/                       # Zod validation schemas
    ├── transaction.ts            # Transaction validation
    ├── categories.ts             # Category validation
    ├── bank.ts                   # Bank validation
    ├── overview.ts               # Query param validation
    └── userSettings.ts           # User settings validation
```

### Key Data Models (Prisma Schema)

- **User, Session, Account, Verification**: Better Auth models for authentication & Google OAuth
- **UserSettings**: Stores user currency preference (keyed by userId)
- **Category**: User-defined categories with icons, scoped by type (income/expense)
- **Bank**: User banks and credit card settings
- **Transaction**: Financial transactions with amount, category, date, type, bank
- **MonthHistory**: Aggregated daily income/expense totals
- **YearHistory**: Aggregated monthly income/expense totals

### Authentication Flow

1. Better Auth handles authentication via proxy ([src/proxy.ts](file:///Users/marcuspaulooliveira/Documents/Projetos/saldo-plus/src/proxy.ts))
2. All routes except `/` and `/sign-in` require authentication
3. First-time users are redirected to `/wizard` to set currency
4. User ID from Better Auth (`user.id`) is used to scope all data

### Data Flow Pattern

1. **Server Components** (pages): Fetch initial data using Prisma
2. **Client Components**: Use TanStack Query for data fetching and mutations
3. **API Routes**: Validate with Zod schemas, query Prisma, return JSON
4. **Forms**: React Hook Form + Zod resolvers for validation

### Important Patterns

- **Currency Formatting**: Use `GetFormatterForCurrency()` from `lib/helpers.ts` to format amounts with user's currency
- **Date Handling**: Use `DateToUTCDate()` to convert dates to UTC for consistent storage
- **User Scoping**: Always filter queries by `userId` from `getCurrentUser()` in `@/lib/auth`
- **Transaction Types**: Strict `"income" | "expense"` literal types throughout
- **History Aggregation**: `MonthHistory` and `YearHistory` tables store pre-aggregated data for performance

### Path Aliases

- `@/*` maps to `src/*` (configured in tsconfig.json)

### Styling

- Tailwind CSS with dark mode as default
- Components follow shadcn/ui patterns
- Geist font family from Vercel
