/**
 * Format helper for currency values
 */
export const formatCurrency = (value: number | string, decimals = 2): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '£0.00';
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

/**
 * Parses simple math expressions safely
 */
export const parseExpression = (expr: string): number | null => {
  try {
    // Sanitize input: allow only digits, operators (+, -, *, /, .), parentheses, and spaces
    const sanitized = expr.replace(/[^0-9+\-*/().\s]/g, '');
    if (!sanitized.trim()) return null;
    
    // Evaluate safely using Function constructor (safe since we sanitized everything except math chars)
    // eslint-disable-next-line no-new-func
    const result = new Function(`return (${sanitized})`)();
    return typeof result === 'number' && !isNaN(result) && isFinite(result) ? result : null;
  } catch (e) {
    return null;
  }
};

export interface UKTaxDetails {
  gross: number;
  personalAllowance: number;
  taxableIncome: number;
  basicRateTax: number;
  higherRateTax: number;
  additionalRateTax: number;
  totalIncomeTax: number;
  niPrimaryThreshold: number;
  niUpperLimit: number;
  niBasicRate: number;
  niHigherRate: number;
  totalNI: number;
  netAnnual: number;
  netMonthly: number;
}

/**
 * Calculates UK Income Tax and National Insurance for tax year 2026/2027
 */
export const calculateUKTax = (gross: number): UKTaxDetails => {
  // 1. Personal Allowance (PA) Tapering
  // Base PA is £12,570. Reduced by £1 for every £2 of income over £100,000
  let personalAllowance = 12570;
  if (gross > 100000) {
    const excess = gross - 100000;
    personalAllowance = Math.max(0, 12570 - Math.floor(excess / 2));
  }

  const taxableIncome = Math.max(0, gross - personalAllowance);

  // 2. Income Tax Bands (taxable income thresholds)
  // Basic rate: 20% on first £37,700 of taxable income
  // Higher rate: 40% on next £74,870 (up to £112,570 taxable)
  // Additional rate: 45% on everything above £112,570
  let basicRateTax = 0;
  let higherRateTax = 0;
  let additionalRateTax = 0;

  if (taxableIncome > 0) {
    const basicBand = Math.min(taxableIncome, 37700);
    basicRateTax = basicBand * 0.20;

    if (taxableIncome > 37700) {
      const higherBand = Math.min(taxableIncome - 37700, 74870);
      higherRateTax = higherBand * 0.40;

      if (taxableIncome > 112570) {
        const additionalBand = taxableIncome - 112570;
        additionalRateTax = additionalBand * 0.45;
      }
    }
  }

  const totalIncomeTax = basicRateTax + higherRateTax + additionalRateTax;

  // 3. National Insurance (Class 1 Primary) - 8% basic, 2% higher
  // Primary Threshold (PT): £12,570 per year
  // Upper Earnings Limit (UEL): £50,270 per year
  let niBasicRate = 0;
  let niHigherRate = 0;

  if (gross > 12570) {
    const niBasicBand = Math.min(gross - 12570, 50270 - 12570);
    niBasicRate = niBasicBand * 0.08;

    if (gross > 50270) {
      const niHigherBand = gross - 50270;
      niHigherRate = niHigherBand * 0.02;
    }
  }

  const totalNI = niBasicRate + niHigherRate;
  const netAnnual = Math.max(0, gross - totalIncomeTax - totalNI);
  const netMonthly = netAnnual / 12;

  return {
    gross,
    personalAllowance,
    taxableIncome,
    basicRateTax,
    higherRateTax,
    additionalRateTax,
    totalIncomeTax,
    niPrimaryThreshold: 12570,
    niUpperLimit: 50270,
    niBasicRate,
    niHigherRate,
    totalNI,
    netAnnual,
    netMonthly
  };
};

/**
 * Helper to solve Gross from Net salary using numerical search (bisection method)
 * Since tax curves are monotonically increasing, this is extremely fast and 100% accurate.
 */
export const calculateGrossFromNet = (targetNet: number): number => {
  if (targetNet <= 0) return 0;
  
  let low = targetNet;
  let high = targetNet * 3; // Estimate high bound
  
  // Double high bound if needed
  while (calculateUKTax(high).netAnnual < targetNet) {
    high *= 2;
  }
  
  // Binary search
  for (let i = 0; i < 50; i++) {
    const mid = (low + high) / 2;
    const computedNet = calculateUKTax(mid).netAnnual;
    
    if (Math.abs(computedNet - targetNet) < 0.01) {
      return Math.round(mid * 100) / 100;
    }
    
    if (computedNet < targetNet) {
      low = mid;
    } else {
      high = mid;
    }
  }
  
  return Math.round(low * 100) / 100;
};
