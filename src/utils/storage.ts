import type { FinanceState } from '../types';
import { DEFAULT_CATEGORIES } from '../constants/categories';
import { localYearMonth } from './formatters';

const STORAGE_KEY = 'homefin_state';
const SCHEMA_VERSION = 1;

interface PersistedState extends FinanceState {
  schemaVersion: number;
}

export function loadState(): FinanceState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed: PersistedState = JSON.parse(raw);
    if (parsed.schemaVersion !== SCHEMA_VERSION) return defaultState();
    return {
      transactions: parsed.transactions ?? [],
      budgets: parsed.budgets ?? [],
      categories: parsed.categories ?? DEFAULT_CATEGORIES,
      selectedMonth: parsed.selectedMonth ?? currentMonth(),
    };
  } catch {
    return defaultState();
  }
}

export function saveState(state: FinanceState): void {
  const persisted: PersistedState = { ...state, schemaVersion: SCHEMA_VERSION };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
}

function currentMonth(): string {
  return localYearMonth();
}

function defaultState(): FinanceState {
  return {
    transactions: [],
    budgets: [],
    categories: DEFAULT_CATEGORIES,
    selectedMonth: currentMonth(),
  };
}
