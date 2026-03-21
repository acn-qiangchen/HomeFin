import { useState } from 'react';
import type { Transaction } from '../../types';
import { useFinance } from '../../hooks/useFinance';
import { useLang } from '../../hooks/useLang';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Modal } from '../shared/Modal';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { TransactionForm } from './TransactionForm';
import { Button } from '../shared/Button';

interface Props {
  transaction: Transaction;
}

export function TransactionRow({ transaction: txn }: Props) {
  const { state, deleteTransaction } = useFinance();
  const { t } = useLang();
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const category = state.categories.find((c) => c.id === txn.categoryId);

  return (
    <>
      <div className="flex items-center gap-3 py-3 px-4 hover:bg-gray-50 rounded-lg">
        <span
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: category?.color ?? '#6b7280' }}
        />
        <div className="flex-1 min-w-0">
          <p className="flex items-center gap-1.5 text-sm font-medium text-gray-800 truncate">
            {category?.label ?? txn.categoryId}
            {txn.fixed && (
              <span className="text-xs bg-blue-100 text-blue-600 rounded px-1 font-normal flex-shrink-0">
                {t.transactions.fixedBadge}
              </span>
            )}
          </p>
          {txn.note && <p className="text-xs text-gray-400 truncate">{txn.note}</p>}
        </div>
        <span className="text-xs text-gray-400 hidden sm:block">{formatDate(txn.date)}</span>
        <span
          className={`text-sm font-semibold w-24 text-right ${
            txn.type === 'income' ? 'text-green-600' : 'text-red-500'
          }`}
        >
          {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
        </span>
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

      <Modal isOpen={editing} onClose={() => setEditing(false)} title={t.transactions.editTitle}>
        <TransactionForm initial={txn} onDone={() => setEditing(false)} />
      </Modal>

      <ConfirmDialog
        isOpen={confirming}
        title={t.transactions.deleteTitle}
        message={t.transactions.deleteMessage}
        onConfirm={() => { deleteTransaction(txn.id); setConfirming(false); }}
        onCancel={() => setConfirming(false)}
      />
    </>
  );
}
