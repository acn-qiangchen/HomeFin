import type {
  FinanceState,
  Transaction,
  MonthlySummary,
  CategorySpending,
  BudgetProgress,
  MonthlyBarData,
} from '../types';

export interface PaymentMethodSpending {
  paymentMethodId: string;
  label: string;
  color: string;
  amount: number;
}

// Rotating palette for payment method slices
const PM_COLORS = [
  '#3b82f6', '#f97316', '#22c55e', '#a855f7', '#eab308',
  '#14b8a6', '#ec4899', '#06b6d4', '#ef4444', '#8b5cf6',
];
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

export function groupByPaymentMethod(
  transactions: Transaction[],
  state: FinanceState,
  noMethodLabel: string
): PaymentMethodSpending[] {
  const map = new Map<string, number>();
  for (const t of transactions) {
    if (t.type !== 'expense') continue;
    const key = t.paymentMethodId ?? '';
    map.set(key, (map.get(key) ?? 0) + t.amount);
  }

  const pmOrder = state.paymentMethods.map((pm) => pm.id);

  return Array.from(map.entries())
    .map(([id, amount], idx) => {
      if (id === '') {
        return { paymentMethodId: '', label: noMethodLabel, color: '#9ca3af', amount };
      }
      const pm = state.paymentMethods.find((p) => p.id === id);
      const colorIdx = pmOrder.indexOf(id);
      const color = PM_COLORS[(colorIdx >= 0 ? colorIdx : idx) % PM_COLORS.length];
      return { paymentMethodId: id, label: pm?.label ?? id, color, amount };
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
