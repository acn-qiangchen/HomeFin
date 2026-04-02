import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useFinance } from '../../hooks/useFinance';
import { useLang } from '../../hooks/useLang';
import { filterByMonth, groupByPaymentMethod } from '../../utils/calculations';
import { formatCurrency } from '../../utils/formatters';

export function PaymentMethodPieChart() {
  const { state } = useFinance();
  const { t } = useLang();
  const txns = filterByMonth(state.transactions, state.selectedMonth);
  const data = groupByPaymentMethod(txns, state, t.dashboard.noPaymentMethod);

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">{t.dashboard.spendingByPaymentMethod}</h3>
        <div className="flex items-center justify-center h-48 text-sm text-gray-400">
          {t.dashboard.noPaymentMethodData}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border p-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">{t.dashboard.spendingByPaymentMethod}</h3>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            dataKey="amount"
            nameKey="label"
            cx="50%"
            cy="50%"
            outerRadius={80}
            innerRadius={40}
          >
            {data.map((entry) => (
              <Cell key={entry.paymentMethodId} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
          <Legend
            formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
