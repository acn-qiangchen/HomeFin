import './aws-config';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { FinanceProvider } from './context/FinanceContext';
import { LangProvider } from './context/LangContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { BudgetsPage } from './pages/BudgetsPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  return (
    <LangProvider>
      <Authenticator>
        {() => (
          <FinanceProvider>
            <HashRouter>
              <div className="flex min-h-screen bg-gray-50">
                <Sidebar />
                <div className="flex-1 flex flex-col min-w-0">
                  <TopBar />
                  <main className="flex-1 pb-20 md:pb-0">
                    <Routes>
                      <Route path="/" element={<DashboardPage />} />
                      <Route path="/transactions" element={<TransactionsPage />} />
                      <Route path="/budgets" element={<BudgetsPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                    </Routes>
                  </main>
                </div>
              </div>
            </HashRouter>
          </FinanceProvider>
        )}
      </Authenticator>
    </LangProvider>
  );
}
