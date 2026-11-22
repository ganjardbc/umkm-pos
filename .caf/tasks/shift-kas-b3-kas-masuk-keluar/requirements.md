# Kas masuk dan kas keluar selama shift
Status: DRAFT
Source: chat (breakdown `.caf/tasks/shift-kas/breakdown.md`, item B-3, bagian "Left out")

## 1. Outcome
Selama shift terbuka, kasir bisa mencatat uang yang masuk ke laci di luar penjualan (kas masuk) dan uang yang keluar dari laci (kas keluar), dengan alasan. Angka itu ikut menghitung kas yang diharapkan dan selisih saat shift ditutup, sehingga selisih tidak lagi salah karena pengeluaran kecil atau tambahan modal yang tidak tercatat.

## 2. Scope
In:
- Pencatatan kas masuk dan kas keluar pada shift yang terbuka.
- Pengaruhnya ke kas yang diharapkan dan selisih yang disimpan saat shift ditutup.
- Daftar dan total kas masuk/keluar di detail shift dan di ringkasan kas setelah tutup shift.
- Aturan siapa yang boleh mencatat, dan perilaku saat setelan buka/tutup kasir outlet mati.

Out:
- Kas awal dan kas akhir (B-1), setelan shift opsional (B-2): aturannya tidak diubah.
- Laporan atau dashboard kas lintas shift, ekspor.
- Kas awal otomatis dari kas akhir shift sebelumnya.
- Peserta dan handoff opsional.
- Refund tunai atas transaksi.
- Perubahan di `apps/admin`.

## 3. Constraints and Assumptions
- Constraint: semua query dibatasi `merchant_id` dari JWT, bukan input klien (`CLAUDE.md`).
- Constraint: spec B-1 dan B-2 sudah APPROVED dan tidak diubah. Rumus kas yang diharapkan hanya diperluas.
- Finding: `closeShift` menjumlahkan transaksi `paid_shift_id` = shift, `payment_method` = `cash`, `is_cancelled` = false di dalam satu `$transaction`, lalu menyimpan `expected_cash` = `opening_cash` + jumlah itu, dan `cash_difference` = `closing_cash` - `expected_cash` (`apps/api/src/shifts/shifts.service.ts`).
- Finding: `openShift` menolak outlet dengan `shift_required === false` (400), dan `isShiftRequired(outletId, merchantId)` sudah ada (`apps/api/src/shifts/shifts.service.ts`). Saat setelan mati tidak ada shift baru, jadi tidak ada tempat mencatat kas.
- Finding: model `shifts` punya `opening_cash`, `closing_cash`, `expected_cash`, `cash_difference` (`DECIMAL(14,2)` nullable). Tidak ada tabel untuk entri kas selama shift (`apps/api/prisma/schema.prisma`).
- Finding: `shift_audit_logs` (kolom `action`, `user_id`, `action_details` JSON) sudah dipakai untuk `shift_opened`, `shift_closed`, dan aksi peserta (`apps/api/src/shifts/shifts.service.ts`).
- Finding: izin shift di controller: `shift.create` (buka), `shift.update` (tutup, peserta, handoff), `shift.read` (baca) (`apps/api/src/shifts/shifts.controller.ts`). Menurut seed, owner, manager, dan cashier memegang ketiganya, viewer hanya `shift.read` (`apps/api/prisma/seed.ts`).
- Finding: validasi nominal `closing_cash` memakai `IsNumber` maksimal 2 desimal, `Min(0)`, `Max(999999999999.99)` (`apps/api/src/shifts/dto/close-shift.dto.ts`).
- Finding: `getShift` dan `queryShifts` membentuk respons field demi field, jadi field baru tidak muncul otomatis (`apps/api/src/shifts/shifts.service.ts`).
- Finding: frontend memakai `formatCash` (menampilkan "-" untuk null) di `apps/merchant/src/modules/shift/services/cash.ts`. Kolom kas dipakai di `CashDialog.vue`, `Information.vue`, dan `HistoryShift.vue` (`apps/merchant/src/modules/shift/`).
- Finding: file migrasi SQL lepas di `apps/api/prisma/migrations`, contoh `add_shift_cash_columns.sql` dan `add_outlets_shift_required.sql`.
- Finding: pembuatan transaksi POS menolak non-peserta aktif dengan `ForbiddenException` (403) dan shift tidak open dengan 400 (`apps/api/src/transactions/transactions.service.ts`, `resolveCashierForPos`).
- Assumption A-1: entri hanya bisa dibuat pada shift berstatus `open`. Shift `closed` menolak entri baru dengan 400. Berdasar pola `addParticipant` yang menolak shift tertutup; tidak dibuktikan untuk entri kas.
- Assumption A-2: nominal wajib lebih dari 0, maksimal 2 desimal, batas atas sama dengan `closing_cash`. Arah (masuk atau keluar) ditentukan oleh jenis entri, bukan tanda nominal.
- Assumption A-3: kas masuk/keluar tidak memengaruhi total penjualan, jumlah transaksi, atau laporan penjualan. Hanya kas laci.
- Assumption A-4: kas yang diharapkan tetap snapshot saat tutup shift (mengikuti D-1 desain B-1). Shift yang sudah ditutup sebelum fitur ini tidak dihitung ulang. Entri kas dijumlahkan dalam `$transaction` tutup shift yang sama.
- Assumption A-5: entri tampil di detail shift sebagai daftar (waktu, jenis, nominal, alasan, pencatat) untuk semua yang punya `shift.read`, ditambah total kas masuk dan total kas keluar di ringkasan kas setelah tutup shift. Kasir tidak melihat kas yang diharapkan sebelum kas akhir (B-1, Q-4), dan total entri tidak mengubah itu.
- Assumption A-6: pencatatan juga menulis `shift_audit_logs` (aksi baru) dalam `$transaction` yang sama.
- Assumption A-7: perubahan schema lewat satu berkas SQL baru di `apps/api/prisma/migrations`, sesuai konvensi berkas yang ada. Shift lama tidak punya entri dan tampil total 0.
- Assumption A-8: tidak ada batas kas keluar terhadap saldo laci. Hanya validasi nominal pada A-2 (batas saldo tidak ditanyakan karena sistem tidak melacak saldo laci secara real-time, sesuai B-1 Q-4).

