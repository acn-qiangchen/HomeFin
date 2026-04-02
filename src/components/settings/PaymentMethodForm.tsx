import { useState } from 'react';
import type { PaymentMethod } from '../../types';
import { useFinance } from '../../hooks/useFinance';
import { useLang } from '../../hooks/useLang';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';

interface Props {
  initial?: PaymentMethod;
  onDone: () => void;
}

export function PaymentMethodForm({ initial, onDone }: Props) {
  const { state, addPaymentMethod, updatePaymentMethod } = useFinance();
  const { t } = useLang();
  const [label, setLabel] = useState(initial?.label ?? '');
  const [error, setError] = useState('');

  function validate() {
    if (!label.trim()) {
      setError(t.settings.errPaymentMethodName);
      return false;
    }
    const duplicate = state.paymentMethods.some(
      (pm) => pm.label.toLowerCase() === label.trim().toLowerCase() && pm.id !== initial?.id
    );
    if (duplicate) {
      setError(t.settings.errPaymentMethodDuplicate);
      return false;
    }
    setError('');
    return true;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const pm: PaymentMethod = {
      id: initial?.id ?? crypto.randomUUID(),
      label: label.trim(),
    };

    if (initial) updatePaymentMethod(pm);
    else addPaymentMethod(pm);
    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label={t.settings.labelName}
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder={t.settings.paymentMethodNamePlaceholder}
        error={error}
      />

      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="secondary" onClick={onDone}>{t.settings.btnCancel}</Button>
        <Button type="submit">{initial ? t.settings.btnSave : t.settings.btnAdd}</Button>
      </div>
    </form>
  );
}
