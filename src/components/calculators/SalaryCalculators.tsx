import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/mathHelpers';
import { usePersistentState } from '../../hooks/usePersistentState';
import { Sparkles, Copy, RotateCcw, Star, HelpCircle, Plus, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CopyableResult } from '../CopyableResult';

export const CalculatorHeader: React.FC<{ title: string; calculatorId: string; onReset: () => void; onCopy: () => void }> = ({ title, calculatorId, onReset, onCopy }) => {
  const { favorites, toggleFavorite } = useApp();
  const isFavorite = favorites.includes(calculatorId);

  return (
    <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
      <h2 className="text-xl font-bold tracking-tight text-foreground">{title}</h2>
      <div className="flex items-center gap-2">
        <button
          onClick={() => toggleFavorite(calculatorId)}
          className={`p-2 rounded-lg border transition-colors ${
            isFavorite
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500/20'
              : 'border-border text-muted-foreground hover:bg-muted'
          }`}
          title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
        >
          <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-500' : ''}`} />
        </button>
        <button
          onClick={onCopy}
          className="p-2 rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          title="Copy Results"
        >
          <Copy className="w-4 h-4" />
        </button>
        <button
          onClick={onReset}
          className="p-2 rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          title="Reset Calculator"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// 1. SALARY ANNUALISER
export const SalaryAnnualiser: React.FC = () => {
  const { addHistory } = useApp();
  const [amount, setAmount] = usePersistentState<string>('salary-annualiser:amount', '2500');
  const [frequency, setFrequency] = usePersistentState<string>('salary-annualiser:frequency', 'monthly');
  const [multiplier, setMultiplier] = usePersistentState<string>('salary-annualiser:multiplier', '12');
  const [copied, setCopied] = useState(false);

  const freqMultipliers: Record<string, number> = {
    weekly: 52,
    'four-weekly': 13,
    monthly: 12,
    quarterly: 4,
    'half-yearly': 2,
    yearly: 1,
  };

  useEffect(() => {
    if (frequency in freqMultipliers) {
      setMultiplier(freqMultipliers[frequency].toString());
    }
  }, [frequency]);

  const numAmount = parseFloat(amount) || 0;
  const numMultiplier = parseFloat(multiplier) || 1;
  const annualSalary = numAmount * numMultiplier;
  const monthlySalary = annualSalary / 12;
  const weeklySalary = annualSalary / 52;

  const handleCopy = () => {
    const text = `Salary Annualiser Results:
- Input Amount: ${formatCurrency(numAmount)} (${frequency})
- Custom Multiplier: ${numMultiplier}
- Annualised Salary: ${formatCurrency(annualSalary)}
- Monthly Equivalent: ${formatCurrency(monthlySalary)}
- Weekly Equivalent: ${formatCurrency(weeklySalary)}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
  };

  const handleReset = () => {
    setAmount('2500');
    setFrequency('monthly');
    setMultiplier('12');
  };

  // Save to history on significant output updates
  useEffect(() => {
    if (numAmount > 0) {
      const timer = setTimeout(() => {
        addHistory(
          'salary-annualiser',
          'Salary Annualiser',
          { amount: numAmount, frequency, multiplier: numMultiplier },
          { annualSalary, monthlySalary, weeklySalary }
        );
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [amount, frequency, multiplier]);

  return (
    <div className="calculator-shell bg-card text-card-foreground p-6 rounded-lg border border-border shadow-sm">
      <CalculatorHeader
        title="Salary Annualiser"
        calculatorId="salary-annualiser"
        onReset={handleReset}
        onCopy={handleCopy}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Payment Amount (£)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              placeholder="e.g. 2500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Frequency
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'weekly', label: 'Weekly' },
                { value: 'four-weekly', label: 'Four Weekly' },
                { value: 'monthly', label: 'Monthly' },
                { value: 'quarterly', label: 'Quarterly' },
                { value: 'half-yearly', label: 'Half Yearly' },
                { value: 'yearly', label: 'Yearly' },
                { value: 'custom', label: 'Custom' }
              ].map((chip) => (
                <button
                  key={chip.value}
                  type="button"
                  onClick={() => setFrequency(chip.value)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    frequency === chip.value
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Multiplier (Editable)
            </label>
            <input
              type="number"
              value={multiplier}
              onChange={(e) => {
                setFrequency('custom');
                setMultiplier(e.target.value);
              }}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              placeholder="Multiplier"
            />
          </div>
        </div>

        {/* Outputs */}
        <div className="calculator-results bg-muted/50 rounded-xl p-6 flex flex-col justify-between border border-border/50">
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-4">
              Annualised Income
            </h3>
            <CopyableResult
              value={formatCurrency(annualSalary)}
              className="text-4xl font-extrabold text-primary tracking-tight"
            />
            <p className="mt-2 text-xs font-medium text-muted-foreground">
              {formatCurrency(numAmount)} x {numMultiplier} = {formatCurrency(annualSalary)}
            </p>
            <div className="h-[1px] bg-border my-6"></div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-xs font-medium text-muted-foreground">Monthly Equivalent</span>
                <CopyableResult value={formatCurrency(monthlySalary)} className="text-lg font-bold text-foreground" />
              </div>
              <div>
                <span className="block text-xs font-medium text-muted-foreground">Weekly Equivalent</span>
                <CopyableResult value={formatCurrency(weeklySalary)} className="text-lg font-bold text-foreground" />
              </div>
            </div>
          </div>

          {copied && (
            <div className="mt-4 p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded text-center text-xs font-semibold flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3" /> Results copied to clipboard!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 2. AVERAGE SALARY CALCULATOR
interface SalaryEntry {
  amount: string;
  frequency: string;
}

export const AverageSalaryCalculator: React.FC = () => {
  const { addHistory } = useApp();
  const [salaries, setSalaries] = usePersistentState<SalaryEntry[]>('average-salary:salaries', [
    { amount: '40000', frequency: 'yearly' },
    { amount: '42000', frequency: 'yearly' },
    { amount: '45000', frequency: 'yearly' },
  ]);
  const [ignoreHighest, setIgnoreHighest] = usePersistentState('average-salary:ignoreHighest', false);
  const [ignoreLowest, setIgnoreLowest] = usePersistentState('average-salary:ignoreLowest', false);
  const [copied, setCopied] = useState(false);

  const freqMultipliers: Record<string, number> = {
    weekly: 52,
    'four-weekly': 13,
    monthly: 12,
    quarterly: 4,
    'half-yearly': 2,
    yearly: 1,
  };
  const frequencyLabels: Record<string, string> = {
    weekly: 'weekly',
    'four-weekly': 'four-weekly',
    monthly: 'monthly',
    quarterly: 'quarterly',
    'half-yearly': 'half-yearly',
    yearly: 'yearly',
  };

  const handleSalaryChange = (index: number, field: keyof SalaryEntry, value: string) => {
    const updated = [...salaries];
    updated[index][field] = value;
    setSalaries(updated);
  };

  const handleFrequencyChange = (value: string) => {
    setSalaries(salaries.map(salary => ({ ...salary, frequency: value })));
  };

  const addSalaryEntry = () => {
    setSalaries([...salaries, { amount: '', frequency: selectedFrequency }]);
  };

  const removeSalaryEntry = (index: number) => {
    if (salaries.length > 1) {
      setSalaries(salaries.filter((_, i) => i !== index));
    }
  };

  const selectedFrequency = salaries[0]?.frequency || 'yearly';
  const selectedMultiplier = freqMultipliers[selectedFrequency] || 1;
  const salaryAmounts = salaries.map(s => parseFloat(s.amount) || 0);
  const annualisedValues = salaryAmounts.map(amount => amount * selectedMultiplier);

  // Filter & average
  let valuesToAverage = [...salaryAmounts];
  let ignoredIndices: number[] = [];

  if (valuesToAverage.length > 1) {
    if (ignoreHighest) {
      const maxVal = Math.max(...valuesToAverage);
      const maxIdx = salaryAmounts.indexOf(maxVal);
      ignoredIndices.push(maxIdx);
      // Remove one occurrence of max
      const idxToRemove = valuesToAverage.indexOf(maxVal);
      if (idxToRemove !== -1) valuesToAverage.splice(idxToRemove, 1);
    }
    if (ignoreLowest && valuesToAverage.length > 1) {
      const minVal = Math.min(...valuesToAverage);
      const minIdx = salaryAmounts.indexOf(minVal);
      if (!ignoredIndices.includes(minIdx)) ignoredIndices.push(minIdx);
      const idxToRemove = valuesToAverage.indexOf(minVal);
      if (idxToRemove !== -1) valuesToAverage.splice(idxToRemove, 1);
    }
  }

  const sum = valuesToAverage.reduce((a, b) => a + b, 0);
  const averageEnteredAmount = valuesToAverage.length > 0 ? sum / valuesToAverage.length : 0;
  const averageAnnual = averageEnteredAmount * selectedMultiplier;
  const averageMonthly = averageAnnual / 12;
  const averageCalculationText = `(${valuesToAverage.map(value => formatCurrency(value)).join(' + ') || formatCurrency(0)}) / ${valuesToAverage.length || 1} = ${formatCurrency(averageEnteredAmount)} ${frequencyLabels[selectedFrequency] || selectedFrequency}; x ${selectedMultiplier} = ${formatCurrency(averageAnnual)} annual`;

  const handleCopy = () => {
    const text = `Average Salary Calculator Results:
- Salaries Entered: ${salaries.map(s => `${formatCurrency(s.amount)} (${s.frequency})`).join(', ')}
- Ignore Highest: ${ignoreHighest ? 'Yes' : 'No'}
- Ignore Lowest: ${ignoreLowest ? 'Yes' : 'No'}
- Calculation: ${averageCalculationText}
- Final Average Annual Income: ${formatCurrency(averageAnnual)}
- Final Average Monthly Income: ${formatCurrency(averageMonthly)}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
  };

  const handleReset = () => {
    setSalaries([
      { amount: '40000', frequency: 'yearly' },
      { amount: '42000', frequency: 'yearly' },
      { amount: '45000', frequency: 'yearly' },
    ]);
    setIgnoreHighest(false);
    setIgnoreLowest(false);
  };

  useEffect(() => {
    if (annualisedValues.some(v => v > 0)) {
      const timer = setTimeout(() => {
        addHistory(
          'average-salary',
          'Average Salary Calculator',
          { salaries, ignoreHighest, ignoreLowest },
          { averageAnnual, averageMonthly }
        );
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [salaries, ignoreHighest, ignoreLowest]);

  return (
    <div className="calculator-shell bg-card text-card-foreground p-6 rounded-lg border border-border shadow-sm">
      <CalculatorHeader
        title="Average Salary Calculator"
        calculatorId="average-salary"
        onReset={handleReset}
        onCopy={handleCopy}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-4">
          <div className="space-y-3">
            {salaries.map((salary, index) => {
              const isIgnored = ignoredIndices.includes(index);
              return (
                <div 
                  key={index} 
                  className={`p-3 rounded-lg border transition-all ${
                    isIgnored 
                      ? 'border-red-500/20 bg-red-500/5 opacity-50' 
                      : 'border-border bg-background'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-muted-foreground">Salary Entry #{index + 1}</span>
                    <div className="flex items-center gap-2">
                      {isIgnored && <span className="text-xxs font-bold text-red-500 uppercase tracking-wider mr-1">Ignored</span>}
                      {salaries.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSalaryEntry(index)}
                          className="p-1 rounded text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                          title="Remove entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-2.5 top-2 text-muted-foreground text-sm">£</span>
                      <input
                        type="number"
                        value={salary.amount}
                        onChange={(e) => handleSalaryChange(index, 'amount', e.target.value)}
                        className="w-full pl-6 pr-3 py-1.5 bg-background border border-border rounded text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                        placeholder="Amount"
                      />
                    </div>
                    <select
                      value={salary.frequency}
                      onChange={(e) => handleFrequencyChange(e.target.value)}
                      className="px-2 py-1.5 bg-background border border-border rounded text-sm text-foreground focus:outline-none"
                    >
                      <option value="yearly">Yearly</option>
                      <option value="monthly">Monthly</option>
                      <option value="four-weekly">Four Weekly</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={addSalaryEntry}
            className="w-full py-2 border border-dashed border-border hover:border-accent text-muted-foreground hover:text-accent font-semibold rounded-lg flex items-center justify-center gap-1.5 text-xs transition-all cursor-pointer bg-background"
          >
            <Plus className="w-4 h-4" /> Add Salary Entry
          </button>

          <div className="flex gap-4 pt-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={ignoreHighest}
                onChange={(e) => setIgnoreHighest(e.target.checked)}
                className="w-4 h-4 accent-accent rounded border-border"
              />
              <span className="text-sm text-foreground">Ignore Highest Value</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={ignoreLowest}
                onChange={(e) => setIgnoreLowest(e.target.checked)}
                className="w-4 h-4 accent-accent rounded border-border"
              />
              <span className="text-sm text-foreground">Ignore Lowest Value</span>
            </label>
          </div>
        </div>

        {/* Outputs */}
        <div className="calculator-results bg-muted/50 rounded-xl p-6 flex flex-col justify-between border border-border/50 md:sticky md:top-28 self-start">
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-4">
              Annualised Average
            </h3>
            <CopyableResult
              value={formatCurrency(averageAnnual)}
              className="text-4xl font-extrabold text-primary tracking-tight"
            />
            <p className="mt-2 text-xs font-medium text-muted-foreground">
              {averageCalculationText}
            </p>
            <div className="h-[1px] bg-border my-6"></div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-xs font-medium text-muted-foreground">Monthly Average</span>
                <CopyableResult value={formatCurrency(averageMonthly)} className="text-lg font-bold text-foreground" />
              </div>
              <div>
                <span className="block text-xs font-medium text-muted-foreground">Entries Counted</span>
                <CopyableResult value={`${valuesToAverage.length} / ${salaries.length}`} className="text-lg font-bold text-foreground" />
              </div>
            </div>
          </div>

          {copied && (
            <div className="mt-4 p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded text-center text-xs font-semibold flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3" /> Results copied to clipboard!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 3. CUSTOM SALARY CALCULATOR
export const CustomSalaryCalculator: React.FC = () => {
  const { addHistory } = useApp();
  const [frequency, setFrequency] = usePersistentState<string>('custom-salary:frequency', 'monthly');
  const [entryCount, setEntryCount] = usePersistentState<number>('custom-salary:entryCount', 12);
  const [customEntryCount, setCustomEntryCount] = usePersistentState<string>('custom-salary:customEntryCount', '12');
  const [amounts, setAmounts] = usePersistentState<string[]>('custom-salary:amounts', () => Array(12).fill(''));
  const [copied, setCopied] = useState(false);

  const frequencyFieldCounts: Record<string, number> = {
    weekly: 52,
    'four-weekly': 13,
    monthly: 12,
    quarterly: 4,
    'half-yearly': 2,
    yearly: 1,
  };

  const frequencyOptions = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'four-weekly', label: 'Four Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'half-yearly', label: 'Half Yearly' },
    { value: 'yearly', label: 'Yearly' },
    { value: 'custom', label: 'Custom' },
  ];

  const numericAmounts = amounts.slice(0, entryCount).map(amount => parseFloat(amount) || 0);
  const annualTotal = numericAmounts.reduce((total, amount) => total + amount, 0);
  const monthlyTotal = annualTotal / 12;

  const syncEntryCount = (count: number) => {
    const nextCount = Math.max(1, count || 1);
    setEntryCount(nextCount);
    setCustomEntryCount(nextCount.toString());
    setAmounts(current => {
      const next = [...current];
      while (next.length < nextCount) next.push('');
      return next.slice(0, nextCount);
    });
  };

  const handleFrequencyChange = (nextFrequency: string) => {
    setFrequency(nextFrequency);
    if (nextFrequency in frequencyFieldCounts) {
      syncEntryCount(frequencyFieldCounts[nextFrequency]);
    }
  };

  const handleCustomEntryCountChange = (value: string) => {
    setCustomEntryCount(value);
    const parsedValue = parseInt(value, 10);
    if (!Number.isNaN(parsedValue) && parsedValue > 0) {
      syncEntryCount(parsedValue);
    }
  };

  const handleAmountChange = (index: number, value: string) => {
    setAmounts(current => current.map((amount, i) => i === index ? value : amount));
  };

  const handleCopy = () => {
    const lines = numericAmounts
      .map((amount, index) => `- Entry ${index + 1}: ${formatCurrency(amount)} (${frequency})`)
      .join('\n');

    const text = `Custom Salary Calculator Results:
${lines}
-----------------------------
- Fields Counted: ${entryCount}
- Total Annual Figure: ${formatCurrency(annualTotal)}
- Monthly Figure: ${formatCurrency(monthlyTotal)}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
  };

  const handleReset = () => {
    setFrequency('monthly');
    setAmounts(Array(12).fill(''));
    syncEntryCount(12);
  };

  useEffect(() => {
    if (annualTotal > 0) {
      const timer = setTimeout(() => {
        addHistory(
          'custom-salary',
          'Custom Salary',
          { amounts: numericAmounts, frequency, fields: entryCount },
          { annualTotal, monthlyTotal }
        );
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [amounts, frequency, entryCount]);

  return (
    <div className="calculator-shell bg-card text-card-foreground p-6 rounded-lg border border-border shadow-sm">
      <CalculatorHeader
        title="Custom Salary"
        calculatorId="custom-salary"
        onReset={handleReset}
        onCopy={handleCopy}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Frequency
            </label>
            <div className="flex flex-wrap gap-2">
              {frequencyOptions.map((chip) => (
                <button
                  key={chip.value}
                  type="button"
                  onClick={() => handleFrequencyChange(chip.value)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    frequency === chip.value
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {frequency === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Number of Salary Fields
              </label>
              <input
                type="number"
                min="1"
                value={customEntryCount}
                onChange={(e) => handleCustomEntryCountChange(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                placeholder="Enter any number of fields"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {amounts.slice(0, entryCount).map((amount, index) => (
              <div key={index} className="p-3 rounded-lg border border-border bg-background">
                <label className="block text-xs font-semibold text-muted-foreground mb-2">
                  {frequency === 'monthly' ? 'Month' : frequency === 'weekly' ? 'Week' : frequency === 'four-weekly' ? 'Four-week period' : frequency === 'quarterly' ? 'Quarter' : frequency === 'half-yearly' ? 'Half-year period' : 'Salary Entry'} #{index + 1}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">GBP</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => handleAmountChange(index, e.target.value)}
                    className="w-full pl-12 pr-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                    placeholder="Amount"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="calculator-results lg:col-span-4 bg-muted/50 rounded-xl p-6 flex flex-col justify-between border border-border/50 lg:sticky lg:top-28 self-start">
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-4">
              Total Annual Figure
            </h3>
            <CopyableResult
              value={formatCurrency(annualTotal)}
              className="text-4xl font-extrabold text-primary tracking-tight"
            />
            <p className="mt-2 text-xs font-medium text-muted-foreground">
              Sum of {entryCount} entered {frequency.replace('-', ' ')} fields = {formatCurrency(annualTotal)}
            </p>

            <div className="h-[1px] bg-border my-6"></div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Monthly Figure:</span>
                <CopyableResult value={formatCurrency(monthlyTotal)} className="font-bold text-foreground" />
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Frequency:</span>
                <span className="font-semibold text-foreground capitalize">{frequency.replace('-', ' ')}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Fields Counted:</span>
                <CopyableResult value={entryCount} className="font-semibold text-foreground" />
              </div>
            </div>
          </div>

          {copied && (
            <div className="mt-6 p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded text-center text-xs font-semibold flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3" /> Results copied to clipboard!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 4. INCOME BUILDER
interface IncomeItem {
  key: string;
  name: string;
  amount: string;
}

export const IncomeBuilder: React.FC = () => {
  const { addHistory, lender, incomeBuilderRules, updateIncomeBuilderRule } = useApp();
  const [copied, setCopied] = useState(false);

  const [incomes, setIncomes] = usePersistentState<IncomeItem[]>('income-builder:incomes', [
    { key: 'basic', name: 'Basic Salary', amount: '45000' },
    { key: 'bonus', name: 'Bonus', amount: '5000' },
    { key: 'commission', name: 'Commission', amount: '2000' },
    { key: 'overtime', name: 'Overtime', amount: '1500' },
    { key: 'carAllowance', name: 'Car Allowance', amount: '3600' },
    { key: 'shiftAllowance', name: 'Shift Allowance', amount: '1200' },
  ]);

  const handleAmountChange = (key: string, value: string) => {
    setIncomes(incomes.map(item => item.key === key ? { ...item, amount: value } : item));
  };

  // Calculate Verified Incomes
  const detailedItems = incomes.map(item => {
    const rawAmt = parseFloat(item.amount) || 0;
    const rulePercentage = incomeBuilderRules[item.key] !== undefined ? incomeBuilderRules[item.key] : 100;
    const verifiedAmt = rawAmt * (rulePercentage / 100);
    return {
      ...item,
      rawAmount: rawAmt,
      percentage: rulePercentage,
      verifiedAmount: verifiedAmt
    };
  });

  const totalRaw = detailedItems.reduce((acc, curr) => acc + curr.rawAmount, 0);
  const totalVerified = detailedItems.reduce((acc, curr) => acc + curr.verifiedAmount, 0);

  const handleCopy = () => {
    const breakDownText = detailedItems
      .map(item => `- ${item.name}: ${formatCurrency(item.rawAmount)} @ ${item.percentage}% = ${formatCurrency(item.verifiedAmount)}`)
      .join('\n');

    const text = `Income Builder Results (Lender: ${lender.toUpperCase()}):
${breakDownText}
-----------------------------
- Total Declared Income: ${formatCurrency(totalRaw)}
- Total Verified Annual Income: ${formatCurrency(totalVerified)}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
  };

  const handleReset = () => {
    setIncomes([
      { key: 'basic', name: 'Basic Salary', amount: '45000' },
      { key: 'bonus', name: 'Bonus', amount: '5000' },
      { key: 'commission', name: 'Commission', amount: '2000' },
      { key: 'overtime', name: 'Overtime', amount: '1500' },
      { key: 'carAllowance', name: 'Car Allowance', amount: '3600' },
      { key: 'shiftAllowance', name: 'Shift Allowance', amount: '1200' },
    ]);
  };

  useEffect(() => {
    if (totalRaw > 0) {
      const timer = setTimeout(() => {
        addHistory(
          'income-builder',
          'Income Builder',
          { incomes, lender, rules: incomeBuilderRules },
          { totalRaw, totalVerified }
        );
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [incomes, lender, incomeBuilderRules]);

  return (
    <div className="calculator-shell bg-card text-card-foreground p-6 rounded-lg border border-border shadow-sm">
      <CalculatorHeader
        title="Income Builder"
        calculatorId="income-builder"
        onReset={handleReset}
        onCopy={handleCopy}
      />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Inputs & Percentages */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 border-b border-border pb-2">
            <span className="w-1/3">Income Type</span>
            <span className="w-1/3 text-center">Declared (£/yr)</span>
            <span className="w-1/3 text-right">Lender Allowance %</span>
          </div>

          <div className="space-y-2">
            {detailedItems.map(item => (
              <div key={item.key} className="flex items-center justify-between gap-4 p-2 hover:bg-muted/30 rounded-lg transition-colors">
                <span className="w-1/3 text-sm font-medium text-foreground">{item.name}</span>
                <div className="w-1/3 relative">
                  <span className="absolute left-2.5 top-1.5 text-muted-foreground text-xs">£</span>
                  <input
                    type="number"
                    value={item.amount}
                    onChange={(e) => handleAmountChange(item.key, e.target.value)}
                    className="w-full pl-5 pr-2 py-1 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                    placeholder="0"
                  />
                </div>
                <div className="w-1/3 flex items-center justify-end gap-1.5">
                  <input
                    type="number"
                    value={item.percentage}
                    min="0"
                    max="100"
                    onChange={(e) => updateIncomeBuilderRule(item.key, Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-16 px-1.5 py-1 text-right bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                  <span className="text-xs text-muted-foreground">%</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-accent/5 rounded-lg border border-accent/10 text-xs text-muted-foreground flex gap-2">
            <HelpCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-foreground">Tip:</span> Lender allowances are prepopulated based on the chosen Lender Theme (Lloyds/Halifax/BM), but they can be manually adjusted for custom calculations.
            </div>
          </div>
        </div>

        {/* Outputs Summary */}
        <div className="calculator-results lg:col-span-5 bg-muted/50 rounded-xl p-6 flex flex-col justify-between border border-border/50">
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-4">
              Verified Annual Income
            </h3>
            <CopyableResult
              value={formatCurrency(totalVerified)}
              className="text-4xl font-extrabold text-primary tracking-tight"
            />
            <p className="mt-2 text-xs font-medium text-muted-foreground">
              Accepted income total = sum of each declared amount x lender allowance %
            </p>
            
            <div className="h-[1px] bg-border my-6"></div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Total Declared Income:</span>
                <CopyableResult value={formatCurrency(totalRaw)} className="font-semibold text-foreground" />
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Lender Applied Deductions:</span>
                <CopyableResult value={`-${formatCurrency(totalRaw - totalVerified)}`} className="font-semibold text-red-500" />
              </div>
              <div className="flex justify-between items-center text-sm border-t border-border pt-3">
                <span className="font-medium text-foreground">Net Lender Acceptance:</span>
                <CopyableResult
                  value={`${totalRaw > 0 ? Math.round((totalVerified / totalRaw) * 100) : 100}%`}
                  className="font-bold text-accent"
                />
              </div>
            </div>
          </div>

          {copied && (
            <div className="mt-6 p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded text-center text-xs font-semibold flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3" /> Results copied to clipboard!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
