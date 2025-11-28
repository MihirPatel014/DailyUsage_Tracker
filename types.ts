export interface Item {
  id?: number;
  name: string;
  unit: string;
  rate: number;
  provider?: string;
  isRoutine: boolean;
  createdAt: number;
}

export interface Log {
  id?: number;
  itemId: number;
  date: string; // YYYY-MM-DD for grouping
  timestamp: number;
  quantity: number;
  cost: number;
  provider?: string;
  note?: string;
}

export interface AppSettings {
  cycleStartDate: number;
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
}