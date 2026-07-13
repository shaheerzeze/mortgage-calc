import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyableResultProps {
  value: string | number;
  className?: string;
  copyText?: string;
  title?: string;
}

export const CopyableResult: React.FC<CopyableResultProps> = ({
  value,
  className = '',
  copyText,
  title = 'Copy number',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(copyText ?? String(value));
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <span className="inline-flex max-w-full items-center gap-1.5 align-baseline">
      <span className={className}>{value}</span>
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-border bg-background/70 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        title={copied ? 'Copied' : title}
        aria-label={copied ? 'Copied' : title}
      >
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </span>
  );
};
