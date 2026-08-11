import React, { useEffect, useMemo, useState } from 'react';
import { Check, Clipboard, Copy, Delete, RotateCcw, X } from 'lucide-react';

interface AdvancedCalculatorProps {
  open: boolean;
  onClose: () => void;
  onUseExpression: (expression: string) => void;
}

interface TapeItem {
  expression: string;
  result: number;
}

const TAPE_STORAGE_KEY = 'shaheers-calc-advanced-tape';

const readSavedTape = (): TapeItem[] => {
  if (typeof window === 'undefined') return [];

  try {
    const savedTape = window.localStorage.getItem(TAPE_STORAGE_KEY);
    if (!savedTape) return [];

    const parsedTape = JSON.parse(savedTape);
    if (!Array.isArray(parsedTape)) return [];

    return parsedTape
      .filter((item): item is TapeItem =>
        item &&
        typeof item.expression === 'string' &&
        typeof item.result === 'number' &&
        Number.isFinite(item.result)
      )
      .slice(0, 8);
  } catch {
    return [];
  }
};

const formatNumber = (value: number) =>
  Number.isInteger(value)
    ? value.toLocaleString('en-GB')
    : value.toLocaleString('en-GB', { maximumFractionDigits: 8 });

const normaliseExpression = (expression: string) =>
  expression
    .replace(/x/g, '*')
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/π/g, `${Math.PI}`)
    .replace(/sqrt\(/g, 'Math.sqrt(')
    .replace(/([0-9.]+)%/g, '($1/100)');

const evaluateExpression = (expression: string): number | null => {
  try {
    const normalised = normaliseExpression(expression);
    const sanitized = normalised.replace(/[^0-9+\-*/().\sMathsqrtPI]/g, '');
    if (!sanitized.trim()) return null;
    // eslint-disable-next-line no-new-func
    const result = new Function(`return (${sanitized})`)();
    return typeof result === 'number' && Number.isFinite(result) ? result : null;
  } catch {
    return null;
  }
};

export const AdvancedCalculator: React.FC<AdvancedCalculatorProps> = ({ open, onClose, onUseExpression }) => {
  const [expression, setExpression] = useState('0');
  const [memory, setMemory] = useState(0);
  const [tape, setTape] = useState<TapeItem[]>(readSavedTape);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => evaluateExpression(expression), [expression]);
  const displayResult = result !== null ? formatNumber(result) : 'Check expression';

  const replaceIfZero = (nextValue: string) => {
    setExpression(current => current === '0' ? nextValue : `${current}${nextValue}`);
  };

  const commitResult = () => {
    if (result === null) return;
    setTape(current => [{ expression, result }, ...current].slice(0, 8));
    setExpression(String(Math.round(result * 100000000) / 100000000));
  };

  const clearAll = () => setExpression('0');
  const backspace = () => setExpression(current => current.length <= 1 ? '0' : current.slice(0, -1));

  const applyUnary = (mode: 'negate' | 'sqrt' | 'square' | 'reciprocal') => {
    if (result === null) return;
    if (mode === 'negate') setExpression(String(result * -1));
    if (mode === 'sqrt') setExpression(`sqrt(${result})`);
    if (mode === 'square') setExpression(`(${result})*(${result})`);
    if (mode === 'reciprocal' && result !== 0) setExpression(`1/(${result})`);
  };

  const applyQuick = (mode: 'vatAdd' | 'vatRemove' | 'monthly' | 'weekly') => {
    if (result === null) return;
    const next = {
      vatAdd: result * 1.2,
      vatRemove: result / 1.2,
      monthly: result * 12,
      weekly: result * 52,
    }[mode];
    setTape(current => [{ expression: `${expression} -> ${mode}`, result: next }, ...current].slice(0, 8));
    setExpression(String(Math.round(next * 100000000) / 100000000));
  };

  const copyResult = () => {
    if (result === null) return;
    navigator.clipboard.writeText(String(result));
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  useEffect(() => {
    window.localStorage.setItem(TAPE_STORAGE_KEY, JSON.stringify(tape));
  }, [tape]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (/^[0-9.+\-*/()]$/.test(event.key)) {
        event.preventDefault();
        replaceIfZero(event.key);
      }
      if (event.key === 'Enter' || event.key === '=') {
        event.preventDefault();
        commitResult();
      }
      if (event.key === 'Backspace') {
        event.preventDefault();
        backspace();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, expression, result, onClose]);

  if (!open) return null;

  const keys = [
    { label: 'C', action: clearAll, tone: 'muted' },
    { label: '(', value: '(' },
    { label: ')', value: ')' },
    { label: 'DEL', action: backspace, tone: 'muted' },
    { label: 'MC', action: () => setMemory(0), tone: 'quiet' },
    { label: 'MR', action: () => setExpression(String(memory)), tone: 'quiet' },
    { label: 'M+', action: () => result !== null && setMemory(memory + result), tone: 'quiet' },
    { label: 'M-', action: () => result !== null && setMemory(memory - result), tone: 'quiet' },
    { label: '7', value: '7' },
    { label: '8', value: '8' },
    { label: '9', value: '9' },
    { label: '÷', value: '/', tone: 'op' },
    { label: '4', value: '4' },
    { label: '5', value: '5' },
    { label: '6', value: '6' },
    { label: '×', value: '*', tone: 'op' },
    { label: '1', value: '1' },
    { label: '2', value: '2' },
    { label: '3', value: '3' },
    { label: '-', value: '-', tone: 'op' },
    { label: '0', value: '0' },
    { label: '.', value: '.' },
    { label: '%', value: '%' },
    { label: '+', value: '+', tone: 'op' },
  ];

  const keyClass = (tone?: string) => {
    if (tone === 'op') return 'bg-accent/10 text-accent hover:bg-accent/20 border-accent/20';
    if (tone === 'muted') return 'bg-muted text-foreground hover:bg-muted/80 border-border';
    if (tone === 'quiet') return 'bg-background text-muted-foreground hover:text-foreground hover:bg-muted/60 border-border';
    return 'bg-card text-foreground hover:bg-muted border-border';
  };

  return (
    <div className="absolute left-1/2 top-full z-40 mt-3 w-[min(92vw,760px)] -translate-x-1/2 rounded-2xl border border-border bg-card shadow-2xl">
      <div className="grid grid-cols-1 gap-0 overflow-hidden rounded-2xl lg:grid-cols-[1fr_230px]">
        <div className="p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-extrabold text-foreground">Advanced Calculator</div>
              <div className="text-[11px] font-medium text-muted-foreground">Keyboard friendly with memory and quick finance actions</div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              title="Close calculator"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="rounded-xl border border-border bg-background p-3">
            <input
              value={expression}
              onChange={(event) => setExpression(event.target.value || '0')}
              className="w-full bg-transparent text-right font-mono text-xl font-bold text-foreground outline-none"
              aria-label="Calculator expression"
            />
            <div className="mt-2 flex items-center justify-between gap-3 border-t border-border pt-2">
              <span className="truncate text-[11px] font-semibold text-muted-foreground">Memory: {formatNumber(memory)}</span>
              <span className={`truncate text-right text-2xl font-extrabold ${result === null ? 'text-red-500' : 'text-primary'}`}>
                {displayResult}
              </span>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-4 gap-2">
            {keys.map((key) => (
              <button
                key={key.label}
                type="button"
                onClick={key.action || (() => replaceIfZero(key.value || ''))}
                className={`h-11 rounded-xl border text-sm font-extrabold transition-colors ${keyClass(key.tone)}`}
              >
                {key.label}
              </button>
            ))}
            <button type="button" onClick={() => applyUnary('negate')} className="h-11 rounded-xl border border-border bg-background text-sm font-extrabold text-foreground hover:bg-muted">+/-</button>
            <button type="button" onClick={() => applyUnary('sqrt')} className="h-11 rounded-xl border border-border bg-background text-sm font-extrabold text-foreground hover:bg-muted">sqrt</button>
            <button type="button" onClick={() => applyUnary('square')} className="h-11 rounded-xl border border-border bg-background text-sm font-extrabold text-foreground hover:bg-muted">x^2</button>
            <button type="button" onClick={() => applyUnary('reciprocal')} className="h-11 rounded-xl border border-border bg-background text-sm font-extrabold text-foreground hover:bg-muted">1/x</button>
            <button type="button" onClick={() => applyQuick('monthly')} className="h-11 rounded-xl border border-border bg-background text-xs font-extrabold text-foreground hover:bg-muted">x12</button>
            <button type="button" onClick={() => applyQuick('weekly')} className="h-11 rounded-xl border border-border bg-background text-xs font-extrabold text-foreground hover:bg-muted">x52</button>
            <button type="button" onClick={() => applyQuick('vatAdd')} className="h-11 rounded-xl border border-border bg-background text-xs font-extrabold text-foreground hover:bg-muted">+VAT</button>
            <button type="button" onClick={() => applyQuick('vatRemove')} className="h-11 rounded-xl border border-border bg-background text-xs font-extrabold text-foreground hover:bg-muted">-VAT</button>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <button type="button" onClick={commitResult} className="h-11 rounded-xl bg-primary text-sm font-extrabold text-primary-foreground hover:opacity-90">=</button>
            <button type="button" onClick={copyResult} className="flex h-11 items-center justify-center gap-1.5 rounded-xl border border-border bg-card text-xs font-extrabold text-foreground hover:bg-muted">
              {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button type="button" onClick={() => onUseExpression(result !== null ? String(result) : expression)} className="flex h-11 items-center justify-center gap-1.5 rounded-xl border border-accent/30 bg-accent/10 text-xs font-extrabold text-accent hover:bg-accent/20">
              <Clipboard className="h-4 w-4" /> Use
            </button>
          </div>
        </div>

        <aside className="border-t border-border bg-background/70 p-4 lg:border-l lg:border-t-0">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tape</span>
            <button
              type="button"
              onClick={() => setTape([])}
              className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              title="Clear tape"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
            {tape.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                Press = to keep calculations here.
              </div>
            ) : (
              tape.map((item, index) => (
                <button
                  key={`${item.expression}-${index}`}
                  type="button"
                  onClick={() => setExpression(String(item.result))}
                  className="block w-full rounded-xl border border-border bg-card p-3 text-left hover:bg-muted"
                >
                  <div className="truncate text-[11px] font-medium text-muted-foreground">{item.expression}</div>
                  <div className="truncate font-mono text-sm font-extrabold text-foreground">{formatNumber(item.result)}</div>
                </button>
              ))
            )}
          </div>
          <button
            type="button"
            onClick={backspace}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs font-extrabold text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Delete className="h-4 w-4" /> Backspace
          </button>
        </aside>
      </div>
    </div>
  );
};
