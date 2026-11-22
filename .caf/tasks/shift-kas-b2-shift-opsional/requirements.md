# Buka/tutup kasir opsional per outlet
Status: APPROVED
Source: chat (breakdown `.caf/tasks/shift-kas/breakdown.md`, item B-2)

## 1. Outcome
Pemilik outlet bisa mematikan kewajiban buka/tutup kasir. Saat dimatikan, kasir langsung berjualan di POS tanpa membuka shift. Saat dihidupkan, perilaku sekarang berlaku: shift wajib dibuka sebelum berjualan dan kas dicatat sesuai B-1.

## 2. Scope
In:
- Setelan "Buka/tutup kasir" per outlet (hidup atau mati), diubah dari halaman edit outlet.
- Perilaku POS saat setelan mati: masuk POS, tambah produk, buat pesanan, bayar langsung, dan bayar pesanan bayar-nanti tanpa shift.
- Perilaku self-order pelanggan saat setelan mati.
- Penegakan di server: saat setelan hidup, transaksi POS tanpa shift ditolak.
- Penolakan mematikan setelan selama outlet punya shift terbuka.
- Penolakan membuka shift baru selama setelan mati, di server dan di tombol buka shift.
- Penyembunyian badge status shift di header dan kartu "Shift Aktif" di dashboard saat setelan mati.
- Penyampaian setelan ke POS kasir tanpa login ulang.

Out:
- Kas awal, kas akhir, dan selisih (sudah di B-1, tidak diubah di sini).
- Kas masuk dan kas keluar.
- Peserta dan handoff opsional secara terpisah dari setelan ini.
- Penghapusan atau perubahan data shift lama dan menu Shift.
- Laporan dan dashboard selain penyembunyian kartu "Shift Aktif".
- Perubahan di `apps/admin`.

## 3. Constraints and Assumptions
- Constraint: semua query tetap dibatasi `merchant_id` dari JWT, bukan dari input klien (`CLAUDE.md`).
- Constraint: spec B-1 (`.caf/tasks/shift-kas-b1-kas-shift/requirements.md`) sudah APPROVED dan tidak diubah. Aturannya berlaku hanya saat setelan hidup. Saat setelan mati, tidak ada shift sehingga tidak ada kas yang dicatat.
- Constraint: setelan harus sampai ke kasir tanpa bergantung pada izin `outlet.read`. Endpoint detail outlet mewajibkan `outlet.read` (`apps/api/src/outlets/outlets.controller.ts`), dan peran mana yang memegang izin itu belum diverifikasi.
- Finding: POS mewajibkan shift hanya di frontend. `apps/merchant/src/modules/pos/pages/index.vue` menampilkan layar buka shift bila shift tidak open. `apps/merchant/src/modules/transaction/components/Product.vue` menolak tambah produk bila bukan peserta shift. `apps/merchant/src/modules/transaction/components/Cart.vue` menonaktifkan checkout dan menolak transaksi bila `shift_id` kosong.
- Finding: API menerima transaksi POS tanpa `shift_id`. Fungsi `resolveCashierForPos` di `apps/api/src/transactions/transactions.service.ts` langsung selesai bila `shift_id` kosong dan tidak memvalidasi shift atau peserta.
- Finding: self-order pelanggan butuh shift terbuka. `createOrder` di `apps/api/src/customer-catalog/customer-catalog.service.ts` menolak pesanan bila tidak ada shift open, dan `getShiftStatus` mengembalikan `is_open`. Frontend (`apps/merchant/src/modules/customer-catalog/pages/browse.vue` dan `cart.vue`) menonaktifkan pesan bila `isShiftOpen` false. Jadi shift juga berfungsi sebagai penanda toko buka bagi pelanggan.
- Finding: pencarian outlet di katalog pelanggan sudah mensyaratkan `is_active = true` (`resolveOutlet` di `customer-catalog.service.ts`).
- Finding: halaman edit outlet berisi field Nama, Lokasi, Kode Rahasia Pelanggan, dan Status Aktif (`apps/merchant/src/modules/outlet/pages/edit.vue`). `PATCH /outlets/:id` memakai izin `outlet.update`. `UpdateOutletDto` turunan `CreateOutletDto`, dan `outlets.service.ts` menyimpan seluruh isi DTO ke database.
- Finding: model `outlets` tidak punya kolom setelan (`apps/api/prisma/schema.prisma`). Outlet aktif di klien disimpan dari respons login (`CLAUDE.md`), dan mekanisme penyegaran setelah outlet diubah belum ditemukan di bagian kode yang dibaca.
- Finding: badge "In Shift / Not Shift" ada di `apps/merchant/src/layouts/default.vue` dan kartu "Shift Aktif" di `apps/merchant/src/modules/dashboard/components/SummaryStats.vue`.
- Finding: tes ada di `apps/api/src/outlets/outlets.service.spec.ts`, `apps/api/src/outlets/outlets.controller.spec.ts`, dan `apps/api/src/transactions/transactions.service.spec.ts`. Modul `customer-catalog` belum punya berkas tes.
- Assumption A-1: izin mengubah setelan memakai `outlet.update` yang sudah ada. Izin baru tidak ditambah.
- Assumption A-2: setelan bernilai hidup untuk semua outlet, lama maupun baru, sehingga perilaku sekarang tidak berubah (Q-2).
- Assumption A-3: mematikan setelan ditolak selama outlet punya shift terbuka (Q-3).
- Assumption A-4: saat setelan hidup, API menolak transaksi POS tanpa shift (Q-4).
- Assumption A-5: menu "Shift" tetap tampil untuk melihat riwayat shift. Badge status shift di header dan kartu "Shift Aktif" di dashboard disembunyikan saat setelan mati.
- Assumption A-6: transaksi yang dibuat saat setelan mati tetap tanpa shift. Transaksi itu tidak dilampirkan ke shift mana pun saat setelan dihidupkan lagi.
- Assumption A-7: perubahan schema dilakukan lewat migrasi SQL di `apps/api/prisma/migrations`, sesuai berkas migrasi yang sudah ada di folder itu.
- Assumption A-8: saat setelan mati, shift tidak bisa dibuka (Q-5). Menu "Shift" hanya untuk melihat riwayat, dan tombol "Buka Shift" tidak tampil. Shift lama yang sudah closed tetap terbaca.

