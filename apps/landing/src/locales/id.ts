export default {
  nav: {
    fitur: 'Fitur',
    harga: 'Harga',
    caraKerja: 'Cara Kerja',
    register: 'Register',
  },
  hero: {
    tagline: 'The simple point of sale for UMKM.',
    deskripsi: 'Solusi POS digital all-in-one untuk UMKM Indonesia. Kelola penjualan, stok, laporan keuangan, dan karyawan dalam satu platform yang mudah digunakan.',
    masuk: 'Masuk',
    daftar: 'Daftar',
    cocokUntuk: 'Cocok untuk',
    segments: ['Kafe & Resto', 'Toko Oleh-oleh', 'Agrowisata', 'Toko Retail'],
    kepercayaan: 'Mulai gratis, tanpa kartu kredit',
  },
  features: {
    title: 'Fitur Unggulan',
    subtitle: 'Semua yang Anda butuhkan untuk mengelola bisnis UMKM Anda.',
    items: [
      { title: 'POS Kasir', description: 'Antarmuka kasir yang cepat dan intuitif untuk transaksi harian.' },
      { title: 'Manajemen Stok', description: 'Stok per outlet tercatat otomatis setiap transaksi, lengkap dengan riwayat penyesuaian.' },
      { title: 'Laporan & Export', description: 'Dashboard penjualan harian, produk terlaris, dan perbandingan outlet. Export ke file kapan saja.' },
      { title: 'Multi-Outlet', description: 'Kelola beberapa outlet dari satu akun merchant dengan data terpusat.' },
      { title: 'Shift Kasir', description: 'Buka-tutup shift dengan kas awal & akhir, serah terima, dan audit log.' },
      { title: 'Karyawan & Hak Akses', description: 'Atur peran dan izin karyawan per outlet — kasir di satu outlet, owner di outlet lain.' },
      { title: 'Self-Order Pelanggan', description: 'Pelanggan pesan sendiri dari menu digital, pesanan langsung masuk ke kasir.' },
      { title: 'Manajemen Meja', description: 'Atur meja outlet dan hubungkan pesanan ke meja untuk usaha kafe & resto.' },
      { title: 'Notifikasi', description: 'Dapatkan pemberitahuan pesanan baru dan aktivitas penting di outlet Anda.' },
    ],
  },
  pricing: {
    title: 'Pilihan Harga',
    subtitle: 'Mulai gratis, upgrade saat bisnis Anda berkembang.',
    badge: 'Rekomendasi',
    plans: [
      {
        name: 'Free',
        price: 'Rp 0',
        period: '/bulan',
        features: ['1 outlet', 'POS kasir & transaksi', 'Manajemen produk & stok', 'Laporan dasar'],
        cta: 'Mulai Gratis',
        featured: false,
      },
      {
        name: 'Pro',
        price: 'Rp 99.000',
        period: '/bulan',
        features: ['Multi-outlet', 'Semua fitur Free', 'Self-order pelanggan & manajemen meja', 'Shift kasir & audit log', 'Laporan lengkap & export data', 'Dukungan prioritas'],
        cta: 'Pilih Pro',
        featured: true,
      },
    ],
  },
  howItWorks: {
    title: 'Mulai dalam 3 Langkah',
    subtitle: 'Tidak perlu perangkat khusus. Cukup browser di HP, tablet, atau laptop.',
    steps: [
      { title: 'Daftar Akun', description: 'Buat akun merchant dan outlet pertama Anda dalam hitungan menit.' },
      { title: 'Tambahkan Produk', description: 'Masukkan produk, kategori, harga, dan stok awal.' },
      { title: 'Mulai Berjualan', description: 'Buka shift, layani pelanggan, dan pantau penjualan secara real-time.' },
    ],
  },
  register: {
    kicker: 'Buat Akun Baru',
    title: 'Mulai UMKM POS Sekarang',
    subtitle: 'Isi data berikut untuk membuat akun customer baru.',
    fields: {
      name: 'Nama Lengkap',
      email: 'Email',
      password: 'Password',
      merchantName: 'Nama Merchant',
      merchantSlug: 'Slug Merchant',
      outletName: 'Nama Outlet',
      outletSlug: 'Slug Outlet',
    },
    actions: {
      submit: 'Daftar Sekarang',
      loading: 'Memproses...',
    },
    messages: {
      success: 'Registrasi berhasil. Silakan lanjut login di aplikasi web.',
      failed: 'Registrasi gagal. Coba lagi.',
    },
  },
  footer: {
    hakCipta: 'UMKM POS. Semua hak dilindungi.',
  },
}
