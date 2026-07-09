import Dexie, { type Table } from 'dexie';

export interface Favorite {
  calculatorId: string;
  createdAt: number;
}

export interface CalculationHistory {
  id?: number;
  calculatorId: string;
  title: string;
  timestamp: number;
  inputs: Record<string, any>;
  outputs: Record<string, any>;
}

export interface AppSetting {
  key: string;
  value: any;
}

export class MortgageHubDatabase extends Dexie {
  favorites!: Table<Favorite, string>;
  history!: Table<CalculationHistory, number>;
  settings!: Table<AppSetting, string>;

  constructor() {
    super('MortgageHubDB');
    this.version(1).stores({
      favorites: 'calculatorId',
      history: '++id, calculatorId, timestamp',
      settings: 'key'
    });
  }
}

export const db = new MortgageHubDatabase();