## 4. Decisions Already Made
- Fitur shift dipertahankan, dibuat opsional per outlet (disepakati di chat).
- Offline sync tidak termasuk pembahasan ini.
- Q-1: saat setelan mati, self-order pelanggan terbuka selama outlet aktif (`is_active`).
- Q-2: setelan bernilai hidup untuk semua outlet, lama dan baru.
- Q-3: mematikan setelan ditolak selama outlet punya shift terbuka.
- Q-4: saat setelan hidup, API menolak transaksi POS tanpa shift.
- Q-5: saat setelan mati, shift tidak bisa dibuka. API menolak buka shift dan tombol buka shift disembunyikan.

## 5. Open Questions
- Q-1 [BLOCKING] Saat setelan mati, kapan pelanggan boleh memesan lewat self-order? Sekarang pesanan ditolak bila tidak ada shift terbuka, jadi shift berfungsi sebagai penanda toko buka. Opsi (a): pelanggan bisa memesan selama outlet aktif (`is_active`). Opsi (b): pemilik membuka dan menutup toko secara manual, yaitu fitur baru di luar B-2. Rekomendasi: (a), karena sederhana dan sesuai pengecekan `is_active` yang sudah ada. Risikonya, pelanggan bisa memesan di luar jam buka kecuali pemilik menonaktifkan outlet. — Answer: (a), pelanggan bisa memesan selama outlet aktif. Sesuai rekomendasi.
- Q-2 [NON-BLOCKING] Apakah setelan bernilai hidup atau mati untuk outlet lama dan baru? Rekomendasi: hidup untuk semua, supaya perilaku sekarang tidak berubah dan kas dari B-1 aktif secara default. — Answer: hidup untuk semua outlet, lama dan baru. Sesuai rekomendasi.
- Q-3 [NON-BLOCKING] Bila setelan dimatikan saat outlet punya shift terbuka, ditolak atau diizinkan? Rekomendasi: ditolak sampai shift ditutup, karena kas shift yang masih berjalan belum selesai dihitung. — Answer: ditolak sampai shift ditutup. Sesuai rekomendasi.
- Q-4 [NON-BLOCKING] Saat setelan hidup, apakah API ikut menolak transaksi POS tanpa shift? Sekarang hanya frontend yang mewajibkan. Rekomendasi: ya, karena kas di B-1 hanya akurat bila semua transaksi tunai punya shift. — Answer: ya, API ikut menolak transaksi POS tanpa shift saat setelan hidup. Sesuai rekomendasi.
- Q-5 [NON-BLOCKING] Saat setelan mati, bolehkah shift dibuka dari menu Shift? Opsi (a): boleh, shift itu tidak dipakai transaksi. Opsi (b): tidak boleh. Rekomendasi: (b), karena shift yang tidak dipakai transaksi tidak berguna dan menghalangi pemilik mematikan setelan lagi (AC-4). — Answer: (b), shift tidak bisa dibuka saat setelan mati.

