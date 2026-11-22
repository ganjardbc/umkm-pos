import { getCurrency } from '@umkm-pos/ui/helpers/utils';

// Decimal may arrive as string or number; null/undefined (old or open shift) shows "-".
export const formatCash = (value: unknown) =>
  value === null || value === undefined || value === '' || Number.isNaN(Number(value))
    ? '-'
    : getCurrency(Number(value));
