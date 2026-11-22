# Design: Kas awal, kas akhir, dan selisih pada shift

## Context
Kriteria yang berlaku: (1) perubahan menyentuh lebih dari satu app (`apps/api` dan `apps/merchant`), (2) menambah schema dan migrasi, (3) mengubah kontrak antar layer (body dan respons endpoint shift dan pembayaran).

- Finding: tabel `shifts` tidak punya kolom kas dan tabel `transactions` tidak mencatat shift tempat uang diterima (`apps/api/prisma/schema.prisma`).
- Finding: `openShift` dan `closeShift` ada di `apps/api/src/shifts/shifts.service.ts`. `closeShift` memakai beberapa panggilan Prisma terpisah, tanpa `$transaction` (update status, tandai peserta keluar, tulis audit log).
- Finding: `getShift` dan `queryShifts` membentuk objek respons secara manual, field demi field. Hanya `findByOutlet` mengembalikan seluruh baris shift (`apps/api/src/shifts/shifts.service.ts`). Field baru tidak muncul otomatis di dua yang pertama.
- Finding: `CreateShiftDto` hanya `outlet_id` dan `CloseShiftDto` kosong. Controller tutup shift tidak menerima body (`apps/api/src/shifts/shifts.controller.ts`).
- Finding: status pembayaran `payment_method` hanya diubah di dua tempat: `createPosTransaction` (bayar langsung atau `pending`) dan `payTransaction` (`apps/api/src/transactions/transactions.service.ts`). `updateStatus` menerima field pembayaran di DTO-nya tetapi tidak menyimpannya.
- Finding: `resolveCashierForPos` memvalidasi shift terbuka, peserta aktif, dan outlet milik merchant. Fungsi ini dipakai pembuatan transaksi POS, bukan `payTransaction` (`apps/api/src/transactions/transactions.service.ts`).
- Finding: ada dua tempat membuka shift di frontend: `apps/merchant/src/modules/transaction/components/OpenShift.vue` dan `handleOpenShift` di `apps/merchant/src/modules/shift/components/ShiftStatus.vue`. Menutup shift hanya di `handleCloseShift` pada berkas yang sama.
- Finding: ada dua tempat membayar pesanan bayar-nanti: `confirmPayment` di `apps/merchant/src/modules/transaction/pages/index.vue` dan `onPayTransaction` di `apps/merchant/src/modules/transaction/pages/detail.vue`. Keduanya memanggil `patchTransactionPay` tanpa `shift_id`. Pembayaran langsung ada di `apps/merchant/src/modules/transaction/components/Cart.vue` dan sudah mengirim `shift_id`.
- Finding: layout utama memuat shift outlet dan pesertanya ke state bersama `useShift` (`apps/merchant/src/layouts/default.vue`, `apps/merchant/src/modules/shift/composables/useShift.ts`), sehingga `currentShift.id` tersedia di halaman transaksi.
- Finding: berkas migrasi di `apps/api/prisma/migrations` berupa `.sql` lepas dengan `migration_lock.toml`. `apps/api/Dockerfile` hanya menjalankan `prisma generate`, dan `apps/api/migrations/MIGRATION_GUIDE.md` menyebut `npx prisma migrate deploy`.
- Finding: `docs/api/api-contract.md` menulis `POST /shifts/:id/close`, sedangkan controller memakai `PATCH`.
- Finding: berkas `.sql` di `apps/api/prisma/migrations` dijalankan otomatis saat deploy (jawaban pemilik repo, bukan dari berkas yang kubaca). Deploy memakai `deploy.sh all`.
- TODO: bentuk JSON kolom `Decimal` di respons. Dugaan: string, karena frontend memakai `Number(item.price)` di `Cart.vue`. Belum dikonfirmasi di respons nyata.

