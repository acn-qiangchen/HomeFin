import { useState } from 'react';
import { useFinance } from '../hooks/useFinance';
import { useLang } from '../hooks/useLang';
import { formatMonth } from '../utils/formatters';
import { TransactionList } from '../components/transactions/TransactionList';
import { TransactionForm } from '../components/transactions/TransactionForm';
import { Modal } from '../components/shared/Modal';
import { Button } from '../components/shared/Button';
import { ConfirmDialog } from '../components/shared/ConfirmDialog';
import { seedDemoData } from '../utils/demoData';

export function TransactionsPage() {
  const { state, addTransaction, addTransactions } = useFinance();
  const { t } = useLang();
  const [adding, setAdding] = useState(false);
  const [showCopyConfirm, setShowCopyConfirm] = useState(false);

  // Compute previous month string "YYYY-MM"
  const [year, month] = state.selectedMonth.split('-').map(Number);
  const prevMonth = month === 1
    ? `${year - 1}-12`
    : `${year}-${String(month - 1).padStart(2, '0')}`;

  const fixedFromPrevMonth = state.transactions.filter(
    (tx) => tx.fixed && tx.date.startsWith(prevMonth)
  );

  function handleSeedDemo() {
    const txns = seedDemoData(state.selectedMonth, state.categories);
    txns.forEach(addTransaction);
  }

  function handleCopyFixed() {
    const currentMonth = state.selectedMonth;
    const [cy, cm] = currentMonth.split('-').map(Number);
    const daysInMonth = new Date(cy, cm, 0).getDate();

    const copied = fixedFromPrevMonth
      .map((tx) => {
        const day = parseInt(tx.date.slice(8, 10), 10);
        const clampedDay = Math.min(day, daysInMonth).toString().padStart(2, '0');
        return { ...tx, id: crypto.randomUUID(), createdAt: new Date().toISOString(), date: `${currentMonth}-${clampedDay}` };
      })
      .filter((tx) =>
        !state.transactions.some(
          (existing) =>
            existing.categoryId === tx.categoryId &&
            existing.date === tx.date &&
            existing.amount === tx.amount
        )
      );

    addTransactions(copied);
    setShowCopyConfirm(false);
  }

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">
          {t.transactions.title} — {formatMonth(state.selectedMonth)}
        </h1>
        <div className="flex gap-2">
          {state.transactions.length === 0 && (
            <Button variant="secondary" size="sm" onClick={handleSeedDemo}>
              {t.transactions.addDemoData}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCopyConfirm(true)}
            disabled={fixedFromPrevMonth.length === 0}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {t.transactions.copyLastMonthFixed}
          </Button>
          <Button size="sm" onClick={() => setAdding(true)}>
            {t.transactions.add}
          </Button>
        </div>
      </div>

      <TransactionList />

      <Modal isOpen={adding} onClose={() => setAdding(false)} title={t.transactions.addTitle}>
        <TransactionForm onDone={() => setAdding(false)} />
      </Modal>

      <ConfirmDialog
        isOpen={showCopyConfirm}
        title={t.transactions.copyFixedConfirmTitle}
        message={t.transactions.copyFixedConfirmMessage(fixedFromPrevMonth.length)}
        confirmLabel={t.shared.copy}
        confirmVariant="primary"
        onConfirm={handleCopyFixed}
        onCancel={() => setShowCopyConfirm(false)}
      />
    </div>
  );
}
