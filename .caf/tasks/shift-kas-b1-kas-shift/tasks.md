# Tasks: Kas awal, kas akhir, dan selisih pada shift

Urutan mengikuti `## Order` di `design.md`. Tes ditulis sebelum implementasi yang diuji.

## Backend Tasks

- [ ] (apps/api) T-1: Tambah berkas SQL migrasi baru di `apps/api/prisma/migrations` (mengikuti berkas `.sql` lepas yang ada): empat kolom `DECIMAL(14,2)` nullable di `shifts` (`opening_cash`, `closing_cash`, `expected_cash`, `cash_difference`), `transactions.paid_shift_id` `CHAR(36)` nullable dengan foreign key ke `shifts(id)` tanpa cascade dan indeks, serta backfill `paid_shift_id = shift_id` untuk transaksi `payment_method` bukan `pending` yang punya `shift_id` (aman diulang). Perbarui `apps/api/prisma/schema.prisma` senada lalu jalankan `prisma generate`. Uji SQL di database lokal. (AC-1, AC-4, AC-6, AC-7, AC-12)
- [ ] (apps/api) T-2: Tulis tes dulu di `apps/api/src/shifts/shifts.service.spec.ts`: buka shift dengan kas awal valid tersimpan (AC-1); kas awal negatif atau bukan angka ditolak 400 dan shift tidak dibuat (AC-2); kas awal hilang ditolak 400 (AC-3); tutup shift dengan kas akhir valid menghasilkan status closed, kas akhir tersimpan, respons memuat kas diharapkan dan selisih (AC-4); kas akhir hilang atau negatif ditolak 400 dan shift tetap open (AC-5); kas akhir berbeda dari diharapkan tetap menutup shift dan menyimpan selisih (AC-10); tutup shift yang sudah closed ditolak 400 tanpa mengubah kas (AC-11). Validasi 400 diuji lewat DTO dengan pipa validasi global di `apps/api/src/common/pipes/validation.pipe.ts` (baca berkas itu sebelum menulis tes). (AC-1, AC-2, AC-3, AC-4, AC-5, AC-10, AC-11)
- [ ] (apps/api) T-3: Tulis tes properti dulu di `apps/api/src/shifts/shifts.service.properties.spec.ts`: untuk campuran transaksi tunai, non-tunai, batal, dan belum dibayar yang dibayar langsung di shift itu, kas diharapkan = kas awal + jumlah `total_amount` transaksi tunai tidak batal. (AC-6)
- [ ] (apps/api) T-4: Implementasi modul shifts di `apps/api/src/shifts`: `opening_cash` di `CreateShiftDto` dan `closing_cash` di `CloseShiftDto` (wajib, angka, minimal 0, maksimal dua desimal, batas atas sesuai `DECIMAL(14,2)`); controller tutup shift (`PATCH /shifts/:id/close`) menerima body; `openShift` menyimpan kas awal; `closeShift` dibungkus satu `$transaction` dengan urutan: validasi milik merchant dan belum closed, ubah status ke closed, jumlahkan `total_amount` transaksi `paid_shift_id` = shift ini, `payment_method` = `cash`, `is_cancelled` = false, hitung kas diharapkan dan selisih, simpan snapshot, tandai peserta keluar, tulis audit log. `getShift`, `queryShifts`, dan `findByOutlet` memuat empat kolom kas (null bila shift lama atau masih open untuk tiga kolom hasil tutup). Respons tutup shift berisi detail shift lengkap dengan kolom kas. (AC-1, AC-2, AC-3, AC-4, AC-5, AC-6, AC-10, AC-11, AC-12, AC-14)
- [ ] (apps/api) T-5: Tulis tes dulu di `apps/api/src/transactions/transactions.service.spec.ts` untuk `payTransaction` dan pembayaran langsung: pesanan bayar-nanti dibuat di shift A lalu dibayar tunai di shift B masuk `paid_shift_id` shift B dan tidak ke shift A (AC-7); pembayaran non-tunai tidak mengubah kas diharapkan shift (AC-8); pembayaran tunai tanpa `shift_id`, tanpa shift terbuka, atau oleh kasir bukan peserta aktif ditolak, pesanan tetap belum dibayar, kas tidak berubah (AC-9); pembayaran langsung mengisi `paid_shift_id` dengan shift pembuat, `pending` dibiarkan kosong (AC-6, AC-7). (AC-6, AC-7, AC-8, AC-9)
- [ ] (apps/api) T-6: Implementasi modul transactions di `apps/api/src/transactions`: `createPosTransaction` mengisi `paid_shift_id` = `shift_id` bila `payment_method` bukan `pending`; `PayTransactionDto` menambah `shift_id` (wajib bila `payment_method` = `cash`, opsional bila non-tunai); `payTransaction` memvalidasi shift dengan aturan yang sama seperti `resolveCashierForPos` (shift terbuka, peserta aktif, outlet milik merchant) lalu mengisi `paid_shift_id`; non-tunai tidak memengaruhi kas. Baca `resolveCashierForPos` sebelum memakainya ulang. (AC-6, AC-7, AC-8, AC-9, AC-15)