## 6. Acceptance Criteria
- AC-1: When setelan shift outlet belum pernah diubah, then nilainya hidup dan alur POS berjalan seperti sebelum fitur ini. Verify: automated test `apps/api/src/outlets/outlets.service.spec.ts`
- AC-2: When pengguna dengan izin `outlet.update` mengubah setelan shift outlet, then nilai baru tersimpan dan terbaca saat detail outlet diambil kembali. Verify: automated test `apps/api/src/outlets/outlets.service.spec.ts`
- AC-3: When pengguna tanpa izin `outlet.update` mengubah setelan, then permintaan ditolak dengan status 403 dan nilai tidak berubah. Verify: automated test `apps/api/src/outlets/outlets.controller.spec.ts`
- AC-4: When setelan dimatikan padahal outlet punya shift terbuka, then permintaan ditolak dengan status 400 dan pesan yang meminta shift ditutup dulu, dan setelan tidak berubah. Verify: automated test `apps/api/src/outlets/outlets.service.spec.ts`
- AC-5: When setelan mati dan transaksi POS dikirim tanpa shift, then transaksi tersimpan tanpa shift dan stok berkurang seperti biasa. Verify: automated test `apps/api/src/transactions/transactions.service.spec.ts`
- AC-6: When setelan hidup dan transaksi POS dikirim tanpa shift, then permintaan ditolak dengan status 400 dan tidak ada transaksi maupun perubahan stok. Verify: automated test `apps/api/src/transactions/transactions.service.spec.ts`
- AC-7: When setelan mati dan pesanan bayar-nanti dibayar tunai, then pembayaran diterima tanpa mensyaratkan shift terbuka. Verify: automated test `apps/api/src/transactions/transactions.service.spec.ts`
- AC-8: When setelan mati dan outlet aktif, then pelanggan bisa membuat pesanan lewat self-order dan pesanan tersimpan tanpa shift. Verify: automated test `apps/api/src/customer-catalog/customer-catalog.service.spec.ts` (berkas baru)
- AC-9: When setelan mati dan outlet tidak aktif, then pesanan self-order ditolak. Verify: automated test `apps/api/src/customer-catalog/customer-catalog.service.spec.ts` (berkas baru)
- AC-10: When setelan hidup dan pelanggan membuat pesanan tanpa shift terbuka, then pesanan ditolak seperti sebelum fitur ini. Verify: automated test `apps/api/src/customer-catalog/customer-catalog.service.spec.ts` (berkas baru)
- AC-11: When setelan mati dan kasir membuka POS, then produk dan keranjang langsung tampil tanpa layar "Belum Ada Shift Aktif", dan tombol bayar bisa dipakai tanpa shift. Verify: manual: matikan setelan di outlet tanpa shift terbuka, buka POS sebagai kasir, tambah produk, bayar tunai sampai berhasil
- AC-12: When setelan mati, then badge "In Shift / Not Shift" di header dan kartu "Shift Aktif" di dashboard tidak tampil, dan menu Shift tetap bisa dibuka untuk melihat riwayat. Verify: manual: matikan setelan, cek header, dashboard, dan menu Shift
- AC-13: When pemilik mengubah setelan, then POS kasir mengikuti nilai baru pada pemuatan halaman POS berikutnya tanpa login ulang, termasuk untuk kasir yang tidak punya izin `outlet.read`. Verify: manual: ubah setelan dari akun pemilik, muat ulang POS di browser kasir yang tidak punya `outlet.read`, pastikan perilaku POS berubah
- AC-14: When setelan dihidupkan kembali setelah sempat mati, then transaksi yang dibuat saat mati tetap tanpa shift dan tidak dilampirkan ke shift baru. Verify: manual: buat transaksi saat setelan mati, hidupkan setelan, buka shift, pastikan transaksi tadi tidak muncul di shift itu
- AC-15: When pemilik membuka halaman edit outlet, then tersedia pilihan "Buka/tutup kasir" dengan keterangan singkat akibatnya, dan kegagalan simpan menampilkan pesan error tanpa kehilangan isian. Verify: manual: ubah pilihan, simpan, ulangi dengan API dimatikan
- AC-16: When perubahan selesai, then lint backend lolos tanpa peringatan. Verify: command: pnpm --filter umkm-pos-api lint:ci | expect: exit 0
- AC-17: When perubahan selesai, then tes backend lolos. Verify: command: pnpm --filter umkm-pos-api test | expect: exit 0
- AC-18: When perubahan selesai, then build frontend lolos tanpa error TypeScript. Verify: command: pnpm --filter @umkm-pos/merchant build | expect: exit 0
- AC-19: When setelan mati dan pengguna membuka shift, then permintaan ditolak dengan status 400 dan pesan yang menyebut setelan buka/tutup kasir mati, dan tidak ada shift baru. Verify: automated test `apps/api/src/shifts/shifts.service.spec.ts`
- AC-20: When setelan mati, then tombol "Buka Shift" tidak tampil di menu Shift maupun di POS, dan riwayat shift lama tetap bisa dibuka. Verify: manual: matikan setelan, cek menu Shift dan POS
