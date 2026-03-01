# HomeFin — CLAUDE.md

Project context and conventions for Claude Code sessions.

## What This Is

HomeFin is a greenfield family finance SPA. No backend — all data lives in `localStorage`.
Deployed as a static site via HashRouter (no server config needed).

## Stack

- **React 19 + TypeScript** — strict mode
- **Vite 7** — requires **Node.js 20+** (Node 18 is incompatible with `@tailwindcss/oxide`)
- **Tailwind CSS v4** — configured via `@tailwindcss/vite` plugin; no `tailwind.config` file; single `@import "tailwindcss"` in `src/index.css`
- **Recharts** — PieChart, BarChart
- **React Router v7** — HashRouter, routes: `/`, `/transactions`, `/budgets`, `/settings`

## Dev Commands

```bash
source ~/.nvm/nvm.sh && nvm use 20   # always required — project needs Node 20
npm run dev                           # http://localhost:5173
npm run build                         # output to dist/
npx tsc --noEmit                      # type-check only
```

## Architecture

### State Management
- Single `FinanceState` in `FinanceContext` (React Context + useReducer)
- Persisted to `localStorage` key `homefin_state` with `schemaVersion: 1`
- Reducer in `src/context/financeReducer.ts` — pure, all action types defined there
- Hook: `useFinance()` from `src/hooks/useFinance.ts`

### i18n
- Two languages: English (`en`) and Japanese (`ja`)
- All UI strings live in `src/i18n/translations.ts` — fully typed, no external library
- Language stored in `localStorage` key `homefin_lang`
- Hook: `useLang()` from `src/hooks/useLang.ts` — returns `{ lang, setLang, t }`
- Switcher: EN / 日本語 toggle buttons in TopBar
- **Every component must use `t.*` — no hardcoded English strings**

### Timezone Safety
- Never use `new Date().toISOString()` to derive month/date strings — it returns UTC
- Always use `localYearMonth(d?)` and `localYearMonthDay(d?)` from `src/utils/formatters.ts`

### Data Models (`src/types/index.ts`)
```ts
Transaction  { id, type, amount, categoryId, date "YYYY-MM-DD", note, createdAt }
Category     { id, label, color (hex), type: "income"|"expense"|"both" }
Budget       { id, categoryId, month "YYYY-MM", limit }
FinanceState { transactions, budgets, categories, selectedMonth "YYYY-MM" }
```

### Key Utilities
| File | Purpose |
|---|---|
| `src/utils/storage.ts` | `loadState()` / `saveState()` — localStorage read/write |
| `src/utils/formatters.ts` | `formatCurrency`, `formatDate`, `formatMonth`, `localYearMonth`, `localYearMonthDay` |
| `src/utils/calculations.ts` | `filterByMonth`, `sumByType`, `groupByCategory`, `computeBudgetProgress`, `buildMonthlyBarData`, `getLast6Months` |
| `src/utils/demoData.ts` | `seedDemoData(month, categories)` — generates 12 sample transactions |

## File Structure

```
src/
├── App.tsx                          # HashRouter + LangProvider + FinanceProvider
├── index.css                        # @import "tailwindcss" only
├── main.tsx
├── types/index.ts
├── constants/categories.ts          # DEFAULT_CATEGORIES (14 built-in)
├── i18n/translations.ts             # EN + JA strings
├── context/
│   ├── FinanceContext.tsx
│   ├── LangContext.tsx
│   └── financeReducer.ts
├── hooks/
│   ├── useFinance.ts
│   └── useLang.ts
├── utils/
│   ├── storage.ts
│   ├── formatters.ts
│   ├── calculations.ts
│   └── demoData.ts
├── pages/
│   ├── DashboardPage.tsx
│   ├── TransactionsPage.tsx
│   ├── BudgetsPage.tsx
│   └── SettingsPage.tsx
└── components/
    ├── layout/    Sidebar, TopBar
    ├── dashboard/ SummaryCards, SpendingPieChart, MonthlyBarChart, RecentTransactions
    ├── transactions/ TransactionForm, TransactionList, TransactionRow
    ├── budgets/   BudgetForm, BudgetCard, BudgetList
    ├── settings/  CategoryForm, CategoryList
    └── shared/    Button, Input, Select, Modal, ConfirmDialog
```

## Conventions

- **Shared UI**: always use `Button`, `Input`, `Select`, `Modal`, `ConfirmDialog` from `src/components/shared/`
- **Recharts Tooltip formatter**: must accept `value: number | undefined` — use `(v) => formatCurrency(Number(v))`
- **Category deletion guard**: block delete if `categoryId` is referenced by any transaction or budget
- **Budget duplicate guard**: block add if same `categoryId + month` already exists

## Completed Features

- [x] Dashboard — summary cards, spending pie chart, 6-month bar chart, recent transactions
- [x] Transactions — add / edit / delete, filter by type + category, demo data seeder
- [x] Budgets — monthly limits per category, progress bars (green / yellow / red)
- [x] Settings — category management (add / edit / delete, color picker, type selector)
- [x] i18n — English + Japanese, persisted preference, language switcher in TopBar
- [x] Timezone-safe date handling (`localYearMonth`, `localYearMonthDay`)
- [x] localStorage persistence with schema version guard

## Repository

https://github.com/acn-qiangchen/HomeFin
