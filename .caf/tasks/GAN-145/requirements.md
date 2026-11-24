# Badge "stok menipis" di daftar produk
Status: DRAFT
Source: GAN-145

## 1. Outcome
Merchant melihat penanda "Stok Menipis" pada produk yang stoknya hampir habis langsung di daftar produk app merchant, tanpa membuka halaman detail. Produk dengan stok cukup tidak diberi penanda.

## 2. Scope
In:
- Badge "Stok Menipis" pada setiap kartu produk di daftar produk app merchant.
- Aturan "menipis" memakai aturan yang sudah ada di app merchant (lihat Finding).

Out:
- Perubahan API, skema database, atau tipe bersama.
- Perubahan cara mengatur batas stok minimum (form buat/ubah produk).
- Filter atau sorting "hanya stok menipis" di daftar produk.
- Notifikasi stok menipis (realtime).
- Penanda terpisah untuk stok habis (stok 0).

## 3. Constraints and Assumptions
- Finding: tiket menyebut batas "menipis" belum jelas, tetapi `apps/merchant/src/modules/product-lists/helpers/stock.ts` sudah mendefinisikan `isLowStock`: menipis bila `min_stock` > 0 dan `stock_qty` <= `min_stock`. Batas berasal dari `min_stock` per produk per outlet, bukan angka global.
- Finding: `apps/merchant/src/modules/product-lists/pages/detail.vue` sudah menampilkan `Tag` "Stok Menipis" (severity `warn`) memakai `isLowStock`.
- Finding: `apps/merchant/src/modules/product-lists/pages/index.vue` sudah mengimpor `isLowStock`, tetapi hanya mewarnai angka "Jumlah Stok" menjadi oranye; belum ada badge/teks "Stok Menipis" di kartu.
- Finding: `apps/api/src/products/products.service.ts` mengisi `stock_qty` dan `min_stock` per outlet pada tiap produk di daftar bila `outlet_id` dikirim; `index.vue` mengirim `outlet_id` dari outlet aktif.
- Finding: `apps/api/src/stock/stock.service.ts` memakai `stock_qty <= min_stock` untuk filter stok rendah, tanpa syarat `min_stock` > 0. Ini sedikit berbeda dari `isLowStock` di merchant; di luar scope tiket ini.
- Finding: tidak ada ADR di `.caf/knowledge/decisions/` yang terkait stok atau badge produk (adr-008 s.d. adr-015 membahas tool dan framework).
- Finding: workspace `@umkm-pos/merchant` tidak punya script `test` dan `lint`; verifikasi otomatis yang tersedia hanya `build` (menjalankan `vue-tsc -b`).
- Assumption A-1: `min_stock` = 0 berarti merchant tidak mengaktifkan batas, sehingga tidak ada badge. Dasar: `isLowStock` mensyaratkan `min_stock` > 0 dan seed memakai 0 sebagai nilai default.
- Assumption A-2: stok sama dengan batas (`stock_qty` = `min_stock`) sudah dihitung menipis. Dasar: `isLowStock` memakai `<=`.
- Assumption A-3: teks dan gaya badge sama dengan halaman detail ("Stok Menipis", severity `warn`) agar konsisten. Dasar: `detail.vue`.

## 4. Decisions Already Made
- Aturan "menipis" memakai `isLowStock` yang sudah ada; tidak membuat aturan baru atau batas global.

## 5. Open Questions
- Q-1 [NON-BLOCKING] Tiket meminta batas "menipis" ditanyakan dulu. Kode sudah menjawabnya (`min_stock` per produk, `<=`, abaikan bila 0), jadi spec memakainya. Mohon konfirmasi bila bisnis ingin aturan lain (misalnya `<` atau batas global). — Answer:
- Q-2 [NON-BLOCKING] Produk stok 0 dengan `min_stock` 0 tidak diberi badge. Perlukah penanda "Stok Habis" terpisah? Rekomendasi: tiket terpisah. — Answer:

## 6. Acceptance Criteria
- AC-1: When produk punya `min_stock` > 0 dan `stock_qty` lebih kecil atau sama dengan `min_stock`, then kartu produk di daftar produk menampilkan badge "Stok Menipis". Verify: manual: buka daftar produk di app merchant dengan outlet aktif, pakai produk dengan stok 5 dan stok minimum 10 (atau sesuaikan lewat "Atur Stok"), cek badge muncul pada kartu itu.
- AC-2: When `stock_qty` produk lebih besar dari `min_stock`, then kartu produk tidak menampilkan badge "Stok Menipis". Verify: manual: buka daftar produk, pakai produk dengan stok 50 dan stok minimum 10, cek tidak ada badge.
- AC-3: When `min_stock` produk 0, then kartu produk tidak menampilkan badge "Stok Menipis", berapa pun `stock_qty`. Verify: manual: buka daftar produk, pakai produk dengan stok minimum 0 dan stok 0, cek tidak ada badge.
- AC-4: When stok produk disesuaikan lewat "Atur Stok" sehingga `stock_qty` melewati `min_stock`, then daftar dimuat ulang dan status badge pada kartu itu berubah sesuai aturan AC-1/AC-2. Verify: manual: sesuaikan stok produk dari menipis ke cukup lewat tombol atur stok, cek badge hilang setelah daftar dimuat ulang.
- AC-5: When app merchant dibangun setelah perubahan, then build dan type-check lulus. Verify: command: pnpm --filter @umkm-pos/merchant build | expect: exit code 0
