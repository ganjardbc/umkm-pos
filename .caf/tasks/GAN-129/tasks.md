# Tasks: GAN-129

## Frontend Tasks
- [x] (apps/web) Update string teks pada layout pelanggan di `apps/web/src/layouts/customer.vue` (fallback title "Customer Catalog" -> "Katalog Pelanggan").
- [x] (apps/web) Update string teks dan router title di `apps/web/src/modules/customer-catalog/router/index.ts` ("Customer Catalog" -> "Katalog Pelanggan").
- [x] (apps/web) Update string teks pada halaman Start di `apps/web/src/modules/customer-catalog/pages/start.vue` ("Menu Customer" -> "Menu Pelanggan", "Secret Code" -> "Kode Akses", "Masukkan secret code outlet..." -> "Masukkan kode akses outlet lalu lanjut pilih menu.").
- [x] (apps/web) Update string teks pada halaman Home di `apps/web/src/modules/customer-catalog/pages/home.vue` ("Items" -> "Item", "Lihat Order" -> "Lihat Pesanan").
- [x] (apps/web) Update string teks pada halaman Browse di `apps/web/src/modules/customer-catalog/pages/browse.vue` ("All Categories" -> "Semua Kategori").
- [x] (apps/web) Update string teks pada halaman Cart di `apps/web/src/modules/customer-catalog/pages/cart.vue` ("Checkout" -> "Detail Pemesanan" / "Konfirmasi Pesanan" atau label checkout yang selaras).
- [x] (apps/web) Update string teks pada halaman Order di `apps/web/src/modules/customer-catalog/pages/order.vue`:
  - "Order ID" -> "ID Pesanan"
  - "Customer" -> "Pelanggan"
  - "Waktu Order" -> "Waktu Pemesanan"
  - "Items" -> "Daftar Item"
  - "No items in this order." -> "Tidak ada item dalam pesanan ini."
  - DataTable headers: "Product Name" -> "Nama Menu", "Price" -> "Harga", "Qty" -> "Jumlah", "Note" -> "Catatan", "Total Amount" -> "Total Pembayaran".
- [x] (apps/web) Periksa dan pastikan komponen pendukung `apps/web/src/modules/customer-catalog/components/ProductCard.vue` dan `CustomerCartFooter.vue` menggunakan string Bahasa Indonesia yang tepat.

## Verification Tasks
- [x] (apps/web) Jalankan type-check dan build: `pnpm --filter umkm-pos-app build` untuk memastikan tidak ada kesalahan kompilasi template atau TypeScript.
- [x] (apps/web) Review seluruh file di modul `customer-catalog` dan `layouts/customer.vue` untuk memastikan tidak ada string user-facing Bahasa Inggris yang terlewat (kecuali istilah glossary yang dikecualikan).
