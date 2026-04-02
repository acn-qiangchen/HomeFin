import { describe, it, expect } from 'vitest';
import { groupByPaymentMethod } from './calculations';
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
