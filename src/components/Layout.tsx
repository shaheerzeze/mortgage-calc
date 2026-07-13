import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { parseExpression } from '../utils/mathHelpers';
import { 
  ArrowLeftRight,
  BadgePoundSterling,
  Banknote,
  Calculator,
  CalendarDays,
  CalendarRange,
  ChartNoAxesCombined,
  ChartPie,
  Columns2,
  House,
  Landmark,
  ListPlus,
  Percent,
  PiggyBank,
  ReceiptText,
  Scale,
  Search,
  Moon,
  Sun,
  Sidebar as SidebarIcon,
  Star,
  Copy,
  Wallet
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  calculators: Array<{
    id: string;
    name: string;
    category: string;
    description: string;
    path: string;
  }>;
}

export const Layout: React.FC<LayoutProps> = ({ children, calculators }) => {
  const { theme, toggleTheme, favorites } = useApp();
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [formulaInput, setFormulaInput] = useState('');
  const [formulaResult, setFormulaResult] = useState<number | null>(null);
  const [formulaCopied, setFormulaCopied] = useState(false);
  const [showFormulaDropdown, setShowFormulaDropdown] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const formulaInputRef = useRef<HTMLInputElement>(null);

  // Group calculators by category
  const categories = [
    { key: 'salary', name: 'Salary Tools' },
    { key: 'mortgage', name: 'Mortgage Tools' },
    { key: 'tax', name: 'Tax Tools' },
    { key: 'utility', name: 'Utility Tools' }
  ];

  const navVisuals: Record<string, { icon: React.ComponentType<{ className?: string }>; short: string }> = {
    'salary-annualiser': { icon: Banknote, short: 'Annual' },
    'average-salary': { icon: ChartNoAxesCombined, short: 'Average' },
    'custom-salary': { icon: ListPlus, short: 'Custom' },
    'income-builder': { icon: Wallet, short: 'Income' },
    'ltv-calculator': { icon: Percent, short: 'LTV' },
    'deposit-calculator': { icon: PiggyBank, short: 'Deposit' },
    'lti-calculator': { icon: Scale, short: 'LTI' },
    'mortgage-repayment': { icon: House, short: 'Repay' },
    'interest-only-repayment': { icon: Landmark, short: 'Interest' },
    'tax-estimator': { icon: BadgePoundSterling, short: 'Tax' },
    'reverse-tax': { icon: ArrowLeftRight, short: 'Reverse' },
    'tax-breakdown': { icon: ReceiptText, short: 'Bands' },
    'percentage-calculators': { icon: ChartPie, short: 'Percent' },
    'age-calculator': { icon: CalendarDays, short: 'Age' },
    'mortgage-end-date': { icon: CalendarRange, short: 'End' },
    'date-difference': { icon: CalendarDays, short: 'Dates' },
    'split-view': { icon: Columns2, short: 'Split' },
  };

  // Filter calculators by search query
  const filteredCalculators = calculators.filter(calc => {
    const query = searchQuery.toLowerCase();
    return (
      calc.name.toLowerCase().includes(query) ||
      calc.category.toLowerCase().includes(query) ||
      calc.description.toLowerCase().includes(query)
    );
  });

  // Hotkeys listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // '/' to search
      if (e.key === '/' && document.activeElement !== searchInputRef.current && document.activeElement !== formulaInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // 'Esc' to clear search or inputs
      if (e.key === 'Escape') {
        setSearchQuery('');
        setFormulaInput('');
        setShowFormulaDropdown(false);
        searchInputRef.current?.blur();
        formulaInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute math expression
  useEffect(() => {
    const res = parseExpression(formulaInput);
    setFormulaResult(res);
    if (res !== null) {
      setShowFormulaDropdown(true);
    } else {
      setShowFormulaDropdown(false);
    }
  }, [formulaInput]);

  const handleCopyFormulaResult = () => {
    if (formulaResult !== null) {
      navigator.clipboard.writeText(formulaResult.toString());
      setFormulaCopied(true);
      setTimeout(() => setFormulaCopied(false), 1500);
    }
  };

  return (
    <div className="min-h-screen flex text-foreground transition-colors duration-200">
      {/* Sidebar Navigation */}
      <aside 
        className={`${
          sidebarOpen ? 'w-64' : 'w-0 -translate-x-full md:w-16 md:translate-x-0'
        } bg-card border-r border-border flex flex-col transition-all duration-300 overflow-hidden shrink-0 z-20`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg select-none">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-mono">
              M
            </div>
            {sidebarOpen && <span className="tracking-tight">Mortgage Hub</span>}
          </Link>
          {sidebarOpen && (
            <button 
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded hover:bg-muted md:hidden text-muted-foreground"
            >
              <SidebarIcon className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search Bar inside Sidebar */}
        {sidebarOpen && (
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search calculators... ('/')"
                className="w-full pl-8 pr-7 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-2 text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground hover:text-foreground"
                >
                  esc
                </button>
              )}
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-4">
          {categories.map(cat => {
            const catCalcs = filteredCalculators.filter(c => c.category === cat.key);
            if (catCalcs.length === 0) return null;

            return (
              <div key={cat.key} className="space-y-1">
                {sidebarOpen ? (
                  <span className="block text-xxs font-bold text-muted-foreground uppercase tracking-widest px-2 mb-1">
                    {cat.name}
                  </span>
                ) : (
                  <div className="h-[1px] bg-border my-3" />
                )}
                
                {catCalcs.map(calc => {
                  const isActive = location.pathname === calc.path;
                  const isFav = favorites.includes(calc.id);
                  const navVisual = navVisuals[calc.id] || { icon: Calculator, short: calc.name.split(' ')[0] };
                  const NavIcon = navVisual.icon;

                  return (
                    <Link
                      key={calc.id}
                      to={calc.path}
                      className={`${sidebarOpen ? 'flex items-center justify-between px-2.5 py-2' : 'flex flex-col items-center justify-center gap-1 px-1 py-2.5 min-h-14'} rounded-lg text-xs font-semibold transition-all ${
                        isActive 
                          ? 'bg-primary text-primary-foreground shadow-sm' 
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                      title={calc.name}
                    >
                      <div className={`${sidebarOpen ? 'flex items-center gap-2 truncate' : 'flex flex-col items-center justify-center gap-1 min-w-0'}`}>
                        <NavIcon className={`${sidebarOpen ? 'w-3.5 h-3.5' : 'w-4.5 h-4.5'} shrink-0`} />
                        {sidebarOpen ? (
                          <span className="truncate">{calc.name}</span>
                        ) : (
                          <span className="max-w-full truncate text-[9px] leading-none font-bold tracking-normal">
                            {navVisual.short}
                          </span>
                        )}
                      </div>
                      {sidebarOpen && isFav && (
                        <Star className={`w-3 h-3 ${isActive ? 'text-primary-foreground fill-primary-foreground' : 'text-amber-500 fill-amber-500'}`} />
                      )}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-20 border-b border-border bg-card grid grid-cols-[minmax(180px,1fr)_minmax(280px,560px)_minmax(48px,1fr)] items-center px-4 gap-4 sticky top-0 z-10">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
              title="Toggle Sidebar"
            >
              <SidebarIcon className="w-5 h-5" />
            </button>
            <Link to="/" className="min-w-0">
              <span className="block truncate text-base font-extrabold tracking-tight text-foreground">
                Shaheers calc
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                i was bored so i made it
              </span>
            </Link>
          </div>

          {/* Quick Formula Bar */}
          <div className="relative hidden md:block">
            <div className="relative">
              <input
                ref={formulaInputRef}
                type="text"
                value={formulaInput}
                onChange={(e) => setFormulaInput(e.target.value)}
                placeholder="Quick Formula (e.g. 1200 * 12)"
                className="w-full pl-4 pr-10 py-2.5 bg-background border border-border rounded-xl text-sm font-medium text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
              />
              <span className="absolute right-3 top-2.5 text-sm text-muted-foreground font-semibold font-mono">
                =
              </span>
            </div>

            {/* Formula parser dropdown */}
            {showFormulaDropdown && formulaResult !== null && (
              <div className="absolute left-0 right-0 mt-2 bg-card border border-border shadow-lg rounded-xl p-3 z-30 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xxs font-bold text-muted-foreground uppercase tracking-wider">Formula Result</span>
                  <button
                    onClick={handleCopyFormulaResult}
                    className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="text-xl font-mono font-bold text-accent mt-1 break-all">
                  {formulaResult}
                </div>
                <div className="text-xxs text-muted-foreground mt-2 flex items-center justify-between border-t border-border pt-2">
                  <span>Press Esc to close</span>
                  {formulaCopied && <span className="text-emerald-500 font-semibold">Copied!</span>}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className={`relative flex-1 overflow-y-auto p-4 md:p-8 bg-background ${
          isHomePage ? 'isolate' : 'max-w-6xl w-full mx-auto'
        }`}>
          {isHomePage && (
            <div
              className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-[0.08]"
              style={{ backgroundImage: `url(${import.meta.env.BASE_URL}shaheer-banner.png)` }}
              aria-hidden="true"
            />
          )}
          <div className={isHomePage ? 'relative z-10 max-w-6xl w-full mx-auto' : undefined}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
