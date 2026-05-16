export default {
  nav: {
    fitur: 'Fitur',
    harga: 'Harga',
    testimoni: 'Testimoni',
  },
  hero: {
    tagline: 'The simple point of sale for UMKM.',
    deskripsi: 'Solusi POS digital all-in-one untuk UMKM Indonesia. Kelola penjualan, stok, laporan keuangan, dan karyawan dalam satu platform yang mudah digunakan.',
    masuk: 'Masuk',
    daftar: 'Daftar',
    stats: {
      pengguna: 'Pengguna Aktif',
      transaksi: 'Transaksi',
      outlet: 'Outlet',
      tahun: 'Pengalaman',
    },
    kepercayaan: 'Dipercaya ribuan UMKM di seluruh Indonesia',
  },
  features: {
    title: 'Fitur Unggulan',
    subtitle: 'Semua yang Anda butuhkan untuk mengelola bisnis UMKM Anda.',
    items: [
      { title: 'Manajemen Stok', description: 'Pantau stok barang secara real-time dengan notifikasi stok minimum.' },
      { title: 'Laporan Penjualan', description: 'Analisis penjualan harian, bulanan, dan tahunan dengan grafik interaktif.' },
      { title: 'Multi-Outlet', description: 'Kelola beberapa outlet dari satu akun dengan data terpusat.' },
      { title: 'Manajemen Produk', description: 'Atur kategori, varian, dan harga produk dengan mudah.' },
      { title: 'Manajemen Karyawan', description: 'Kelola shift, peran, dan akses karyawan Anda.' },
      { title: 'POS Kasir', description: 'Antarmuka kasir yang cepat dan intuitif untuk transaksi harian.' },
    ],
  },
  pricing: {
    title: 'Pilihan Harga',
    subtitle: 'Pilih paket yang sesuai dengan kebutuhan bisnis Anda.',
    plans: [
      {
        name: 'Gratis',
        price: 'Rp 0',
        period: '/bulan',
        features: ['Hingga 50 transaksi/bulan', '1 outlet', 'Laporan dasar', 'Dukungan email'],
        cta: 'Mulai Gratis',
        featured: false,
      },
      {
        name: 'Bisnis',
        price: 'Rp 99.000',
        period: '/bulan',
        features: ['Transaksi tak terbatas', 'Hingga 3 outlet', 'Laporan lengkap', 'Dukungan prioritas', 'Ekspor data'],
        cta: 'Mulai Trial',
        featured: true,
      },
      {
        name: 'Enterprise',
        price: 'Rp 299.000',
        period: '/bulan',
        features: ['Transaksi tak terbatas', 'Outlet tak terbatas', 'Laporan kustom', 'Dukungan 24/7', 'API akses', 'Dedicated account'],
        cta: 'Hubungi Kami',
        featured: false,
      },
    ],
  },
  testimonials: {
    title: 'Apa Kata Pelanggan',
    subtitle: 'Bergabung dengan ribuan UMKM yang sudah menggunakan UMKM POS.',
    items: [
      { quote: 'UMKM POS membantu saya mengelola stok dan laporan dengan sangat mudah. Bisnis saya jadi lebih teratur!', name: 'Siti Rahmawati', role: 'Pemilik Toko Sembako' },
      { quote: 'Dulu saya pusing ngurusin laporan keuangan. Sekarang tinggal lihat dashboard, beres!', name: 'Budi Santoso', role: 'Pemilik Warung Makan' },
      { quote: 'Fitur multi-outlet-nya luar biasa. Saya bisa pantau semua toko dari satu tempat.', name: 'Dewi Lestari', role: 'Pemilik Fashion Store' },
    ],
  },
  footer: {
    hakCipta: 'UMKM POS. Semua hak dilindungi.',
  },
}
