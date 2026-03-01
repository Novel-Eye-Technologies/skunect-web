const ngnFormatter = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Format an amount as Nigerian Naira.
 * e.g. 1500000 → "₦1,500,000.00"
 */
export function formatCurrency(amount: number): string {
  return ngnFormatter.format(amount);
}

/**
 * Format an amount as shortened Naira for display.
 * e.g. 1500000 → "₦1.5M", 250000 → "₦250K", 800 → "₦800"
 */
export function formatCurrencyShort(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (abs >= 1_000_000_000) {
    return `${sign}₦${(abs / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B`;
  }
  if (abs >= 1_000_000) {
    return `${sign}₦${(abs / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (abs >= 1_000) {
    return `${sign}₦${(abs / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return `${sign}₦${abs.toLocaleString('en-NG')}`;
}
