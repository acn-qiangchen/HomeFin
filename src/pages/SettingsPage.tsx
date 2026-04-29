import { useState } from 'react';
import { useLang } from '../hooks/useLang';
import { CategoryList } from '../components/settings/CategoryList';
import { CategoryForm } from '../components/settings/CategoryForm';
import { PaymentMethodList } from '../components/settings/PaymentMethodList';
import { PaymentMethodForm } from '../components/settings/PaymentMethodForm';
import { Modal } from '../components/shared/Modal';
import { Button } from '../components/shared/Button';
import { APP_VERSION } from '../utils/appVersion';

export function SettingsPage() {
  const { t } = useLang();
  const [addingCategory, setAddingCategory] = useState(false);
  const [addingPaymentMethod, setAddingPaymentMethod] = useState(false);

  return (
    <div className="p-4 md:p-6 space-y-8 max-w-2xl mx-auto">
      {/* Categories section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{t.settings.title}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{t.settings.subtitle}</p>
          </div>
          <Button size="sm" onClick={() => setAddingCategory(true)}>
            {t.settings.addCategory}
          </Button>
        </div>
        <CategoryList />
      </div>

      {/* Payment Methods section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{t.settings.paymentMethodsTitle}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{t.settings.paymentMethodsSubtitle}</p>
          </div>
          <Button size="sm" onClick={() => setAddingPaymentMethod(true)}>
            {t.settings.addPaymentMethod}
          </Button>
        </div>
        <PaymentMethodList />
      </div>

      {/* App version — shown on mobile where the sidebar footer is hidden */}
      <div className="md:hidden pt-2 pb-4 border-t border-gray-200">
        <p className="text-xs text-gray-400">
          {t.settings.appVersion}: {APP_VERSION}
        </p>
      </div>

      <Modal isOpen={addingCategory} onClose={() => setAddingCategory(false)} title={t.settings.addTitle}>
        <CategoryForm onDone={() => setAddingCategory(false)} />
      </Modal>

      <Modal isOpen={addingPaymentMethod} onClose={() => setAddingPaymentMethod(false)} title={t.settings.addPaymentMethodTitle}>
        <PaymentMethodForm onDone={() => setAddingPaymentMethod(false)} />
      </Modal>
    </div>
  );
}
