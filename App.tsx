import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { History } from './components/History';
import { ItemsManager } from './components/ItemsManager';
import { Settings } from './components/Settings';
import { Theme } from './types';

const AppContent: React.FC<{
  theme: Theme;
  setTheme: (t: Theme) => void;
}> = ({ theme, setTheme }) => {
  const navigate = useNavigate();

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard onAddItemClick={() => navigate('/items')} />} />
        <Route path="/history" element={<History />} />
        <Route path="/items" element={<ItemsManager />} />
        <Route path="/settings" element={<Settings currentTheme={theme} onThemeChange={setTheme} />} />
      </Routes>
    </Layout>
  );
};

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) || Theme.SYSTEM;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const applyTheme = (t: Theme) => {
      if (t === Theme.DARK || (t === Theme.SYSTEM && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme(theme);
    localStorage.setItem('theme', theme);

    if (theme === Theme.SYSTEM) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme(Theme.SYSTEM);
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  return (
    <HashRouter>
      <AppContent theme={theme} setTheme={setTheme} />
    </HashRouter>
  );
};

export default App;