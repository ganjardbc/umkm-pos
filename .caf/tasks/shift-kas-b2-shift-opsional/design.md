# Design: Buka/tutup kasir opsional per outlet

## Context
Kriteria yang berlaku: (1) perubahan menyentuh lebih dari satu app (`apps/api` dan `apps/merchant`), (2) menambah schema dan migrasi, (3) mengubah kontrak antar layer (body update outlet, respons status shift katalog, satu endpoint baru).

- Finding: model `outlets` tidak punya kolom setelan. Kolom yang ada: `slug`, `name`, `location`, `guest_session_secret`, `logo`, `logo_upload_id`, `is_active`, audit (`apps/api/prisma/schema.prisma`).
- Finding: `OutletsService.update` menyimpan seluruh isi `UpdateOutletDto` ke database. `UpdateOutletDto` adalah `PartialType(CreateOutletDto)`, jadi field baru di `CreateOutletDto` otomatis ikut. `PATCH /outlets/:id` memakai `outlet.update`, sedangkan `GET /outlets/:id` memakai `outlet.read` (`apps/api/src/outlets/outlets.controller.ts`, `outlets.service.ts`).
- Finding: `resolveCashierForPos` di `apps/api/src/transactions/transactions.service.ts` langsung mengembalikan `userId` bila `dto.shift_id` kosong. Tidak ada pemeriksaan shift. `payTransaction` tidak menerima `shift_id` (belum ada B-1).
- Finding: `createOrder` di `apps/api/src/customer-catalog/customer-catalog.service.ts` menolak pesanan bila `findOpenShift` kosong, lalu meneruskan `shift_id: shift.id` ke `createCatalogOrder`. `resolveOutlet` di berkas yang sama mensyaratkan `is_active = true` dan mengembalikan seluruh baris outlet. `getShiftStatus` mengembalikan `{ is_open, shift_id, status }`.
- Finding: sisi pelanggan memakai getter `isShiftOpen` (`is_open === true`) di `apps/merchant/src/modules/customer-catalog/stores/getters.ts`. Getter itu menonaktifkan tombol keranjang di `layouts/customer.vue` dan `pages/cart.vue`, dan menampilkan pesan "shift kasir belum dibuka".
- Finding: kasir memuat shift lewat `getOutletShift` (`GET /api/v1/shifts/outlet/:outlet_id`, izin `shift.read`) di `apps/merchant/src/layouts/default.vue` dan `apps/merchant/src/modules/pos/pages/index.vue`. `findByOutlet` melempar 404 bila outlet belum pernah punya shift, dan responsnya adalah baris shift, bukan setelan outlet (`apps/api/src/shifts/shifts.service.ts`).
- Finding: `pos/pages/index.vue` memilih layar dari `isShiftLoaded` dan `isShiftOpen` (layar `OpenShift` bila tidak open). `ShiftStatus.vue` (transaksi) menampilkan peringatan shift ditutup dan bukan peserta. Keranjang dan produk memeriksa `shift_id` dan peserta (`transaction/components/Cart.vue`, `Product.vue`, sesuai spec B-2).
- Finding: badge "In Shift / Not Shift" ada di `apps/merchant/src/layouts/default.vue` (baris sekitar 67 sampai 70). Kartu "Shift Aktif" ada di `apps/merchant/src/modules/dashboard/components/SummaryStats.vue` dengan prop `activeShiftsCount`, diisi `apps/merchant/src/modules/dashboard/pages/index.vue` dari `getListShift`.
- Finding: halaman edit outlet memakai PrimeVue `Form` dengan zod, mengirim `name`, `location`, `guest_session_secret`, `is_active`, dan menampilkan toast error di blok `catch` tanpa meninggalkan halaman (`apps/merchant/src/modules/outlet/pages/edit.vue`).
- Finding: berkas migrasi di `apps/api/prisma/migrations` berupa `.sql` lepas berisi `ALTER TABLE` (contoh `modify_shifts_table_schema.sql`).
- Finding: berkas `.sql` di `apps/api/prisma/migrations` dijalankan otomatis saat deploy (jawaban pemilik repo, sama dengan design B-1).
- Finding: peran kasir memegang izin `shift.read` (jawaban pemilik repo). Layout sudah memanggil endpoint ber-izin itu untuk memuat shift.
- Finding: jalur transaksi offline (sinkronisasi) dikeluarkan dari pembahasan atas keputusan pemilik repo dan tidak dibaca di desain ini.
- Finding: tombol "Buka Shift" ada di `apps/merchant/src/modules/shift/components/ShiftStatus.vue` (`handleOpenShift`, memanggil `shiftApi.openShift`) dan layar `apps/merchant/src/modules/transaction/components/OpenShift.vue`. Controller `POST /shifts` memanggil `ShiftsService.openShift` (`apps/api/src/shifts/shifts.controller.ts`). Tes shift ada di `apps/api/src/shifts/shifts.service.spec.ts`.

