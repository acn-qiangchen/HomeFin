import { useState } from 'react';
import type { TransactionType } from '../../types';
import { useFinance } from '../../hooks/useFinance';
import { useLang } from '../../hooks/useLang';
import { filterByMonth } from '../../utils/calculations';
import { TransactionRow } from './TransactionRow';

export function TransactionList() {
  const { state } = useFinance();
  const { t } = useLang();
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const monthTxns = filterByMonth(state.transactions, state.selectedMonth);
  const filtered = monthTxns
    .filter((txn) => typeFilter === 'all' || txn.type === typeFilter)
    .filter((txn) => categoryFilter === 'all' || txn.categoryId === categoryFilter)
    .sort((a, b) => b.date.localeCompare(a.date));

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
