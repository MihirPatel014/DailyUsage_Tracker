import Dexie, { Table } from 'dexie';
import { Item, Log } from './types';

export class DailyUsageDatabase extends Dexie {
  items!: Table<Item, number>;
  logs!: Table<Log, number>;

  constructor() {
    super('DailyUsageTrackerDB');
    // Cast to any to avoid TS error about version not existing, though it exists at runtime
    (this as any).version(1).stores({
      items: '++id, name, isRoutine',
      logs: '++id, itemId, date, timestamp'
    });
  }
}

export const db = new DailyUsageDatabase();

// Helper to manage cycle start date in localStorage for simplicity in Phase 1
export const getCycleStartDate = (): number => {
  const stored = localStorage.getItem('cycleStartDate');
  if (stored) {
    return parseInt(stored, 10);
  }
  const now = Date.now();
  localStorage.setItem('cycleStartDate', now.toString());
  return now;
};

export const setCycleStartDate = (timestamp: number) => {
  localStorage.setItem('cycleStartDate', timestamp.toString());
  // Trigger a custom event so components can react if needed, 
  // though we will likely use React state for the UI trigger.
  window.dispatchEvent(new Event('cycle-reset'));
};