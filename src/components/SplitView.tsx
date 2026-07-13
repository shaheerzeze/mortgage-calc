import React from 'react';
import { Columns2, Columns3 } from 'lucide-react';
import { usePersistentState } from '../hooks/usePersistentState';

interface SplitCalculator {
  id: string;
  name: string;
  category: string;
  description: string;
  path: string;
  component?: React.ComponentType;
}

interface SplitViewProps {
  calculators: SplitCalculator[];
}

export const SplitView: React.FC<SplitViewProps> = ({ calculators }) => {
  const availableCalculators = calculators.filter(calc => calc.id !== 'split-view' && calc.component);
  const [paneCount, setPaneCount] = usePersistentState<number>('split-view:paneCount', 2);
  const [selectedIds, setSelectedIds] = usePersistentState<string[]>('split-view:selectedIds', [
    'salary-annualiser',
    'ltv-calculator',
    'tax-estimator',
  ]);

  const visiblePaneCount = paneCount === 3 ? 3 : 2;
  const visibleSelections = Array.from({ length: visiblePaneCount }, (_, index) =>
    selectedIds[index] || availableCalculators[index]?.id || availableCalculators[0]?.id || ''
  );

  const updateSelection = (index: number, value: string) => {
    const nextSelections = [...selectedIds];
    nextSelections[index] = value;
    setSelectedIds(nextSelections);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col gap-3 border-b border-border pb-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Split View</h2>
          <p className="text-xs text-muted-foreground">Run two or three calculators side by side.</p>
        </div>
        <div className="inline-flex w-fit rounded-lg border border-border bg-card p-1">
          <button
            type="button"
            onClick={() => setPaneCount(2)}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              visiblePaneCount === 2 ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Columns2 className="h-3.5 w-3.5" /> 2 Split
          </button>
          <button
            type="button"
            onClick={() => setPaneCount(3)}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              visiblePaneCount === 3 ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Columns3 className="h-3.5 w-3.5" /> 3 Split
          </button>
        </div>
      </div>

      <div className={`grid grid-cols-1 gap-4 ${visiblePaneCount === 3 ? '2xl:grid-cols-3' : 'xl:grid-cols-2'}`}>
        {visibleSelections.map((selectedId, index) => {
          const selectedCalculator = availableCalculators.find(calc => calc.id === selectedId) || availableCalculators[0];
          const SelectedComponent = selectedCalculator?.component;

          return (
            <section key={index} className="min-w-0 space-y-3">
              <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-2">
                <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Pane {index + 1}
                </span>
                <select
                  value={selectedCalculator?.id || ''}
                  onChange={(event) => updateSelection(index, event.target.value)}
                  className="min-w-0 flex-1 rounded-md border border-border bg-background px-2 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
                >
                  {availableCalculators.map(calc => (
                    <option key={calc.id} value={calc.id}>
                      {calc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="split-pane min-w-0">
                {SelectedComponent && <SelectedComponent />}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};
