// Decimal may arrive as string or number; null/undefined (old or open shift) shows "-".
// Written in full, never rounded: Rp1.377.000 (cents only when present).
export const formatCash = (value: unknown) => {
  if (value === null || value === undefined || value === '' || Number.isNaN(Number(value))) return '-';
  const n = Number(value);
  return `${n < 0 ? '-' : ''}Rp${Math.abs(n).toLocaleString('id-ID', { maximumFractionDigits: 2 })}`;
};

// 0 = pas, up to Rp5.000 = kecil, above = besar. A UI hint only. null when unknown (shift still open).
export const differenceSeverity = (value: unknown): 'success' | 'warn' | 'danger' | null => {
  if (value === null || value === undefined || value === '' || Number.isNaN(Number(value))) return null;
  const diff = Math.abs(Number(value));
  if (diff === 0) return 'success';
  return diff <= 5000 ? 'warn' : 'danger';
};
