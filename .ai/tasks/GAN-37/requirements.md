## Ticket: GAN-37
## Status: PLAN

## Deskripsi
Di halaman list outlet, baris outlet yang belum punya produk sama sekali (tidak ada record `outlet_product_inventory`) tidak menampilkan keterangan apapun. Tambah badge/label kecil "Belum ada produk" di kolom baru pada tabel outlet list, muncul hanya untuk outlet dengan 0 produk.

## Acceptance Criteria
- [ ] `GET /outlets` response tiap item outlet punya field baru `product_count: number` — hasil count distinct `product_id` di `outlet_product_inventory` untuk `outlet_id` tsb, scoped `merchant_id`.
- [ ] Endpoint tetap merchant-scoped, tidak menambah query param baru, tidak ubah pagination meta.
- [ ] Di halaman `apps/web/src/modules/outlet/pages/index.vue`, tabel outlet punya kolom baru "Produk" yang menampilkan:
  - Badge/Tag warning kecil bertuliskan "Belum ada produk" jika `product_count === 0`.
  - Angka `product_count` (plain text, tanpa badge) jika `product_count > 0`.
- [ ] Kolom baru tidak menghapus/mengubah kolom existing (logo, name, location, merchant, created_at, status, action).
- [ ] Tidak ada regresi pada list, create, update, delete outlet flow existing.

## Constraints
- Multi-tenant: query `outlet_product_inventory` count harus di-scope `merchant_id` dari JWT (`CurrentUser`), bukan dari client input.
- Tidak boleh N+1 query per outlet — pakai `groupBy` atau agregasi sekali jalan untuk semua outlet dalam 1 page.
- Tidak menambah endpoint baru — perubahan cukup di response `GET /outlets` existing.
- Ikuti struktur module existing (controller thin, service handle logic & Prisma).
- Badge style pakai komponen PrimeVue `Tag` (konsisten dengan kolom `status` yang sudah pakai `Tag`), severity `warn` untuk "Belum ada produk".

## Out of Scope
- Tidak mengubah cara hitung stock atau logic `outlet_product_inventory` lain.
- Tidak menambah filter/sort berdasarkan `product_count` di list outlet.
- Tidak mengubah halaman detail outlet.
- Tidak menambah field `product_count` ke endpoint `GET /outlets/:id`.

## Dependensi
- Module `outlets` (BE) dan `outlet` (FE, folder singular) sudah ada dan berjalan.
- Table `outlet_product_inventory` sudah ada di schema Prisma (dipakai module `products` & `stock`).
