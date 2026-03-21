# HomeFin — CLAUDE.md

Project context and conventions for Claude Code sessions.

## What This Is

HomeFin is a family finance SPA with Cognito authentication and per-user DynamoDB storage.
Deployed as a static site on GitHub Pages via HashRouter.

## Stack

- **React 19 + TypeScript** — strict mode
- **Vite 7** — requires **Node.js 20+** (Node 18 is incompatible with `@tailwindcss/oxide`)
- **Tailwind CSS v4** — configured via `@tailwindcss/vite` plugin; no `tailwind.config` file; single `@import "tailwindcss"` in `src/index.css`
- **Recharts** — PieChart, BarChart
- **React Router v7** — HashRouter, routes: `/`, `/transactions`, `/budgets`, `/settings`
- **AWS Amplify v6** (`aws-amplify`, `@aws-amplify/ui-react`) — Cognito auth + `<Authenticator>` UI
- **AWS SDK v3** (`@aws-sdk/client-dynamodb`, `@aws-sdk/lib-dynamodb`) — DynamoDB read/write

## Dev Commands

```bash
source ~/.nvm/nvm.sh && nvm use 20   # always required — project needs Node 20
npm run dev                           # http://localhost:5173/HomeFin/
npm run build                         # output to dist/
npx tsc --noEmit                      # type-check only
```

## AWS Infrastructure (ap-northeast-1)

| Resource | ID |
|---|---|
| Cognito User Pool | `ap-northeast-1_pSHzX5rLJ` |
| User Pool Client | `2f9eq6fmr3vg5tss9aj8t0u7e5` |
| Identity Pool | `ap-northeast-1:0d2bd5be-126b-4718-b639-4806d1ba5821` |
| DynamoDB Table | `HomeFin` — PK: `userId` (string), SK: `sk` (string) |
| IAM Role | `HomeFin-CognitoAuthRole` — row-level policy on `userId` |

**Critical**: The DynamoDB partition key `userId` must be the **Identity Pool `identityId`**
(e.g. `ap-northeast-1:uuid`), NOT the Cognito User Pool `sub` or email.
The IAM condition `dynamodb:LeadingKeys: ["${cognito-identity.amazonaws.com:sub}"]`
resolves to `session.identityId` from `fetchAuthSession()`.

## Architecture

### Auth Flow
- `src/aws-config.ts` calls `Amplify.configure()` — must be imported before any Amplify usage
- `App.tsx` wraps everything in `<LangProvider>` → `<Authenticator>` → `<FinanceProvider>`
- The `<Authenticator>` shows the Cognito sign-in/sign-up form when unauthenticated
- `FinanceProvider` only mounts when the user is authenticated

### State Management
- Single `FinanceState` in `FinanceContext` (React Context + useReducer)
- On mount: loads from DynamoDB; detects user switch via `homefin_identity` localStorage key
- Write-through cache: every state change saves to localStorage immediately + DynamoDB after 1.5s debounce
- Reducer in `src/context/financeReducer.ts` — `LOAD_STATE` fills missing fields with defaults; `ADD_TRANSACTIONS` and `ADD_BUDGETS` bulk-insert multiple items
- Hook: `useFinance()` from `src/hooks/useFinance.ts` — exposes `state`, `syncing`, and all actions including `addTransactions(txns[])` and `addBudgets(bs[])`

### Multi-User Isolation
- Each user's data is stored in DynamoDB at `userId = identityId`
- `homefin_identity` in localStorage tracks the last logged-in user's `identityId`
- On mount, if `session.identityId !== homefin_identity`, the stale localStorage state is
  discarded and replaced with the new user's DynamoDB data (or a fresh default)
- Prevents User B from seeing User A's cached data after a browser-local sign-out/sign-in

### DynamoDB Sync (`src/utils/dynamoSync.ts`)
- `loadFromDynamo()` — returns `{ state: FinanceState | null; identityId: string | null }`
- `saveToDynamo(state)` — writes `{ userId: identityId, sk: "STATE", data: JSON.stringify(state) }`
- Both functions call `fetchAuthSession()` internally to get credentials and `identityId`
- All errors are caught and logged; the app continues with local state on failure

### i18n
- Two languages: English (`en`) and Japanese (`ja`)
- All UI strings live in `src/i18n/translations.ts` — fully typed, no external library
- Language stored in `localStorage` key `homefin_lang`
- Hook: `useLang()` from `src/hooks/useLang.ts` — returns `{ lang, setLang, t }`
- Switcher: `EN | JP` toggle buttons in TopBar (short labels for mobile)
- **Every component must use `t.*` — no hardcoded English strings**

### Timezone Safety
- Never use `new Date().toISOString()` to derive month/date strings — it returns UTC
- Always use `localYearMonth(d?)` and `localYearMonthDay(d?)` from `src/utils/formatters.ts`

### Data Models (`src/types/index.ts`)
```ts
Transaction  { id, type, amount, categoryId, date "YYYY-MM-DD", note, createdAt, fixed? }
Category     { id, label, color (hex), type: "income"|"expense"|"both" }
Budget       { id, categoryId, month "YYYY-MM", limit, note? }
FinanceState { transactions, budgets, categories, selectedMonth "YYYY-MM" }
```
- `fixed?: boolean` on Transaction — marks a recurring monthly transaction; `undefined`/`false` = not fixed

