import React, { createContext, useReducer, useEffect, useRef, useState } from 'react';
import type { FinanceState, Transaction, Budget, Category } from '../types';
import { financeReducer } from './financeReducer';
import { loadState, saveState, loadStoredIdentity, saveIdentity, defaultFinanceState } from '../utils/storage';
import { loadFromDynamo, saveToDynamo } from '../utils/dynamoSync';

interface FinanceContextValue {
  state: FinanceState;
  syncing: boolean;
  addTransaction: (t: Transaction) => void;
  addTransactions: (txns: Transaction[]) => void;
  updateTransaction: (t: Transaction) => void;
  deleteTransaction: (id: string) => void;
  addBudget: (b: Budget) => void;
  addBudgets: (bs: Budget[]) => void;
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

  // Load from DynamoDB on mount; detect user switch and reset stale localStorage
  useEffect(() => {
    setSyncing(true);
    loadingFromRemote.current = true;
    loadFromDynamo().then(({ state: remote, identityId }) => {
      const storedIdentity = loadStoredIdentity();
      const userChanged = identityId !== null && storedIdentity !== identityId;

      if (userChanged) {
        // Different user logged in — discard previous user's cached data
        const fresh = remote ?? defaultFinanceState();
        dispatch({ type: 'LOAD_STATE', payload: fresh });
        saveState(fresh);
        saveIdentity(identityId);
      } else if (remote) {
        // Same user — apply fresh DynamoDB data
        dispatch({ type: 'LOAD_STATE', payload: remote });
        saveState(remote);
        if (identityId) saveIdentity(identityId);
      } else if (identityId) {
        // Same user but no DynamoDB record yet — persist identity for next check
        saveIdentity(identityId);
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
    addTransactions: (txns) => dispatch({ type: 'ADD_TRANSACTIONS', payload: txns }),
    updateTransaction: (t) => dispatch({ type: 'UPDATE_TRANSACTION', payload: t }),
    deleteTransaction: (id) => dispatch({ type: 'DELETE_TRANSACTION', payload: id }),
    addBudget: (b) => dispatch({ type: 'ADD_BUDGET', payload: b }),
    addBudgets: (bs) => dispatch({ type: 'ADD_BUDGETS', payload: bs }),
    updateBudget: (b) => dispatch({ type: 'UPDATE_BUDGET', payload: b }),
    deleteBudget: (id) => dispatch({ type: 'DELETE_BUDGET', payload: id }),
    addCategory: (c) => dispatch({ type: 'ADD_CATEGORY', payload: c }),
    updateCategory: (c) => dispatch({ type: 'UPDATE_CATEGORY', payload: c }),
    deleteCategory: (id) => dispatch({ type: 'DELETE_CATEGORY', payload: id }),
    setSelectedMonth: (month) => dispatch({ type: 'SET_SELECTED_MONTH', payload: month }),
  };

  return <FinanceContext.Provider value={ctx}>{children}</FinanceContext.Provider>;
}