## 4. Decisions Already Made
- Fitur shift dipertahankan, kas masuk/keluar adalah item terpisah setelah B-1 dan B-2 (disepakati di chat, `breakdown.md`).
- Offline sync tidak termasuk pembahasan ini.
- Q-1 (a): kas yang diharapkan = kas awal + penjualan tunai + total kas masuk - total kas keluar, dan selisih mengikuti.
- Q-2 (a): alasan teks wajib (maks 255 karakter), tanpa kategori.
- Q-3 (a): entri final, tidak bisa diubah, dihapus, atau dibatalkan; salah catat dikoreksi dengan entri lawan beserta alasan.
- Q-4 (a): pengguna ber-izin `shift.update` yang menjadi peserta aktif shift terbuka itu (aturan yang sama dengan pembuatan transaksi), tanpa izin baru; viewer hanya melihat.
- Q-5 (a): saat setelan buka/tutup kasir outlet mati, fitur tidak tersedia: API menolak 400 dan tombolnya disembunyikan, karena entri melekat pada shift.

## 5. Open Questions
- Q-1 [BLOCKING] Bagaimana entri memengaruhi angka kas? Opsi (a): kas yang diharapkan = kas awal + penjualan tunai + total kas masuk - total kas keluar, dan selisih mengikuti. Opsi (b): entri hanya dicatat sebagai informasi, rumus B-1 tidak berubah. Rekomendasi: (a), karena tujuan fitur adalah selisih yang akurat. — Answer: (a) kas yang diharapkan = kas awal + penjualan tunai + total kas masuk - total kas keluar, dan selisih mengikuti.
- Q-2 [BLOCKING] Alasan dan kategori. Opsi (a): alasan teks wajib (maks 255 karakter), tanpa kategori. Opsi (b): alasan opsional. Opsi (c): kategori tetap (mis. belanja, modal, setoran) ditambah catatan. Rekomendasi: (a), karena kas keluar tanpa alasan tidak bisa diaudit dan kategori menambah master data yang belum diminta. — Answer: (a) alasan teks wajib (maks 255 karakter), tanpa kategori.
- Q-3 [BLOCKING] Bolehkah entri diubah, dihapus, atau dibatalkan? Opsi (a): tidak, entri final; salah catat dikoreksi dengan entri lawan beserta alasan. Opsi (b): boleh dihapus/dibatalkan oleh pencatat atau manager selama shift masih terbuka, dengan jejak audit. Rekomendasi: (a), karena paling sederhana dan jejaknya utuh; (b) menambah endpoint, izin, dan status entri. — Answer: (a) tidak, entri final; salah catat dikoreksi dengan entri lawan beserta alasan.
- Q-4 [BLOCKING] Siapa yang boleh mencatat? Opsi (a): pengguna ber-izin `shift.update` yang menjadi peserta aktif shift terbuka itu (aturan yang sama dengan pembuatan transaksi), tanpa izin baru; viewer hanya melihat. Opsi (b): izin baru khusus kas masuk/keluar (perlu perubahan seed dan penugasan peran). Opsi (c): hanya owner shift. Rekomendasi: (a). — Answer: (a) pengguna ber-izin `shift.update` yang menjadi peserta aktif shift terbuka itu (aturan yang sama dengan pembuatan transaksi), tanpa izin baru; viewer hanya melihat.
- Q-5 [BLOCKING] Perilaku saat setelan buka/tutup kasir outlet mati (tidak ada shift). Opsi (a): fitur tidak tersedia, API menolak 400 dan tombolnya disembunyikan, karena entri melekat pada shift. Opsi (b): entri dilampirkan ke outlet tanpa shift (perlu desain baru dan rekap harian). Rekomendasi: (a), konsisten dengan B-2 (kas hanya dicatat saat shift ada). — Answer: (a) fitur tidak tersedia, API menolak 400 dan tombolnya disembunyikan, karena entri melekat pada shift.

