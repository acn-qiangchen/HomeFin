import React, { createContext, useReducer, useEffect } from 'react';
import type { FinanceState, Transaction, Budget, Category } from '../types';
import { financeReducer } from './financeReducer';
import { loadState, saveState } from '../utils/storage';

interface FinanceContextValue {
  state: FinanceState;
  addTransaction: (t: Transaction) => void;
  updateTransaction: (t: Transaction) => void;
  deleteTransaction: (id: string) => void;
  addBudget: (b: Budget) => void;
  updateBudget: (b: Budget) => void;
  deleteBudget: (id: string) => void;
  addCategory: (c: Category) => void;
  updateCategory: (c: Category) => void;
  deleteCategory: (id: string) => void;
  setSelectedMonth: (month: string) => void;
}

export const FinanceContext = createContext<FinanceContextValue | null>(null);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(financeReducer, undefined, loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const ctx: FinanceContextValue = {
    state,
    addTransaction: (t) => dispatch({ type: 'ADD_TRANSACTION', payload: t }),
    updateTransaction: (t) => dispatch({ type: 'UPDATE_TRANSACTION', payload: t }),
    deleteTransaction: (id) => dispatch({ type: 'DELETE_TRANSACTION', payload: id }),
    addBudget: (b) => dispatch({ type: 'ADD_BUDGET', payload: b }),
    updateBudget: (b) => dispatch({ type: 'UPDATE_BUDGET', payload: b }),
    deleteBudget: (id) => dispatch({ type: 'DELETE_BUDGET', payload: id }),
    addCategory: (c) => dispatch({ type: 'ADD_CATEGORY', payload: c }),
    updateCategory: (c) => dispatch({ type: 'UPDATE_CATEGORY', payload: c }),
    deleteCategory: (id) => dispatch({ type: 'DELETE_CATEGORY', payload: id }),
    setSelectedMonth: (month) => dispatch({ type: 'SET_SELECTED_MONTH', payload: month }),
  };

  return <FinanceContext.Provider value={ctx}>{children}</FinanceContext.Provider>;
}
