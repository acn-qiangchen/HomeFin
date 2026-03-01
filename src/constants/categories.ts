import type { Category } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  // Income
  { id: 'salary',      label: 'Salary',        color: '#22c55e', type: 'income' },
  { id: 'freelance',   label: 'Freelance',      color: '#16a34a', type: 'income' },
  { id: 'investment',  label: 'Investment',     color: '#15803d', type: 'income' },
  { id: 'other_inc',   label: 'Other Income',   color: '#86efac', type: 'income' },
  // Expense
  { id: 'housing',     label: 'Housing',        color: '#ef4444', type: 'expense' },
  { id: 'food',        label: 'Food & Dining',  color: '#f97316', type: 'expense' },
  { id: 'transport',   label: 'Transport',      color: '#eab308', type: 'expense' },
  { id: 'utilities',   label: 'Utilities',      color: '#8b5cf6', type: 'expense' },
  { id: 'healthcare',  label: 'Healthcare',     color: '#ec4899', type: 'expense' },
  { id: 'education',   label: 'Education',      color: '#06b6d4', type: 'expense' },
  { id: 'entertainment', label: 'Entertainment', color: '#f59e0b', type: 'expense' },
  { id: 'shopping',    label: 'Shopping',       color: '#3b82f6', type: 'expense' },
  { id: 'savings',     label: 'Savings',        color: '#10b981', type: 'both' },
  { id: 'other_exp',   label: 'Other Expense',  color: '#6b7280', type: 'expense' },
];
