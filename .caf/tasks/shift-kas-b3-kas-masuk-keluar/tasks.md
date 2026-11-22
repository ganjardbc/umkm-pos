# Tasks: kas masuk dan kas keluar selama shift
Mengikuti urutan di `design.md`. Tes ditulis sebelum implementasi.

## Backend Tasks
- [ ] T-1 (apps/api) Tambah `shift_cash_entries` (`findMany`, `create`) ke `mockPrisma` di `apps/api/src/shifts/shifts.service.spec.ts` dan `shifts.service.properties.spec.ts`, lalu tulis tes (gagal dulu) di blok `describe('cash entries (kas masuk/keluar)')`: `AC-1 records in/out entry for active participant`, `AC-2 rejects invalid amount/reason via DTO (0, -1, 'abc', 1.234, over max, empty reason, reason > 255)`, `AC-3 rejects closed shift`, `AC-4 rejects non-participant (403, no create)`, `AC-7 rejects when shift_required is false`, `AC-8 404 for shift of other merchant`, `AC-9 entry and audit log created in one $transaction; no entry when audit write fails`, `AC-10 getShift returns cash_entries, total_cash_in, total_cash_out, and 0/[] when none`, `AC-6 closeShift without entries equals B-1 expected/difference`. Baca kedua file spec sebelum mengubahnya. (AC-1, AC-2, AC-3, AC-4, AC-6, AC-7, AC-8, AC-9, AC-10, AC-14)
- [ ] T-2 (apps/api) Tulis tes properti di `apps/api/src/shifts/shifts.service.properties.spec.ts` (fast-check): `AC-5 expected_cash = opening + cash sales + total in - total out and cash_difference = closing - expected` untuk nominal acak 2 desimal. (AC-5, AC-14)
- [ ] T-3 (apps/api) Tambah model `shift_cash_entries` dan relasi balik di `shifts` dan `users` pada `apps/api/prisma/schema.prisma` (baca model `users` dulu), tulis `apps/api/prisma/migrations/add_shift_cash_entries.sql` (file baru, hanya `CREATE TABLE` + indeks, gaya `add_shift_cash_columns.sql`), jalankan `pnpm --filter umkm-pos-api exec prisma generate`. (AC-1, AC-9, AC-10)
- [ ] T-4 (apps/api) Buat `apps/api/src/shifts/dto/add-cash-entry.dto.ts` (`type` in/out, `amount` `IsNumber` maks 2 desimal `Min(0.01)` `Max(999999999999.99)`, `reason` `IsString` trim tidak kosong `MaxLength(255)`; gaya `close-shift.dto.ts`). (AC-2)
- [ ] T-5 (apps/api) Di `apps/api/src/shifts/shifts.service.ts`: tambah `addCashEntry` (urutan cek: 404 merchant, 400 closed, 400 `shift_required === false`, 403 bukan peserta aktif via `isActiveParticipant`; entri + `shift_audit_logs` `cash_entry_added` dalam satu `$transaction`, pola `addParticipant`); perluas `closeShift` menjumlahkan entri in/out dalam `$transaction` yang sama dengan `round2`; perluas `getShift` dengan `cash_entries`, `total_cash_in`, `total_cash_out`. Jangan ubah `queryShifts`. (AC-1, AC-3, AC-4, AC-5, AC-6, AC-7, AC-8, AC-9, AC-10)
- [ ] T-6 (apps/api) Di `apps/api/src/shifts/shifts.controller.ts` tambah `POST :id/cash-entries` dengan `@RequirePermission('shift.update')`, `@ApiResponse` 201/400/403/404, memanggil `addCashEntry` dengan `merchant_id` dan `id` dari `@CurrentUser`. (AC-1, AC-4, AC-8)
- [ ] T-7 (apps/api) Jalankan `pnpm --filter umkm-pos-api lint:ci` dan `pnpm --filter umkm-pos-api test` sampai exit 0. (AC-13, AC-14)

## Frontend Tasks
- [ ] T-8 (apps/merchant) Tambah `addCashEntry(shiftId, data)` (POST `/api/v1/shifts/:id/cash-entries`) di `apps/merchant/src/modules/shift/services/api.ts`. (AC-11)
- [ ] T-9 (apps/merchant) Buat `CashEntryDialog.vue` (jenis masuk/keluar, nominal `InputNumber`, alasan maks 255; error API ditampilkan lewat `getErrorMessage` dan isian tidak dihapus, pola `CashDialog.vue`) dan daftar entri (waktu, jenis, nominal, alasan, pencatat) di `apps/merchant/src/modules/shift/components/`. (AC-11)
- [ ] T-10 (apps/merchant) Pasang di `apps/merchant/src/modules/shift/pages/detail.vue`: tombol "Catat Kas" hanya bila `status === 'open'`, `isHasPermission` `shift.update` (baca `services/constants.ts`), dan `getOutletShiftSetting(outlet_id)` bukan `false`; muat ulang detail setelah sukses. (AC-11)
- [ ] T-11 (apps/merchant) Perbarui `apps/merchant/src/modules/shift/components/CashDialog.vue` (baris Kas Masuk dan Kas Keluar; Penjualan Tunai = `expected_cash - opening_cash - total_cash_in + total_cash_out`) dan `Information.vue` (total masuk/keluar). Kas diharapkan tetap tidak tampil sebelum tutup. (AC-12)
- [ ] T-12 (apps/merchant) Jalankan `pnpm --filter @umkm-pos/merchant build` sampai exit 0. (AC-15)

## Docs Tasks
- [ ] T-13 (docs) Perbarui `docs/api/api-contract.md` (endpoint `POST /shifts/:id/cash-entries`, field respons detail, rumus `expected_cash` baru, aturan error) dan `docs/database/erd.md` (tabel `shift_cash_entries`, relasi dari `shifts` dan `users`, berkas migrasi). Hapus klaim lama bahwa `expected_cash = opening_cash + SUM(...)` saja. (AC-5, AC-10)

## Verification Tasks
- [ ] T-14 (apps/merchant) Uji manual AC-11: buka shift, catat masuk dan keluar, matikan API lalu ulangi (error tampil, isian tetap), tutup shift dan matikan setelan outlet, cek tombol hilang. (AC-11)
- [ ] T-15 (apps/merchant) Uji manual AC-12: catat entri, tutup shift, cocokkan ringkasan dengan rumus AC-5; pastikan kas diharapkan tidak tampil sebelum kas akhir dikirim. (AC-12)

## Coverage
- AC-1: T-1, T-3, T-5, T-6
- AC-2: T-1, T-4
- AC-3: T-1, T-5
- AC-4: T-1, T-5, T-6
- AC-5: T-2, T-5, T-13
- AC-6: T-1, T-5
- AC-7: T-1, T-5
- AC-8: T-1, T-5, T-6
- AC-9: T-1, T-3, T-5
- AC-10: T-1, T-3, T-5, T-13
- AC-11: T-8, T-9, T-10, T-14
- AC-12: T-11, T-15
- AC-13: T-7
- AC-14: T-1, T-2, T-7
- AC-15: T-12
