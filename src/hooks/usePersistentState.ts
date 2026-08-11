import { useEffect, useState } from 'react';

const calculatorInputKeysToClear = [
  'salary-annualiser:amount',
  'salary-annualiser:multiplier',
  'average-salary:salaries',
  'custom-salary:amounts',
  'income-builder:incomes',
  'ltv:propertyValue',
  'ltv:loanAmount',
  'ltv:ltv',
  'ltv:depositAmount',
  'ltv:depositPercent',
  'deposit:propertyValue',
  'deposit:deposit',
  'deposit:ltv',
  'lti:loanAmount',
  'lti:applicant1Income',
  'lti:applicant2Income',
  'repayment:loanAmount',
  'repayment:interestRate',
  'repayment:term',
  'interest-only:loanAmount',
  'interest-only:interestRate',
  'interest-only:term',
  'tax-estimator:grossSalary',
  'reverse-tax:targetNet',
  'tax-breakdown:grossSalary',
  'percentage:pctX',
  'percentage:pctY',
  'percentage:changeX',
  'percentage:changeY',
  'percentage:diffX',
  'percentage:diffY',
  'mortgage-end:term',
  'date-offset:amount',
];

const clearSeededCalculatorInputs = () => {
  if (typeof window === 'undefined') return;

  const migrationKey = 'shaheers-calc:blank-inputs-migration-v1';
  if (window.localStorage.getItem(migrationKey) === 'done') return;

  calculatorInputKeysToClear.forEach(key => window.localStorage.removeItem(key));
  window.localStorage.setItem(migrationKey, 'done');
};

export function usePersistentState<T>(key: string, defaultValue: T | (() => T)) {
  const [value, setValue] = useState<T>(() => {
    clearSeededCalculatorInputs();

    const fallback = typeof defaultValue === 'function'
      ? (defaultValue as () => T)()
      : defaultValue;

    try {
      const stored = window.localStorage.getItem(key);
      return stored === null ? fallback : JSON.parse(stored);
    } catch {
      return fallback;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Local storage can be unavailable in private browsing or restricted contexts.
    }
  }, [key, value]);

  return [value, setValue] as const;
}