## Approach
Backend (`apps/api`):
1. Schema: empat kolom kas di `shifts`, satu kolom `paid_shift_id` di `transactions`.
2. Modul `shifts`: buka shift menerima dan menyimpan kas awal. Tutup shift menerima kas akhir, lalu dalam satu `$transaction` menutup shift, menghitung kas yang diharapkan dan selisih, dan menyimpannya sebagai snapshot.
3. Modul `transactions`: pembayaran langsung mengisi `paid_shift_id` dengan shift pembuatnya. `payTransaction` menerima `shift_id`, memvalidasinya dengan aturan yang sama seperti pembuatan transaksi POS, lalu mengisi `paid_shift_id`.

Frontend (`apps/merchant`):
1. Satu komponen dialog kas dipakai dua tempat buka shift dan satu tempat tutup shift.
2. Setelah tutup shift, ringkasan kas ditampilkan dari respons tutup shift.
3. Detail dan riwayat shift menampilkan kolom kas, dengan "-" bila kosong.
4. Dua tempat bayar-nanti mengirim `shift_id` dari `currentShift.id`.

Alur tutup shift (Backend), berurutan dalam satu `$transaction`:
1. Validasi shift milik merchant dan belum closed.
2. Ubah status menjadi closed (menghentikan transaksi baru ke shift ini).
3. Jumlahkan `total_amount` transaksi dengan `paid_shift_id` = shift ini, `payment_method` = `cash`, dan `is_cancelled` = false.
4. Hitung kas yang diharapkan (kas awal ditambah jumlah itu) dan selisih (kas akhir dikurangi kas yang diharapkan).
5. Simpan kas akhir, kas yang diharapkan, dan selisih; tandai peserta keluar; tulis audit log.

## Contracts
- `POST /api/v1/shifts`. Sebelum: `{ outlet_id }`. Sesudah: `{ outlet_id, opening_cash }`, `opening_cash` wajib, angka 0 atau lebih, maksimal dua desimal. Selain itu ditolak 400. (AC-1, AC-2, AC-3)
- `PATCH /api/v1/shifts/:id/close`. Sebelum: tanpa body. Sesudah: `{ closing_cash }`, wajib, angka 0 atau lebih, maksimal dua desimal. Respons berisi detail shift lengkap dengan kolom kas. Shift yang sudah closed tetap ditolak 400 tanpa mengubah kas. (AC-4, AC-5, AC-8, AC-10)
- Respons shift dari `getShift`, `queryShifts`, dan `findByOutlet`. Sebelum: tanpa kolom kas. Sesudah: ditambah `opening_cash`, `closing_cash`, `expected_cash`, `cash_difference`. Shift lama bernilai null. Pada shift yang masih open, `closing_cash`, `expected_cash`, dan `cash_difference` bernilai null, sehingga kasir tidak melihat kas yang diharapkan sebelum menutup shift. (AC-1, AC-4, AC-10, AC-12, AC-14)
- `PATCH /api/v1/transactions/:id/pay`. Sebelum: `{ payment_method, cash_received?, change_amount?, is_offline? }`. Sesudah: ditambah `shift_id`. Wajib bila `payment_method` = `cash`; ditolak 400 bila hilang, dan ditolak bila shift tidak terbuka atau pengguna bukan peserta aktif. Bila `payment_method` bukan tunai, `shift_id` opsional dan tidak memengaruhi kas. (AC-7, AC-8, AC-9, AC-15)
- `POST /api/v1/transactions` (bayar langsung). Request tidak berubah. Server mengisi `paid_shift_id` dengan `shift_id` bila `payment_method` bukan `pending`, dan membiarkannya kosong bila `pending`. (AC-6, AC-7)
- Schema `shifts`: tambah `opening_cash`, `closing_cash`, `expected_cash`, `cash_difference`, semuanya `DECIMAL(14,2)` nullable (sama dengan kolom uang di `transactions`). `cash_difference` boleh negatif. (AC-1, AC-4, AC-10, AC-12)
- Schema `transactions`: tambah `paid_shift_id` `CHAR(36)` nullable, foreign key ke `shifts(id)` tanpa cascade, dengan indeks. (AC-6, AC-7, AC-8)
- Tipe `Currentshift` di `apps/merchant/src/modules/shift/composables/useShift.ts`: tambah empat field kas opsional. (AC-12, AC-14)
- `closeShift` di `apps/merchant/src/modules/shift/services/api.ts`: sebelum `(id)`, sesudah `(id, { closing_cash })`. `openShift` menerima `opening_cash` di body. (AC-13, AC-14)
- `patchTransactionPay`: dua pemanggil mengirim `shift_id`. (AC-15)

