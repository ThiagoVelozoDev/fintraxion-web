# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server with HMR
npm run build     # TypeScript check + Vite production build
npm run lint      # ESLint across entire codebase
npm run preview   # Preview the production build locally
```

No test runner is configured yet.

## Project Concept

Fintraxion treats personal finance like a business: income = revenue, expenses = operating costs, leftover = profit/reinvestment. Use enterprise vocabulary — Revenue, Operating Costs, Burn Rate, Net Profit, Savings Rate, Debt Ratio, Net Worth, Capital Allocation — not generic finance terms.

## Architecture Overview

**Stack:** React 19 + Vite + TypeScript (strict), React Router DOM v7, plain CSS (dark theme, `src/index.css`)

**App shell:** `main.tsx` wraps in `<LanguageProvider>` + `<BrowserRouter>`. `App.tsx` defines routes. `AppLayout` (sidebar + header + `<Outlet>`) wraps all protected pages. `ProtectedRoute` redirects unauthenticated users to `/login`.

**State management:**
- Global language preference via Context API (`src/i18n/LanguageContext.tsx`) — no Redux or external state library
- All other state is component-local via `useState`
- Data persisted to `localStorage` under these keys:
  - `fintraxion_auth` — boolean auth flag (`'true'`)
  - `fintraxion_language` — `'en'` | `'pt'` (defaults to `'en'`)
  - `fintraxion_financial_entries` — one-time transaction records
  - `fintraxion_recurring_templates` — recurring entry templates (FixedCostsPage)

**i18n pattern:** All UI text must go through `const { t } = useLanguage()` — called as `t('English text', 'Texto em português')`. Never hardcode strings.

**Financial categories (`src/data/categories.ts`):** Single source of truth for all entry types and categories. The 6 `EntryType` values (`revenue`, `fixed_cost`, `variable_cost`, `expense`, `investment`, `debt`) and 50+ categories are defined here with bilingual names (`name_en`, `name_pt`). Use `getCategoriesByType()` and `getCategoryById()` helpers. `TYPE_META` provides display metadata (badge class, positive/negative flag).

## Critical Architectural Constraints

- **No financial logic in the frontend.** All calculations, metrics, and business rules must come from the backend API. The frontend only renders data it receives.
- **All current dashboard metrics are hardcoded mock data** — the backend is not yet implemented.
- **Authentication is a mock** — login only sets a boolean in localStorage; there is no real auth backend.

## Planned (Not Yet Implemented) Stack

Per `.cursor/rules/tech-stack-architecture.mdc`:
- **Backend:** NestJS with layered architecture: modules → domain → analytics → infra
- **Database:** PostgreSQL via Prisma ORM (snake_case, plural table names, append-only for time-series data)
- **Forms/Validation:** React Hook Form + Zod
- **CSS:** TailwindCSS (current plain CSS is interim)
- **Infrastructure:** Render platform (separate API and Worker services)

When adding backend modules: business logic in services (never controllers), DTOs for all inputs, Prisma for DB access. Analytics jobs run asynchronously (daily analysis, monthly consolidation).

## Naming Conventions

- Files: PascalCase for components (`DashboardPage.tsx`), camelCase for hooks (`useLanguage.ts`)
- Components: PascalCase exports only
- Hooks: prefix with `use`
- localStorage keys: `UPPER_SNAKE_CASE` constants (e.g., `AUTH_KEY`, `LANGUAGE_KEY`)
- TypeScript strict mode enforces `noUnusedLocals` and `noUnusedParameters` — unused variables fail the build
