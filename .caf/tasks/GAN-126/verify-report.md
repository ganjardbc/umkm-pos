# Verification Report: GAN-126 — Wording ID — Transaksi, Kasir & Shift (apps/web)

Status: SUCCESS

## Overview
All user-facing wording in Transaction, POS Cashier, and Shift modules across `apps/web` has been standardized into clean, natural Bahasa Indonesia while preserving terminology guidelines (untranslated: `invoice`, `barcode`, `QR code`, `export`, `import`, `upload`, `download`).

## Changes Made
1. **Transaction Module (`apps/web/src/modules/transaction/`):**
   - `router/index.ts`: Breadcrumb & title to 'Transaksi', 'Buat Transaksi', 'Detail', 'Beranda'.
   - `pages/index.vue`: Filter dropdown labels ('Semua Status', 'Aktif', 'Dibatalkan', 'Semua Pesanan'), empty states ('Belum ada transaksi.'), cancel confirm dialogs, card badges, and toasts.
   - `pages/create.vue`: Page title updated to 'Buat Transaksi'.
   - `pages/detail.vue`: Transaction details headers, field labels, data table column headers, payment & invoice badges, and action buttons.
   - `components/Cart.vue`: Cart header ('Keranjang'), table selector ('Meja', 'Pilih meja'), subtotal/tax/discount/total labels, empty state ('Keranjang belanja masih kosong.'), and validation messages.
   - `components/Product.vue`: Search placeholder ('Cari produk...'), category chips ('Semua Kategori'), empty state ('Produk tidak ditemukan.'), low stock warning ('Stok Menipis'), and shift validation toasts.
   - `components/ShiftStatus.vue`: Shift closed warning and participant status messages.
   - `components/PaymentModal.vue`: Payment modal headers, payment methods ('Tunai', 'Kartu Debit', 'E-Wallet', 'QRIS'), order types ('Dine In', 'Take Away'), tender amounts, confirm dialogs, and actions ('Bayar Sekarang', 'Batal').
   - `components/ReceiptModal.vue`: Printer connection status ('Terhubung', 'Menghubungkan...', 'Terputus'), action buttons ('Pasangkan & Hubungkan', 'Putuskan Koneksi', 'Uji Cetak', 'Download Gambar Struk', 'Tutup'), paper width options ('58mm (Kecil)', '80mm (Lebar)'), and toasts.
   - `components/ReceiptPreview.vue`: Receipt template strings ('Struk #', 'Tanggal:', 'Waktu:', 'Kasir:', 'Pembayaran:', 'Harga', 'Total Pembayaran:', 'Uang Tunai Diterima:', 'Kembalian:', 'DIBATALKAN', 'Terima kasih atas kunjungan Anda!').
   - `utils/receiptGenerator.ts`: Thermal print HTML generator wording matching preview.
   - `utils/bluetoothPrinter.ts`: ESC/POS bluetooth printer commands and raw printer strings.

2. **POS Module (`apps/web/src/modules/pos/`):**
   - `router/index.ts`: Breadcrumbs and title updated to 'Kasir' and 'Beranda'.

3. **Shift Module (`apps/web/src/modules/shift/`):**
   - `router/index.ts`: Breadcrumb & title updated to 'Shift' and 'Beranda'.
   - `pages/index.vue`: Shift tab titles ('Shift Saat Ini', 'Riwayat Shift').
   - `pages/HistoryShift.vue`: History shift loading message, empty state ('Riwayat shift masih kosong.'), card grid metrics labels, and status badges.
   - `pages/detail.vue`: Detail header title ('Detail Shift').
   - `components/ShiftStatus.vue`: Active shift banner, open/close buttons ('Buka Shift', 'Tutup Shift'), stat cards ('Peserta', 'Total Transaksi', 'Waktu Shift'), and user shift warning messages.
   - `components/ParticipantManagement.vue`: Participant list header ('Peserta Shift'), tags ('Pemilik Shift', 'Dihapus'), add participant dialog ('Tambah Peserta', 'Pilih Pengguna'), handoff dialog ('Oper Shift', 'Pilih Peserta Tujuan'), confirm dialogs, and toasts.
   - `components/Information.vue`: Section title ('Informasi Shift'), labels ('Pemilik Shift', 'Waktu Dibuat', 'Status'), and summary cards.
   - `components/MetricsDisplay.vue`: Title ('Metrik Performa'), chart titles ('Transaksi & Pendapatan per Peserta', 'Detail Peserta'), Chart.js dataset labels & axis labels ('Transaksi', 'Pendapatan (Rp)'), table headers, tags, and toasts.
   - `components/ShiftHandoff.vue` & `components/UserShift.vue`: Shift handoff and user shift component labels and dialogs.

## Verification Checklist
- [x] TypeScript validation (`vue-tsc -b`): Passed with 0 errors
- [x] Production build (`vite build` in `apps/web`): Passed with 0 errors
- [x] Verified glossary compliance (`invoice`, `barcode`, `QR code`, `export`, `import`, `upload`, `download` preserved)