## Data and migration
- Satu berkas SQL baru di `apps/api/prisma/migrations`, mengikuti konvensi berkas `.sql` lepas yang ada, berisi: empat kolom nullable di `shifts`, `paid_shift_id` beserta foreign key dan indeks di `transactions`. `apps/api/prisma/schema.prisma` diperbarui senada. (AC-1, AC-4, AC-6)
- Backfill: untuk transaksi yang sudah dibayar (`payment_method` bukan `pending`) dan punya `shift_id`, isi `paid_shift_id` dengan `shift_id`. Pernyataan ini aman dijalankan ulang. Transaksi `pending` dibiarkan kosong. (AC-6, AC-7)
- Shift lama: empat kolom kas tetap null dan tampil "-". Tidak ada backfill kas untuk shift lama. (AC-12)
- Kompatibilitas: kolom baru nullable, jadi kode lama mengabaikannya dan rollback kode tidak butuh rollback data.
- Urutan deploy: migrasi, lalu API dan merchant bersamaan. Frontend lama tidak mengirim kas awal, kas akhir, atau `shift_id` pada pembayaran bayar-nanti tunai, sehingga ketiganya ditolak 400 oleh API baru. Karena itu API dan merchant dideploy bersamaan (`deploy.sh all`) dan jendela ketidakcocokan dibuat sesingkat mungkin. (AC-3, AC-5, AC-9)
- Tutup shift menjadi atomik dengan `$transaction`, tanpa efek ke data lama. (AC-4, AC-10)

## Decisions
- D-1: kas yang diharapkan dan selisih disimpan sebagai snapshot saat shift ditutup, bukan dihitung ulang setiap dibaca. Alternatif: hitung saat dibaca. Alasan: riwayat tidak berubah bila transaksi dibatalkan setelah shift ditutup, dan shift yang masih open otomatis tidak punya angka itu, sehingga kasir tidak melihat angka sistem sebelum mengisi kas akhir. (AC-4, AC-10, AC-12, AC-14)
- D-2: tambah `transactions.paid_shift_id` dan biarkan `shift_id` tetap sebagai shift pembuat. Alternatif: menimpa `shift_id` saat dibayar. Alasan: `shift_id` dipakai untuk hitungan transaksi per shift dan per peserta di `getShift`, jadi menimpanya mengubah angka itu. Alternatif lain, menebak lewat `updated_at`, tidak andal. (AC-6, AC-7, AC-8)
- D-3: klien mengirim `shift_id` ke endpoint bayar, dan server memvalidasinya dengan aturan pembuatan transaksi (shift open, peserta aktif, outlet milik merchant). Alternatif: server menentukan shift pengguna sendiri. Alasan: seorang pengguna bisa menjadi peserta di lebih dari satu shift terbuka, jadi server bisa salah menebak, dan Cart sudah memakai pola yang sama. (AC-7, AC-9, AC-15)
- D-4: tutup shift dibungkus satu `$transaction`, dengan urutan ubah status ke closed lebih dulu, baru jumlahkan kas. Alternatif: tetap beberapa panggilan terpisah. Alasan: saat ini kegagalan di tengah bisa menyisakan shift closed tanpa kas, dan menutup status lebih dulu menghentikan transaksi baru masuk ke shift yang sedang dijumlahkan. (AC-4, AC-6, AC-8, AC-10)
- D-5: penjumlahan hanya `payment_method` = `cash`, `is_cancelled` = false, `paid_shift_id` = shift ini, memakai `total_amount`. Alternatif: memakai `cash_received`. Alasan: `cash_received` termasuk uang kembalian yang dikembalikan ke pelanggan, dan API sudah memastikan kembalian sama dengan uang diterima dikurangi total (`apps/api/src/transactions/transactions.service.ts`). (AC-6, AC-8)
- D-6: kas awal dan kas akhir divalidasi di DTO dengan aturan angka, minimal 0, dua desimal, dan batas atas sesuai `DECIMAL(14,2)`. Alternatif: validasi manual di service. Alasan: sesuai pola DTO yang ada dan menghasilkan 400 seragam. (AC-2, AC-3, AC-5)
- D-7: satu komponen dialog kas di `apps/merchant/src/modules/shift/components/` dipakai dua tempat buka shift dan satu tempat tutup shift. Alternatif: form terpisah di tiap tempat. Alasan: dua tempat buka shift sudah ada, dan memisahkannya akan membuat validasi dan teks berbeda. (AC-13, AC-14)
- D-8: ringkasan setelah tutup shift diambil dari respons tutup shift, tanpa permintaan tambahan. Alternatif: memuat ulang detail shift. Alasan: respons sudah memuat semua angka, dan shift yang baru ditutup tidak lagi terambil sebagai shift aktif oleh `findByOutlet`. (AC-14)

