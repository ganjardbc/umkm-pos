# Tasks: Buka/tutup kasir opsional per outlet

Urutan mengikuti `design.md` `## Order`. B-1 sudah merged di main (langkah 1 terpenuhi). Backend lebih dulu, lalu frontend, lalu docs, lalu verifikasi. Tes ditulis sebelum implementasi yang diuji.

## Backend Tasks

Schema dan migrasi
- [ ] (apps/api) Tambah berkas SQL baru di `apps/api/prisma/migrations`: `ALTER TABLE outlets ADD COLUMN shift_required TINYINT(1) NOT NULL DEFAULT 1`, dan tambah `shift_required Boolean @default(true)` pada model `outlets` di `apps/api/prisma/schema.prisma`. Jalankan `prisma generate`. (AC-1, AC-2)

Outlets (tes dulu)
- [ ] (apps/api) Tulis tes di `apps/api/src/outlets/outlets.service.spec.ts`: outlet tanpa perubahan bernilai `shift_required` true (AC-1); update menyimpan nilai baru dan terbaca di `findOne` (AC-2); mematikan saat ada shift `open` ditolak 400 dengan pesan meminta shift ditutup dulu dan nilai tidak berubah (AC-4). (AC-1, AC-2, AC-4)
- [ ] (apps/api) Tulis tes di `apps/api/src/outlets/outlets.controller.spec.ts`: pengguna tanpa `outlet.update` ditolak 403 pada `PATCH /outlets/:id` dengan `shift_required`, dan service tidak dipanggil. (AC-3)
- [ ] (apps/api) Tambah `shift_required` (boolean, opsional) di `CreateOutletDto`; di `OutletsService.update`, bila nilai menjadi `false`, jalankan update dan hitung shift `open` outlet itu dalam satu `$transaction`, lempar 400 bila ada. Baca file yang diubah lebih dulu. (AC-1, AC-2, AC-4)

Shifts (tes dulu)
- [ ] (apps/api) Tulis tes di `apps/api/src/shifts/shifts.service.spec.ts`: `openShift` saat `shift_required` mati ditolak 400 dengan pesan yang menyebut setelan buka/tutup kasir mati dan tidak membuat shift; `isShiftRequired` mengembalikan nilai outlet milik merchant dan menolak outlet merchant lain. (AC-19)
- [ ] (apps/api) Di `apps/api/src/shifts/shifts.service.ts` tambah `isShiftRequired(outletId, merchantId)` dan pengecekan di `openShift` sebelum validasi yang menulis data. Di `apps/api/src/shifts/shifts.controller.ts` tambah `GET /shifts/outlet/:outlet_id/setting` (izin `shift.read`) yang mengembalikan `{ outlet_id, shift_required }` dengan `merchant_id` dari JWT. (AC-19, AC-11, AC-13)

Transactions (tes dulu)
- [ ] (apps/api) Tulis tes di `apps/api/src/transactions/transactions.service.spec.ts`: setelan mati + tanpa `shift_id` tersimpan dan stok berkurang (AC-5); setelan mati + `shift_id` terkirim disimpan `null` (AC-5, AC-14); setelan hidup + tanpa `shift_id` ditolak 400 tanpa transaksi dan tanpa perubahan stok (AC-6); `payTransaction` setelan mati tanpa shift diterima dan `paid_shift_id` kosong (AC-7). (AC-5, AC-6, AC-7, AC-14)
- [ ] (apps/api) Di `apps/api/src/transactions/transactions.service.ts`, `createPosTransaction` dan `payTransaction` memanggil `ShiftsService.isShiftRequired`: hidup tanpa shift ditolak 400, hidup dengan shift memakai validasi sekarang, mati mengabaikan `shift_id` dan menyimpan `null`. Aturan kas B-1 hanya berlaku saat hidup. Daftarkan dependensi modul bila perlu. (AC-5, AC-6, AC-7, AC-14)

Customer-catalog (berkas tes baru dulu)
- [ ] (apps/api) Buat `apps/api/src/customer-catalog/customer-catalog.service.spec.ts` dengan mock `PrismaService`, `TransactionsService`, `NotificationsService`: mati + outlet aktif membuat pesanan tanpa shift, `shift_id` null (AC-8); mati + outlet tidak aktif ditolak (AC-9); hidup tanpa shift open ditolak seperti sebelumnya (AC-10); `getShiftStatus` memuat `shift_required`. (AC-8, AC-9, AC-10)
- [ ] (apps/api) Di `apps/api/src/customer-catalog/customer-catalog.service.ts`, `createOrder` membaca `shift_required` dari baris outlet hasil `resolveOutlet`: mati menerima pesanan dengan `shift_id` null, hidup memakai aturan sekarang. `getShiftStatus` menambah field `shift_required`. (AC-8, AC-9, AC-10)

## Frontend Tasks

Tidak ada berkas tes frontend (workspace `@umkm-pos/merchant` tidak punya script test, lihat `CLAUDE.md`); AC frontend diverifikasi manual dan lewat build.

