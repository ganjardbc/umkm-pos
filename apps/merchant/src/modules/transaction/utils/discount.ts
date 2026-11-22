export type DiscountType = 'amount' | 'percent';

// Mirrors the API's computeDiscount; the API stays the source of truth.
export const calcDiscountAmount = (
  subtotal: number,
  type: DiscountType | '' | null | undefined,
  value: number | null | undefined,
): number => {
  if (!type || !value || value <= 0) return 0;
  const raw = type === 'percent' ? (subtotal * Math.min(value, 100)) / 100 : value;
  return Math.min(Number(raw.toFixed(2)), subtotal);
};
