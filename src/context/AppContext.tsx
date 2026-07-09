import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type CalculationHistory } from '../db/database';

export type Theme = 'light' | 'dark';
export type Lender = 'generic' | 'lloyds' | 'halifax' | 'bm';

interface AppContextType {
  theme: Theme;
  lender: Lender;
  favorites: string[];
  history: CalculationHistory[];
  salaryMultiplier: number;
  incomeBuilderRules: Record<string, number>;
  toggleTheme: () => void;
  setLender: (lender: Lender) => void;
  toggleFavorite: (calculatorId: string) => void;
  addHistory: (calculatorId: string, title: string, inputs: Record<string, any>, outputs: Record<string, any>) => void;
  clearHistory: () => void;
  deleteHistoryItem: (id: number) => void;
  updateSalaryMultiplier: (multiplier: number) => void;
  updateIncomeBuilderRule: (field: string, percentage: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultIncomeRules: Record<Lender, Record<string, number>> = {
  generic: { basic: 100, bonus: 100, commission: 100, overtime: 100, carAllowance: 100, shiftAllowance: 100 },
  lloyds: { basic: 100, bonus: 50, commission: 50, overtime: 50, carAllowance: 100, shiftAllowance: 100 },
  halifax: { basic: 100, bonus: 60, commission: 60, overtime: 60, carAllowance: 100, shiftAllowance: 100 },
  bm: { basic: 100, bonus: 50, commission: 50, overtime: 50, carAllowance: 100, shiftAllowance: 100 },
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('light');
  const [lender, setLenderState] = useState<Lender>('generic');
  const [salaryMultiplier, setSalaryMultiplier] = useState<number>(52); // Default weekly multiplier
  const [incomeBuilderRules, setIncomeBuilderRules] = useState<Record<string, number>>(defaultIncomeRules.generic);

  // Live queries from Dexie
  const dbFavorites = useLiveQuery(() => db.favorites.toArray());
  const dbHistory = useLiveQuery(() => db.history.orderBy('timestamp').reverse().toArray());
  const dbSettings = useLiveQuery(() => db.settings.toArray());

  // Load settings on startup
  useEffect(() => {
    if (dbSettings) {
      const themeSetting = dbSettings.find(s => s.key === 'theme');
      if (themeSetting) {
        setThemeState(themeSetting.value);
        document.documentElement.className = themeSetting.value;
      } else {
        // Detect system preference
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const systemTheme = isDark ? 'dark' : 'light';
        setThemeState(systemTheme);
        document.documentElement.className = systemTheme;
      }

      const lenderSetting = dbSettings.find(s => s.key === 'lender');
      if (lenderSetting) {
        setLenderState(lenderSetting.value);
        document.body.setAttribute('data-lender', lenderSetting.value);
        // Load appropriate income rules
        const customRules = dbSettings.find(s => s.key === `incomeRules_${lenderSetting.value}`);
        setIncomeBuilderRules(customRules ? customRules.value : defaultIncomeRules[lenderSetting.value as Lender]);
      } else {
        document.body.setAttribute('data-lender', 'generic');
      }

      const multiplierSetting = dbSettings.find(s => s.key === 'salaryMultiplier');
      if (multiplierSetting) {
        setSalaryMultiplier(multiplierSetting.value);
      }
    }
  }, [dbSettings]);

  // Apply visual theme settings
  const toggleTheme = async () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setThemeState(nextTheme);
    document.documentElement.className = nextTheme;
    await db.settings.put({ key: 'theme', value: nextTheme });
  };

  const setLender = async (nextLender: Lender) => {
    setLenderState(nextLender);
    document.body.setAttribute('data-lender', nextLender);
    await db.settings.put({ key: 'lender', value: nextLender });
    
    // Load rules for this lender
    const rulesSetting = await db.settings.get(`incomeRules_${nextLender}`);
    const nextRules = rulesSetting ? rulesSetting.value : defaultIncomeRules[nextLender];
    setIncomeBuilderRules(nextRules);
  };

  const toggleFavorite = async (calculatorId: string) => {
    const exists = await db.favorites.get(calculatorId);
    if (exists) {
      await db.favorites.delete(calculatorId);
    } else {
      await db.favorites.put({ calculatorId, createdAt: Date.now() });
    }
  };

  const addHistory = async (calculatorId: string, title: string, inputs: Record<string, any>, outputs: Record<string, any>) => {
    // Keep max 50 recent items
    const count = await db.history.count();
    if (count >= 50) {
      const oldest = await db.history.orderBy('timestamp').first();
      if (oldest?.id) await db.history.delete(oldest.id);
    }
    await db.history.put({
      calculatorId,
      title,
      timestamp: Date.now(),
      inputs,
      outputs
    });
  };

  const clearHistory = async () => {
    await db.history.clear();
  };

  const deleteHistoryItem = async (id: number) => {
    await db.history.delete(id);
  };

  const updateSalaryMultiplier = async (multiplier: number) => {
    setSalaryMultiplier(multiplier);
    await db.settings.put({ key: 'salaryMultiplier', value: multiplier });
  };

  const updateIncomeBuilderRule = async (field: string, percentage: number) => {
    const newRules = { ...incomeBuilderRules, [field]: percentage };
    setIncomeBuilderRules(newRules);
    await db.settings.put({ key: `incomeRules_${lender}`, value: newRules });
  };

  const favorites = dbFavorites ? dbFavorites.map(f => f.calculatorId) : [];
  const history = dbHistory || [];

  return (
    <AppContext.Provider
      value={{
        theme,
        lender,
        favorites,
        history,
        salaryMultiplier,
        incomeBuilderRules,
        toggleTheme,
        setLender,
        toggleFavorite,
        addHistory,
        clearHistory,
        deleteHistoryItem,
        updateSalaryMultiplier,
        updateIncomeBuilderRule,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