## Approach
Backend (`apps/api`):
1. Schema: satu kolom `shift_required` di `outlets`, default hidup.
2. Modul `outlets`: field baru diterima lewat DTO. Saat nilai diubah menjadi mati, update dan pengecekan shift terbuka dilakukan dalam satu `$transaction`. Bila ada shift terbuka, update dibatalkan dengan 400.
3. Modul `shifts`: endpoint baca setelan untuk kasir (izin `shift.read`), satu fungsi `isShiftRequired(outletId, merchantId)` yang dipakai modul lain, dan penolakan `openShift` bila setelan mati.
4. Modul `transactions`: `createPosTransaction` dan `payTransaction` memanggil `isShiftRequired`. Hidup: tanpa shift ditolak 400. Mati: `shift_id` diabaikan, transaksi tersimpan tanpa shift.
5. Modul `customer-catalog`: `createOrder` membaca setelan dari baris outlet yang sudah diambil `resolveOutlet`. Mati: pesanan diterima tanpa shift. Hidup: aturan sekarang. `getShiftStatus` ikut mengembalikan setelan.

Frontend (`apps/merchant`):
1. State bersama `useShift` mendapat `shiftRequired` (default `true`) dan aksi memuat setelan. Layout utama dan halaman POS memuat setelan bersama shift.
2. POS menunggu setelan dan shift selesai dimuat, lalu: hidup memakai alur sekarang, mati langsung menampilkan produk dan keranjang tanpa layar buka shift, dan keranjang serta produk tidak memeriksa shift.
3. Badge header, peringatan `ShiftStatus` di POS, dan kartu dashboard "Shift Aktif" hanya tampil bila `shiftRequired` true.
4. Halaman edit outlet mendapat pilihan "Buka/tutup kasir" dengan keterangan akibatnya.
5. Sisi pelanggan: getter `isShiftOpen` dianggap terpenuhi bila setelan mati.

