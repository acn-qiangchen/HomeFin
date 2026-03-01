import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { useFinance } from '../../hooks/useFinance';
import { useLang } from '../../hooks/useLang';
import { buildMonthlyBarData } from '../../utils/calculations';
import { formatCurrency } from '../../utils/formatters';

export function MonthlyBarChart() {
  const { state } = useFinance();
  const { t } = useLang();
  const data = buildMonthlyBarData(state);
  const hasData = data.some((d) => d.income > 0 || d.expense > 0);

  return (
    <div className="bg-white rounded-xl border p-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">{t.dashboard.last6Months}</h3>
      {hasData ? (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
            <Tooltip formatter={(v) => formatCurrency(Number(v))} />
            <Legend formatter={(v) => <span className="text-xs capitalize">{v}</span>} />
            <Bar dataKey="income" name={t.dashboard.barIncome} fill="#22c55e" radius={[3, 3, 0, 0]} />
            <Bar dataKey="expense" name={t.dashboard.barExpense} fill="#ef4444" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-48 text-sm text-gray-400">
          {t.dashboard.noBarData}
        </div>
      )}
    </div>
  );
}
