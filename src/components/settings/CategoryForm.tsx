import { useState } from 'react';
import type { Category, TransactionType } from '../../types';
import { useFinance } from '../../hooks/useFinance';
import { useLang } from '../../hooks/useLang';
import { Button } from '../shared/Button';
import { Input, Select } from '../shared/Input';

interface Props {
  initial?: Category;
  onDone: () => void;
}

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280',
  '#f59e0b', '#10b981', '#0ea5e9', '#a855f7', '#fb923c',
];

export function CategoryForm({ initial, onDone }: Props) {
  const { state, addCategory, updateCategory } = useFinance();
  const { t } = useLang();
  const [label, setLabel] = useState(initial?.label ?? '');
  const [type, setType] = useState<TransactionType | 'both'>(initial?.type ?? 'expense');
  const [color, setColor] = useState(initial?.color ?? PRESET_COLORS[0]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!label.trim()) e.label = t.settings.errName;
    if (!initial) {
      const id = label.trim().toLowerCase().replace(/\s+/g, '_');
      if (state.categories.some((c) => c.id === id)) {
        e.label = t.settings.errDuplicate;
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const id = initial?.id ?? label.trim().toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();
    const category: Category = { id, label: label.trim(), color, type };

    if (initial) updateCategory(category);
    else addCategory(category);
    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label={t.settings.labelName}
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder={t.settings.namePlaceholder}
        error={errors.label}
      />

      <Select
        label={t.settings.labelAppliesTo}
        value={type}
        onChange={(e) => setType(e.target.value as TransactionType | 'both')}
      >
        <option value="expense">{t.settings.expense}</option>
        <option value="income">{t.settings.income}</option>
        <option value="both">{t.settings.both}</option>
      </Select>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">{t.settings.labelColor}</label>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-7 h-7 rounded-full transition-transform hover:scale-110 ${
                color === c ? 'ring-2 ring-offset-2 ring-gray-500 scale-110' : ''
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-500">{t.settings.labelCustom}</span>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-7 w-12 cursor-pointer rounded border border-gray-300"
          />
          <span className="text-xs text-gray-400">{color}</span>
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="secondary" onClick={onDone}>{t.settings.btnCancel}</Button>
        <Button type="submit">{initial ? t.settings.btnSave : t.settings.btnAdd}</Button>
      </div>
    </form>
  );
}
