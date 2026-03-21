import { useState } from 'react';
import type { Budget } from '../../types';
import { useFinance } from '../../hooks/useFinance';
import { useLang } from '../../hooks/useLang';
import { Button } from '../shared/Button';
import { Input, Select } from '../shared/Input';

interface Props {
  initial?: Budget;
  onDone: () => void;
}

export function BudgetForm({ initial, onDone }: Props) {
  const { state, addBudget, updateBudget } = useFinance();
  const { t } = useLang();
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? '');
  const [month, setMonth] = useState(initial?.month ?? state.selectedMonth);
  const [limit, setLimit] = useState(initial ? String(initial.limit) : '');
  const [note, setNote] = useState(initial?.note ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const budgetCategories = state.categories.filter(
    (c) => c.type === 'expense' || c.type === 'both'
  );

  function validate() {
    const e: Record<string, string> = {};
    if (!categoryId) e.categoryId = t.budgets.errCategory;
    if (!limit || Number(limit) <= 0) e.limit = t.budgets.errLimit;
    if (!month) e.month = t.budgets.errMonth;
    if (!initial) {
      const exists = state.budgets.some(
        (b) => b.categoryId === categoryId && b.month === month
      );
      if (exists) e.categoryId = t.budgets.errDuplicate;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const budget: Budget = {
      id: initial?.id ?? crypto.randomUUID(),
      categoryId,
      month,
      limit: Number(limit),
      note: note || undefined,
    };

    if (initial) updateBudget(budget);
    else addBudget(budget);
    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Select
        label={t.budgets.labelCategory}
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        error={errors.categoryId}
      >
        <option value="">{t.budgets.selectCategory}</option>
        {budgetCategories.map((c) => (
          <option key={c.id} value={c.id}>{c.label}</option>
        ))}
      </Select>

      <Input
        label={t.budgets.labelMonth}
        type="month"
        value={month}
        onChange={(e) => setMonth(e.target.value)}
        error={errors.month}
      />

      <Input
        label={t.budgets.labelLimit}
        type="number"
        min="1"
        step="1"
        value={limit}
        onChange={(e) => setLimit(e.target.value)}
        placeholder="0"
        error={errors.limit}
      />

      <Input
        label={t.budgets.labelNote}
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder={t.budgets.notePlaceholder}
      />

      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="secondary" onClick={onDone}>{t.budgets.btnCancel}</Button>
        <Button type="submit">{initial ? t.budgets.btnSave : t.budgets.btnAdd}</Button>
      </div>
    </form>
  );
}
