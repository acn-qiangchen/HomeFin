import { useFinance } from '../../hooks/useFinance';
import { useLang } from '../../hooks/useLang';
import { computeBudgetProgress } from '../../utils/calculations';
import { BudgetCard } from './BudgetCard';

export function BudgetList() {
  const { state } = useFinance();
  const { t } = useLang();
  const progress = computeBudgetProgress(state);

  if (progress.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-gray-400">
        {t.budgets.noBudgets}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {progress.map((p) => (
        <BudgetCard key={p.budget.id} progress={p} />
      ))}
    </div>
  );
}
