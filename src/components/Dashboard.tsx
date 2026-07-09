import React from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/mathHelpers';
import { Star, History, Trash2, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardProps {
  calculators: Array<{
    id: string;
    name: string;
    category: string;
    description: string;
    path: string;
  }>;
}

export const Dashboard: React.FC<DashboardProps> = ({ calculators }) => {
  const { favorites, history, clearHistory, deleteHistoryItem, lender } = useApp();

  const favoriteCalcs = calculators.filter(c => favorites.includes(c.id));
  
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'salary': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'mortgage': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'tax': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border p-5 rounded-xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-amber-500/10 rounded-lg text-amber-500">
            <Star className="w-5 h-5 fill-amber-500/20" />
          </div>
          <div>
            <span className="block text-xs font-medium text-muted-foreground">Favorite Tools</span>
            <span className="text-xl font-bold text-foreground">{favorites.length}</span>
          </div>
        </div>

        <div className="bg-card border border-border p-5 rounded-xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-accent/10 rounded-lg text-accent">
            <History className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-xs font-medium text-muted-foreground">Calculations Run</span>
            <span className="text-xl font-bold text-foreground">{history.length}</span>
          </div>
        </div>

        <div className="bg-card border border-border p-5 rounded-xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500 font-bold text-sm tracking-wider uppercase shrink-0">
            {lender.toUpperCase()}
          </div>
          <div>
            <span className="block text-xs font-medium text-muted-foreground">Current Preset</span>
            <span className="text-sm font-semibold text-foreground truncate block max-w-[150px] md:max-w-none">
              {lender === 'generic' ? 'Generic Slate' : lender.charAt(0).toUpperCase() + lender.slice(1)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Favorites Section */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-1.5">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500/20" />
            Favorite Calculators
          </h2>

          {favoriteCalcs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {favoriteCalcs.map(calc => (
                <Link
                  key={calc.id}
                  to={calc.path}
                  className="group bg-card border border-border hover:border-accent p-4 rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border mb-2.5 ${getCategoryColor(calc.category)}`}>
                      {calc.category}
                    </span>
                    <h3 className="font-bold text-sm text-foreground group-hover:text-accent transition-colors">
                      {calc.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {calc.description}
                    </p>
                  </div>
                  <div className="flex items-center text-xs font-semibold text-accent mt-3 self-end gap-0.5">
                    Launch <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-card border border-border p-8 rounded-xl text-center space-y-3">
              <Star className="w-10 h-10 text-muted-foreground mx-auto opacity-40 stroke-1" />
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Pin your most used calculators to your favorites dashboard for instant access.
              </p>
              <div className="text-xs font-semibold text-accent">
                Click the star icon inside any calculator.
              </div>
            </div>
          )}
        </div>

        {/* History Section */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-1.5">
              <History className="w-5 h-5 text-accent" />
              Recent Calculations
            </h2>
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="text-xs font-semibold text-red-500 hover:text-red-600 hover:underline focus:outline-none flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear All
              </button>
            )}
          </div>

          {history.length > 0 ? (
            <div className="bg-card border border-border rounded-xl shadow-sm divide-y divide-border overflow-hidden max-h-[360px] overflow-y-auto">
              {history.map((item) => (
                <div key={item.id} className="p-3.5 flex items-start justify-between gap-3 hover:bg-muted/10 transition-colors">
                  <div className="space-y-1">
                    <span className="block text-xs font-bold text-foreground">
                      {item.title}
                    </span>
                    <span className="block text-xxs text-muted-foreground">
                      {new Date(item.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} • {new Date(item.timestamp).toLocaleDateString('en-GB')}
                    </span>
                    {/* Quick values summary */}
                    <div className="flex flex-wrap gap-x-2 text-[10px] text-muted-foreground mt-1">
                      {Object.entries(item.inputs).slice(0, 2).map(([k, v]) => (
                        <span key={k} className="bg-muted px-1.5 py-0.5 rounded font-mono">
                          {k}: {typeof v === 'number' && v > 1000 ? formatCurrency(v, 0) : String(v)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => item.id !== undefined && deleteHistoryItem(item.id)}
                    className="p-1 rounded text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors"
                    title="Delete entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-card border border-border p-8 rounded-xl text-center space-y-3">
              <History className="w-10 h-10 text-muted-foreground mx-auto opacity-40 stroke-1" />
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                No calculations run yet in this session. Run some math in the calculators to populate your history.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
