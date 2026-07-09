import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/mathHelpers';
import { CalculatorHeader } from './SalaryCalculators';
import { Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

// 1. LTV CALCULATOR
export const LtvCalculator: React.FC = () => {
  const { addHistory } = useApp();
  const [propertyValue, setPropertyValue] = useState<string>('300000');
  const [loanAmount, setLoanAmount] = useState<string>('270000');
  const [ltv, setLtv] = useState<string>('90');
  const [depositAmount, setDepositAmount] = useState<string>('30000');
  const [depositPercent, setDepositPercent] = useState<string>('10');
  const [copied, setCopied] = useState(false);

  const numVal = parseFloat(propertyValue) || 0;
  const numLoan = parseFloat(loanAmount) || 0;
  const numLtv = parseFloat(ltv) || 0;
  const numDeposit = parseFloat(depositAmount) || 0;
  const numDepositPercent = parseFloat(depositPercent) || 0;

  const handlePropertyValueChange = (valStr: string) => {
    setPropertyValue(valStr);
    const pv = parseFloat(valStr) || 0;
    const currentLtv = parseFloat(ltv) || 0;
    if (pv > 0) {
      const la = pv * (currentLtv / 100);
      const da = pv - la;
      setLoanAmount(Math.round(la).toString());
      setDepositAmount(Math.round(da).toString());
    }
  };

  const handleLoanAmountChange = (valStr: string) => {
    setLoanAmount(valStr);
    const la = parseFloat(valStr) || 0;
    const pv = parseFloat(propertyValue) || 0;
    if (pv > 0) {
      const da = Math.max(0, pv - la);
      const ltvVal = (la / pv) * 100;
      const dpVal = (da / pv) * 100;
      setDepositAmount(Math.round(da).toString());
      setLtv(ltvVal.toFixed(2));
      setDepositPercent(dpVal.toFixed(2));
    }
  };

  const handleLtvChange = (valStr: string) => {
    setLtv(valStr);
    const ltvVal = parseFloat(valStr) || 0;
    const pv = parseFloat(propertyValue) || 0;
    if (pv > 0) {
      const la = pv * (ltvVal / 100);
      const da = pv - la;
      const dpVal = 100 - ltvVal;
      setLoanAmount(Math.round(la).toString());
      setDepositAmount(Math.round(da).toString());
      setDepositPercent(dpVal.toFixed(2));
    }
  };

  const handleDepositAmountChange = (valStr: string) => {
    setDepositAmount(valStr);
    const da = parseFloat(valStr) || 0;
    const pv = parseFloat(propertyValue) || 0;
    if (pv > 0) {
      const la = Math.max(0, pv - da);
      const ltvVal = (la / pv) * 100;
      const dpVal = (da / pv) * 100;
      setLoanAmount(Math.round(la).toString());
      setLtv(ltvVal.toFixed(2));
      setDepositPercent(dpVal.toFixed(2));
    }
  };

  const handleDepositPercentChange = (valStr: string) => {
    setDepositPercent(valStr);
    const dpVal = parseFloat(valStr) || 0;
    const pv = parseFloat(propertyValue) || 0;
    if (pv > 0) {
      const da = pv * (dpVal / 100);
      const la = pv - da;
      const ltvVal = 100 - dpVal;
      setLoanAmount(Math.round(la).toString());
      setDepositAmount(Math.round(da).toString());
      setLtv(ltvVal.toFixed(2));
    }
  };

  const handleCopy = () => {
    const text = `LTV Calculator Results:
- Property Value: ${formatCurrency(numVal)}
- Loan Amount: ${formatCurrency(numLoan)}
- LTV (Loan to Value): ${numLtv.toFixed(2)}%
- Deposit: ${formatCurrency(numDeposit)} (${numDepositPercent.toFixed(2)}%)`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
  };

  const handleReset = () => {
    setPropertyValue('300000');
    setLoanAmount('270000');
    setLtv('90');
    setDepositAmount('30000');
    setDepositPercent('10');
  };

  useEffect(() => {
    if (numVal > 0 && numLoan > 0) {
      const timer = setTimeout(() => {
        addHistory(
          'ltv-calculator',
          'LTV Calculator',
          { propertyValue: numVal, loanAmount: numLoan, ltv: numLtv, depositAmount: numDeposit, depositPercent: numDepositPercent },
          { ltv: numLtv, depositAmt: numDeposit, depositPct: numDepositPercent }
        );
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [propertyValue, loanAmount, ltv, depositAmount, depositPercent]);

  return (
    <div className="bg-card text-card-foreground p-6 rounded-lg border border-border shadow-sm">
      <CalculatorHeader
        title="Super-Flexible LTV Calculator"
        calculatorId="ltv-calculator"
        onReset={handleReset}
        onCopy={handleCopy}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Property Value (£)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">£</span>
              <input
                type="number"
                value={propertyValue}
                onChange={(e) => handlePropertyValueChange(e.target.value)}
                className="w-full pl-7 pr-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                placeholder="e.g. 300000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Loan Amount (£)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">£</span>
              <input
                type="number"
                value={loanAmount}
                onChange={(e) => handleLoanAmountChange(e.target.value)}
                className="w-full pl-7 pr-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                placeholder="e.g. 270000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Loan-to-Value (LTV %)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                value={ltv}
                onChange={(e) => handleLtvChange(e.target.value)}
                className="w-full pr-8 pl-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                placeholder="e.g. 90"
              />
              <span className="absolute right-3 top-2.5 text-muted-foreground text-sm">%</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Deposit Amount (£)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">£</span>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => handleDepositAmountChange(e.target.value)}
                className="w-full pl-7 pr-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                placeholder="e.g. 30000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Deposit Percentage (%)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                value={depositPercent}
                onChange={(e) => handleDepositPercentChange(e.target.value)}
                className="w-full pr-8 pl-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                placeholder="e.g. 10"
              />
              <span className="absolute right-3 top-2.5 text-muted-foreground text-sm">%</span>
            </div>
          </div>
        </div>

        {/* Outputs */}
        <div className="bg-muted/50 rounded-xl p-6 flex flex-col justify-between border border-border/50">
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-4">
              LTV & Deposit Summary
            </h3>
            
            <div className="space-y-4">
              <div>
                <span className="block text-xs font-medium text-muted-foreground">Property Value</span>
                <span className="text-2xl font-bold text-foreground">{formatCurrency(numVal)}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs font-medium text-muted-foreground">Loan Amount</span>
                  <span className="text-lg font-bold text-foreground">{formatCurrency(numLoan)}</span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-muted-foreground">LTV Ratio</span>
                  <span className="text-lg font-bold text-accent">{numLtv.toFixed(2)}%</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs font-medium text-muted-foreground">Deposit Paid</span>
                  <span className="text-lg font-bold text-foreground">{formatCurrency(numDeposit)}</span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-muted-foreground">Deposit Percentage</span>
                  <span className="text-lg font-bold text-foreground">{numDepositPercent.toFixed(2)}%</span>
                </div>
              </div>
            </div>

            <div className="h-[1px] bg-border my-6"></div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">LTV Risk Tier:</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                numLtv <= 75 ? 'bg-emerald-500/10 text-emerald-500' :
                numLtv <= 85 ? 'bg-amber-500/10 text-amber-500' :
                numLtv <= 90 ? 'bg-orange-500/10 text-orange-500' :
                'bg-red-500/10 text-red-500'
              }`}>
                {numLtv <= 75 ? 'Low Risk' : numLtv <= 85 ? 'Medium' : numLtv <= 90 ? 'High' : 'Very High LTV'}
              </span>
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

// 2. DEPOSIT CALCULATOR
export const DepositCalculator: React.FC = () => {
  const { addHistory } = useApp();
  const [propertyValue, setPropertyValue] = useState<string>('300000');
  const [deposit, setDeposit] = useState<string>('30000');
  const [ltv, setLtv] = useState<string>('90');
  const [copied, setCopied] = useState(false);

  const numVal = parseFloat(propertyValue) || 0;

  // Sync inputs
  const handlePropValChange = (valStr: string) => {
    setPropertyValue(valStr);
    const val = parseFloat(valStr) || 0;
    const currentLtv = parseFloat(ltv) || 0;
    const computedDeposit = val * ((100 - currentLtv) / 100);
    setDeposit(Math.round(computedDeposit).toString());
  };

  const handleDepositChange = (depStr: string) => {
    setDeposit(depStr);
    const dep = parseFloat(depStr) || 0;
    if (numVal > 0) {
      const computedLtv = ((numVal - dep) / numVal) * 100;
      setLtv(computedLtv.toFixed(2));
    }
  };

  const handleLtvChange = (ltvStr: string) => {
    setLtv(ltvStr);
    const currentLtv = parseFloat(ltvStr) || 0;
    if (numVal > 0) {
      const computedDeposit = numVal * ((100 - currentLtv) / 100);
      setDeposit(Math.round(computedDeposit).toString());
    }
  };

  const numDeposit = parseFloat(deposit) || 0;
  const numLtv = parseFloat(ltv) || 0;
  const loanAmount = Math.max(0, numVal - numDeposit);

  const handleCopy = () => {
    const text = `Deposit Calculator Results:
- Property Value: ${formatCurrency(numVal)}
- Deposit Amount: ${formatCurrency(numDeposit)} (${(100 - numLtv).toFixed(2)}%)
- Resulting Loan: ${formatCurrency(loanAmount)}
- Resulting LTV: ${numLtv.toFixed(2)}%`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
  };

  const handleReset = () => {
    setPropertyValue('300000');
    setDeposit('30000');
    setLtv('90');
  };

  useEffect(() => {
    if (numVal > 0 && numDeposit > 0) {
      const timer = setTimeout(() => {
        addHistory(
          'deposit-calculator',
          'Deposit Calculator',
          { propertyValue: numVal, deposit: numDeposit },
          { loanAmount, ltv: numLtv }
        );
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [propertyValue, deposit]);

  return (
    <div className="bg-card text-card-foreground p-6 rounded-lg border border-border shadow-sm">
      <CalculatorHeader
        title="Deposit Calculator"
        calculatorId="deposit-calculator"
        onReset={handleReset}
        onCopy={handleCopy}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Property Value (£)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">£</span>
              <input
                type="number"
                value={propertyValue}
                onChange={(e) => handlePropValChange(e.target.value)}
                className="w-full pl-7 pr-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                placeholder="e.g. 300000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Deposit Amount (£)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">£</span>
              <input
                type="number"
                value={deposit}
                onChange={(e) => handleDepositChange(e.target.value)}
                className="w-full pl-7 pr-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                placeholder="e.g. 30000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              LTV (%)
            </label>
            <div className="relative">
              <input
                type="number"
                value={ltv}
                onChange={(e) => handleLtvChange(e.target.value)}
                className="w-full pr-8 pl-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                placeholder="e.g. 90"
              />
              <span className="absolute right-3 top-2.5 text-muted-foreground text-sm">%</span>
            </div>
          </div>
        </div>

        {/* Outputs */}
        <div className="bg-muted/50 rounded-xl p-6 flex flex-col justify-between border border-border/50">
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-4">
              Resulting Loan Amount
            </h3>
            <div className="text-4xl font-extrabold text-primary tracking-tight">
              {formatCurrency(loanAmount)}
            </div>
            
            <div className="h-[1px] bg-border my-6"></div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-xs font-medium text-muted-foreground">Deposit Percentage</span>
                <span className="text-lg font-bold text-foreground">{(numVal > 0 ? (numDeposit / numVal) * 100 : 0).toFixed(2)}%</span>
              </div>
              <div>
                <span className="block text-xs font-medium text-muted-foreground">Lending (LTV)</span>
                <span className="text-lg font-bold text-foreground">{numLtv}%</span>
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

// 3. LOAN-TO-INCOME (LTI) CALCULATOR
export const LtiCalculator: React.FC = () => {
  const { addHistory } = useApp();
  const [loanAmount, setLoanAmount] = useState<string>('225000');
  const [applicant1Income, setApplicant1Income] = useState<string>('45000');
  const [applicant2Income, setApplicant2Income] = useState<string>('15000');
  const [copied, setCopied] = useState(false);

  const numLoan = parseFloat(loanAmount) || 0;
  const inc1 = parseFloat(applicant1Income) || 0;
  const inc2 = parseFloat(applicant2Income) || 0;
  const totalIncome = inc1 + inc2;

  const ltiRatio = totalIncome > 0 ? numLoan / totalIncome : 0;

  const maxLoan4_5 = totalIncome * 4.5;
  const maxLoan5_0 = totalIncome * 5.0;
  const maxLoan5_5 = totalIncome * 5.5;

  const handleCopy = () => {
    const text = `Loan-to-Income (LTI) Calculator Results:
- Loan Amount: ${formatCurrency(numLoan)}
- Combined Income: ${formatCurrency(totalIncome)}
- LTI Ratio: ${ltiRatio.toFixed(2)}x
- Cap Estimates:
  - 4.5x Multiplier Cap: ${formatCurrency(maxLoan4_5)}
  - 5.0x Multiplier Cap: ${formatCurrency(maxLoan5_0)}
  - 5.5x Multiplier Cap: ${formatCurrency(maxLoan5_5)}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
  };

  const handleReset = () => {
    setLoanAmount('225000');
    setApplicant1Income('45000');
    setApplicant2Income('15000');
  };

  useEffect(() => {
    if (numLoan > 0 && totalIncome > 0) {
      const timer = setTimeout(() => {
        addHistory(
          'lti-calculator',
          'LTI Calculator',
          { loanAmount: numLoan, applicant1Income: inc1, applicant2Income: inc2 },
          { ltiRatio, totalIncome }
        );
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [loanAmount, applicant1Income, applicant2Income]);

  return (
    <div className="bg-card text-card-foreground p-6 rounded-lg border border-border shadow-sm">
      <CalculatorHeader
        title="Loan-to-Income (LTI) Calculator"
        calculatorId="lti-calculator"
        onReset={handleReset}
        onCopy={handleCopy}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Loan Amount (£)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">£</span>
              <input
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                className="w-full pl-7 pr-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                placeholder="e.g. 225000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Applicant 1 Income (£/yr)
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-1.5 text-muted-foreground text-xs">£</span>
                <input
                  type="number"
                  value={applicant1Income}
                  onChange={(e) => setApplicant1Income(e.target.value)}
                  className="w-full pl-6 pr-2 py-1.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Applicant 2 Income (£/yr)
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-1.5 text-muted-foreground text-xs">£</span>
                <input
                  type="number"
                  value={applicant2Income}
                  onChange={(e) => setApplicant2Income(e.target.value)}
                  className="w-full pl-6 pr-2 py-1.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Outputs */}
        <div className="bg-muted/50 rounded-xl p-6 flex flex-col justify-between border border-border/50">
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-4">
              LTI Multiplier
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-extrabold text-primary tracking-tight">
                {ltiRatio.toFixed(2)}x
              </span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                ltiRatio <= 4.49 ? 'bg-emerald-500/10 text-emerald-500' :
                ltiRatio <= 4.99 ? 'bg-amber-500/10 text-amber-500' :
                'bg-red-500/10 text-red-500'
              }`}>
                {ltiRatio <= 4.49 ? 'Within 4.5x' : ltiRatio <= 4.99 ? 'Within 5.0x' : 'High LTI (>5.0x)'}
              </span>
            </div>
            
            <div className="h-[1px] bg-border my-6"></div>
            
            <div className="space-y-2">
              <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Lender Cap Estimates</span>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Standard (4.5x Combined):</span>
                <span className="font-semibold text-foreground">{formatCurrency(maxLoan4_5)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">High Income (5.0x Combined):</span>
                <span className="font-semibold text-foreground">{formatCurrency(maxLoan5_0)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Extraordinary / Bespoke (5.5x):</span>
                <span className="font-semibold text-foreground">{formatCurrency(maxLoan5_5)}</span>
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

// 4. MORTGAGE REPAYMENT CALCULATOR
export const MortgageRepaymentCalculator: React.FC = () => {
  const { addHistory } = useApp();
  const [loanAmount, setLoanAmount] = useState<string>('250000');
  const [interestRate, setInterestRate] = useState<string>('4.5');
  const [term, setTerm] = useState<string>('25');
  const [showAmortization, setShowAmortization] = useState(false);
  const [copied, setCopied] = useState(false);

  const P = parseFloat(loanAmount) || 0;
  const annualR = parseFloat(interestRate) || 0;
  const years = parseFloat(term) || 0;

  // Monthly repayment calculation
  const monthlyR = annualR / 12 / 100;
  const n = years * 12;
  
  let monthlyPayment = 0;
  if (P > 0 && n > 0) {
    if (monthlyR === 0) {
      monthlyPayment = P / n;
    } else {
      monthlyPayment = P * (monthlyR * Math.pow(1 + monthlyR, n)) / (Math.pow(1 + monthlyR, n) - 1);
    }
  }

  const totalPaid = monthlyPayment * n;
  const totalInterest = Math.max(0, totalPaid - P);

  // Generate annual amortization schedule
  const generateAmortizationSchedule = () => {
    let balance = P;
    const r = monthlyR;
    const schedule = [];

    for (let year = 1; year <= years; year++) {
      let interestForYear = 0;
      let principalForYear = 0;

      for (let month = 1; month <= 12; month++) {
        const interestForMonth = balance * r;
        const principalForMonth = monthlyPayment - interestForMonth;
        
        interestForYear += interestForMonth;
        principalForYear += principalForMonth;
        balance = Math.max(0, balance - principalForMonth);
      }

      schedule.push({
        year,
        startBalance: balance + principalForYear,
        interestPaid: interestForYear,
        principalPaid: principalForYear,
        endBalance: balance
      });
    }
    return schedule;
  };

  const schedule = P > 0 && years > 0 ? generateAmortizationSchedule() : [];

  const handleCopy = () => {
    const text = `Mortgage Repayment Calculator Results:
- Loan Amount: ${formatCurrency(P)}
- Interest Rate: ${annualR}%
- Term: ${years} Years
- Monthly Payment (P+I): ${formatCurrency(monthlyPayment)}
- Total Principal: ${formatCurrency(P)}
- Total Interest: ${formatCurrency(totalInterest)}
- Total Cost over term: ${formatCurrency(totalPaid)}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
  };

  const handleReset = () => {
    setLoanAmount('250000');
    setInterestRate('4.5');
    setTerm('25');
    setShowAmortization(false);
  };

  useEffect(() => {
    if (P > 0 && annualR > 0 && years > 0) {
      const timer = setTimeout(() => {
        addHistory(
          'mortgage-repayment',
          'Mortgage Repayment Calculator',
          { loanAmount: P, interestRate: annualR, term: years },
          { monthlyPayment, totalPaid, totalInterest }
        );
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [loanAmount, interestRate, term]);

  return (
    <div className="bg-card text-card-foreground p-6 rounded-lg border border-border shadow-sm space-y-6">
      <CalculatorHeader
        title="Mortgage Repayment Calculator"
        calculatorId="mortgage-repayment"
        onReset={handleReset}
        onCopy={handleCopy}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Loan Amount (£)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">£</span>
              <input
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                className="w-full pl-7 pr-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                placeholder="e.g. 250000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Interest Rate (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  className="w-full pr-8 pl-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                  placeholder="e.g. 4.5"
                />
                <span className="absolute right-3 top-2.5 text-muted-foreground text-sm">%</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Term (Years)
              </label>
              <input
                type="number"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                placeholder="e.g. 25"
              />
            </div>
          </div>
        </div>

        {/* Outputs */}
        <div className="bg-muted/50 rounded-xl p-6 flex flex-col justify-between border border-border/50">
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-4">
              Monthly Repayment (P+I)
            </h3>
            <div className="text-4xl font-extrabold text-primary tracking-tight">
              {formatCurrency(monthlyPayment)}
            </div>
            
            <div className="h-[1px] bg-border my-6"></div>
            
            {/* Visual ratio of principal to interest */}
            {P > 0 && (
              <div className="mb-6">
                <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Cost Breakdown Ratio</span>
                <div className="h-4 w-full bg-border rounded-full overflow-hidden flex">
                  <div 
                    className="bg-accent h-full transition-all duration-500" 
                    style={{ width: `${(P / totalPaid) * 100}%` }}
                    title={`Principal: ${Math.round((P / totalPaid) * 100)}%`}
                  />
                  <div 
                    className="bg-amber-500 h-full transition-all duration-500" 
                    style={{ width: `${(totalInterest / totalPaid) * 100}%` }}
                    title={`Interest: ${Math.round((totalInterest / totalPaid) * 100)}%`}
                  />
                </div>
                <div className="flex justify-between items-center text-xs mt-1.5">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-accent inline-block"></span> Principal ({Math.round((P / totalPaid) * 100)}%)</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> Interest ({Math.round((totalInterest / totalPaid) * 100)}%)</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-xs font-medium text-muted-foreground">Total Interest Paid</span>
                <span className="text-lg font-bold text-foreground">{formatCurrency(totalInterest)}</span>
              </div>
              <div>
                <span className="block text-xs font-medium text-muted-foreground">Total Paid Over Term</span>
                <span className="text-lg font-bold text-foreground">{formatCurrency(totalPaid)}</span>
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

      {/* Amortization schedule toggle */}
      {schedule.length > 0 && (
        <div className="border-t border-border pt-4 mt-4">
          <button
            onClick={() => setShowAmortization(!showAmortization)}
            className="text-xs font-semibold text-accent hover:underline focus:outline-none flex items-center gap-1"
          >
            {showAmortization ? 'Hide Amortisation Schedule' : 'Show Amortisation Schedule'}
          </button>
          
          {showAmortization && (
            <div className="overflow-x-auto mt-4 max-h-[300px] border border-border rounded-lg">
              <table className="min-w-full divide-y divide-border text-xs">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold text-muted-foreground">Year</th>
                    <th className="px-4 py-2 text-right font-semibold text-muted-foreground">Start Balance</th>
                    <th className="px-4 py-2 text-right font-semibold text-muted-foreground">Principal Paid</th>
                    <th className="px-4 py-2 text-right font-semibold text-muted-foreground">Interest Paid</th>
                    <th className="px-4 py-2 text-right font-semibold text-muted-foreground">End Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {schedule.map((row) => (
                    <tr key={row.year} className="hover:bg-muted/20">
                      <td className="px-4 py-2 font-medium text-foreground">{row.year}</td>
                      <td className="px-4 py-2 text-right text-muted-foreground">{formatCurrency(row.startBalance, 0)}</td>
                      <td className="px-4 py-2 text-right text-emerald-600 font-medium">{formatCurrency(row.principalPaid, 0)}</td>
                      <td className="px-4 py-2 text-right text-amber-600">{formatCurrency(row.interestPaid, 0)}</td>
                      <td className="px-4 py-2 text-right font-medium text-foreground">{formatCurrency(row.endBalance, 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// 5. INTEREST-ONLY REPAYMENT CALCULATOR
export const InterestOnlyCalculator: React.FC = () => {
  const { addHistory } = useApp();
  const [loanAmount, setLoanAmount] = useState<string>('250000');
  const [interestRate, setInterestRate] = useState<string>('4.5');
  const [term, setTerm] = useState<string>('25');
  const [copied, setCopied] = useState(false);

  const P = parseFloat(loanAmount) || 0;
  const annualR = parseFloat(interestRate) || 0;
  const years = parseFloat(term) || 0;

  const monthlyPayment = P * (annualR / 100) / 12;
  const totalInterest = monthlyPayment * (years * 12);

  // Compare to Repayment
  const monthlyR = annualR / 12 / 100;
  const n = years * 12;
  let repaymentMonthly = 0;
  if (P > 0 && n > 0) {
    if (monthlyR === 0) {
      repaymentMonthly = P / n;
    } else {
      repaymentMonthly = P * (monthlyR * Math.pow(1 + monthlyR, n)) / (Math.pow(1 + monthlyR, n) - 1);
    }
  }

  const handleCopy = () => {
    const text = `Interest-Only Mortgage Calculator Results:
- Loan Amount: ${formatCurrency(P)}
- Interest Rate: ${annualR}%
- Term: ${years} Years
- Monthly Interest-Only Payment: ${formatCurrency(monthlyPayment)}
- Total Interest Paid: ${formatCurrency(totalInterest)}
- (Comparison) Equivalent Repayment Monthly: ${formatCurrency(repaymentMonthly)}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
  };

  const handleReset = () => {
    setLoanAmount('250000');
    setInterestRate('4.5');
    setTerm('25');
  };

  useEffect(() => {
    if (P > 0 && annualR > 0 && years > 0) {
      const timer = setTimeout(() => {
        addHistory(
          'interest-only-repayment',
          'Interest-Only Repayment Calculator',
          { loanAmount: P, interestRate: annualR, term: years },
          { monthlyPayment, totalInterest }
        );
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [loanAmount, interestRate, term]);

  return (
    <div className="bg-card text-card-foreground p-6 rounded-lg border border-border shadow-sm">
      <CalculatorHeader
        title="Interest-Only Mortgage Calculator"
        calculatorId="interest-only-repayment"
        onReset={handleReset}
        onCopy={handleCopy}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Loan Amount (£)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">£</span>
              <input
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                className="w-full pl-7 pr-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                placeholder="e.g. 250000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Interest Rate (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  className="w-full pr-8 pl-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                  placeholder="e.g. 4.5"
                />
                <span className="absolute right-3 top-2.5 text-muted-foreground text-sm">%</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Term (Years)
              </label>
              <input
                type="number"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                placeholder="e.g. 25"
              />
            </div>
          </div>
        </div>

        {/* Outputs */}
        <div className="bg-muted/50 rounded-xl p-6 flex flex-col justify-between border border-border/50">
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-4">
              Monthly Payment (Interest Only)
            </h3>
            <div className="text-4xl font-extrabold text-primary tracking-tight">
              {formatCurrency(monthlyPayment)}
            </div>
            
            <div className="h-[1px] bg-border my-6"></div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Total Interest Paid:</span>
                <span className="font-semibold text-foreground">{formatCurrency(totalInterest)}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-t border-border pt-3">
                <span className="text-muted-foreground">Equivalent Repayment Monthly Payment:</span>
                <span className="font-medium text-muted-foreground line-through">{formatCurrency(repaymentMonthly)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Monthly Savings (Interest Only):</span>
                <span className="font-bold text-emerald-600">-{formatCurrency(repaymentMonthly - monthlyPayment)}</span>
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