## 6. Acceptance Criteria
Catatan: kelima jawaban sama dengan rekomendasi yang dipakai menulis AC berikut, jadi AC tidak berubah. Status DRAFT: jawaban sudah disetujui manusia, teks spec penuh belum.

- AC-1: When pengguna peserta aktif ber-izin `shift.update` mencatat kas masuk atau kas keluar dengan nominal lebih dari 0 dan alasan pada shift terbuka, then entri tersimpan dengan jenis, nominal, alasan, pencatat, dan waktu, dan muncul di detail shift. Verify: automated test `apps/api/src/shifts/shifts.service.spec.ts`
- AC-2: When nominal 0, negatif, bukan angka, lebih dari 2 desimal, atau melebihi batas, atau alasan kosong, then permintaan ditolak 400 dan tidak ada entri. Verify: automated test `apps/api/src/shifts/shifts.service.spec.ts`
- AC-3: When entri dicatat pada shift yang sudah closed, then permintaan ditolak 400 dan tidak ada entri. Verify: automated test `apps/api/src/shifts/shifts.service.spec.ts`
- AC-4: When pengguna bukan peserta aktif shift, atau tanpa izin `shift.update`, then permintaan ditolak dan tidak ada entri. Verify: automated test `apps/api/src/shifts/shifts.service.spec.ts`
- AC-5: When shift ditutup setelah ada kas masuk dan kas keluar, then `expected_cash` = kas awal + penjualan tunai + total kas masuk - total kas keluar, dan `cash_difference` = kas akhir - `expected_cash`. Verify: automated test `apps/api/src/shifts/shifts.service.properties.spec.ts`
- AC-6: When shift ditutup tanpa entri, then `expected_cash` dan `cash_difference` sama seperti perilaku B-1. Verify: automated test `apps/api/src/shifts/shifts.service.spec.ts`
- AC-7: When setelan buka/tutup kasir outlet mati dan entri dicatat, then permintaan ditolak 400 dan tidak ada entri. Verify: automated test `apps/api/src/shifts/shifts.service.spec.ts`
- AC-8: When pengguna dari merchant lain mencatat atau membaca entri sebuah shift, then ditolak dengan 404 seperti endpoint shift lain. Verify: automated test `apps/api/src/shifts/shifts.service.spec.ts`
- AC-9: When entri dicatat, then satu baris audit log tertulis atomik bersama entri; bila penulisan gagal, entri tidak tersimpan. Verify: automated test `apps/api/src/shifts/shifts.service.spec.ts`
- AC-10: When detail shift dimuat, then respons memuat daftar entri dan total kas masuk serta total kas keluar; shift lama tanpa entri menampilkan total 0 dan daftar kosong tanpa error. Verify: automated test `apps/api/src/shifts/shifts.service.spec.ts`
- AC-11: When kasir membuka detail shift terbuka di layar, then tersedia tombol dan form catat kas masuk/keluar (nominal, alasan) yang menampilkan pesan error saat API gagal tanpa menghapus isian, dan tombol tidak tampil saat shift closed atau setelan mati. Verify: manual: buka shift, catat masuk dan keluar, matikan API lalu ulangi, tutup shift dan matikan setelan outlet, cek tombol
- AC-12: When shift ditutup, then ringkasan kas setelah tutup menampilkan total kas masuk dan kas keluar bersama kas awal, penjualan tunai, kas diharapkan, kas akhir, dan selisih; sebelum kas akhir dikirim kas yang diharapkan tidak tampil. Verify: manual: catat entri, tutup shift, cocokkan angka dengan rumus AC-5
- AC-13: When perubahan selesai, then lint backend lolos tanpa peringatan. Verify: command: pnpm --filter umkm-pos-api lint:ci | expect: exit 0
- AC-14: When perubahan selesai, then tes backend lolos. Verify: command: pnpm --filter umkm-pos-api test | expect: exit 0
- AC-15: When perubahan selesai, then build frontend lolos tanpa error TypeScript. Verify: command: pnpm --filter @umkm-pos/merchant build | expect: exit 0
