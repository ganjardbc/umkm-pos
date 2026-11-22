# Kas awal, kas akhir, dan selisih pada shift
Status: APPROVED
Source: chat (breakdown `.caf/tasks/shift-kas/breakdown.md`, item B-1)

## 1. Outcome
Saat membuka shift kasir mengisi kas awal, dan saat menutup shift mengisi kas akhir. Sistem menghitung kas yang diharapkan dari penjualan tunai yang uangnya diterima di shift itu, lalu menampilkan selisihnya setelah kas akhir dikirim, sehingga owner bisa melihat apakah uang di laci sesuai dengan penjualan.

## 2. Scope
In:
- Kolom kas awal, kas akhir, kas yang diharapkan, dan selisih pada shift.
- Input kas awal di layar buka shift dan kas akhir di layar tutup shift.
- Ringkasan kas (kas awal, penjualan tunai, kas diharapkan, kas akhir, selisih) di detail shift.
- Pembayaran pesanan bayar-nanti mencatat shift tempat uang diterima, supaya masuk hitungan kas shift itu.
- Perilaku shift lama yang belum punya data kas.

Out:
- Kas masuk dan kas keluar selama shift.
- Kas awal terisi otomatis dari kas akhir shift sebelumnya.
- Setelan shift opsional per outlet (breakdown B-2).
- Peserta dan handoff opsional.
- Laporan kas lintas shift, dashboard, dan ekspor.
- Metode pembayaran non-tunai.

## 3. Constraints and Assumptions
- Constraint: semua query shift tetap dibatasi `merchant_id` dari JWT, bukan dari input klien (`CLAUDE.md`).
- Constraint: izin memakai kode yang sudah ada (`shift.create`, `shift.update`, `shift.read`) di `apps/api/src/shifts/shifts.controller.ts`. Izin baru tidak ditambah.
- Finding: tabel `shifts` tidak punya kolom kas (`apps/api/prisma/schema.prisma`, model `shifts`), padahal `CLAUDE.md` menyebut shift punya open/close cash. Dokumen dan schema tidak sama.
- Finding: `CreateShiftDto` hanya berisi `outlet_id` dan `CloseShiftDto` kosong (`apps/api/src/shifts/dto/`). Endpoint tutup shift di `apps/api/src/shifts/shifts.controller.ts` tidak menerima body.
- Finding: buka shift di frontend memanggil `openShift({ outlet_id })` dari `apps/merchant/src/modules/transaction/components/OpenShift.vue`. Tutup shift memanggil `closeShift(id)` tanpa input dari `apps/merchant/src/modules/shift/components/ShiftStatus.vue`.
- Finding: tabel `transactions` punya `payment_method`, `total_amount`, `cash_received`, `change_amount`, `is_cancelled`, dan `shift_id` yang nullable (`apps/api/prisma/schema.prisma`). Pesanan yang dibayar nanti punya `payment_method = 'pending'` (`apps/api/src/transactions/transactions.service.ts`).
- Finding: `payTransaction` mengisi metode bayar, uang diterima, dan kembalian, tapi tidak menerima maupun mengubah `shift_id`, dan `PayTransactionDto` tidak punya field shift (`apps/api/src/transactions/transactions.service.ts`, `apps/api/src/transactions/dto/pay-transaction.dto.ts`). Pesanan bayar-nanti saat ini tetap tercatat di shift tempat pesanan dibuat.
- Finding: tidak ada tes `payTransaction` di `apps/api/src/transactions/transactions.service.spec.ts`.
- Finding: metode tunai dikirim frontend sebagai `cash` (`apps/merchant/src/modules/transaction/components/PaymentModal.vue`).
- Finding: sudah ada tes shift di `apps/api/src/shifts/shifts.service.spec.ts` dan `apps/api/src/shifts/shifts.service.properties.spec.ts`.
- Assumption A-1: kas yang diharapkan = kas awal + jumlah `total_amount` transaksi tunai yang tidak batal dan uangnya diterima di shift itu (dibayar langsung saat dibuat, atau dibayar nanti saat shift itu berjalan). Tidak ada kas masuk atau keluar lain.
- Assumption A-2: selisih tidak menghalangi penutupan shift, hanya dicatat.
- Assumption A-3: siapa pun yang punya `shift.read` boleh melihat ringkasan kas shift.
- Assumption A-4: kolom kas pada shift lama bernilai kosong dan tampil sebagai "-".
- Assumption A-5: handoff tidak meminta hitung kas. Kas tetap melekat pada shift yang sama sampai ditutup.
- Assumption A-6: perubahan schema dilakukan lewat migrasi SQL di `apps/api/prisma/migrations`, sesuai berkas migrasi shift yang sudah ada di folder itu.
- Assumption A-7: selama shift masih wajib (sebelum B-2), pembayaran tunai pesanan bayar-nanti harus dilakukan oleh kasir yang menjadi peserta aktif di shift yang terbuka, dengan aturan yang sama seperti membuat transaksi. Pembayaran non-tunai tidak memengaruhi kas.

## 4. Decisions Already Made
- Fitur shift dipertahankan dan kas ditambahkan ke dalamnya (disepakati di chat).
- Offline sync tidak termasuk pembahasan ini.
- Q-1: uang pesanan bayar-nanti dihitung ke shift tempat pembayaran diterima.
- Q-2: kas awal dan kas akhir wajib diisi, boleh 0.
- Q-3: selisih tidak menghalangi tutup shift, hanya dicatat.
- Q-4: kasir tidak melihat kas yang diharapkan sebelum mengirim kas akhir. Angka itu tampil setelah kas akhir dikirim.

