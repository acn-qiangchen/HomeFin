import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { TransactionType } from '../../types';
import { useFinance } from '../../hooks/useFinance';
import { useLang } from '../../hooks/useLang';
import { filterByMonth, sumByType } from '../../utils/calculations';
import { formatCurrency } from '../../utils/formatters';
import { TransactionRow } from './TransactionRow';

export function TransactionList() {
  const { state } = useFinance();
  const { t } = useLang();
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') as TransactionType | null;
  const initialCategory = searchParams.get('category');
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>(initialType ?? 'all');
  const [categoryFilter, setCategoryFilter] = useState<string>(initialCategory ?? 'all');

  const monthTxns = filterByMonth(state.transactions, state.selectedMonth);
  const filtered = monthTxns
    .filter((txn) => typeFilter === 'all' || txn.type === typeFilter)
    .filter((txn) => categoryFilter === 'all' || txn.categoryId === categoryFilter)
    .sort((a, b) => b.date.localeCompare(a.date));

  const totals = sumByType(filtered);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-3 flex-wrap">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as TransactionType | 'all')}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="all">{t.transactions.allTypes}</option>
          <option value="income">{t.transactions.income}</option>
          <option value="expense">{t.transactions.expense}</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="all">{t.transactions.allCategories}</option>
          {state.categories.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 px-1 text-sm">
        {typeFilter !== 'expense' && (
          <span className="text-green-600 font-medium">
            {t.transactions.income}: {formatCurrency(totals.income)}
          </span>
        )}
        {typeFilter !== 'income' && (
          <span className="text-red-500 font-medium">
            {t.transactions.expense}: {formatCurrency(totals.expense)}
          </span>
        )}
        {typeFilter === 'all' && (
          <span className={`font-medium ${totals.net >= 0 ? 'text-blue-600' : 'text-red-500'}`}>
            {t.transactions.filteredBalance}: {formatCurrency(totals.net)}
          </span>
        )}
      </div>

      <div className="bg-white rounded-xl border divide-y divide-gray-100">
        {filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-gray-400">
            {t.transactions.noTransactions}
          </p>
        ) : (
          filtered.map((txn) => <TransactionRow key={txn.id} transaction={txn} />)
        )}
      </div>
      <p className="text-xs text-gray-400 text-right">{t.transactions.count(filtered.length)}</p>
    </div>
  );
}
