import { useFinance } from '../../hooks/useFinance';
import { useLang } from '../../hooks/useLang';
import type { Lang } from '../../i18n/translations';
import { formatMonth, localYearMonth } from '../../utils/formatters';
import { getLast6Months } from '../../utils/calculations';

function getMonthOptions(): string[] {
  const months = getLast6Months();
  // add next month so users can plan ahead
  const last = months[months.length - 1];
  const [y, m] = last.split('-').map(Number);
  const next = new Date(y, m, 1); // new Date(year, month, 1) uses local time
  return [...months, localYearMonth(next)];
}

const LANGS: { value: Lang; label: string }[] = [
  { value: 'en', label: 'EN' },
  { value: 'ja', label: '日本語' },
];

export function TopBar() {
  const { state, setSelectedMonth } = useFinance();
  const { lang, setLang, t } = useLang();

  return (
    <header className="h-14 bg-white border-b flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      <h2 className="text-base font-semibold text-gray-800 md:hidden">{t.app.name}</h2>
      <div className="hidden md:block" />
      <div className="flex items-center gap-3">
        {/* Language switcher */}
        <div className="flex rounded-lg overflow-hidden border border-gray-200">
          {LANGS.map((l) => (
            <button
              key={l.value}
              onClick={() => setLang(l.value)}
              className={`px-3 py-1 text-xs font-medium transition-colors ${
                lang === l.value
                  ? 'bg-gray-800 text-white'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Month selector */}
        <label htmlFor="month-select" className="text-sm text-gray-500 hidden sm:block">
          {t.topBar.period}
        </label>
        <select
          id="month-select"
          value={state.selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          {getMonthOptions().map((m) => (
            <option key={m} value={m}>{formatMonth(m)}</option>
          ))}
        </select>
      </div>
    </header>
  );
}
