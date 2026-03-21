import { useState } from 'react';
import type { BudgetProgress } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { useLang } from '../../hooks/useLang';
import { Button } from '../shared/Button';
import { Modal } from '../shared/Modal';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { BudgetForm } from './BudgetForm';
import { useFinance } from '../../hooks/useFinance';

interface Props {
  progress: BudgetProgress;
}

const statusColors = {
  ok: { bar: 'bg-green-500', text: 'text-green-600', bg: 'bg-green-50' },
  warning: { bar: 'bg-yellow-500', text: 'text-yellow-600', bg: 'bg-yellow-50' },
  over: { bar: 'bg-red-500', text: 'text-red-600', bg: 'bg-red-50' },
};

export function BudgetCard({ progress }: Props) {
  const { deleteBudget } = useFinance();
  const { t } = useLang();
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const colors = statusColors[progress.status];
  const pct = Math.min(progress.percentage, 100);

  return (
    <>
      <div className={`rounded-xl border p-4 ${colors.bg}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: progress.category.color }}
            />
            <div>
              <span className="text-sm font-semibold text-gray-800">{progress.category.label}</span>
              {progress.budget.note && (
                <p className="text-xs text-gray-400 line-clamp-2">{progress.budget.note}</p>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setConfirming(true)}>
              <svg className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </Button>
          </div>
        </div>

        <div className="h-2 bg-white rounded-full overflow-hidden mb-2">
          <div
            className={`h-full rounded-full transition-all ${colors.bar}`}
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="flex justify-between text-xs">
          <span className="text-gray-500">
            {formatCurrency(progress.spent)} {t.budgets.spent}
          </span>
          <span className={`font-medium ${colors.text}`}>
            {progress.percentage.toFixed(0)}% {t.budgets.of} {formatCurrency(progress.budget.limit)}
          </span>
        </div>

        {progress.status === 'over' && (
          <p className="text-xs text-red-500 font-medium mt-1">
            {t.budgets.overBy} {formatCurrency(progress.spent - progress.budget.limit)}
          </p>
        )}
      </div>

      <Modal isOpen={editing} onClose={() => setEditing(false)} title={t.budgets.editTitle}>
        <BudgetForm initial={progress.budget} onDone={() => setEditing(false)} />
      </Modal>

      <ConfirmDialog
        isOpen={confirming}
        title={t.budgets.deleteTitle}
        message={t.budgets.deleteMessage}
        onConfirm={() => { deleteBudget(progress.budget.id); setConfirming(false); }}
        onCancel={() => setConfirming(false)}
      />
    </>
  );
}
