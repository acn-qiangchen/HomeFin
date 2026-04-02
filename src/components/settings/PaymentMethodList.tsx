import { useState } from 'react';
import type { PaymentMethod } from '../../types';
import { useFinance } from '../../hooks/useFinance';
import { useLang } from '../../hooks/useLang';
import { Button } from '../shared/Button';
import { Modal } from '../shared/Modal';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { PaymentMethodForm } from './PaymentMethodForm';

interface RowProps {
  pm: PaymentMethod;
  canDelete: boolean;
}

function PaymentMethodRow({ pm, canDelete }: RowProps) {
  const { deletePaymentMethod } = useFinance();
  const { t } = useLang();
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);

  return (
    <>
      <div className="flex items-center gap-3 py-3 px-4 hover:bg-gray-50 rounded-lg">
        <span className="flex-1 text-sm font-medium text-gray-800">{pm.label}</span>
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
            title={canDelete ? t.settings.tooltipDelete : t.settings.tooltipPaymentMethodInUse}
          >
            <svg className={`h-4 w-4 ${canDelete ? 'text-red-400' : 'text-gray-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </Button>
        </div>
      </div>

      <Modal isOpen={editing} onClose={() => setEditing(false)} title={t.settings.editPaymentMethodTitle}>
        <PaymentMethodForm initial={pm} onDone={() => setEditing(false)} />
      </Modal>

      <ConfirmDialog
        isOpen={confirming}
        title={t.settings.deletePaymentMethodTitle}
        message={t.settings.deletePaymentMethodMessage(pm.label)}
        onConfirm={() => { deletePaymentMethod(pm.id); setConfirming(false); }}
        onCancel={() => setConfirming(false)}
      />
    </>
  );
}

export function PaymentMethodList() {
  const { state } = useFinance();
  const usedIds = new Set(
    state.transactions.map((txn) => txn.paymentMethodId).filter(Boolean) as string[]
  );

  if (state.paymentMethods.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border">
      <div className="divide-y divide-gray-100">
        {state.paymentMethods.map((pm) => (
          <PaymentMethodRow key={pm.id} pm={pm} canDelete={!usedIds.has(pm.id)} />
        ))}
      </div>
    </div>
  );
}
