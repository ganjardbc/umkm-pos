## Ticket: diskon-per-item-saat-checkout
## Status: PLAN

## Deskripsi
Menambahkan fungsionalitas potongan harga/diskon manual per baris item produk saat kasir melakukan transaksi POS di cart checkout. Mendukung 2 mode diskon: persentase (`%`) dan nominal tetap (`Rp`), dengan kalkulasi reaktif subtotal item, total transaksi, validasi batasan diskon, penyimpanan riwayat snapshot diskon pada database `transaction_items`, serta penampilan rincian diskon pada Cart, Payment Modal, Receipt Preview/Print, dan halaman Detail Transaksi.

## Acceptance Criteria
- [ ] Kasir dapat membuka modal/popover diskon pada setiap baris item produk di keranjang belanja (`Cart.vue`).
- [ ] Tersedia pilihan 2 mode diskon: Persen (`%`, rentang `0%` - `100%`) dan Nominal Tetap (`Rp`, rentang `Rp 0` sampai batas kotor item `price * qty`).
- [ ] Terdapat preview kalkulasi nilai diskon (`discount_amount`) dan subtotal bersih item sebelum diterapkan ke keranjang.
- [ ] Baris item di keranjang menampilkan label badge diskon (misal: `Diskon 10% (-Rp 2.500)` atau `Diskon Rp 5.000`), coretan/info harga awal, dan subtotal bersih yang diperbarui secara reaktif.
- [ ] Total tagihan keranjang (`cartTotal`) dihitung berdasarkan akumulasi subtotal bersih seluruh item setelah diskon.
- [ ] Kasir dapat mereset atau menghapus diskon pada baris item untuk mengembalikan subtotal ke harga normal (`price * qty`).
- [ ] Mengubah kuantitas item (`qty +/-`) memperbarui kalkulasi diskon secara otomatis (mode persen proporsional terhadap qty baru; mode nominal memvalidasi agar tidak melebihi subtotal baru).
- [ ] Payload `POST /api/v1/transactions` menerima atribut diskon per item: `discount_type` (`'percentage' | 'fixed' | null`), `discount_value` (`number | null`), dan menghitung `discount_amount` serta `subtotal` bersih secara valid di backend.
- [ ] Database `transaction_items` menyimpan kolom baru: `discount_type` (`VARCHAR(20) NULL`), `discount_value` (`DECIMAL(14,2) NULL`), dan `discount_amount` (`DECIMAL(14,2) DEFAULT 0`).
- [ ] Validasi server-side memastikan diskon persen tidak melebihi `100%`, diskon nominal tidak melebihi gross subtotal (`price_snapshot * qty`), dan `subtotal` baris item tidak boleh negatif (`subtotal >= 0`).
- [ ] Struk belanja fisik (Bluetooth Thermal 58mm/80mm), template HTML struk (`receiptGenerator.ts`), dan `ReceiptPreview.vue` menampilkan baris potongan diskon per item (jika item memiliki diskon).
- [ ] Halaman detail transaksi POS (`/transaction/detail/:id`) menampilkan kolom/rincian diskon per baris item dan ringkasan potongan pada tabel item transaksi.

## Constraints
- **Multi-tenant**: `merchant_id` HARUS diambil dari JWT context authenticated user, bukan dari client request payload.
- **RBAC**: Akses checkout dan mutasi transaksi tetap mengikuti `@RequirePermission('transaction.create')` dan validasi shift partisipan aktif kasir.
- **Data Integrity & Decimal Snapshot**: `price_snapshot`, `discount_value`, `discount_amount`, dan `subtotal` pada `transaction_items` disimpan sebagai immutable snapshot (`DECIMAL(14, 2)`) saat transaksi di-commit.
- **Zero Drift Calculation**: Tidak boleh ada selisih pembulatan antara kalkulasi subtotal frontend, backend validation, dan pencetakan struk.
- **Stock & Inventory Invariant**: Perhitungan pengurangan stok dan audit log `inventory_movements` tetap didasarkan pada `qty` murni produk tanpa terpengaruh diskon harga.

## Out of Scope
- Promo engine otomatis berbasis kode voucher, kupon promo, bundle deals, atau *Buy 1 Get 1*.
- Multi-tier gabungan diskon bertingkat pada satu item yang sama (misal kombinasi 10% + Rp 5.000).
- Fitur diskon per item pada halaman katalog publik mandiri pelanggan (*customer self-order* via `/menu/:outletId` atau `/public/orders`).
- Approval PIN / otorisasi khusus bertingkat dari Store Manager/Supervisor untuk batas diskon tertentu.

## Dependensi
- Modul transaksi backend: `apps/api/src/transactions/` (DTO, service, migration Prisma `transaction_items`).
- Modul transaksi frontend: `apps/web/src/modules/transaction/` (`stores-pos`, `Cart.vue`, `PaymentModal.vue`, `ReceiptPreview.vue`, `ReceiptModal.vue`, `receiptGenerator.ts`, `bluetoothPrinter.ts`, `pages/detail.vue`).
- Paket tipe bersama `@umkm-pos/shared-types` untuk tipe diskon item transaksi.

## Pertanyaan Terbuka
- Apakah perlu batasan persentase maksimum diskon per role (misal: Kasir max 20%, di atas itu butuh pin/supervisor) untuk iterasi berikutnya?
- Apakah format tampilan diskon di printer termal 58mm/80mm cukup mencantumkan baris terpisah `-Disc (10%) Rp X` di bawah nama item?
