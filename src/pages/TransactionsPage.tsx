import { useState } from 'react';
import { useFinance } from '../hooks/useFinance';
import { useLang } from '../hooks/useLang';
import { formatMonth } from '../utils/formatters';
import { TransactionList } from '../components/transactions/TransactionList';
import { TransactionForm } from '../components/transactions/TransactionForm';
import { Modal } from '../components/shared/Modal';
import { Button } from '../components/shared/Button';
import { seedDemoData } from '../utils/demoData';

export function TransactionsPage() {
  const { state, addTransaction } = useFinance();
  const { t } = useLang();
  const [adding, setAdding] = useState(false);

  function handleSeedDemo() {
    const txns = seedDemoData(state.selectedMonth, state.categories);
    txns.forEach(addTransaction);
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
          <Button size="sm" onClick={() => setAdding(true)}>
            {t.transactions.add}
          </Button>
        </div>
      </div>

      <TransactionList />

      <Modal isOpen={adding} onClose={() => setAdding(false)} title={t.transactions.addTitle}>
        <TransactionForm onDone={() => setAdding(false)} />
      </Modal>
    </div>
  );
}
