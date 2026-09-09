# Requirements: GAN-126 — Wording ID — Transaksi, Kasir & Shift (apps/web)

## Status: PLAN

## Overview
Standarisasi wording antarmuka pengguna pada modul Transaksi, Kasir (POS), dan Shift di `apps/web` menjadi 100% Bahasa Indonesia. String hardcoded yang sebelumnya berbahasa Inggris diubah menjadi Bahasa Indonesia baku, jelas, dan ramah bagi pengguna UMKM (pemilik toko & kasir), tanpa mengubah tata letak, alur interaksi, maupun response backend.

## Scope
- Modul Transaksi: `apps/web/src/modules/transaction/**`
  - Router & breadcrumb
  - Daftar transaksi (`pages/index.vue`)
  - Kasir / POS Pembuatan Transaksi (`pages/create.vue`, `components/Cart.vue`, `components/Product.vue`, `components/PaymentModal.vue`, `components/ShiftStatus.vue`)
  - Detail transaksi (`pages/detail.vue`)
  - Cetak struk & preview struk (`components/ReceiptModal.vue`, `components/ReceiptPreview.vue`, `utils/receiptGenerator.ts`, `utils/bluetoothPrinter.ts`)
  - Status helper (`services/status-labels.ts`)
- Modul Shift: `apps/web/src/modules/shift/**`
  - Router & breadcrumb
  - Halaman utama shift & tab navigasi (`pages/index.vue`, `pages/CurrentShift.vue`, `pages/HistoryShift.vue`)
  - Detail shift (`pages/detail.vue`)
  - Komponen status shift (`components/ShiftStatus.vue`)
  - Manajemen peserta shift (`components/ParticipantManagement.vue`)
  - Metrik & grafik performa peserta (`components/MetricsDisplay.vue`)
  - Komponen informasi shift (`components/Information.vue`)

Elemen yang dicakup:
- Label form, placeholder, teks input & dropdown options
- Label tombol, tooltip, dan badge/tag
- Judul halaman, card header, dan section header
- Pesan dialog konfirmasi (header, message, acceptLabel, rejectLabel)
- Pesan toast (sukses, error, peringatan, info)
- Pesan empty state, teks loading, dan banner warning/info
- Header kolom DataTable & ringkasan metrik/kalkulasi

## Glossary & Non-Translated Terms
Istilah teknis yang TETAP Bahasa Inggris (tidak diterjemahkan):
- invoice
- barcode
- QR code
- export
- import
- upload
- download

## Out-of-Scope
- `apps/landing`
- `apps/api` (pesan backend/error API tidak diubah)
- Data dummy database / seed
- Nama variabel, nama fungsi, komentar kode, identifier teknis
- Framework i18n (`vue-i18n`) — string diubah langsung (hardcoded)
- Perubahan layout / struktur fungsional

## Acceptance Criteria
1. Seluruh teks antarmuka user-facing pada modul transaksi dan shift di `apps/web` menggunakan Bahasa Indonesia yang konsisten dan natural.
2. Tidak ada string berbahasa Inggris yang tertinggal (kecuali istilah dalam glossary: invoice, barcode, QR code, export, import, upload, download).
3. Pesan toast notifikasi, dialog konfirmasi, empty state, dan loading state berbahasa Indonesia.
4. Preview struk dan pencetakan struk termal menyajikan label transaksi dalam Bahasa Indonesia yang rapi.
5. Build aplikasi frontend (`pnpm --filter umkm-pos-app build` / `vue-tsc -b`) berhasil tanpa error tipe maupun kompilasi.
