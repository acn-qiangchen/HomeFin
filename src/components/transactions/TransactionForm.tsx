import { useState } from 'react';
import type { Transaction, TransactionType } from '../../types';
import { useFinance } from '../../hooks/useFinance';
import { useLang } from '../../hooks/useLang';
import { localYearMonthDay } from '../../utils/formatters';
import { Button } from '../shared/Button';
import { Input, Select } from '../shared/Input';

interface Props {
  initial?: Transaction;
  onDone: () => void;
}

function today(): string {
  return localYearMonthDay();
}

export function TransactionForm({ initial, onDone }: Props) {
  const { state, addTransaction, updateTransaction } = useFinance();
  const { t } = useLang();
  const [type, setType] = useState<TransactionType>(initial?.type ?? 'expense');
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '');
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? '');
  const [date, setDate] = useState(initial?.date ?? today());
  const [note, setNote] = useState(initial?.note ?? '');
  const [fixed, setFixed] = useState(initial?.fixed ?? false);
  const [paymentMethodId, setPaymentMethodId] = useState(initial?.paymentMethodId ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = state.categories.filter(
    (c) => c.type === type || c.type === 'both'
  );

  function validate() {
    const e: Record<string, string> = {};
    if (!amount || Number(amount) <= 0) e.amount = t.transactions.errAmount;
    if (!categoryId) e.categoryId = t.transactions.errCategory;
    if (!date) e.date = t.transactions.errDate;
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const txn: Transaction = {
      id: initial?.id ?? crypto.randomUUID(),
      type,
      amount: Number(amount),
      categoryId,
      date,
      note,
      createdAt: initial?.createdAt ?? new Date().toISOString(),
      fixed: fixed || undefined,
      paymentMethodId: paymentMethodId || undefined,
    };

    if (initial) updateTransaction(txn);
    else addTransaction(txn);
    onDone();
  }

  const typeLabels: Record<TransactionType, string> = {
    expense: t.transactions.expense,
    income: t.transactions.income,
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Type toggle */}
      <div className="flex rounded-lg overflow-hidden border border-gray-200">
        {(['expense', 'income'] as TransactionType[]).map((tp) => (
          <button
            key={tp}
            type="button"
            onClick={() => { setType(tp); setCategoryId(''); }}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              type === tp
                ? tp === 'expense'
                  ? 'bg-red-500 text-white'
                  : 'bg-green-500 text-white'
                : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
          >
            {typeLabels[tp]}
          </button>
        ))}
      </div>

      <Input
        label={t.transactions.labelAmount}
        type="number"
        min="0.01"
        step="0.01"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="0.00"
        error={errors.amount}
      />

      <Select
        label={t.transactions.labelCategory}
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        error={errors.categoryId}
      >
        <option value="">{t.transactions.selectCategory}</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.label}</option>
        ))}
      </Select>

      <Input
        label={t.transactions.labelDate}
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        error={errors.date}
      />

      <Input
        label={t.transactions.labelNote}
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder={t.transactions.notePlaceholder}
      />

      {state.paymentMethods.length > 0 && (
        <Select
          label={t.transactions.labelPaymentMethod}
          value={paymentMethodId}
          onChange={(e) => setPaymentMethodId(e.target.value)}
        >
          <option value="">{t.transactions.selectPaymentMethod}</option>
          {state.paymentMethods.map((pm) => (
            <option key={pm.id} value={pm.id}>{pm.label}</option>
          ))}
        </Select>
      )}

      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={fixed}
          onChange={(e) => setFixed(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-blue-600"
        />
        {t.transactions.markAsFixed}
      </label>

      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="secondary" onClick={onDone}>{t.transactions.btnCancel}</Button>
        <Button type="submit">{initial ? t.transactions.btnSave : t.transactions.btnAdd}</Button>
      </div>
    </form>
  );
}
