export type TransactionType = 'income' | 'expense';
export type CategoryId = string;

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: CategoryId;
  date: string;       // "YYYY-MM-DD"
  note: string;
  createdAt: string;  // ISO timestamp
  fixed?: boolean;    // true = repeats every month
}

export interface Category {
  id: CategoryId;
  label: string;
  color: string;      // hex for charts
  type: TransactionType | 'both';
}

export interface Budget {
  id: string;
  categoryId: CategoryId;
  month: string;      // "YYYY-MM"
  limit: number;
}

export interface FinanceState {
  transactions: Transaction[];
  budgets: Budget[];
  categories: Category[];
  selectedMonth: string; // "YYYY-MM"
}

// Derived types
export interface MonthlySummary {
  income: number;
  expense: number;
  net: number;
}

export interface CategorySpending {
  categoryId: CategoryId;
  label: string;
  color: string;
  amount: number;
}

export interface BudgetProgress {
  budget: Budget;
  category: Category;
  spent: number;
  percentage: number;
  status: 'ok' | 'warning' | 'over';
}

export interface MonthlyBarData {
  month: string;
  label: string;
  income: number;
  expense: number;
}