## Contracts
- `PATCH /api/v1/outlets/:id`. Sebelum: body field opsional dari `CreateOutletDto` (`slug`, `name`, `location`, `guest_session_secret`, `logo`, `is_active`). Sesudah: ditambah `shift_required` (boolean, opsional). Izin tetap `outlet.update`. Mengubah ke `false` saat outlet punya shift dengan status `open` ditolak 400 dengan pesan yang meminta shift ditutup dulu, dan nilai tidak berubah. (AC-2, AC-3, AC-4)
- `GET /api/v1/outlets/:id` dan `GET /api/v1/outlets`. Sebelum: baris outlet tanpa setelan. Sesudah: baris outlet memuat `shift_required` (otomatis dari Prisma, tanpa perubahan kode baca). Izin tetap `outlet.read`. (AC-1, AC-2, AC-15)
- `GET /api/v1/shifts/outlet/:outlet_id/setting` (baru). Izin `shift.read`. Memvalidasi outlet milik `merchant_id` dari JWT, lalu mengembalikan `{ outlet_id, shift_required }`. Outlet milik merchant lain ditolak seperti endpoint shift lain. (AC-13, AC-11)
- `POST /api/v1/transactions` (POS). Sebelum: `shift_id` opsional, tidak diperiksa bila kosong. Sesudah: request tidak berubah. Bila `shift_required` hidup dan `shift_id` kosong, ditolak 400 tanpa transaksi dan tanpa perubahan stok. Bila hidup dan `shift_id` ada, validasi sekarang berlaku (shift open, peserta aktif, outlet milik merchant). Bila mati, `shift_id` yang dikirim diabaikan dan disimpan `null`. (AC-5, AC-6, AC-14)
- `POST /api/v1/shifts`. Sebelum (setelah B-1): `{ outlet_id, opening_cash }`, selalu bisa membuka shift. Sesudah: body tidak berubah. Bila `shift_required` outlet mati, ditolak 400 dengan pesan yang menyebut setelan buka/tutup kasir mati, dan tidak ada shift baru. Pengecekan dilakukan sebelum validasi lain yang menulis data. (AC-19)
- `PATCH /api/v1/transactions/:id/pay`. Aturan `shift_id` dari B-1 berlaku hanya bila `shift_required` hidup. Bila mati, `shift_id` tidak wajib, tidak divalidasi, dan `paid_shift_id` tetap kosong. (AC-7, AC-14)
- `GET /catalog/shift-status` (`@Get('catalog/shift-status')` pada controller tanpa prefiks rute). Sebelum: `{ is_open, shift_id, status }`. Sesudah: ditambah `shift_required`. Field lama tidak berubah artinya. (AC-8, AC-10)
- `POST` pesanan katalog (`createOrder`). Sebelum: ditolak 400 bila tidak ada shift open. Sesudah: bila `shift_required` mati, diterima tanpa shift dan `shift_id` pesanan `null`. Bila hidup, ditolak seperti sebelumnya. Outlet tidak aktif tetap ditolak lebih awal oleh `resolveOutlet`. (AC-8, AC-9, AC-10)
- Schema `outlets`: tambah `shift_required BOOLEAN NOT NULL DEFAULT TRUE` (`TINYINT(1)`), di Prisma `Boolean @default(true)`. (AC-1, AC-2)
- Tipe frontend: `useShift` mengekspor `shiftRequired` dan `fetchShiftSetting(outletId)` di `apps/merchant/src/modules/shift/composables/useShift.ts`. Layanan baru `getOutletShiftSetting(outletId)` di `apps/merchant/src/modules/shift/services/api.ts`. `FormEdit` di `apps/merchant/src/modules/outlet/services/types.ts` ditambah `shift_required`. Tipe `CatalogShiftStatus` di `apps/merchant/src/modules/customer-catalog/stores/state.ts` ditambah `shift_required`. (AC-11, AC-12, AC-13, AC-15)
- Getter `isShiftOpen` di `apps/merchant/src/modules/customer-catalog/stores/getters.ts`. Sebelum: `is_open === true`. Sesudah: benar bila `shift_required` false atau `is_open === true`. Nama getter dipertahankan agar pemakainya tidak berubah. (AC-8, AC-10)

## Data and migration
- Satu berkas SQL baru di `apps/api/prisma/migrations`: `ALTER TABLE outlets ADD COLUMN shift_required TINYINT(1) NOT NULL DEFAULT 1`. `apps/api/prisma/schema.prisma` diperbarui senada. (AC-1)
- Outlet lama otomatis bernilai hidup lewat default kolom, jadi tidak ada backfill dan perilaku sekarang tidak berubah. (AC-1)
- Kompatibilitas: kode lama tidak membaca kolom itu dan tidak terpengaruh. Rollback kode tidak butuh rollback data. Transaksi yang dibuat saat mati tetap `shift_id` null, dan sudah boleh null di skema sekarang, jadi tidak ada perubahan lain. (AC-14)
- Urutan deploy: migrasi, lalu API dan merchant bersamaan. API baru dengan frontend lama tetap bekerja untuk outlet hidup (perilaku sama). Frontend baru dengan API lama gagal memuat endpoint setelan, lalu memakai default hidup (D-6). (AC-1, AC-13)
- B-2 dikerjakan setelah B-1 (lihat `breakdown.md`), karena keduanya mengubah `OpenShift.vue`, `ShiftStatus.vue`, dan jalur bayar. Aturan kas B-1 dipasang di balik pengecekan `shift_required`. (AC-6, AC-7)

