import { Link } from 'react-router-dom';
import { useFinance } from '../../hooks/useFinance';
import { useLang } from '../../hooks/useLang';
import { filterByMonth } from '../../utils/calculations';
import { formatCurrency, formatDate } from '../../utils/formatters';

export function RecentTransactions() {
  const { state } = useFinance();
  const { t } = useLang();
  const recent = filterByMonth(state.transactions, state.selectedMonth)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  return (
    <div className="bg-white rounded-xl border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">{t.dashboard.recentTransactions}</h3>
        <Link to="/transactions" className="text-xs text-blue-600 hover:underline">
          {t.dashboard.viewAll}
        </Link>
      </div>

      {recent.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">{t.dashboard.noRecentTxns}</p>
      ) : (
        <div className="divide-y divide-gray-100">
          {recent.map((txn) => {
            const cat = state.categories.find((c) => c.id === txn.categoryId);
            return (
              <div key={txn.id} className="flex items-center gap-3 py-2.5">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: cat?.color ?? '#6b7280' }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 truncate">{cat?.label ?? txn.categoryId}</p>
                  <p className="text-xs text-gray-400">{formatDate(txn.date)}</p>
                </div>
                <span className={`text-sm font-medium ${txn.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                  {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