- [ ] (apps/merchant) Di `apps/merchant/src/modules/shift/services/api.ts` tambah `getOutletShiftSetting(outletId)`; di `apps/merchant/src/modules/shift/composables/useShift.ts` ekspor `shiftRequired` (default `true`) dan `fetchShiftSetting(outletId)`; bila gagal muat, tetap `true`. (AC-11, AC-13)
- [ ] (apps/merchant) Di `apps/merchant/src/layouts/default.vue` muat setelan bersama shift dan tampilkan badge "In Shift / Not Shift" hanya bila `shiftRequired`. (AC-12, AC-13)
- [ ] (apps/merchant) Di `apps/merchant/src/modules/pos/pages/index.vue` tunggu setelan dan shift selesai dimuat; mati langsung tampilkan produk dan keranjang tanpa layar `OpenShift`. Di `apps/merchant/src/modules/transaction/components/Cart.vue` dan `Product.vue` lewati pemeriksaan shift/peserta saat mati, dan sembunyikan peringatan di `ShiftStatus.vue` (transaksi). (AC-11, AC-13, AC-14, AC-20)
- [ ] (apps/merchant) Di `apps/merchant/src/modules/shift/components/ShiftStatus.vue` sembunyikan tombol "Buka Shift" saat `shiftRequired` false; menu Shift dan riwayat tetap bisa dibuka. (AC-20, AC-12)
- [ ] (apps/merchant) Di `apps/merchant/src/modules/dashboard/components/SummaryStats.vue` dan `apps/merchant/src/modules/dashboard/pages/index.vue` sembunyikan kartu "Shift Aktif" saat `shiftRequired` false. (AC-12)
- [ ] (apps/merchant) Di `apps/merchant/src/modules/customer-catalog/stores/state.ts` tambah `shift_required` pada `CatalogShiftStatus`; di `stores/getters.ts` ubah `isShiftOpen` menjadi benar bila `shift_required` false atau `is_open === true`. Pastikan pesan "shift kasir belum dibuka" di `layouts/customer.vue` dan `pages/cart.vue` tidak tampil saat mati. (AC-8, AC-10)
- [ ] (apps/merchant) Di `apps/merchant/src/modules/outlet/services/types.ts` tambah `shift_required` pada `FormEdit`; di `apps/merchant/src/modules/outlet/pages/edit.vue` tambah checkbox "Buka/tutup kasir" dengan keterangan akibat (pola `is_active`), kirim di payload, error simpan tetap lewat toast di `catch` tanpa kehilangan isian. (AC-15)

## Documentation Tasks

- [ ] (docs) Perbarui `docs/api/api-contract.md`: `shift_required` pada `PATCH/GET /outlets`, endpoint baru `GET /shifts/outlet/:outlet_id/setting`, perilaku `POST /shifts`, `POST /transactions`, `PATCH /transactions/:id/pay`, `GET /catalog/shift-status`, dan pesanan katalog. Perbarui `docs/database/erd.md` dengan kolom `outlets.shift_required`. Dikerjakan oleh agen documentation (di luar scope Planner). (AC-1, AC-2, AC-19)

## Verification Tasks

- [ ] (apps/api) Jalankan `pnpm --filter umkm-pos-api lint:ci` dan perbaiki sampai exit 0. (AC-16)
- [ ] (apps/api) Jalankan `pnpm --filter umkm-pos-api test` sampai exit 0. (AC-17)
- [ ] (apps/merchant) Jalankan `pnpm --filter @umkm-pos/merchant build` sampai exit 0. (AC-18)
- [ ] (apps/merchant) Uji manual AC-11, AC-12, AC-13, AC-14, AC-15, AC-20 sesuai langkah `Verify:` di `requirements.md`. (AC-11, AC-12, AC-13, AC-14, AC-15, AC-20)

## Coverage
- AC-1: migrasi, tes dan implementasi outlets, docs
- AC-2: migrasi, tes dan implementasi outlets, docs
- AC-3: tes `outlets.controller.spec.ts`
- AC-4: tes dan implementasi outlets
- AC-5: tes dan implementasi transactions
- AC-6: tes dan implementasi transactions
- AC-7: tes dan implementasi transactions
- AC-8: tes dan implementasi customer-catalog, getter katalog frontend
- AC-9: tes dan implementasi customer-catalog
- AC-10: tes dan implementasi customer-catalog, getter katalog frontend
- AC-11: endpoint setelan shifts, useShift, POS, uji manual
- AC-12: layout badge, dashboard, ShiftStatus, uji manual
- AC-13: endpoint setelan shifts, useShift, layout, POS, uji manual
- AC-14: transactions, POS frontend, uji manual
- AC-15: halaman edit outlet, uji manual
- AC-16: verifikasi lint
- AC-17: verifikasi test
- AC-18: verifikasi build
- AC-19: tes dan implementasi shifts, docs
- AC-20: POS, ShiftStatus, uji manual
