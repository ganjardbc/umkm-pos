# Verification Report: GAN-129

## Status: SUCCESS

### Checklist
- [x] (apps/web) Layout & Router: Title fallback dan route metadata diubah dari 'Customer Catalog' ke 'Katalog Pelanggan'.
- [x] (apps/web) Start Page: Badge diubah ke 'Menu Pelanggan', label field diubah ke 'Kode Akses', placeholder/instruksi disesuaikan.
- [x] (apps/web) Home Page: Label 'Items' diubah ke 'Item', tombol 'Lihat Order' diubah ke 'Lihat Pesanan'.
- [x] (apps/web) Browse Page: Tag kategori 'All Categories' diubah ke 'Semua Kategori'.
- [x] (apps/web) Cart Page: Header section 'Checkout' diubah ke 'Detail Pemesanan'.
- [x] (apps/web) Order Page: Field 'Order ID' -> 'ID Pesanan', 'Customer' -> 'Pelanggan', 'Waktu Order' -> 'Waktu Pemesanan', 'Items' -> 'Daftar Item', 'No items in this order.' -> 'Tidak ada item dalam pesanan ini.', header tabel ('Product Name' -> 'Nama Menu', 'Price' -> 'Harga', 'Qty' -> 'Jumlah', 'Note' -> 'Catatan', 'Total Amount' -> 'Total Pembayaran').
- [x] (apps/web) Komponen pendukung (`ProductCard.vue`, `StoreInformations.vue`, `CustomerCartFooter.vue`): string 'Stok Kosong' -> 'Stok Habis', 'Logout' -> 'Keluar', 'Customer' -> 'Pelanggan', 'Status order' -> 'Status pesanan', 'belum ada order' -> 'belum ada pesanan'.
- [x] (apps/web) Build & type-check (`pnpm --filter umkm-pos-app build` / `vue-tsc -b && vite build`) berhasil tanpa error.