## Decisions
- D-1: setelan disimpan sebagai satu kolom boolean di `outlets`. Alternatif: tabel `outlet_settings` atau kolom JSON. Alasan: hanya ada satu setelan, dan kolom biasa langsung ikut `findOne`, DTO, dan tes yang sudah ada. Tabel setelan bisa ditambahkan nanti bila setelan kedua muncul. (AC-1, AC-2)
- D-2: nilai awal lewat `DEFAULT 1` pada kolom, tanpa skrip backfill. Alternatif: tulis `true` ke setiap baris lewat pernyataan terpisah. Alasan: `ADD COLUMN ... DEFAULT` sudah mengisi baris lama dan aman dijalankan sekali. (AC-1)
- D-3: setelan diubah lewat `PATCH /outlets/:id` yang ada dengan `outlet.update`. Alternatif: endpoint dan izin baru. Alasan: sesuai asumsi A-1, dan DTO turunan `PartialType` otomatis menerima field baru. Konsekuensi: peran dengan `outlet.update` juga bisa mengubah setelan ini. (AC-2, AC-3)
- D-4: penolakan mematikan setelan dilakukan dalam `$transaction`: update lebih dulu, lalu hitung shift `open` di outlet itu, dan lempar 400 bila ada agar update dibatalkan. Alternatif: periksa lalu update sebagai dua langkah terpisah. Alasan: dua langkah terpisah menyisakan celah bila shift dibuka di antaranya. Celah itu tidak sepenuhnya hilang (lihat Risks), tapi menyempit. (AC-4)
- D-5: kasir membaca setelan lewat endpoint baru berizin `shift.read`. Alternatif: `GET /outlets/:id` (butuh `outlet.read`, peran kasir belum terbukti memegangnya), payload login (butuh login ulang, bertentangan dengan AC-13), atau menambah field ke respons `findByOutlet` (404 bila outlet belum pernah punya shift, jadi setelan tidak terbaca justru pada outlet baru). Alasan: layout sudah memakai izin `shift.read` untuk memuat shift, dan endpoint ini tidak bergantung pada ada atau tidaknya shift. (AC-11, AC-13)
- D-6: bila pemuatan setelan gagal, frontend memakai `shiftRequired = true`. Alternatif: anggap mati, atau blokir POS dengan error. Alasan: hidup adalah perilaku sekarang, dan API tetap menjadi penjaga akhir (D-8), jadi kegagalan memuat tidak membuka celah. Biayanya, kasir di outlet yang setelannya mati melihat layar buka shift sampai muat ulang berhasil. (AC-1, AC-13)
- D-7: bila setelan mati, API menyimpan `shift_id` transaksi sebagai `null` walau klien mengirim nilainya. Alternatif: tetap melampirkan shift yang dikirim. Alasan: spec menetapkan transaksi saat mati tidak dilampirkan ke shift mana pun, dan klien lama yang masih memegang shift terbuka tidak boleh mencampur data. (AC-5, AC-14)
- D-8: keputusan wajib atau tidak ada di server lewat `ShiftsService.isShiftRequired(outletId, merchantId)`, yang membaca `merchant_id` dari JWT. Katalog pelanggan membaca kolom dari baris outlet yang sudah diambil `resolveOutlet`. Alternatif: klien mengirim bendera "tanpa shift". Alasan: input klien tidak dipercaya (`CLAUDE.md`), dan katalog tidak punya JWT merchant. (AC-5, AC-6, AC-7, AC-8, AC-10)
- D-9: `getShiftStatus` mendapat field baru `shift_required`, dan getter `isShiftOpen` memakainya. Alternatif: membuat `is_open` bernilai `true` saat setelan mati. Alasan: `is_open` memang berarti shift terbuka, jadi mengubah maknanya menyesatkan pemakai lain. (AC-8, AC-10)
- D-10: setelan di frontend disimpan di singleton `useShift` bersama state shift, dimuat di layout dan POS, dan POS menandai siap setelah setelan dan shift selesai dimuat. Alternatif: menyimpan di `localStorage` (`APP_ACTIVE_OUTLET`). Alasan: nilai di `localStorage` berasal dari login dan akan basi setelah pemilik mengubah setelan, sedangkan AC-13 meminta nilai baru tanpa login ulang. (AC-11, AC-13)
- D-11: badge header, `ShiftStatus` POS, dan kartu dashboard memakai flag `shiftRequired` yang sama dengan POS. Alternatif: tiap tempat memanggil API sendiri. Alasan: satu sumber kebenaran di klien, dan menu Shift sengaja tidak disembunyikan agar riwayat tetap bisa dilihat. (AC-12)
- D-12: pilihan di halaman edit outlet berupa checkbox bernama `shift_required` dengan keterangan akibat, mengikuti pola checkbox `is_active`. Alternatif: halaman setelan terpisah. Alasan: spec meminta perubahan dari halaman edit outlet, dan penanganan error di `catch` yang ada sudah mempertahankan isian. (AC-15)
- D-13: pembukaan shift saat setelan mati ditolak di `ShiftsService.openShift` (jalur yang dipanggil controller) memakai `isShiftRequired`, dan tombol "Buka Shift" di `ShiftStatus.vue` modul shift disembunyikan lewat flag `shiftRequired`. Alternatif: hanya menyembunyikan tombol. Alasan: tombol bukan penjaga, klien lama atau permintaan langsung tetap bisa membuka shift, dan shift itu menghalangi pemilik mematikan setelan lagi. Layar `OpenShift.vue` di POS tidak muncul saat setelan mati (D-10), jadi tidak perlu diubah selain itu. Fungsi lama `open` (non-controller) tidak diubah. (AC-19, AC-20)

