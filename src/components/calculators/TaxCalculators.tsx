import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, calculateUKTax, calculateGrossFromNet } from '../../utils/mathHelpers';
import { usePersistentState } from '../../hooks/usePersistentState';
import { CalculatorHeader } from './SalaryCalculators';
import { Sparkles, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

type TaxFrequency = 'annual' | 'monthly' | 'weekly' | 'fortnightly' | 'two-weekly' | 'four-weekly' | 'quarterly' | 'half-yearly';

const taxFrequencyOptions: Array<{ value: TaxFrequency; label: string }> = [
  { value: 'annual', label: 'Annual' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'fortnightly', label: 'Fortnightly' },
  { value: 'two-weekly', label: '2 Weekly' },
  { value: 'four-weekly', label: 'Four Weekly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'half-yearly', label: 'Half Yearly' },
];

const taxFrequencyMultipliers: Record<TaxFrequency, number> = {
  annual: 1,
  monthly: 12,
  weekly: 52,
  fortnightly: 26,
  'two-weekly': 26,
  'four-weekly': 13,
  quarterly: 4,
  'half-yearly': 2,
};

const getTaxFrequencyLabel = (frequency: TaxFrequency) =>
  taxFrequencyOptions.find(option => option.value === frequency)?.label || frequency;

// 1. UK TAX ESTIMATOR
export const TaxEstimator: React.FC = () => {
  const { addHistory } = useApp();
  const [grossSalary, setGrossSalary] = usePersistentState<string>('tax-estimator:grossSalary', '50000');
  const [frequency, setFrequency] = usePersistentState<TaxFrequency>('tax-estimator:frequency', 'annual');
  const [copied, setCopied] = useState(false);

  const grossInput = parseFloat(grossSalary) || 0;
  const frequencyMultiplier = taxFrequencyMultipliers[frequency];
  const annualGross = grossInput * frequencyMultiplier;
  const taxDetails = calculateUKTax(annualGross);
  const frequencyLabel = getTaxFrequencyLabel(frequency);
  const taxForFrequency = taxDetails.totalIncomeTax / frequencyMultiplier;
  const niForFrequency = taxDetails.totalNI / frequencyMultiplier;
  const netForFrequency = taxDetails.netAnnual / frequencyMultiplier;

  const handleCopy = () => {
    const text = `UK Tax Estimator Results (2026/27):
- Gross ${frequencyLabel} Salary: ${formatCurrency(grossInput)}
- Annualised Gross Salary: ${formatCurrency(annualGross)}
- Personal Allowance: ${formatCurrency(taxDetails.personalAllowance)}
- Taxable Income: ${formatCurrency(taxDetails.taxableIncome)}
- Estimated ${frequencyLabel} Income Tax: ${formatCurrency(taxForFrequency)}
- Estimated ${frequencyLabel} National Insurance: ${formatCurrency(niForFrequency)}
- Total Annual Income Tax: ${formatCurrency(taxDetails.totalIncomeTax)}
- Total Annual National Insurance: ${formatCurrency(taxDetails.totalNI)}
- Net Annual Pay: ${formatCurrency(taxDetails.netAnnual)}
- Net ${frequencyLabel} Take-Home: ${formatCurrency(netForFrequency)}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
  };

  const handleReset = () => {
    setGrossSalary('50000');
    setFrequency('annual');
  };

  useEffect(() => {
    if (annualGross > 0) {
      const timer = setTimeout(() => {
        addHistory(
          'tax-estimator',
          'UK Tax Estimator',
          { grossSalary: grossInput, frequency, annualGross },
          { netAnnual: taxDetails.netAnnual, netForFrequency, totalIncomeTax: taxDetails.totalIncomeTax, totalNI: taxDetails.totalNI }
        );
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [grossSalary, frequency]);

  return (
    <div className="bg-card text-card-foreground p-6 rounded-lg border border-border shadow-sm">
      <CalculatorHeader
        title="UK Tax Estimator (2026/27)"
        calculatorId="tax-estimator"
        onReset={handleReset}
        onCopy={handleCopy}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Gross {frequencyLabel} Salary (£)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">£</span>
              <input
                type="number"
                value={grossSalary}
                onChange={(e) => setGrossSalary(e.target.value)}
                className="w-full pl-7 pr-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                placeholder="e.g. 50000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Pay Frequency
            </label>
            <div className="flex flex-wrap gap-2">
              {taxFrequencyOptions.map((chip) => (
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

          <div className="bg-accent/5 p-4 rounded-lg border border-accent/10 space-y-2 text-xs text-muted-foreground">
            <h4 className="font-semibold text-foreground flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-accent" /> UK tax rules applied:
            </h4>
            <ul className="list-disc pl-4 space-y-1">
              <li>Personal Allowance: £12,570 (Tapers down starting at £100,000, reaching £0 at £125,140).</li>
              <li>Basic Income Tax Rate: 20% on taxable income up to £37,700.</li>
              <li>Higher Income Tax Rate: 40% on taxable income between £37,700 and £112,570.</li>
              <li>Additional Income Tax Rate: 45% on taxable income over £112,570.</li>
              <li>Employee Class 1 National Insurance: 8% on earnings between £12,570 and £50,270, and 2% thereafter.</li>
            </ul>
          </div>
        </div>

        {/* Outputs */}
        <div className="bg-muted/50 rounded-xl p-6 flex flex-col justify-between border border-border/50">
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-4">
              {frequencyLabel} Take-home Pay
            </h3>
            <div className="text-4xl font-extrabold text-primary tracking-tight">
              {formatCurrency(netForFrequency)}
            </div>
            <p className="mt-2 text-xs font-medium text-muted-foreground">
              {formatCurrency(grossInput)} x {frequencyMultiplier} = {formatCurrency(annualGross)} annual; ({formatCurrency(annualGross)} - {formatCurrency(taxDetails.totalIncomeTax)} tax - {formatCurrency(taxDetails.totalNI)} NI) / {frequencyMultiplier} = {formatCurrency(netForFrequency)}
            </p>
            
            <div className="h-[1px] bg-border my-6"></div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Personal Allowance:</span>
                <span className="font-semibold text-foreground">{formatCurrency(taxDetails.personalAllowance)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">{frequencyLabel} Income Tax:</span>
                <span className="font-semibold text-red-500">-{formatCurrency(taxForFrequency)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">{frequencyLabel} National Insurance:</span>
                <span className="font-semibold text-red-500">-{formatCurrency(niForFrequency)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Annualised Gross:</span>
                <span className="font-semibold text-foreground">{formatCurrency(annualGross)}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-t border-border pt-3">
                <span className="font-medium text-foreground">Estimated Net Annual Pay:</span>
                <span className="font-bold text-accent">{formatCurrency(taxDetails.netAnnual)}</span>
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

// 2. REVERSE TAX CALCULATOR
export const ReverseTaxCalculator: React.FC = () => {
  const { addHistory } = useApp();
  const [targetNet, setTargetNet] = usePersistentState<string>('reverse-tax:targetNet', '36000');
  const [frequency, setFrequency] = usePersistentState<TaxFrequency>('reverse-tax:frequency', 'annual');
  const [copied, setCopied] = useState(false);

  const numNet = parseFloat(targetNet) || 0;
  const frequencyMultiplier = taxFrequencyMultipliers[frequency];
  const frequencyLabel = getTaxFrequencyLabel(frequency);
  const targetAnnualNet = numNet * frequencyMultiplier;
  
  const estimatedGross = calculateGrossFromNet(targetAnnualNet);
  const taxDetails = calculateUKTax(estimatedGross);
  const grossForFrequency = estimatedGross / frequencyMultiplier;
  const taxForFrequency = taxDetails.totalIncomeTax / frequencyMultiplier;
  const niForFrequency = taxDetails.totalNI / frequencyMultiplier;

  const handleCopy = () => {
    const text = `Reverse Tax Calculator Results:
- Target ${frequencyLabel} Net Salary: ${formatCurrency(numNet)}
- Target Annual Net Salary: ${formatCurrency(targetAnnualNet)}
- Estimated Required Gross Annual: ${formatCurrency(estimatedGross)}
- Estimated Required Gross ${frequencyLabel}: ${formatCurrency(grossForFrequency)}
- Estimated ${frequencyLabel} Income Tax deductions: ${formatCurrency(taxForFrequency)}
- Estimated ${frequencyLabel} NI deductions: ${formatCurrency(niForFrequency)}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
  };

  const handleReset = () => {
    setTargetNet('36000');
    setFrequency('annual');
  };

  useEffect(() => {
    if (numNet > 0) {
      const timer = setTimeout(() => {
        addHistory(
          'reverse-tax',
          'Reverse Tax Calculator',
          { targetNet: numNet, frequency, targetAnnualNet },
          { estimatedGross, grossForFrequency }
        );
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [targetNet, frequency]);

  return (
    <div className="bg-card text-card-foreground p-6 rounded-lg border border-border shadow-sm">
      <CalculatorHeader
        title="Reverse Tax Calculator"
        calculatorId="reverse-tax"
        onReset={handleReset}
        onCopy={handleCopy}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Target {frequencyLabel} Net Salary (£)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">£</span>
              <input
                type="number"
                value={targetNet}
                onChange={(e) => setTargetNet(e.target.value)}
                className="w-full pl-7 pr-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                placeholder="e.g. 3000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Net Frequency
            </label>
            <div className="flex flex-wrap gap-2">
              {taxFrequencyOptions.map((chip) => (
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
        </div>

        {/* Outputs */}
        <div className="bg-muted/50 rounded-xl p-6 flex flex-col justify-between border border-border/50">
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-4">
              Estimated Required Gross {frequencyLabel} Salary
            </h3>
            <div className="text-4xl font-extrabold text-primary tracking-tight">
              {formatCurrency(grossForFrequency)}
            </div>
            <p className="mt-2 text-xs font-medium text-muted-foreground">
              {formatCurrency(numNet)} x {frequencyMultiplier} = {formatCurrency(targetAnnualNet)} annual target net; solved backwards to {formatCurrency(estimatedGross)} gross annual
            </p>
            
            <div className="h-[1px] bg-border my-6"></div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Gross Annual equivalent:</span>
                <span className="font-semibold text-foreground">{formatCurrency(estimatedGross)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Estimated {frequencyLabel} Income Tax:</span>
                <span className="font-semibold text-red-500">+{formatCurrency(taxForFrequency)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Estimated {frequencyLabel} National Insurance:</span>
                <span className="font-semibold text-red-500">+{formatCurrency(niForFrequency)}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-t border-border pt-3">
                <span className="font-medium text-foreground">Target {frequencyLabel} Net Salary:</span>
                <span className="font-bold text-accent">{formatCurrency(numNet)}</span>
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

// 3. TAX BREAKDOWN
export const TaxBreakdown: React.FC = () => {
  const { addHistory } = useApp();
  const [grossSalary, setGrossSalary] = usePersistentState<string>('tax-breakdown:grossSalary', '60000');
  const [copied, setCopied] = useState(false);

  const gross = parseFloat(grossSalary) || 0;
  const taxDetails = calculateUKTax(gross);

  const handleCopy = () => {
    const text = `Tax Breakdown Results:
- Gross Annual: ${formatCurrency(gross)}
- Net Income: ${formatCurrency(taxDetails.netAnnual)} (${Math.round((taxDetails.netAnnual / gross) * 100)}%)
- Income Tax: ${formatCurrency(taxDetails.totalIncomeTax)} (${Math.round((taxDetails.totalIncomeTax / gross) * 100)}%)
- NI Contributions: ${formatCurrency(taxDetails.totalNI)} (${Math.round((taxDetails.totalNI / gross) * 100)}%)`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
  };

  const handleReset = () => {
    setGrossSalary('60000');
  };

  useEffect(() => {
    if (gross > 0) {
      const timer = setTimeout(() => {
        addHistory(
          'tax-breakdown',
          'Tax Breakdown',
          { grossSalary: gross },
          { netAnnual: taxDetails.netAnnual, totalIncomeTax: taxDetails.totalIncomeTax, totalNI: taxDetails.totalNI }
        );
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [grossSalary]);

  const taxPct = gross > 0 ? (taxDetails.totalIncomeTax / gross) * 100 : 0;
  const niPct = gross > 0 ? (taxDetails.totalNI / gross) * 100 : 0;
  const netPct = gross > 0 ? (taxDetails.netAnnual / gross) * 100 : 100;

  return (
    <div className="bg-card text-card-foreground p-6 rounded-lg border border-border shadow-sm space-y-6">
      <CalculatorHeader
        title="Tax Breakdown Detailed Overview"
        calculatorId="tax-breakdown"
        onReset={handleReset}
        onCopy={handleCopy}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Gross Annual Salary (£)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">£</span>
              <input
                type="number"
                value={grossSalary}
                onChange={(e) => setGrossSalary(e.target.value)}
                className="w-full pl-7 pr-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                placeholder="e.g. 60000"
              />
            </div>
          </div>

          {gross > 0 && (
            <div className="space-y-2 border-t border-border pt-4">
              <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Income Allocation</span>
              <div className="h-5 w-full bg-border rounded-full overflow-hidden flex">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-500" 
                  style={{ width: `${netPct}%` }}
                  title={`Net: ${netPct.toFixed(1)}%`}
                />
                <div 
                  className="bg-red-500 h-full transition-all duration-500" 
                  style={{ width: `${taxPct}%` }}
                  title={`Tax: ${taxPct.toFixed(1)}%`}
                />
                <div 
                  className="bg-amber-500 h-full transition-all duration-500" 
                  style={{ width: `${niPct}%` }}
                  title={`NI: ${niPct.toFixed(1)}%`}
                />
              </div>
              <div className="flex justify-between items-center text-xs mt-1.5">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Net Take-Home ({netPct.toFixed(0)}%)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span> Income Tax ({taxPct.toFixed(0)}%)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> NI ({niPct.toFixed(0)}%)</span>
              </div>
            </div>
          )}
        </div>

        {/* Breakdown Output */}
        <div className="bg-muted/50 rounded-xl p-6 border border-border/50 space-y-4">
          <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-2">
            Detailed Cost Breakdown
          </h3>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center py-1">
              <span className="text-muted-foreground">Gross Annual Salary:</span>
              <span className="font-semibold text-foreground">{formatCurrency(gross)}</span>
            </div>
            
            <div className="h-[1px] bg-border my-1"></div>
            
            <div className="flex justify-between items-center py-1">
              <span className="text-muted-foreground">Untaxed (Personal Allowance):</span>
              <span className="font-semibold text-foreground">{formatCurrency(taxDetails.personalAllowance)}</span>
            </div>
            
            <div className="flex justify-between items-center py-1">
              <span className="text-muted-foreground">Taxable Income:</span>
              <span className="font-semibold text-foreground">{formatCurrency(taxDetails.taxableIncome)}</span>
            </div>

            <div className="h-[1px] bg-border my-1"></div>

            <div className="flex justify-between items-center py-1">
              <span className="text-muted-foreground pl-3 border-l border-red-500/30">Basic Rate (20%):</span>
              <span className="font-medium text-foreground">{formatCurrency(taxDetails.basicRateTax)}</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-muted-foreground pl-3 border-l border-red-500/30">Higher Rate (40%):</span>
              <span className="font-medium text-foreground">{formatCurrency(taxDetails.higherRateTax)}</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-muted-foreground pl-3 border-l border-red-500/30">Additional Rate (45%):</span>
              <span className="font-medium text-foreground">{formatCurrency(taxDetails.additionalRateTax)}</span>
            </div>

            <div className="h-[1px] bg-border my-1"></div>

            <div className="flex justify-between items-center py-1">
              <span className="text-muted-foreground pl-3 border-l border-amber-500/30">National Insurance (8%):</span>
              <span className="font-medium text-foreground">{formatCurrency(taxDetails.niBasicRate)}</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-muted-foreground pl-3 border-l border-amber-500/30">National Insurance (2%):</span>
              <span className="font-medium text-foreground">{formatCurrency(taxDetails.niHigherRate)}</span>
            </div>

            <div className="h-[1px] bg-border my-2"></div>

            <div className="flex justify-between items-center py-1 text-base font-bold">
              <span className="text-foreground">Net Pay (Take-Home):</span>
              <span className="text-accent">{formatCurrency(taxDetails.netAnnual)}</span>
            </div>
            <p className="pt-2 text-xs font-medium text-muted-foreground">
              Net pay = {formatCurrency(gross)} - {formatCurrency(taxDetails.totalIncomeTax)} tax - {formatCurrency(taxDetails.totalNI)} NI
            </p>
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
