import { useFinance } from '../../hooks/useFinance';
import { useLang } from '../../hooks/useLang';
import { filterByMonth, sumByType } from '../../utils/calculations';
import { formatCurrency } from '../../utils/formatters';

export function SummaryCards() {
  const { state } = useFinance();
  const { t } = useLang();
  const txns = filterByMonth(state.transactions, state.selectedMonth);
  const { income, expense, net } = sumByType(txns);
  const totalBudget = state.budgets
    .filter((b) => b.month === state.selectedMonth)
    .reduce((sum, b) => sum + b.limit, 0);

  const cards = [
    {
      label: t.dashboard.income,
      value: formatCurrency(income),
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: (
        <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
    },
    {
      label: t.dashboard.expenses,
      value: formatCurrency(expense),
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: (
        <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      ),
    },
    {
      label: t.dashboard.netBalance,
      value: formatCurrency(net),
      color: net >= 0 ? 'text-blue-600' : 'text-red-600',
      bg: net >= 0 ? 'bg-blue-50' : 'bg-red-50',
      border: net >= 0 ? 'border-blue-200' : 'border-red-200',
      icon: (
        <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </svg>
      ),
    },
    {
      label: t.dashboard.totalBudget,
      value: formatCurrency(totalBudget),
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      icon: (
        <svg className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.label} className={`rounded-xl border p-5 ${card.bg} ${card.border}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-600">{card.label}</span>
            {card.icon}
          </div>
          <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}
