import { signOut } from 'aws-amplify/auth';
import { useFinance } from '../../hooks/useFinance';
import { useLang } from '../../hooks/useLang';
import type { Lang } from '../../i18n/translations';
import { formatMonth, localYearMonth } from '../../utils/formatters';
import { getLast6Months } from '../../utils/calculations';

function getMonthOptions(): string[] {
  const months = getLast6Months();
  const last = months[months.length - 1];
  const [y, m] = last.split('-').map(Number);
  const next = new Date(y, m, 1);
  return [...months, localYearMonth(next)];
}

const LANGS: { value: Lang; label: string }[] = [
  { value: 'en', label: 'EN' },
  { value: 'ja', label: '日本語' },
];

export function TopBar() {
  const { state, setSelectedMonth, syncing } = useFinance();
  const { lang, setLang, t } = useLang();

  return (
    <header className="h-14 bg-white border-b flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      <h2 className="text-base font-semibold text-gray-800 md:hidden">{t.app.name}</h2>
      <div className="hidden md:block" />
      <div className="flex items-center gap-3">
        {/* Sync indicator */}
        {syncing && (
          <span className="text-xs text-gray-400 animate-pulse hidden sm:block">
            {t.auth.syncing}
          </span>
        )}

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

        {/* Sign out */}
        <button
          onClick={() => signOut()}
          className="text-xs text-gray-400 hover:text-gray-700 transition-colors px-2 py-1 rounded-lg hover:bg-gray-100"
          title={t.auth.signOut}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </header>
  );
}
