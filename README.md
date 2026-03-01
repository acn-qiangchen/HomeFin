# HomeFin — Family Finance Manager

A single-page application for tracking family income, expenses, and budgets — with full English / Japanese support.

## Features

- **Dashboard** — monthly summary cards, spending pie chart, 6-month bar chart, recent transactions
- **Transactions** — add, edit, delete; filter by type and category
- **Budgets** — set monthly limits per category with green/yellow/red progress bars
- **Settings** — manage expense categories (name, type, color)
- **i18n** — switch between English and Japanese; preference persisted across sessions
- **Persistence** — all data saved to `localStorage`; survives page refresh

## Tech Stack

| | |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite 7 |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| Routing | React Router v7 (HashRouter) |
| State | React Context + useReducer |

No backend, no database, no external accounts required.

## Getting Started

**Requires Node.js 20+**

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

To populate the app with sample data, go to the **Transactions** page and click **"Add Demo Data"**.

## Build

```bash
npm run build
```

Output goes to `dist/` — deploy to any static file host (Netlify, Vercel, GitHub Pages, S3, etc.).

## Project Structure

```
src/
├── components/
│   ├── dashboard/     # SummaryCards, SpendingPieChart, MonthlyBarChart, RecentTransactions
│   ├── transactions/  # TransactionForm, TransactionList, TransactionRow
│   ├── budgets/       # BudgetForm, BudgetCard, BudgetList
│   ├── settings/      # CategoryForm, CategoryList
│   ├── layout/        # Sidebar, TopBar
│   └── shared/        # Button, Input, Modal, ConfirmDialog
├── context/           # FinanceContext, LangContext, financeReducer
├── hooks/             # useFinance, useLang
├── i18n/              # translations (EN / JA)
├── pages/             # DashboardPage, TransactionsPage, BudgetsPage, SettingsPage
├── types/             # TypeScript interfaces
└── utils/             # storage, formatters, calculations, demoData
```
