import { useState } from 'react';
import type { Category } from '../../types';
import { useFinance } from '../../hooks/useFinance';
import { useLang } from '../../hooks/useLang';
import { Button } from '../shared/Button';
import { Modal } from '../shared/Modal';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { CategoryForm } from './CategoryForm';

const TYPE_BADGE: Record<string, string> = {
  income: 'bg-green-100 text-green-700',
  expense: 'bg-red-100 text-red-700',
  both: 'bg-blue-100 text-blue-700',
};

interface RowProps {
  category: Category;
  canDelete: boolean;
}

function CategoryRow({ category, canDelete }: RowProps) {
  const { deleteCategory } = useFinance();
  const { t } = useLang();
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const typeLabel: Record<string, string> = {
    income: t.settings.income,
    expense: t.settings.expense,
    both: t.settings.both,
  };

  return (
    <>
      <div className="flex items-center gap-3 py-3 px-4 hover:bg-gray-50 rounded-lg">
        <span
          className="w-4 h-4 rounded-full flex-shrink-0"
          style={{ backgroundColor: category.color }}
        />
        <span className="flex-1 text-sm font-medium text-gray-800">{category.label}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_BADGE[category.type]}`}>
          {typeLabel[category.type]}
        </span>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfirming(true)}
            disabled={!canDelete}
            title={canDelete ? t.settings.tooltipDelete : t.settings.tooltipInUse}
          >
            <svg className={`h-4 w-4 ${canDelete ? 'text-red-400' : 'text-gray-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </Button>
        </div>
      </div>

      <Modal isOpen={editing} onClose={() => setEditing(false)} title={t.settings.editTitle}>
        <CategoryForm initial={category} onDone={() => setEditing(false)} />
      </Modal>

      <ConfirmDialog
        isOpen={confirming}
        title={t.settings.deleteTitle}
        message={t.settings.deleteMessage(category.label)}
        onConfirm={() => { deleteCategory(category.id); setConfirming(false); }}
        onCancel={() => setConfirming(false)}
      />
    </>
  );
}

export function CategoryList() {
  const { state } = useFinance();
  const { t } = useLang();

  const usedIds = new Set([
    ...state.transactions.map((txn) => txn.categoryId),
    ...state.budgets.map((b) => b.categoryId),
  ]);

  const typeLabel: Record<string, string> = {
    income: t.settings.income,
    expense: t.settings.expense,
    both: t.settings.both,
  };

  const byType = {
    income: state.categories.filter((c) => c.type === 'income'),
    expense: state.categories.filter((c) => c.type === 'expense'),
    both: state.categories.filter((c) => c.type === 'both'),
  };

  return (
    <div className="flex flex-col gap-6">
      {(['expense', 'income', 'both'] as const).map((type) => (
        byType[type].length > 0 && (
          <div key={type} className="bg-white rounded-xl border">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 px-4 py-3 border-b">
              {typeLabel[type]}
            </h3>
            <div className="divide-y divide-gray-100">
              {byType[type].map((cat) => (
                <CategoryRow
                  key={cat.id}
                  category={cat}
                  canDelete={!usedIds.has(cat.id)}
                />
              ))}
            </div>
          </div>
        )
      ))}
    </div>
  );
}
