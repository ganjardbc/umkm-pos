// Reason codes for cash entries (optional; free-text reason stays required).
export const CASH_IN_REASON_CODES = [
  'modal_tambahan',
  'kembalian',
  'lainnya',
] as const;
export const CASH_OUT_REASON_CODES = [
  'beli_bahan',
  'operasional',
  'setoran_pemilik',
  'lainnya',
] as const;
export const CASH_REASON_CODES = [
  ...new Set([...CASH_IN_REASON_CODES, ...CASH_OUT_REASON_CODES]),
];

// Refund entries are written by the transactions flow; they never count toward the daily limit.
export const REFUND_REASON_PREFIX = 'Refund #';