## 5. Open Questions
- Q-1 [BLOCKING] Uang dari pesanan "bayar nanti" dihitung ke shift mana? Opsi (a): shift tempat pesanan dibuat. Opsi (b): shift tempat pembayaran diterima. Rekomendasi: (b). — Answer: (b), sesuai rekomendasi.
- Q-2 [BLOCKING] Apakah kas awal dan kas akhir wajib diisi (angka, boleh 0)? Rekomendasi: wajib, boleh 0. — Answer: wajib, boleh 0.
- Q-3 [NON-BLOCKING] Apakah selisih yang tidak nol menghalangi tutup shift? Rekomendasi: tidak. — Answer: tidak menghalangi, hanya dicatat.
- Q-4 [NON-BLOCKING] Apakah kasir melihat angka kas yang diharapkan sebelum mengisi kas akhir? Rekomendasi: tidak. — Answer: tidak, tampil setelah kas akhir dikirim.

## 6. Acceptance Criteria
- AC-1: When shift dibuka dengan kas awal 0 atau lebih, then shift tersimpan dengan nilai kas awal itu dan nilainya muncul di detail shift. Verify: automated test `apps/api/src/shifts/shifts.service.spec.ts`
- AC-2: When shift dibuka dengan kas awal negatif atau bukan angka, then permintaan ditolak dengan status 400 dan shift tidak dibuat. Verify: automated test `apps/api/src/shifts/shifts.service.spec.ts`
- AC-3: When shift dibuka tanpa kas awal, then permintaan ditolak dengan status 400 dan shift tidak dibuat. Verify: automated test `apps/api/src/shifts/shifts.service.spec.ts`
- AC-4: When shift ditutup dengan kas akhir 0 atau lebih, then status shift menjadi closed, kas akhir tersimpan, dan respons memuat kas yang diharapkan serta selisih. Verify: automated test `apps/api/src/shifts/shifts.service.spec.ts`
- AC-5: When shift ditutup tanpa kas akhir atau dengan nilai negatif, then permintaan ditolak dengan status 400 dan shift tetap open. Verify: automated test `apps/api/src/shifts/shifts.service.spec.ts`
- AC-6: When shift berisi transaksi tunai, non-tunai, batal, dan belum dibayar yang dibuat langsung bayar di shift itu, then kas yang diharapkan hanya menjumlahkan kas awal ditambah total transaksi tunai yang tidak batal. Verify: automated test `apps/api/src/shifts/shifts.service.properties.spec.ts`
- AC-7: When pesanan bayar-nanti dibuat di shift A lalu dibayar tunai di shift B, then uangnya masuk kas yang diharapkan shift B dan tidak masuk shift A. Verify: automated test `apps/api/src/transactions/transactions.service.spec.ts`
- AC-8: When pesanan bayar-nanti dibayar dengan metode non-tunai, then kas yang diharapkan shift tidak berubah. Verify: automated test `apps/api/src/transactions/transactions.service.spec.ts`
- AC-9: When pesanan bayar-nanti dibayar tunai tanpa shift terbuka atau oleh kasir yang bukan peserta aktif shift, then pembayaran ditolak, pesanan tetap berstatus belum dibayar, dan kas tidak berubah. Verify: automated test `apps/api/src/transactions/transactions.service.spec.ts`
- AC-10: When kas akhir berbeda dari kas yang diharapkan, then shift tetap tertutup dan selisih (kas akhir dikurangi kas diharapkan) tersimpan dan tampil di detail shift. Verify: automated test `apps/api/src/shifts/shifts.service.spec.ts`
- AC-11: When shift yang sudah ditutup ditutup lagi, then permintaan ditolak dengan status 400 dan data kas tidak berubah. Verify: automated test `apps/api/src/shifts/shifts.service.spec.ts`
- AC-12: When shift lama tanpa data kas dibuka di detail atau riwayat, then halaman tampil tanpa error dan kolom kas menampilkan "-". Verify: manual: buka detail dan riwayat shift yang dibuat sebelum perubahan, pastikan tidak ada error dan kolom kas berisi "-"
- AC-13: When kasir membuka shift dari layar buka shift, then form meminta kas awal sebelum shift dibuat, dan kegagalan API menampilkan pesan error tanpa menutup form. Verify: manual: buka POS tanpa shift aktif, isi kas awal, kirim; ulangi dengan API dimatikan
- AC-14: When kasir menutup shift dari layar tutup shift, then form meminta kas akhir tanpa menampilkan kas yang diharapkan, dan setelah kas akhir dikirim layar menampilkan ringkasan kas awal, penjualan tunai, kas diharapkan, kas akhir, dan selisih. Verify: manual: tutup shift dengan kas akhir lebih besar, sama, dan lebih kecil dari yang diharapkan
- AC-15: When kasir membayar pesanan bayar-nanti tunai dari layar pembayaran, then pembayaran tercatat ke shift yang sedang berjalan tanpa langkah tambahan dari kasir. Verify: manual: buat pesanan bayar-nanti, bayar tunai, lalu cek ringkasan kas shift
- AC-16: When perubahan selesai, then lint backend lolos tanpa peringatan. Verify: command: pnpm --filter umkm-pos-api lint:ci | expect: exit 0
- AC-17: When perubahan selesai, then tes backend lolos. Verify: command: pnpm --filter umkm-pos-api test | expect: exit 0
- AC-18: When perubahan selesai, then build frontend lolos tanpa error TypeScript. Verify: command: pnpm --filter @umkm-pos/merchant build | expect: exit 0
