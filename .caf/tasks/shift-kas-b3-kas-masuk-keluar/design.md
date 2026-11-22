# Design: kas masuk dan kas keluar selama shift

## Context
- Finding: perubahan menambah tabel (schema + migrasi) dan mengubah kontrak respons antara `apps/api` dan `apps/merchant`; dua dari tiga kriteria `caf-design` terpenuhi (schema/migrasi, kontrak antar layer, dan lebih dari satu app).
- Finding: `closeShift` berjalan dalam `$transaction`: menutup shift dulu, lalu `transactions.aggregate`, lalu menyimpan `expected_cash`/`cash_difference` dengan `round2`, lalu `shift_audit_logs.create` (`apps/api/src/shifts/shifts.service.ts`).
- Finding: `getShift` membentuk respons field demi field dan dipakai oleh `openShift`, `closeShift`, `handoffShift`, serta endpoint `GET /shifts/:id` (`apps/api/src/shifts/shifts.service.ts`, `shifts.controller.ts`).
- Finding: `isActiveParticipant(shiftId, userId)` dan `isShiftRequired(outletId, merchantId)` sudah ada di `ShiftsService`; `resolveCashierForPos` menolak non-peserta dengan 403 (`apps/api/src/transactions/transactions.service.ts`).
- Finding: `shifts.controller.ts` memakai `@RequirePermission('shift.update')` untuk aksi tulis dan `shift.read` untuk baca.
- Finding: `shift_audit_logs.user_id` wajib (FK ke `users`), `action` `VARCHAR(50)`, `action_details` JSON (`apps/api/prisma/schema.prisma`).
- Finding: `CashDialog.vue` menghitung "Penjualan Tunai" di ringkasan tutup sebagai `expected_cash - opening_cash`; rumus ini salah setelah ada entri kas (`apps/merchant/src/modules/shift/components/CashDialog.vue`).
- Finding: `detail.vue` memuat `getDetailShift` lalu `Information` dan `MetricsDisplay`; `useShift.ts` memakai `getOutletShiftSetting` untuk `shiftRequired` (`apps/merchant/src/modules/shift/`).
- Finding: migrasi berupa SQL lepas di `apps/api/prisma/migrations` (contoh `add_shift_cash_columns.sql`), dan `docs/api/api-contract.md` serta `docs/database/erd.md` memuat bagian shift.

## Approach
Backend (`apps/api`):
1. Tabel baru `shift_cash_entries` + model Prisma + relasi dari `shifts` dan `users`.
2. `ShiftsService.addCashEntry(shiftId, userId, merchantId, dto)`: scope merchant lewat outlet (404 bila bukan), tolak shift bukan `open` (400), tolak outlet `shift_required === false` (400), tolak non-peserta aktif via `isActiveParticipant` (403), lalu dalam satu `$transaction` buat entri dan `shift_audit_logs` (`cash_entry_added`).
3. `closeShift`: di `$transaction` yang sama, setelah agregasi penjualan tunai, jumlahkan entri `in` dan `out` shift itu, `expected = round2(opening + sales + in - out)`; sisanya tidak berubah.
4. `getShift` menambah `cash_entries`, `total_cash_in`, `total_cash_out` (dihitung dari entri, 0 dan `[]` bila tidak ada). Karena `openShift`, `closeShift`, `handoffShift` memakai `getShift`, ringkasan setelah tutup ikut tanpa kode tambahan.
5. Controller: `POST /shifts/:id/cash-entries` dengan `shift.update`.

Frontend (`apps/merchant`), setelah backend:
1. `addCashEntry` di `services/api.ts`.
2. Komponen dialog catat kas (jenis, nominal, alasan; error ditampilkan, isian tetap) dan daftar entri; dipasang di `detail.vue`. Tombol tampil hanya bila status `open`, pengguna punya `shift.update`, dan `getOutletShiftSetting` bukan `false`.
3. `CashDialog.vue` ringkasan tutup: tambah baris kas masuk dan kas keluar, dan "Penjualan Tunai" = `expected_cash - opening_cash - total_cash_in + total_cash_out`. `Information.vue` menampilkan total masuk/keluar.

Docs: `docs/api/api-contract.md` dan `docs/database/erd.md`.

