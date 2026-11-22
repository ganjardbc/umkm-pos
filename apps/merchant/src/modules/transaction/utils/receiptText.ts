import type { ReceiptData } from './receiptGenerator';

const rupiah = (amount: string | number): string =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(Number(amount));

const paymentLabels: Record<string, string> = {
  cash: 'Tunai',
  debit: 'Kartu Debit',
  'e-wallet': 'E-Wallet',
  qris: 'QRIS',
};

// Plain-text receipt for chat apps. `*bold*` is WhatsApp markup.
export const buildReceiptText = (t: ReceiptData): string => {
  const lines: string[] = [];
  if (t.outlets?.name) lines.push(`*${t.outlets.name}*`);
  if (t.outlets?.location) lines.push(t.outlets.location);
  lines.push(
    new Date(t.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
    `No: ${String(t.id).slice(0, 8).toUpperCase()}`,
    '------------------------',
  );

  for (const item of t.transaction_items ?? []) {
    lines.push(`${item.qty}x ${item.product_name_snapshot}`);
    lines.push(`   ${rupiah(item.price_snapshot)} = ${rupiah(item.subtotal)}`);
  }
  lines.push('------------------------');

  if (Number(t.discount_amount) > 0) {
    lines.push(`Subtotal: ${rupiah(Number(t.total_amount) + Number(t.discount_amount))}`);
    const pct = t.discount_type === 'percent' ? ` (${Number(t.discount_value)}%)` : '';
    lines.push(`Diskon${pct}: -${rupiah(t.discount_amount as number)}`);
  }
  lines.push(`*Total: ${rupiah(t.total_amount)}*`);
  lines.push(`Bayar: ${paymentLabels[t.payment_method] ?? t.payment_method}`);
  if (t.payment_method === 'cash' && t.cash_received != null) {
    lines.push(`Tunai diterima: ${rupiah(t.cash_received)}`);
    if (t.change_amount != null) lines.push(`Kembalian: ${rupiah(t.change_amount)}`);
  }
  lines.push('', 'Terima kasih sudah berbelanja!');
  return lines.join('\n');
};

// Indonesian numbers only: 08xx / 8xx / +62 8xx -> 628xx. Returns null if it doesn't look valid.
export const toWhatsAppNumber = (raw: string): string | null => {
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('0')) digits = `62${digits.slice(1)}`;
  else if (digits.startsWith('8')) digits = `62${digits}`;
  return /^62\d{8,13}$/.test(digits) ? digits : null;
};

// Without a number WhatsApp opens its contact picker with the text prefilled.
export const buildWhatsAppUrl = (phone: string | null, text: string): string =>
  `https://wa.me/${phone ?? ''}?text=${encodeURIComponent(text)}`;
