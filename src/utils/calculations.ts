import type {
  FinanceState,
  Transaction,
  MonthlySummary,
  CategorySpending,
  BudgetProgress,
  MonthlyBarData,
} from '../types';
import { formatMonthShort, localYearMonth } from './formatters';

export function filterByMonth(transactions: Transaction[], month: string): Transaction[] {
  return transactions.filter((t) => t.date.startsWith(month));
}

export function sumByType(transactions: Transaction[]): MonthlySummary {
  let income = 0;
  let expense = 0;
  for (const t of transactions) {
    if (t.type === 'income') income += t.amount;
    else expense += t.amount;
  }
  return { income, expense, net: income - expense };
}

export function groupByCategory(
  transactions: Transaction[],
  state: FinanceState
): CategorySpending[] {
  const map = new Map<string, number>();
  for (const t of transactions) {
    if (t.type !== 'expense') continue;
    map.set(t.categoryId, (map.get(t.categoryId) ?? 0) + t.amount);
  }
  return Array.from(map.entries())
    .map(([categoryId, amount]) => {
      const cat = state.categories.find((c) => c.id === categoryId);
      return {
        categoryId,
        label: cat?.label ?? categoryId,
        color: cat?.color ?? '#6b7280',
        amount,
      };
    })
    .sort((a, b) => b.amount - a.amount);
}

export function computeBudgetProgress(state: FinanceState): BudgetProgress[] {
  const monthBudgets = state.budgets.filter((b) => b.month === state.selectedMonth);
  const monthTxns = filterByMonth(state.transactions, state.selectedMonth);

  return monthBudgets.map((budget) => {
    const category = state.categories.find((c) => c.id === budget.categoryId) ?? {
      id: budget.categoryId,
      label: budget.categoryId,
      color: '#6b7280',
      type: 'expense' as const,
    };
    const spent = monthTxns
      .filter((t) => t.type === 'expense' && t.categoryId === budget.categoryId)
      .reduce((sum, t) => sum + t.amount, 0);
    const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
    const status: BudgetProgress['status'] =
      percentage >= 100 ? 'over' : percentage >= 80 ? 'warning' : 'ok';
    return { budget, category, spent, percentage, status };
  });
}

export function getLast6Months(): string[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(localYearMonth(d));
  }
  return months;
}

export function buildMonthlyBarData(state: FinanceState): MonthlyBarData[] {
  const months = getLast6Months();
  return months.map((month) => {
    const txns = filterByMonth(state.transactions, month);
    const { income, expense } = sumByType(txns);
    return { month, label: formatMonthShort(month), income, expense };
  });
}