## Contracts
- Tabel `shift_cash_entries`: `id CHAR(36) PK`, `shift_id CHAR(36) FK -> shifts (ON DELETE CASCADE)`, `type VARCHAR(10)` (`in` | `out`), `amount DECIMAL(14,2) NOT NULL`, `reason VARCHAR(255) NOT NULL`, `created_by CHAR(36) FK -> users`, `created_at TIMESTAMP`; indeks `shift_id`. (AC-1, AC-9, AC-10)
- `POST /shifts/:id/cash-entries`, izin `shift.update`, body `{ type: 'in' | 'out', amount: number, reason: string }`. `amount` angka > 0, maks 2 desimal, maks 999999999999.99; `reason` tidak kosong setelah trim, maks 255. Respons 201: entri `{ id, shift_id, type, amount, reason, created_by, created_by_name, created_at }`. Error: 400 validasi / shift closed / setelan mati, 403 bukan peserta aktif atau tanpa izin, 404 shift bukan milik merchant. (AC-1, AC-2, AC-3, AC-4, AC-7, AC-8)
- Respons detail shift (`POST /shifts`, `GET /shifts/:id`, `PATCH /shifts/:id/close`, handoff) menambah `cash_entries: [{ id, type, amount, reason, created_by, created_by_name, created_at }]` urut `created_at` naik, `total_cash_in`, `total_cash_out`. Item `GET /shifts` tidak berubah. (AC-10, AC-12)
- `expected_cash` setelah close = `opening_cash + penjualan tunai + total_cash_in - total_cash_out`, `cash_difference = closing_cash - expected_cash`, pembulatan dua desimal. (AC-5, AC-6)
- `shift_audit_logs.action = 'cash_entry_added'`, `action_details = { entry_id, type, amount }`, `user_id` = pencatat. (AC-9)
- Tidak ada perubahan `@umkm-pos/shared-types` (field kas shift tidak ada di sana; tidak dibuktikan, jadi tidak disentuh). (AC-10)

## Data and migration
- Satu berkas baru `apps/api/prisma/migrations/add_shift_cash_entries.sql`: `CREATE TABLE` saja, tanpa perubahan tabel lain; shift lama otomatis tanpa entri (total 0). (AC-10)
- `schema.prisma` diperbarui sama persis (model `shift_cash_entries`, relasi balik pada `shifts` dan `users`), lalu `prisma generate`.
- Urutan deploy: jalankan SQL, lalu deploy API, lalu deploy merchant. Frontend lama tetap jalan karena field baru hanya tambahan. Shift yang sudah closed tidak dihitung ulang. (AC-5, AC-6)

## Decisions
- D-1: entri disimpan di tabel baru, bukan di `shift_audit_logs`; alternatif memakai audit log sebagai sumber ditolak karena JSON sulit dijumlahkan dan memang bukan data transaksional. (AC-1, AC-5)
- D-2: total dihitung dari entri saat dibaca/ditutup, tidak ada kolom total di `shifts`; alternatif kolom agregat ditolak agar tidak ada dua sumber kebenaran. Hasil tutup tetap snapshot di `expected_cash`. (AC-5, AC-10)
- D-3: non-peserta ditolak 403 mengikuti `resolveCashierForPos`; shift closed dan setelan mati 400. Urutan cek: 404 merchant, 400 closed, 400 setelan mati, 403 peserta. (AC-3, AC-4, AC-7, AC-8)
- D-4: tanpa endpoint ubah/hapus/daftar terpisah; daftar lewat detail shift. Jawaban Q-3 (a) dan efisiensi. (AC-1, AC-10)
- D-5: "Penjualan Tunai" di ringkasan tutup diturunkan di klien dari field respons, tidak ada field `cash_sales` baru. (AC-12)

## Risks
- Entri dan tutup shift bersamaan: `closeShift` menutup status dulu, tetapi `addCashEntry` membaca status tanpa kunci baris, sehingga entri bisa terselip setelah penjumlahan. Risiko kecil, sama dengan balapan penjualan di B-1; dapat dikurangi dengan membaca status dalam `$transaction` entri. Tes `shifts.service.spec.ts` hanya memverifikasi urutan dengan mock, bukan konkurensi nyata. (AC-3, AC-5)
- Mock Prisma di dua spec belum punya `shift_cash_entries`; tes lama gagal sampai mock ditambah. Terlihat saat `pnpm --filter umkm-pos-api test`. (AC-14)
- Lupa `prisma generate` membuat build backend gagal; terlihat di lint/test. (AC-13, AC-14)
- Baris "Penjualan Tunai" lama di `CashDialog.vue` salah bila tidak diperbarui; hanya terlihat lewat uji manual. (AC-12)

## Order
1. Tes backend (spec dan properties) lebih dulu.
2. Schema Prisma + migrasi SQL + `prisma generate`.
3. DTO, service (`addCashEntry`, `getShift`, `closeShift`), controller.
4. Lint dan tes backend hijau.
5. Frontend (api, dialog, daftar, ringkasan) lalu build.
6. Docs, lalu verifikasi manual.
