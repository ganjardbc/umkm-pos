const STATUS_LABELS: Record<string, string> = {
  active: 'Aktif',
  ordered: 'Ada Pesanan',
  closed: 'Ditutup',
  expired: 'Kedaluwarsa',
  menunggu_konfirmasi: 'Menunggu Konfirmasi',
  diterima: 'Diterima',
  diproses: 'Diproses',
  sampai: 'Sampai',
  selesai: 'Selesai',
};

export const getCustomerCatalogStatusLabel = (status?: string | null) => {
  if (!status) return '-';
  return STATUS_LABELS[status] || status.replace(/_/g, ' ');
};
