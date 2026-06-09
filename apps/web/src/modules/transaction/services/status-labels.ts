const ORDER_STATUS_LABELS: Record<string, string> = {
  menunggu_konfirmasi: 'Menunggu Konfirmasi',
  diterima: 'Diterima',
  diproses: 'Diproses',
  sampai: 'Sampai',
  selesai: 'Selesai',
};

export const getOrderStatusLabel = (status?: string | null) => {
  if (!status) return '-';
  return ORDER_STATUS_LABELS[status] || status;
};
