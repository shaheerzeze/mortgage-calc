import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, calculateUKTax, calculateGrossFromNet } from '../../utils/mathHelpers';
import { CalculatorHeader } from './SalaryCalculators';
import { Sparkles, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

// 1. UK TAX ESTIMATOR
export const TaxEstimator: React.FC = () => {
  const { addHistory } = useApp();
  const [grossSalary, setGrossSalary] = useState<string>('50000');
  const [copied, setCopied] = useState(false);

  const gross = parseFloat(grossSalary) || 0;
  const taxDetails = calculateUKTax(gross);

  const handleCopy = () => {
    const text = `UK Tax Estimator Results (2026/27):
- Gross Annual Salary: ${formatCurrency(gross)}
- Personal Allowance: ${formatCurrency(taxDetails.personalAllowance)}
- Taxable Income: ${formatCurrency(taxDetails.taxableIncome)}
- Total Income Tax: ${formatCurrency(taxDetails.totalIncomeTax)}
- National Insurance: ${formatCurrency(taxDetails.totalNI)}
- Net Annual Pay: ${formatCurrency(taxDetails.netAnnual)}
- Net Monthly Take-Home: ${formatCurrency(taxDetails.netMonthly)}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
  };

  const handleReset = () => {
    setGrossSalary('50000');
  };

  useEffect(() => {
    if (gross > 0) {
      const timer = setTimeout(() => {
        addHistory(
          'tax-estimator',
          'UK Tax Estimator',
          { grossSalary: gross },
          { netAnnual: taxDetails.netAnnual, netMonthly: taxDetails.netMonthly, totalIncomeTax: taxDetails.totalIncomeTax, totalNI: taxDetails.totalNI }
        );
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [grossSalary]);

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
              Gross Annual Salary (£)
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
              Monthly Take-home Pay
            </h3>
            <div className="text-4xl font-extrabold text-primary tracking-tight">
              {formatCurrency(taxDetails.netMonthly)}
            </div>
            <p className="mt-2 text-xs font-medium text-muted-foreground">
              ({formatCurrency(gross)} - {formatCurrency(taxDetails.totalIncomeTax)} - {formatCurrency(taxDetails.totalNI)}) / 12 = {formatCurrency(taxDetails.netMonthly)}
            </p>
            
            <div className="h-[1px] bg-border my-6"></div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Personal Allowance:</span>
                <span className="font-semibold text-foreground">{formatCurrency(taxDetails.personalAllowance)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Total Income Tax:</span>
                <span className="font-semibold text-red-500">-{formatCurrency(taxDetails.totalIncomeTax)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">National Insurance:</span>
                <span className="font-semibold text-red-500">-{formatCurrency(taxDetails.totalNI)}</span>
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
  const [targetNet, setTargetNet] = useState<string>('3000');
  const [frequency, setFrequency] = useState<'monthly' | 'annual'>('monthly');
  const [copied, setCopied] = useState(false);

  const numNet = parseFloat(targetNet) || 0;
  const targetAnnualNet = frequency === 'monthly' ? numNet * 12 : numNet;
  
  const estimatedGross = calculateGrossFromNet(targetAnnualNet);
  const taxDetails = calculateUKTax(estimatedGross);

  const handleCopy = () => {
    const text = `Reverse Tax Calculator Results:
- Target Net Salary: ${formatCurrency(numNet)} (${frequency})
- Estimated Required Gross Annual: ${formatCurrency(estimatedGross)}
- Estimated Monthly Gross: ${formatCurrency(estimatedGross / 12)}
- Income Tax deductions: ${formatCurrency(taxDetails.totalIncomeTax)}
- NI deductions: ${formatCurrency(taxDetails.totalNI)}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
  };

  const handleReset = () => {
    setTargetNet('3000');
    setFrequency('monthly');
  };

  useEffect(() => {
    if (numNet > 0) {
      const timer = setTimeout(() => {
        addHistory(
          'reverse-tax',
          'Reverse Tax Calculator',
          { targetNet: numNet, frequency },
          { estimatedGross }
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
              Target Net Salary (£)
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
            <div className="grid grid-cols-2 gap-2 bg-muted p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setFrequency('monthly')}
                className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
                  frequency === 'monthly'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Monthly Net
              </button>
              <button
                type="button"
                onClick={() => setFrequency('annual')}
                className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
                  frequency === 'annual'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Annual Net
              </button>
            </div>
          </div>
        </div>

        {/* Outputs */}
        <div className="bg-muted/50 rounded-xl p-6 flex flex-col justify-between border border-border/50">
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-4">
              Estimated Required Gross Annual Salary
            </h3>
            <div className="text-4xl font-extrabold text-primary tracking-tight">
              {formatCurrency(estimatedGross)}
            </div>
            <p className="mt-2 text-xs font-medium text-muted-foreground">
              Target annual net {formatCurrency(targetAnnualNet)} solved backwards to estimated gross {formatCurrency(estimatedGross)}
            </p>
            
            <div className="h-[1px] bg-border my-6"></div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Gross Monthly equivalent:</span>
                <span className="font-semibold text-foreground">{formatCurrency(estimatedGross / 12)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Estimated Income Tax:</span>
                <span className="font-semibold text-red-500">+{formatCurrency(taxDetails.totalIncomeTax)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Estimated National Insurance:</span>
                <span className="font-semibold text-red-500">+{formatCurrency(taxDetails.totalNI)}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-t border-border pt-3">
                <span className="font-medium text-foreground">Target Net Salary:</span>
                <span className="font-bold text-accent">{formatCurrency(frequency === 'monthly' ? numNet : targetAnnualNet / 12)} /mo</span>
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
  const [grossSalary, setGrossSalary] = useState<string>('60000');
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
