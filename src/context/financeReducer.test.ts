import { describe, it, expect } from 'vitest';
import { financeReducer } from './financeReducer';
import type { FinanceState, PaymentMethod } from '../types';
import { DEFAULT_CATEGORIES } from '../constants/categories';

function baseState(): FinanceState {
  return {
    transactions: [],
    budgets: [],
    categories: DEFAULT_CATEGORIES,
    paymentMethods: [],
    selectedMonth: '2026-04',
  };
}

describe('financeReducer — payment methods', () => {
  it('ADD_PAYMENT_METHOD appends a new payment method', () => {
    const pm: PaymentMethod = { id: 'pm1', label: 'Credit Card A' };
    const next = financeReducer(baseState(), { type: 'ADD_PAYMENT_METHOD', payload: pm });
    expect(next.paymentMethods).toHaveLength(1);
    expect(next.paymentMethods[0]).toEqual(pm);
  });

  it('ADD_PAYMENT_METHOD preserves existing payment methods', () => {
    const state = { ...baseState(), paymentMethods: [{ id: 'pm1', label: 'Cash' }] };
    const pm: PaymentMethod = { id: 'pm2', label: 'PayPay' };
    const next = financeReducer(state, { type: 'ADD_PAYMENT_METHOD', payload: pm });
    expect(next.paymentMethods).toHaveLength(2);
  });

  it('UPDATE_PAYMENT_METHOD updates an existing payment method by id', () => {
    const state = {
      ...baseState(),
      paymentMethods: [
        { id: 'pm1', label: 'Old Name' },
        { id: 'pm2', label: 'Other' },
      ],
    };
    const updated: PaymentMethod = { id: 'pm1', label: 'New Name' };
    const next = financeReducer(state, { type: 'UPDATE_PAYMENT_METHOD', payload: updated });
    expect(next.paymentMethods.find((pm) => pm.id === 'pm1')?.label).toBe('New Name');
    expect(next.paymentMethods.find((pm) => pm.id === 'pm2')?.label).toBe('Other');
  });

  it('DELETE_PAYMENT_METHOD removes the payment method with matching id', () => {
    const state = {
      ...baseState(),
      paymentMethods: [
        { id: 'pm1', label: 'Cash' },
        { id: 'pm2', label: 'Card' },
      ],
    };
    const next = financeReducer(state, { type: 'DELETE_PAYMENT_METHOD', payload: 'pm1' });
    expect(next.paymentMethods).toHaveLength(1);
    expect(next.paymentMethods[0].id).toBe('pm2');
  });

  it('LOAD_STATE fills missing paymentMethods with empty array', () => {
    const partial = {
      transactions: [],
      budgets: [],
      categories: DEFAULT_CATEGORIES,
      selectedMonth: '2026-04',
    } as unknown as FinanceState;
    const next = financeReducer(baseState(), { type: 'LOAD_STATE', payload: partial });
    expect(next.paymentMethods).toEqual([]);
  });

  it('LOAD_STATE preserves paymentMethods from payload', () => {
    const payload: FinanceState = {
      ...baseState(),
      paymentMethods: [{ id: 'pm1', label: 'Cash' }],
    };
    const next = financeReducer(baseState(), { type: 'LOAD_STATE', payload });
    expect(next.paymentMethods).toHaveLength(1);
    expect(next.paymentMethods[0].label).toBe('Cash');
  });
});
