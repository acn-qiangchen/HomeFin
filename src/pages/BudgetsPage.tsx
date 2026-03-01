import { useState } from 'react';
import { useFinance } from '../hooks/useFinance';
import { useLang } from '../hooks/useLang';
import { formatMonth } from '../utils/formatters';
import { BudgetList } from '../components/budgets/BudgetList';
import { BudgetForm } from '../components/budgets/BudgetForm';
import { Modal } from '../components/shared/Modal';
import { Button } from '../components/shared/Button';

export function BudgetsPage() {
  const { state } = useFinance();
  const { t } = useLang();
  const [adding, setAdding] = useState(false);

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">
          {t.budgets.title} — {formatMonth(state.selectedMonth)}
        </h1>
        <Button size="sm" onClick={() => setAdding(true)}>
          {t.budgets.addBudget}
        </Button>
      </div>

      <BudgetList />

      <Modal isOpen={adding} onClose={() => setAdding(false)} title={t.budgets.addTitle}>
        <BudgetForm onDone={() => setAdding(false)} />
      </Modal>
    </div>
  );
}
