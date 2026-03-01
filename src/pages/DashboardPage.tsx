import { SummaryCards } from '../components/dashboard/SummaryCards';
import { SpendingPieChart } from '../components/dashboard/SpendingPieChart';
import { MonthlyBarChart } from '../components/dashboard/MonthlyBarChart';
import { RecentTransactions } from '../components/dashboard/RecentTransactions';
import { useFinance } from '../hooks/useFinance';
import { useLang } from '../hooks/useLang';
import { formatMonth } from '../utils/formatters';

export function DashboardPage() {
  const { state } = useFinance();
  const { t } = useLang();

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900">
        {t.dashboard.title} — {formatMonth(state.selectedMonth)}
      </h1>
      <SummaryCards />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpendingPieChart />
        <MonthlyBarChart />
      </div>
      <RecentTransactions />
    </div>
  );
}
