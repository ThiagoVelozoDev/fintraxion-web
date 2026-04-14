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

Fintraxion treats personal finance like a business: income = revenue, expenses = operating costs, leftover = profit/reinvestment. The domain vocabulary matters — use Revenue, Operating Costs, Burn Rate, Net Profit, Savings Rate, Debt Ratio, Net Worth, Capital Allocation rather than generic finance terms.

## Architecture Overview

**Stack:** React 19 + Vite + TypeScript (strict), React Router DOM v7, plain CSS (dark theme)

**App shell:** `main.tsx` wraps the tree in `<LanguageProvider>` + `<BrowserRouter>`. `App.tsx` defines routes. `AppLayout` (sidebar + header + `<Outlet>`) wraps all protected pages. `ProtectedRoute` redirects unauthenticated users to `/login`.

**State management:**
- Global language preference via Context API (`src/i18n/LanguageContext.tsx`)
- Auth token persisted to `localStorage` under key `fintraxion_auth`
- Language persisted to `localStorage` under key `fintraxion_language` (defaults to `'en'`)
- No Redux or external state library

**i18n pattern:** All UI text must go through `const { t } = useLanguage()` — call as `t('English text', 'Portuguese text')`. Do not hardcode strings.

## Critical Architectural Constraint

**No financial logic in the frontend.** All calculations, metrics, and business rules must come from the backend API. The frontend only renders data it receives. This is a hard rule from the project architecture.

## Planned (Not Yet Implemented) Stack

Per `.cursor/rules/tech-stack-architecture.mdc`:
- **Backend:** NestJS (Node.js) with layered architecture (controller → service → repository)
- **Database:** PostgreSQL via Prisma ORM (snake_case, plural table names, append-only for time-series)
- **Validation:** Zod + React Hook Form
- **CSS:** TailwindCSS (current plain CSS is interim)
- **Infrastructure:** Render platform (separate API and Worker services)

When adding backend modules, follow NestJS conventions: business logic in services (never controllers), DTOs for all inputs, Prisma for DB access.

## Cursor Agents

`.cursor/agents/` defines specialized AI agents (Financial Analyst, Data Analyst, Risk, Investment Advisor, Debt Strategy, Fullstack Specialist). These represent planned backend services/jobs, not frontend features.

## Naming Conventions

- Files: PascalCase for components (`DashboardPage.tsx`), camelCase for hooks (`useLanguage.ts`)
- Components: PascalCase exports only
- Hooks: prefix with `use`
- localStorage keys: `UPPER_SNAKE_CASE` constants (e.g., `AUTH_KEY`, `LANGUAGE_KEY`)
- TypeScript: strict mode, `noUnusedLocals` and `noUnusedParameters` are enforced — unused variables will fail the build