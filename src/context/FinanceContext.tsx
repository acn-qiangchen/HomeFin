import React, { createContext, useReducer, useEffect, useRef, useState } from 'react';
import type { FinanceState, Transaction, Budget, Category } from '../types';
import { financeReducer } from './financeReducer';
import { loadState, saveState } from '../utils/storage';
import { loadFromDynamo, saveToDynamo } from '../utils/dynamoSync';

interface FinanceContextValue {
  state: FinanceState;
  syncing: boolean;
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

interface Props {
  children: React.ReactNode;
}

export function FinanceProvider({ children }: Props) {
  const [state, dispatch] = useReducer(financeReducer, undefined, loadState);
  const [syncing, setSyncing] = useState(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadingFromRemote = useRef(false);

  // Load from DynamoDB on mount; fall back to localStorage if empty
  useEffect(() => {
    setSyncing(true);
    loadingFromRemote.current = true;
    loadFromDynamo().then((remote) => {
      if (remote) {
        dispatch({ type: 'LOAD_STATE', payload: remote });
        saveState(remote); // keep localStorage in sync
      }
      loadingFromRemote.current = false;
      setSyncing(false);
    });
  }, []);

  // Save to localStorage immediately and DynamoDB (debounced 1.5s) on every change
  useEffect(() => {
    if (loadingFromRemote.current) return;
    saveState(state);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveToDynamo(state);
    }, 1500);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [state]);

  const ctx: FinanceContextValue = {
    state,
    syncing,
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