## Risks
- Jendela deploy: API baru dengan frontend lama membuat buka shift, tutup shift, dan bayar-nanti tunai gagal 400. Terlihat lewat uji manual setelah deploy (AC-13, AC-14, AC-15) dan kegagalan di log API.
- Balapan tutup shift dan transaksi tunai baru: pemeriksaan shift terbuka dan penyisipan transaksi bukan satu transaksi database, jadi satu transaksi bisa lolos tepat saat shift ditutup dan tidak terhitung di snapshot. Terlihat dengan tes yang memanggil bayar dan tutup bergantian (AC-6). Risikonya diterima, mengingat transaksi baru sudah ditolak setelah status closed.
- Pembatalan atau refund setelah shift ditutup tidak mengubah snapshot. Ini sesuai D-1, tapi owner bisa menemukan selisih yang tidak berubah. Refund tunai ada di luar scope.
- Bentuk JSON `Decimal` belum dipastikan. Bila berupa string, frontend perlu mengonversi sebelum menghitung. Terlihat saat menjalankan layar ringkasan kas (AC-14).
- Pipa validasi global kustom (`apps/api/src/common/pipes/validation.pipe.ts`) belum kubaca, jadi perilaku menolak nilai bukan angka dan nilai berlebih belum terbukti. Terlihat lewat tes AC-2, AC-3, dan AC-5.
- Backfill salah bila ada transaksi dibayar yang `shift_id`-nya bukan shift tempat uang diterima. Itu hanya terjadi pada pesanan bayar-nanti lama, yang tidak bisa direkonstruksi, dan diterima.
- Migrasi berjalan otomatis saat deploy, jadi SQL yang salah menggagalkan deploy dan terlihat di log deploy. Uji berkas SQL di database lokal sebelum deploy.

## Order
1. Schema dan migrasi: berkas SQL dan `schema.prisma`.
2. API shifts: DTO, buka shift, tutup shift atomik, bentuk respons. Tes lebih dulu (AC-1 sampai AC-5, AC-8, AC-10).
3. API transactions: `paid_shift_id` di pembayaran langsung dan `payTransaction`. Tes lebih dulu (AC-6 sampai AC-9).
4. Frontend: tipe, layanan API, dialog kas, buka dan tutup shift, tampilan detail dan riwayat, dua pemanggil bayar-nanti (AC-12 sampai AC-15).
5. Perbarui `docs/api/api-contract.md` (termasuk perbaikan `PATCH` untuk tutup shift) dan `docs/database/erd.md`.
6. Verifikasi (AC-16 sampai AC-18) dan deploy API serta merchant bersamaan.
