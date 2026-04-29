import { describe, it, expect } from 'vitest';
import { groupByPaymentMethod, sumByType } from './calculations';
import type { FinanceState, Transaction } from '../types';
import { DEFAULT_CATEGORIES } from '../constants/categories';

function baseState(extra: Partial<FinanceState> = {}): FinanceState {
  return {
    transactions: [],
    budgets: [],
    categories: DEFAULT_CATEGORIES,
    paymentMethods: [
      { id: 'pm1', label: 'Credit Card' },
      { id: 'pm2', label: 'Cash' },
    ],
    selectedMonth: '2026-04',
    ...extra,
  };
}

function makeTxn(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: crypto.randomUUID(),
    type: 'expense',
    amount: 1000,
    categoryId: 'food',
    date: '2026-04-01',
    note: '',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('sumByType', () => {
  it('sums income and expense separately and computes net', () => {
    const txns = [
      makeTxn({ type: 'income', amount: 50000 }),
      makeTxn({ type: 'expense', amount: 20000 }),
      makeTxn({ type: 'expense', amount: 5000 }),
    ];
    const result = sumByType(txns);
    expect(result.income).toBe(50000);
    expect(result.expense).toBe(25000);
    expect(result.net).toBe(25000);
  });

  it('returns zeros for empty array', () => {
    const result = sumByType([]);
    expect(result.income).toBe(0);
    expect(result.expense).toBe(0);
    expect(result.net).toBe(0);
  });

  it('returns negative net when expenses exceed income', () => {
    const txns = [
      makeTxn({ type: 'income', amount: 10000 }),
      makeTxn({ type: 'expense', amount: 30000 }),
    ];
    const result = sumByType(txns);
    expect(result.net).toBe(-20000);
  });

  it('sums only income when all transactions are income', () => {
    const txns = [
      makeTxn({ type: 'income', amount: 100000 }),
      makeTxn({ type: 'income', amount: 50000 }),
    ];
    const result = sumByType(txns);
    expect(result.income).toBe(150000);
    expect(result.expense).toBe(0);
    expect(result.net).toBe(150000);
  });

  it('sums only expense when all transactions are expenses', () => {
    const txns = [
      makeTxn({ type: 'expense', amount: 3000 }),
      makeTxn({ type: 'expense', amount: 7000 }),
    ];
    const result = sumByType(txns);
    expect(result.income).toBe(0);
    expect(result.expense).toBe(10000);
    expect(result.net).toBe(-10000);
  });
});

describe('groupByPaymentMethod', () => {
  it('aggregates expenses by payment method', () => {
    const txns = [
      makeTxn({ paymentMethodId: 'pm1', amount: 3000 }),
      makeTxn({ paymentMethodId: 'pm1', amount: 2000 }),
      makeTxn({ paymentMethodId: 'pm2', amount: 1000 }),
    ];
    const result = groupByPaymentMethod(txns, baseState(), 'Unspecified');
    const pm1 = result.find((r) => r.paymentMethodId === 'pm1');
    const pm2 = result.find((r) => r.paymentMethodId === 'pm2');
    expect(pm1?.amount).toBe(5000);
    expect(pm1?.label).toBe('Credit Card');
    expect(pm2?.amount).toBe(1000);
    expect(pm2?.label).toBe('Cash');
  });

  it('groups expenses without a payment method under the noMethodLabel', () => {
    const txns = [makeTxn({ paymentMethodId: undefined, amount: 800 })];
    const result = groupByPaymentMethod(txns, baseState(), 'Unspecified');
    const unspecified = result.find((r) => r.paymentMethodId === '');
    expect(unspecified?.label).toBe('Unspecified');
    expect(unspecified?.amount).toBe(800);
    expect(unspecified?.color).toBe('#9ca3af');
  });

  it('excludes income transactions', () => {
    const txns = [
      makeTxn({ type: 'income', paymentMethodId: 'pm1', amount: 50000 }),
      makeTxn({ type: 'expense', paymentMethodId: 'pm1', amount: 2000 }),
    ];
    const result = groupByPaymentMethod(txns, baseState(), 'Unspecified');
    const pm1 = result.find((r) => r.paymentMethodId === 'pm1');
    expect(pm1?.amount).toBe(2000);
  });

  it('returns empty array when there are no expense transactions', () => {
    const result = groupByPaymentMethod([], baseState(), 'Unspecified');
    expect(result).toHaveLength(0);
  });

  it('sorts results by amount descending', () => {
    const txns = [
      makeTxn({ paymentMethodId: 'pm2', amount: 500 }),
      makeTxn({ paymentMethodId: 'pm1', amount: 3000 }),
    ];
    const result = groupByPaymentMethod(txns, baseState(), 'Unspecified');
    expect(result[0].paymentMethodId).toBe('pm1');
    expect(result[1].paymentMethodId).toBe('pm2');
  });
});
