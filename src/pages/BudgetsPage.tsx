import { useState } from 'react';
import { useFinance } from '../hooks/useFinance';
import { useLang } from '../hooks/useLang';
import { formatMonth, formatCurrency } from '../utils/formatters';
import { BudgetList } from '../components/budgets/BudgetList';
import { BudgetForm } from '../components/budgets/BudgetForm';
import { Modal } from '../components/shared/Modal';
import { Button } from '../components/shared/Button';
import { ConfirmDialog } from '../components/shared/ConfirmDialog';

export function BudgetsPage() {
  const { state, addBudgets } = useFinance();
  const { t } = useLang();
  const [adding, setAdding] = useState(false);
  const [showCopyConfirm, setShowCopyConfirm] = useState(false);

  const [year, month] = state.selectedMonth.split('-').map(Number);
  const prevMonth = month === 1
    ? `${year - 1}-12`
    : `${year}-${String(month - 1).padStart(2, '0')}`;

  const budgetsFromPrevMonth = state.budgets.filter((b) => b.month === prevMonth);
  const totalLimit = state.budgets
    .filter((b) => b.month === state.selectedMonth)
    .reduce((sum, b) => sum + b.limit, 0);

  function handleCopyBudgets() {
    const currentMonth = state.selectedMonth;
    const copied = budgetsFromPrevMonth
      .map((b) => ({ ...b, id: crypto.randomUUID(), month: currentMonth }))
      .filter((b) =>
        !state.budgets.some(
          (existing) => existing.categoryId === b.categoryId && existing.month === currentMonth
        )
      );
    addBudgets(copied);
    setShowCopyConfirm(false);
  }

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">
          {t.budgets.title} — {formatMonth(state.selectedMonth)}
        </h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCopyConfirm(true)}
            disabled={budgetsFromPrevMonth.length === 0}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {t.budgets.copyLastMonth}
          </Button>
          <Button size="sm" onClick={() => setAdding(true)}>
            {t.budgets.addBudget}
          </Button>
        </div>
      </div>

      {totalLimit > 0 && (
        <div className="flex justify-end text-sm text-gray-500">
          {t.budgets.totalBudget}:
          <span className="ml-1 font-semibold text-gray-800">{formatCurrency(totalLimit)}</span>
        </div>
      )}

      <BudgetList />

      <Modal isOpen={adding} onClose={() => setAdding(false)} title={t.budgets.addTitle}>
        <BudgetForm onDone={() => setAdding(false)} />
      </Modal>

      <ConfirmDialog
        isOpen={showCopyConfirm}
        title={t.budgets.copyConfirmTitle}
        message={t.budgets.copyConfirmMessage(budgetsFromPrevMonth.length)}
        confirmLabel={t.shared.copy}
        confirmVariant="primary"
        onConfirm={handleCopyBudgets}
        onCancel={() => setShowCopyConfirm(false)}
      />
    </div>
  );
}