### Currency
- All amounts display in **Japanese Yen (JPY)** — `formatCurrency` uses `ja-JP` locale, `currency: 'JPY'`, `minimumFractionDigits: 0`
- Output example: `¥1,234` (no decimals)

### Key Utilities
| File | Purpose |
|---|---|
| `src/utils/storage.ts` | `loadState()`, `saveState()`, `defaultFinanceState()`, `loadStoredIdentity()`, `saveIdentity()` |
| `src/utils/dynamoSync.ts` | `loadFromDynamo()`, `saveToDynamo()` |
| `src/utils/formatters.ts` | `formatCurrency` (JPY), `formatDate`, `formatMonth`, `localYearMonth`, `localYearMonthDay` |
| `src/utils/calculations.ts` | `filterByMonth`, `sumByType`, `groupByCategory`, `computeBudgetProgress`, `buildMonthlyBarData`, `getLast6Months` |
| `src/utils/demoData.ts` | `seedDemoData(month, categories)` — generates 12 sample transactions |

## File Structure

```
src/
├── App.tsx                          # LangProvider + Authenticator + FinanceProvider + HashRouter
├── aws-config.ts                    # Amplify.configure() — imported first in App.tsx
├── index.css                        # @import "tailwindcss" only
├── main.tsx
├── types/index.ts
├── constants/categories.ts          # DEFAULT_CATEGORIES (14 built-in)
├── i18n/translations.ts             # EN + JA strings
├── context/
│   ├── FinanceContext.tsx           # DynamoDB load/save, user-switch detection
│   ├── LangContext.tsx
│   └── financeReducer.ts            # LOAD_STATE is defensive (fills missing fields)
├── hooks/
│   ├── useFinance.ts
│   └── useLang.ts
├── utils/
│   ├── storage.ts                   # localStorage + identity helpers
│   ├── dynamoSync.ts                # DynamoDB read/write via Identity Pool credentials
│   ├── formatters.ts
│   ├── calculations.ts
│   └── demoData.ts
├── pages/
│   ├── DashboardPage.tsx
│   ├── TransactionsPage.tsx
│   ├── BudgetsPage.tsx
│   └── SettingsPage.tsx
└── components/
    ├── layout/    Sidebar, TopBar (useAuthenticator for user email + signOut)
    ├── dashboard/ SummaryCards, SpendingPieChart, MonthlyBarChart, RecentTransactions
    ├── transactions/ TransactionForm, TransactionList, TransactionRow
    ├── budgets/   BudgetForm, BudgetCard, BudgetList
    ├── settings/  CategoryForm, CategoryList
    └── shared/    Button, Input, Select, Modal, ConfirmDialog
```

## Conventions

- **Shared UI**: always use `Button`, `Input`, `Select`, `Modal`, `ConfirmDialog` from `src/components/shared/`
- **Button variants**: `primary` (blue), `secondary` (gray), `danger` (red), `ghost` (transparent), `outline` (blue border)
- **ConfirmDialog**: accepts optional `confirmLabel` (string) and `confirmVariant` (`'danger'|'primary'`) — use these when the action is not a delete
- **Recharts Tooltip formatter**: must accept `value: number | undefined` — use `(v) => formatCurrency(Number(v))`
- **Category deletion guard**: block delete if `categoryId` is referenced by any transaction or budget
- **Budget duplicate guard**: block add if same `categoryId + month` already exists
- **Fixed transaction copy guard**: skip copy if same `categoryId + date + amount` already exists in target month

## Completed Features

- [x] Dashboard — summary cards, spending pie chart, 6-month bar chart, recent transactions
- [x] Transactions — add / edit / delete, filter by type + category, demo data seeder
- [x] Budgets — monthly limits per category, progress bars (green / yellow / red)
- [x] Settings — category management (add / edit / delete, color picker, type selector)
- [x] i18n — English + Japanese, persisted preference, language switcher in TopBar
- [x] Timezone-safe date handling (`localYearMonth`, `localYearMonthDay`)
- [x] Cognito auth — email/password sign-up/sign-in via `<Authenticator>` UI; logged-in email shown in TopBar
- [x] DynamoDB sync — per-user state stored at `userId = identityId`, debounced 1.5s writes
- [x] Multi-user isolation — identity switch detection clears stale localStorage on login
- [x] Fixed (recurring) transactions — mark transactions as monthly fixed; one-click copy from previous month with duplicate guard
- [x] Budget note — optional note field on budgets, shown on BudgetCard
- [x] Budget copy — one-click copy last month's budgets to current month with confirmation and duplicate guard

## Deployment

- GitHub Pages: https://acn-qiangchen.github.io/HomeFin/
- GitHub Actions workflow: `.github/workflows/deploy.yml` — triggers on push to `main`
- `vite.config.ts` has `base: '/HomeFin/'` — required for GitHub Pages; dev URL is `http://localhost:5173/HomeFin/`

## Repository

https://github.com/acn-qiangchen/HomeFin
