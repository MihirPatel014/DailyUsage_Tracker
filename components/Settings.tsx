import React, { useState, useEffect } from 'react';
import { RefreshCw, Moon, Sun, Monitor, Trash } from 'lucide-react';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { setCycleStartDate, getCycleStartDate } from '../db';
import { Theme } from '../types';

interface SettingsProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export const Settings: React.FC<SettingsProps> = ({ currentTheme, onThemeChange }) => {
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [lastCycleDate, setLastCycleDate] = useState<number>(getCycleStartDate());

  useEffect(() => {
      // Refresh local state if it changes elsewhere
      setLastCycleDate(getCycleStartDate());
  }, []);

  const handleResetCycle = () => {
    setCycleStartDate(Date.now());
    setLastCycleDate(Date.now());
    setIsResetModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-20">
      <header>
        <h1 className="text-2xl font-bold">Settings</h1>
      </header>

      <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-lg">Monthly Cycle</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
             Manage your billing cycle. Resetting starts a new period but keeps all your logs.
          </p>
        </div>
        <div className="p-4 flex items-center justify-between">
           <div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Current Cycle Start</div>
              <div className="text-sm text-gray-500">{new Date(lastCycleDate).toLocaleDateString()}</div>
           </div>
           <Button variant="danger" size="sm" onClick={() => setIsResetModalOpen(true)}>
             <RefreshCw size={16} className="mr-2" />
             End Cycle
           </Button>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-lg">Appearance</h2>
        </div>
        <div className="p-4 grid grid-cols-3 gap-2">
            <button
              onClick={() => onThemeChange(Theme.LIGHT)}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border ${currentTheme === Theme.LIGHT ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'border-gray-200 dark:border-gray-700'}`}
            >
              <Sun size={24} className="mb-2" />
              <span className="text-xs font-medium">Light</span>
            </button>
            <button
              onClick={() => onThemeChange(Theme.DARK)}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border ${currentTheme === Theme.DARK ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'border-gray-200 dark:border-gray-700'}`}
            >
              <Moon size={24} className="mb-2" />
              <span className="text-xs font-medium">Dark</span>
            </button>
            <button
              onClick={() => onThemeChange(Theme.SYSTEM)}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border ${currentTheme === Theme.SYSTEM ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'border-gray-200 dark:border-gray-700'}`}
            >
              <Monitor size={24} className="mb-2" />
              <span className="text-xs font-medium">System</span>
            </button>
        </div>
      </section>

      <div className="text-center text-xs text-gray-400 pt-8">
         <p>DailyUsage Tracker v1.0.0 (MVP)</p>
         <p>Offline Ready</p>
      </div>

      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Reset Monthly Cycle?"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            Do you want to reset monthly totals? Your logs will remain saved in history, but the dashboard totals will reset to zero starting from today.
          </p>
          <div className="flex space-x-3 pt-2">
            <Button variant="secondary" className="w-full" onClick={() => setIsResetModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" className="w-full" onClick={handleResetCycle}>
              Yes, Reset
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};