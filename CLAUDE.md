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
- **Framework**: Next.js 15 (App Router)
- **Authentication**: Clerk (@clerk/nextjs)
- **Database**: PostgreSQL via Prisma
- **UI**: Radix UI + Tailwind CSS + shadcn/ui
- **Forms**: React Hook Form + Zod validation
- **State Management**: TanStack Query (React Query)
- **Charts**: Recharts

### Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (app)/                    # Authenticated routes
│   │   ├── dashboard/            # Main dashboard with overview
│   │   ├── transactions/         # Transaction history table
│   │   ├── settings/             # User settings (currency)
│   │   └── wizard/               # Initial setup wizard
│   ├── (auth)/                   # Auth routes (sign-in/sign-up)
│   └── api/                      # API routes
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
│   ├── navbar/                   # Navigation
│   ├── overview/                 # Dashboard stats cards
│   ├── providers/                # Context providers
│   └── stats_cards/              # Balance summary cards
├── hooks/                        # Custom React hooks
├── lib/                          # Utility functions
│   ├── prisma.ts                 # Prisma client singleton
│   ├── helpers.ts                # Date and currency formatters
│   ├── currencies.ts             # Supported currencies list
│   └── types.ts                  # Shared TypeScript types
└── schema/                       # Zod validation schemas
    ├── transaction.ts            # Transaction validation
    ├── categories.ts             # Category validation
    ├── overview.ts               # Query param validation
    └── userSettings.ts           # User settings validation
```

### Key Data Models (Prisma Schema)

- **UserSettings**: Stores user currency preference (keyed by Clerk userId)
- **Category**: User-defined categories with icons, scoped by type (income/expense)
- **Transaction**: Financial transactions with amount, category, date, and type
- **MonthHistory**: Aggregated daily income/expense totals
- **YearHistory**: Aggregated monthly income/expense totals

### Authentication Flow

1. Clerk handles authentication via middleware (src/middleware.ts)
2. All routes except `/`, `/sign-in`, and `/sign-up` require authentication
3. First-time users are redirected to `/wizard` to set currency
4. User ID from Clerk (`user.id`) is used to scope all data

### Data Flow Pattern

1. **Server Components** (pages): Fetch initial data using Prisma
2. **Client Components**: Use TanStack Query for data fetching and mutations
3. **API Routes**: Validate with Zod schemas, query Prisma, return JSON
4. **Forms**: React Hook Form + Zod resolvers for validation

### Important Patterns

- **Currency Formatting**: Use `GetFormatterForCurrency()` from `lib/helpers.ts` to format amounts with user's currency
- **Date Handling**: Use `DateToUTCDate()` to convert dates to UTC for consistent storage
- **User Scoping**: Always filter queries by `userId` from Clerk's `currentUser()`
- **Transaction Types**: Strict `"income" | "expense"` literal types throughout
- **History Aggregation**: `MonthHistory` and `YearHistory` tables store pre-aggregated data for performance

### Path Aliases

- `@/*` maps to `src/*` (configured in tsconfig.json)

### Styling

- Tailwind CSS with dark mode as default
- Components follow shadcn/ui patterns
- Geist font family from Vercel