## Frontend Tasks

- [ ] (apps/merchant) T-7: Di `apps/merchant/src/modules/shift/composables/useShift.ts` tambah empat field kas opsional ke tipe `Currentshift`; di `apps/merchant/src/modules/shift/services/api.ts` ubah `closeShift` menjadi `(id, { closing_cash })` dan `openShift` menerima `opening_cash` di body. Baca berkas itu sebelum mengubah. Bentuk JSON `Decimal` (string atau angka) dikonversi dengan `Number(...)` sebelum dihitung atau ditampilkan. (AC-12, AC-13, AC-14)
- [ ] (apps/merchant) T-8: Buat satu komponen dialog kas di `apps/merchant/src/modules/shift/components/` (input angka wajib, minimal 0, mode buka dan mode tutup; mode tutup tidak menampilkan kas diharapkan; kegagalan API menampilkan pesan error tanpa menutup form). Pakai di `apps/merchant/src/modules/transaction/components/OpenShift.vue`, `handleOpenShift` dan `handleCloseShift` di `apps/merchant/src/modules/shift/components/ShiftStatus.vue`. Setelah tutup shift, tampilkan ringkasan kas awal, penjualan tunai, kas diharapkan, kas akhir, selisih dari respons tutup shift tanpa permintaan tambahan. (AC-13, AC-14)
- [ ] (apps/merchant) T-9: Tampilkan kolom kas di detail dan riwayat shift di `apps/merchant/src/modules/shift`, dengan "-" bila nilai kosong. Baca halaman detail dan riwayat shift sebelum mengubah. (AC-12, AC-14)
- [ ] (apps/merchant) T-10: Kirim `shift_id` dari `currentShift.id` (state `useShift`) pada `patchTransactionPay` di `confirmPayment` (`apps/merchant/src/modules/transaction/pages/index.vue`) dan `onPayTransaction` (`apps/merchant/src/modules/transaction/pages/detail.vue`). (AC-15)

## Documentation Tasks

- [ ] (docs) T-11: Perbarui `docs/api/api-contract.md`: `POST /shifts` dengan `opening_cash`; tutup shift memakai `PATCH /shifts/:id/close` (perbaiki dari `POST`) dengan body `closing_cash` dan respons berisi kolom kas; empat field kas di respons shift; `PATCH /transactions/:id/pay` dengan `shift_id`. Perbarui `docs/database/erd.md`: empat kolom kas di `shifts` dan `transactions.paid_shift_id` beserta relasinya ke `shifts`. (AC-1, AC-4, AC-7, AC-9; dokumentasi kontrak dan schema sesuai design.md Order langkah 5)

## Verification Tasks

- [ ] (apps/api) T-12: Jalankan `pnpm --filter umkm-pos-api lint:ci` dan `pnpm --filter umkm-pos-api test`. (AC-16, AC-17)
- [ ] (apps/merchant) T-13: Jalankan `pnpm --filter @umkm-pos/merchant build`, lalu uji manual AC-12 sampai AC-15 sesuai langkah `Verify:` di `requirements.md`. (AC-12, AC-13, AC-14, AC-15, AC-18)

## Coverage

- AC-1: T-1, T-2, T-4, T-11
- AC-2: T-2, T-4
- AC-3: T-2, T-4
- AC-4: T-1, T-2, T-4, T-11
- AC-5: T-2, T-4
- AC-6: T-1, T-3, T-4, T-5, T-6
- AC-7: T-1, T-5, T-6, T-11
- AC-8: T-5, T-6
- AC-9: T-5, T-6, T-11
- AC-10: T-2, T-4
- AC-11: T-2, T-4
- AC-12: T-1, T-4, T-7, T-9, T-13
- AC-13: T-7, T-8, T-13
- AC-14: T-4, T-7, T-8, T-9, T-13
- AC-15: T-6, T-10, T-13
- AC-16: T-12
- AC-17: T-12
- AC-18: T-13