## Risks
- Celah balapan pada D-4: shift bisa dibuka tepat sesudah hitungan dan sebelum commit. Hasilnya outlet bernilai mati dengan satu shift terbuka. Dampaknya terbatas, karena saat mati transaksi tidak memakai shift (D-7), dan shift itu masih bisa ditutup dari menu Shift. Risiko diterima. Tes AC-4 hanya mencakup kasus berurutan.
- Fungsi lama `ShiftsService.open` tidak diberi penolakan. Pencarian `.open(` di `apps/api/src` (selain tes) tidak menemukan pemanggil di jalur shift, jadi dianggap tidak dipakai. Bila nanti dipakai, shift bisa terbuka saat setelan mati.
- Klien lama yang masih mengirim `shift_id` saat setelan mati: ditangani D-7. Terlihat lewat tes AC-5 dengan `shift_id` terisi.
- Jalur transaksi offline sengaja dilewati. Bila ia memakai `createPosTransaction`, transaksi offline tanpa shift akan ditolak 400 pada outlet hidup (AC-6). Perlu dicek saat offline sync dibahas lagi.
- Pesan "shift kasir belum dibuka" di `layouts/customer.vue` tidak boleh muncul saat setelan mati. Terlihat lewat uji manual katalog pelanggan (AC-8).
- `customer-catalog` belum punya berkas tes, jadi `customer-catalog.service.spec.ts` perlu menyiapkan mock `PrismaService`, `TransactionsService`, dan `NotificationsService` dari nol. Itu menambah pekerjaan pada task tes (AC-8, AC-9, AC-10).
- Migrasi berjalan otomatis saat deploy. SQL yang salah menggagalkan deploy dan terlihat di log deploy. Uji berkas SQL di database lokal sebelum deploy.

## Order
1. Pastikan B-1 sudah mendarat, karena B-2 memasang pengecekan di jalur bayar dan dialog kas milik B-1.
2. Schema dan migrasi: berkas SQL dan `schema.prisma`.
3. API outlets: DTO, update dengan penolakan shift terbuka. Tes lebih dulu (AC-1 sampai AC-4).
4. API shifts: endpoint setelan, `isShiftRequired`, dan penolakan `openShift`. Tes lebih dulu (AC-19).
5. API transactions: cabang hidup dan mati di `createPosTransaction` dan `payTransaction`. Tes lebih dulu (AC-5 sampai AC-7).
6. API customer-catalog: berkas tes baru lebih dulu (AC-8 sampai AC-10), lalu `createOrder` dan `getShiftStatus`.
7. Frontend: layanan dan state setelan, POS, badge, kartu dashboard, katalog pelanggan, halaman edit outlet, dan tombol Buka Shift (AC-11 sampai AC-15, AC-20).
8. Perbarui `docs/api/api-contract.md` dan `docs/database/erd.md`.
9. Verifikasi (AC-16 sampai AC-18) dan deploy API serta merchant bersamaan.
