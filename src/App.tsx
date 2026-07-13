import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { SplitView } from './components/SplitView';

// Calculators
import { 
  SalaryAnnualiser, 
  AverageSalaryCalculator, 
  CustomSalaryCalculator,
  IncomeBuilder 
} from './components/calculators/SalaryCalculators';
import { 
  LtvCalculator, 
  DepositCalculator, 
  LtiCalculator, 
  MortgageRepaymentCalculator, 
  InterestOnlyCalculator 
} from './components/calculators/MortgageCalculators';
import { 
  TaxEstimator, 
  ReverseTaxCalculator, 
  TaxBreakdown 
} from './components/calculators/TaxCalculators';
import { 
  PercentageCalculators, 
  AgeCalculator, 
  MortgageEndDateCalculator, 
  DateDifferenceCalculator 
} from './components/calculators/UtilityCalculators';

// Full List of Calculators for navigation and search indexing
const calculators = [
  {
    id: 'split-view',
    name: 'Split View',
    category: 'utility',
    description: 'Open two or three calculators side by side.',
    path: '/split',
  },
  { 
    id: 'salary-annualiser', 
    name: 'Salary Annualiser', 
    category: 'salary', 
    description: 'Convert weekly, monthly or custom frequency incomes to a verified annual salary.', 
    path: '/salary/annualiser', 
    component: SalaryAnnualiser 
  },
  { 
    id: 'average-salary', 
    name: 'Average Salary', 
    category: 'salary', 
    description: 'Average salaries with options to ignore highest and lowest values.', 
    path: '/salary/average', 
    component: AverageSalaryCalculator 
  },
  {
    id: 'custom-salary',
    name: 'Custom Salary',
    category: 'salary',
    description: 'Add manual salary figures by frequency and calculate annual and monthly totals.',
    path: '/salary/custom',
    component: CustomSalaryCalculator
  },
  { 
    id: 'income-builder', 
    name: 'Income Builder', 
    category: 'salary', 
    description: 'Build verified annual income by combining basic salary, bonus, overtime, and allowances.', 
    path: '/salary/builder', 
    component: IncomeBuilder 
  },
  { 
    id: 'ltv-calculator', 
    name: 'LTV Calculator', 
    category: 'mortgage', 
    description: 'Calculate Loan-to-Value (LTV) ratio and deposit thresholds.', 
    path: '/mortgage/ltv', 
    component: LtvCalculator 
  },
  { 
    id: 'deposit-calculator', 
    name: 'Deposit Calculator', 
    category: 'mortgage', 
    description: 'Calculate loan amount or deposit based on target LTV and property value.', 
    path: '/mortgage/deposit', 
    component: DepositCalculator 
  },
  { 
    id: 'lti-calculator', 
    name: 'Loan-to-Income (LTI)', 
    category: 'mortgage', 
    description: 'Verify LTI multiples and check lending capabilities.', 
    path: '/mortgage/lti', 
    component: LtiCalculator 
  },
  { 
    id: 'mortgage-repayment', 
    name: 'Repayment Calculator', 
    category: 'mortgage', 
    description: 'Calculate monthly capital & interest payments and amortisation schedules.', 
    path: '/mortgage/repayment', 
    component: MortgageRepaymentCalculator 
  },
  { 
    id: 'interest-only-repayment', 
    name: 'Interest-Only Calculator', 
    category: 'mortgage', 
    description: 'Calculate interest-only mortgage monthly payments.', 
    path: '/mortgage/interest-only', 
    component: InterestOnlyCalculator 
  },
  { 
    id: 'tax-estimator', 
    name: 'UK Tax Estimator', 
    category: 'tax', 
    description: 'Estimate annual income tax, NI, and monthly net take-home pay.', 
    path: '/tax/estimator', 
    component: TaxEstimator 
  },
  { 
    id: 'reverse-tax', 
    name: 'Reverse Tax Calculator', 
    category: 'tax', 
    description: 'Back-calculate Gross Salary from a target Net take-home salary.', 
    path: '/tax/reverse', 
    component: ReverseTaxCalculator 
  },
  { 
    id: 'tax-breakdown', 
    name: 'Tax Breakdown', 
    category: 'tax', 
    description: 'View full tax band details and NI contributions breakdown.', 
    path: '/tax/breakdown', 
    component: TaxBreakdown 
  },
  { 
    id: 'percentage-calculators', 
    name: 'Percentage Tools', 
    category: 'utility', 
    description: 'Calculate percentages, percentage change, and absolute/relative variance.', 
    path: '/utility/percentage', 
    component: PercentageCalculators 
  },
  { 
    id: 'age-calculator', 
    name: 'Age Calculator', 
    category: 'utility', 
    description: 'Calculate exact age in years, months, and days from DOB.', 
    path: '/utility/age', 
    component: AgeCalculator 
  },
  { 
    id: 'mortgage-end-date', 
    name: 'Mortgage End Date', 
    category: 'utility', 
    description: 'Compute mortgage end date and client age at retirement.', 
    path: '/utility/end-date', 
    component: MortgageEndDateCalculator 
  },
  { 
    id: 'date-difference', 
    name: 'Date Difference', 
    category: 'utility', 
    description: 'Calculate exact duration between two calendar dates.', 
    path: '/utility/difference', 
    component: DateDifferenceCalculator 
  }
];

function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Layout calculators={calculators}>
          <Routes>
            {/* Dashboard */}
            <Route path="/" element={<Dashboard calculators={calculators} />} />
            <Route path="/split" element={<SplitView calculators={calculators} />} />
            
            {/* Dynamic calculator routes */}
            {calculators.filter(calc => calc.component).map(calc => {
              const CalculatorComponent = calc.component!;
              return (
                <Route
                  key={calc.id}
                  path={calc.path}
                  element={<CalculatorComponent />}
                />
              );
            })}
          </Routes>
        </Layout>
      </HashRouter>
    </AppProvider>
  );
}

export default App;
