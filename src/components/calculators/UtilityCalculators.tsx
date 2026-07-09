import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { usePersistentState } from '../../hooks/usePersistentState';
import { CalculatorHeader } from './SalaryCalculators';
import { Sparkles, Calendar, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';

// 1. PERCENTAGE CALCULATORS (Percentage of, Percentage Change, Difference)
export const PercentageCalculators: React.FC = () => {
  const { addHistory } = useApp();
  const [activeTab, setActiveTab] = usePersistentState<'of' | 'change' | 'diff'>('percentage:activeTab', 'of');
  const [copied, setCopied] = useState(false);

  // Tab 1: What is X% of Y?
  const [pctX, setPctX] = usePersistentState('percentage:pctX', '15');
  const [pctY, setPctY] = usePersistentState('percentage:pctY', '250000');
  const numPctX = parseFloat(pctX) || 0;
  const numPctY = parseFloat(pctY) || 0;
  const ofResult = (numPctX / 100) * numPctY;

  // Tab 2: Percentage change from X to Y
  const [changeX, setChangeX] = usePersistentState('percentage:changeX', '1500');
  const [changeY, setChangeY] = usePersistentState('percentage:changeY', '1800');
  const numChangeX = parseFloat(changeX) || 0;
  const numChangeY = parseFloat(changeY) || 0;
  const changeResult = numChangeX > 0 ? ((numChangeY - numChangeX) / numChangeX) * 100 : 0;

  // Tab 3: Difference between X and Y
  const [diffX, setDiffX] = usePersistentState('percentage:diffX', '320000');
  const [diffY, setDiffY] = usePersistentState('percentage:diffY', '300000');
  const numDiffX = parseFloat(diffX) || 0;
  const numDiffY = parseFloat(diffY) || 0;
  const diffAbs = Math.abs(numDiffX - numDiffY);
  const diffPct = numDiffX > 0 ? (diffAbs / numDiffX) * 100 : 0;

  const handleCopy = () => {
    let text = '';
    if (activeTab === 'of') {
      text = `Percentage Calculator:
- ${pctX}% of ${pctY} = ${ofResult.toFixed(2)}`;
    } else if (activeTab === 'change') {
      text = `Percentage Change:
- From ${changeX} to ${changeY} = ${changeResult >= 0 ? '+' : ''}${changeResult.toFixed(2)}%`;
    } else {
      text = `Difference Calculator:
- Between ${diffX} and ${diffY}
- Absolute Difference: ${diffAbs.toFixed(2)}
- Percentage Difference: ${diffPct.toFixed(2)}%`;
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
  };

  const handleReset = () => {
    if (activeTab === 'of') {
      setPctX('15');
      setPctY('250000');
    } else if (activeTab === 'change') {
      setChangeX('1500');
      setChangeY('1800');
    } else {
      setDiffX('320000');
      setDiffY('300000');
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === 'of' && numPctX > 0 && numPctY > 0) {
        addHistory('percentage-calculator', 'Percentage Calculator (X% of Y)', { x: numPctX, y: numPctY }, { result: ofResult });
      } else if (activeTab === 'change' && numChangeX > 0 && numChangeY > 0) {
        addHistory('percentage-change', 'Percentage Change', { from: numChangeX, to: numChangeY }, { change: changeResult });
      } else if (activeTab === 'diff' && numDiffX > 0 && numDiffY > 0) {
        addHistory('difference-calculator', 'Difference Calculator', { valueA: numDiffX, valueB: numDiffY }, { diffAbs, diffPct });
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [pctX, pctY, changeX, changeY, diffX, diffY, activeTab]);

  return (
    <div className="bg-card text-card-foreground p-6 rounded-lg border border-border shadow-sm space-y-6">
      <CalculatorHeader
        title="Percentage / Change / Difference"
        calculatorId="percentage-calculators"
        onReset={handleReset}
        onCopy={handleCopy}
      />

      {/* Tabs */}
      <div className="flex bg-muted p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('of')}
          className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
            activeTab === 'of' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          X% of Y
        </button>
        <button
          onClick={() => setActiveTab('change')}
          className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
            activeTab === 'change' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Percentage Change
        </button>
        <button
          onClick={() => setActiveTab('diff')}
          className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
            activeTab === 'diff' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Difference
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Tab Inputs */}
        <div className="space-y-4">
          {activeTab === 'of' && (
            <>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Percentage (X)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={pctX}
                    onChange={(e) => setPctX(e.target.value)}
                    className="w-full pr-8 pl-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                    placeholder="e.g. 15"
                  />
                  <span className="absolute right-3 top-2.5 text-muted-foreground text-sm">%</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Of Value (Y)</label>
                <input
                  type="number"
                  value={pctY}
                  onChange={(e) => setPctY(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                  placeholder="e.g. 250000"
                />
              </div>
            </>
          )}

          {activeTab === 'change' && (
            <>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Original Value (From)</label>
                <input
                  type="number"
                  value={changeX}
                  onChange={(e) => setChangeX(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                  placeholder="e.g. 1500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">New Value (To)</label>
                <input
                  type="number"
                  value={changeY}
                  onChange={(e) => setChangeY(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                  placeholder="e.g. 1800"
                />
              </div>
            </>
          )}

          {activeTab === 'diff' && (
            <>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Value A</label>
                <input
                  type="number"
                  value={diffX}
                  onChange={(e) => setDiffX(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                  placeholder="e.g. 320000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Value B</label>
                <input
                  type="number"
                  value={diffY}
                  onChange={(e) => setDiffY(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                  placeholder="e.g. 300000"
                />
              </div>
            </>
          )}
        </div>

        {/* Tab Outputs */}
        <div className="bg-muted/50 rounded-xl p-6 flex flex-col justify-between border border-border/50">
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-4 font-mono">
              {activeTab === 'of' ? 'Resulting Value' : activeTab === 'change' ? 'Percentage Change' : 'Difference Summary'}
            </h3>
            
            {activeTab === 'of' && (
              <div className="text-4xl font-extrabold text-primary tracking-tight">
                {ofResult.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            )}

            {activeTab === 'change' && (
              <div className="flex items-baseline gap-2">
                <span className={`text-5xl font-extrabold tracking-tight ${changeResult >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {changeResult >= 0 ? '+' : ''}{changeResult.toFixed(2)}%
                </span>
              </div>
            )}

            {activeTab === 'diff' && (
              <div className="space-y-4">
                <div>
                  <span className="block text-xs font-medium text-muted-foreground">Absolute Difference</span>
                  <span className="text-3xl font-extrabold text-primary">{diffAbs.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-muted-foreground">Percentage Difference (of A)</span>
                  <span className="text-xl font-bold text-foreground">{diffPct.toFixed(2)}%</span>
                </div>
              </div>
            )}

            <div className="h-[1px] bg-border my-6"></div>
            
            <div className="text-xs text-muted-foreground flex gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-accent shrink-0" />
              <span>
                {activeTab === 'of' && `${pctX} / 100 x ${pctY} = ${ofResult.toFixed(2)}`}
                {activeTab === 'change' && `((${changeY} - ${changeX}) / ${changeX}) x 100 = ${changeResult.toFixed(2)}%`}
                {activeTab === 'diff' && `|${diffX} - ${diffY}| = ${diffAbs.toFixed(2)}, then / ${diffX} x 100 = ${diffPct.toFixed(2)}%`}
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

// Helper function to calculate date differences precisely
const calcDateDifference = (start: Date, end: Date) => {
  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();

  if (days < 0) {
    months -= 1;
    // Get days in previous month
    const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
    days += prevMonth.getDate();
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return { years, months, days };
};

// 2. AGE CALCULATOR
export const AgeCalculator: React.FC = () => {
  const { addHistory } = useApp();
  const [dob, setDob] = usePersistentState('age:dob', '1990-01-15');
  const [targetDate, setTargetDate] = usePersistentState('age:targetDate', () => new Date().toISOString().split('T')[0]);
  const [copied, setCopied] = useState(false);

  const startDate = new Date(dob);
  const endDate = new Date(targetDate);
  
  let age = { years: 0, months: 0, days: 0 };
  let isValid = false;

  if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && endDate >= startDate) {
    age = calcDateDifference(startDate, endDate);
    isValid = true;
  }

  const handleCopy = () => {
    if (!isValid) return;
    const text = `Age Calculator Results:
- Date of Birth: ${dob}
- Target Date: ${targetDate}
- Age: ${age.years} Years, ${age.months} Months, ${age.days} Days`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
  };

  const handleReset = () => {
    setDob('1990-01-15');
    setTargetDate(new Date().toISOString().split('T')[0]);
  };

  useEffect(() => {
    if (isValid && dob) {
      const timer = setTimeout(() => {
        addHistory(
          'age-calculator',
          'Age Calculator',
          { dob, targetDate },
          { ageYears: age.years, ageMonths: age.months, ageDays: age.days }
        );
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [dob, targetDate]);

  return (
    <div className="bg-card text-card-foreground p-6 rounded-lg border border-border shadow-sm">
      <CalculatorHeader
        title="Age Calculator"
        calculatorId="age-calculator"
        onReset={handleReset}
        onCopy={handleCopy}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Target Date (Defaults to Today)
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>
        </div>

        {/* Outputs */}
        <div className="bg-muted/50 rounded-xl p-6 flex flex-col justify-between border border-border/50">
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-4">
              Calculated Age
            </h3>
            {isValid ? (
              <div className="space-y-1">
                <div className="text-4xl font-extrabold text-primary tracking-tight">
                  {age.years} <span className="text-2xl font-semibold text-muted-foreground">Years</span>
                </div>
                <div className="text-xl font-bold text-foreground">
                  {age.months} Months, {age.days} Days
                </div>
              </div>
            ) : (
              <div className="text-sm font-medium text-red-500">Please enter a valid Date of Birth before target date.</div>
            )}
            
            <div className="h-[1px] bg-border my-6"></div>
            
            <div className="text-xs text-muted-foreground flex gap-1.5 items-center">
              <Calendar className="w-4 h-4 text-accent shrink-0" />
              <span>{dob} to {targetDate} = {age.years} years, {age.months} months, {age.days} days</span>
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

// 3. MORTGAGE END DATE CALCULATOR
export const MortgageEndDateCalculator: React.FC = () => {
  const { addHistory, lender } = useApp();
  const [startDate, setStartDate] = usePersistentState('mortgage-end:startDate', () => new Date().toISOString().split('T')[0]);
  const [term, setTerm] = usePersistentState('mortgage-end:term', '25');
  const [dob, setDob] = usePersistentState('mortgage-end:dob', '1990-01-15');
  const [copied, setCopied] = useState(false);

  const parsedStart = new Date(startDate);
  const parsedDob = new Date(dob);
  const yearsTerm = parseInt(term) || 0;

  let endDate = new Date();
  let clientAgeAtEnd = 0;
  let isValid = false;

  if (!isNaN(parsedStart.getTime()) && !isNaN(parsedDob.getTime()) && yearsTerm > 0) {
    endDate = new Date(parsedStart.getFullYear() + yearsTerm, parsedStart.getMonth(), parsedStart.getDate());
    
    // Calculate client age at end date
    const ageDiff = calcDateDifference(parsedDob, endDate);
    clientAgeAtEnd = ageDiff.years + (ageDiff.months / 12) + (ageDiff.days / 365.25);
    isValid = true;
  }

  // Lloyds/Halifax rule limits: Standard maximum age at end of term is 70 or 75 (depending on retirement age, project details).
  // Let's flag warnings if age is >= 70 or >= 75.
  const ageLimit = lender === 'halifax' || lender === 'lloyds' ? 75 : 70;
  const isOverLimit = isValid && clientAgeAtEnd >= ageLimit;

  const handleCopy = () => {
    if (!isValid) return;
    const text = `Mortgage End Date Calculator:
- Start Date: ${startDate}
- Term: ${term} Years
- Date of Birth: ${dob}
- Mortgage End Date: ${endDate.toISOString().split('T')[0]}
- Age at End of Term: ${clientAgeAtEnd.toFixed(1)} years (Limit: ${ageLimit})`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
  };

  const handleReset = () => {
    setStartDate(new Date().toISOString().split('T')[0]);
    setTerm('25');
    setDob('1990-01-15');
  };

  useEffect(() => {
    if (isValid && dob) {
      const timer = setTimeout(() => {
        addHistory(
          'mortgage-end-date',
          'Mortgage End Date Calculator',
          { startDate, term: yearsTerm, dob },
          { endDate: endDate.toISOString().split('T')[0], ageAtEnd: Math.round(clientAgeAtEnd * 10) / 10 }
        );
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [startDate, term, dob]);

  return (
    <div className="bg-card text-card-foreground p-6 rounded-lg border border-border shadow-sm">
      <CalculatorHeader
        title="Mortgage End Date & Client Age"
        calculatorId="mortgage-end-date"
        onReset={handleReset}
        onCopy={handleCopy}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Mortgage Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Mortgage Term (Years)
            </label>
            <input
              type="number"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              placeholder="e.g. 25"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Client Date of Birth
            </label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>
        </div>

        {/* Outputs */}
        <div className="bg-muted/50 rounded-xl p-6 flex flex-col justify-between border border-border/50">
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-4">
              Retirement & End Date Criteria
            </h3>
            {isValid ? (
              <div className="space-y-4">
                <div>
                  <span className="block text-xs font-medium text-muted-foreground">Estimated End Date</span>
                  <span className="text-2xl font-extrabold text-primary">
                    {endDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-muted-foreground">Client Age at End Date</span>
                  <span className={`text-3xl font-extrabold ${isOverLimit ? 'text-amber-500' : 'text-foreground'}`}>
                    {clientAgeAtEnd.toFixed(1)} years old
                  </span>
                </div>

                {isOverLimit && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-lg text-xs font-medium flex gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <div>
                      <span className="font-bold uppercase">Criteria Flag:</span> Age is over {ageLimit} limit. Lloyds/Halifax require manual retirement income verification if term extends past age {ageLimit} or retirement age.
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm font-medium text-red-500">Please check input values.</div>
            )}
            
            <div className="h-[1px] bg-border my-6"></div>
            
            <div className="text-xs text-muted-foreground">
              {startDate} + {yearsTerm} years = {endDate.toISOString().split('T')[0]}; age at end is {clientAgeAtEnd.toFixed(1)} years.
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

// 4. DATE DIFFERENCE CALCULATOR
export const DateDifferenceCalculator: React.FC = () => {
  const { addHistory } = useApp();
  const [dateA, setDateA] = usePersistentState('date-difference:dateA', () => new Date().toISOString().split('T')[0]);
  const [dateB, setDateB] = usePersistentState('date-difference:dateB', () => new Date().toISOString().split('T')[0]);
  const [copied, setCopied] = useState(false);

  const start = new Date(dateA);
  const end = new Date(dateB);

  let diff = { years: 0, months: 0, days: 0 };
  let totalDays = 0;
  let totalWeeks = 0;
  let isValid = false;

  if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    totalWeeks = Math.floor(totalDays / 7);

    // Calculate broken down difference
    const dA = start < end ? start : end;
    const dB = start < end ? end : start;
    diff = calcDateDifference(dA, dB);
    isValid = true;
  }

  const handleCopy = () => {
    if (!isValid) return;
    const text = `Date Difference Calculator Results:
- Date A: ${dateA}
- Date B: ${dateB}
- Difference: ${diff.years} Years, ${diff.months} Months, ${diff.days} Days
- Total Days: ${totalDays}
- Total Weeks: ${totalWeeks}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
  };

  const handleReset = () => {
    setDateA(new Date().toISOString().split('T')[0]);
    setDateB(new Date().toISOString().split('T')[0]);
  };

  useEffect(() => {
    if (isValid && dateA !== dateB) {
      const timer = setTimeout(() => {
        addHistory(
          'date-difference',
          'Date Difference Calculator',
          { dateA, dateB },
          { diffYears: diff.years, diffMonths: diff.months, diffDays: diff.days, totalDays }
        );
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [dateA, dateB]);

  return (
    <div className="bg-card text-card-foreground p-6 rounded-lg border border-border shadow-sm">
      <CalculatorHeader
        title="Date Difference Calculator"
        calculatorId="date-difference"
        onReset={handleReset}
        onCopy={handleCopy}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Date A
            </label>
            <input
              type="date"
              value={dateA}
              onChange={(e) => setDateA(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Date B
            </label>
            <input
              type="date"
              value={dateB}
              onChange={(e) => setDateB(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>
        </div>

        {/* Outputs */}
        <div className="bg-muted/50 rounded-xl p-6 flex flex-col justify-between border border-border/50">
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-4">
              Difference Duration
            </h3>
            {isValid ? (
              <div className="space-y-4">
                <div className="text-3xl font-extrabold text-primary tracking-tight">
                  {diff.years}y, {diff.months}m, {diff.days}d
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-xs font-medium text-muted-foreground">Total Days</span>
                    <span className="text-lg font-bold text-foreground">{totalDays.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-muted-foreground">Total Weeks</span>
                    <span className="text-lg font-bold text-foreground">{totalWeeks.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm font-medium text-red-500">Please check input dates.</div>
            )}
            
            <div className="h-[1px] bg-border my-6"></div>
            
            <div className="text-xs text-muted-foreground">
              Absolute difference between {dateA} and {dateB} = {totalDays} days, or {totalWeeks} full weeks.
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
