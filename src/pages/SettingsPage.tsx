import { useState } from 'react';
import { useLang } from '../hooks/useLang';
import { CategoryList } from '../components/settings/CategoryList';
import { CategoryForm } from '../components/settings/CategoryForm';
import { Modal } from '../components/shared/Modal';
import { Button } from '../components/shared/Button';

export function SettingsPage() {
  const { t } = useLang();
  const [adding, setAdding] = useState(false);

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t.settings.title}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{t.settings.subtitle}</p>
        </div>
        <Button size="sm" onClick={() => setAdding(true)}>
          {t.settings.addCategory}
        </Button>
      </div>

      <CategoryList />

      <Modal isOpen={adding} onClose={() => setAdding(false)} title={t.settings.addTitle}>
        <CategoryForm onDone={() => setAdding(false)} />
      </Modal>
    </div>
  );
}
