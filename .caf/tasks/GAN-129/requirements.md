# Requirements: GAN-129

## Ticket
- **ID:** GAN-129
- **Title:** Wording ID — Katalog Pelanggan / Self-Order (apps/web)
- **Status:** PLAN

## Source
Discovery `wording-bahasa-indonesia-web`, file: `.caf/discovery/wording-bahasa-indonesia-web/prd.md` + `flow.md`

## Problem
Teks antarmuka di `apps/web` bercampur Bahasa Inggris dan Indonesia, tergantung siapa yang menulis module saat development. Tidak ada standar wording maupun lapisan i18n — semua string hardcoded. Ini membingungkan pengguna yang mayoritas tidak familiar dengan istilah teknis berbahasa Inggris.

## Target User
Pelanggan akhir merchant (bukan staf) — pengguna katalog/self-order publik (`/menu/:outletId/**`), mayoritas berbahasa Indonesia sebagai bahasa sehari-hari.

## Scope
Pembaruan seluruh string user-facing hardcoded menjadi Bahasa Indonesia baku dan ramah pengguna pada modul Katalog Pelanggan / Self-Order (`/menu/:outletId/**`) dan layout customer:

1. **Layout & Navigasi Customer (`apps/web/src/layouts/customer.vue`):**
   - Judul fallback outlet / header: "Customer Catalog" -> "Katalog Pelanggan".
   - Page title fallback.

2. **Halaman Start / Masuk Sesi (`apps/web/src/modules/customer-catalog/pages/start.vue`):**
   - Header badge: "Menu Customer" -> "Menu Pelanggan" / "Katalog Pelanggan".
   - Form label: "Secret Code" -> "Kode Akses" / "Kode Rahasia".
   - Helper text: "Masukkan secret code outlet..." -> "Masukkan kode akses outlet lalu lanjut pilih menu."

3. **Halaman Beranda Pelanggan (`apps/web/src/modules/customer-catalog/pages/home.vue`):**
   - Ringkasan pesanan label: "Items" -> "Item", "Lihat Order" -> "Lihat Pesanan".

4. **Halaman Pilih Menu / Browse (`apps/web/src/modules/customer-catalog/pages/browse.vue`):**
   - Kategori filter: "All Categories" -> "Semua Kategori".
   - Placeholder input & pesan toast.

5. **Halaman Keranjang / Cart (`apps/web/src/modules/customer-catalog/pages/cart.vue`):**
   - Section heading: "Checkout" -> "Detail Pemesanan" / "Konfirmasi Pesanan" atau "Checkout" disesuaikan dengan konteks pemesanan.
   - Placeholder & konfirmasi dialog & toast.

6. **Halaman Detail Pesanan (`apps/web/src/modules/customer-catalog/pages/order.vue`):**
   - Section label: "Order ID" -> "ID Pesanan", "Customer" -> "Pelanggan", "Waktu Order" -> "Waktu Pemesanan".
   - Table header & empty state:
     - "Items" -> "Daftar Item" / "Item Pesanan"
     - "No items in this order." -> "Tidak ada item dalam pesanan ini."
     - "Product Name" -> "Nama Menu"
     - "Price" -> "Harga"
     - "Qty" -> "Jumlah"
     - "Subtotal" -> "Subtotal"
     - "Note" -> "Catatan"
     - "Total Amount" -> "Total Pembayaran"

7. **Komponen Pendukung (`ProductCard.vue`, `CustomerCartFooter.vue`, dsb.):**
   - Memastikan label tombol, tag status ("Stok Habis"), dan teks footer konsisten dalam Bahasa Indonesia.

8. **Router Meta (`apps/web/src/modules/customer-catalog/router/index.ts`):**
   - `meta.title`: 'Customer Catalog' -> 'Katalog Pelanggan'.

## Glossary Istilah (TETAP Bahasa Inggris / Tidak Diterjemahkan)
- `invoice`
- `barcode`
- `QR code`
- `export`
- `import`
- `upload`
- `download`

## Out-of-Scope
- `apps/landing` (marketing landing page)
- `apps/api` — pesan error/response backend tidak diubah
- Data seed database dan konten dummy/demo
- Nama variabel, nama fungsi, komentar kode, log internal
- Lapisan i18n (`vue-i18n`) — tidak dipasang, string langsung di-hardcode
- Dokumentasi developer (`docs/**`, `CLAUDE.md`)
- Perubahan struktur/urutan/interaksi UI — murni perubahan teks

## Acceptance Criteria
1. Semua string UI yang ditampilkan kepada pengguna (label, placeholder, button text, table header, empty state, toast message, confirmation dialog, modal/badge) pada modul `/menu/:outletId/**` dan `apps/web/src/layouts/customer.vue` menggunakan Bahasa Indonesia yang konsisten (kecuali glossary di atas).
2. Tidak ada teks berbahasa Inggris yang tertinggal pada tampilan publik pelanggan (seperti "All Categories", "Product Name", "Price", "Qty", "Note", "No items in this order.", "Total Amount", "Order ID", "Secret Code", "Customer").
3. Type-check dan build frontend (`pnpm --filter umkm-pos-app build`) berhasil tanpa error typescript atau lint regression.

## Open Questions
None.
