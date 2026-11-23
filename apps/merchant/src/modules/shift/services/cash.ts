// Decimal may arrive as string or number; null/undefined (old or open shift) shows "-".
// Written in full, never rounded: Rp1.377.000 (cents only when present).
export const formatCash = (value: unknown) => {
  if (value === null || value === undefined || value === '' || Number.isNaN(Number(value))) return '-';
  const n = Number(value);
  return `${n < 0 ? '-' : ''}Rp${Math.abs(n).toLocaleString('id-ID', { maximumFractionDigits: 2 })}`;
};
