# PRD: Reminder Tutup Shift Kasir (Draft Test — Fallback Verification)

> Catatan: Ini adalah discovery draft KECIL untuk keperluan test/verifikasi fitur
> planner agent fallback, bukan fitur produk sungguhan yang siap diimplementasikan.
> Tetap ditulis dengan format lengkap seperti discovery pada umumnya.

## Problem

Kasir outlet sering lupa menutup shift di akhir hari kerja. Akibatnya, sesi shift
tetap berstatus "open" hingga keesokan harinya, sehingga laporan kas (selisih kas
masuk/keluar, penerimaan transaksi per shift) tidak akurat dan owner/manajer
kesulitan merekonsiliasi kas harian. Masalah ini murni soal kelalaian operasional
di ujung hari kerja, bukan soal proses buka shift atau pencatatan transaksi itu
sendiri.

## Target User

Kasir outlet — pengguna dengan role kasir yang membuka dan menutup sesi shift
harian di satu outlet tertentu (bukan owner/manajer, meskipun mereka bisa jadi
penerima notifikasi sekunder di iterasi berikutnya).

## Success Metric

- Penurunan jumlah shift yang "lupa ditutup" (shift dengan status open lebih dari
  X jam setelah jam operasional outlet berakhir) sebesar minimal 50% dalam 30 hari
  setelah fitur ini dirilis, dibandingkan baseline sebelum rilis.
- Sinyal pendukung: persentase kasir yang menutup shift dalam rentang waktu wajar
  (misal dalam 1 jam setelah reminder muncul) meningkat, diukur dari timestamp
  reminder vs timestamp shift close di tabel `shifts`.

## Scope

- Reminder otomatis yang muncul untuk kasir ketika shift mereka masih berstatus
  open mendekati/melewati perkiraan jam tutup outlet.
- Reminder bersifat non-blocking — kasir tetap bisa melanjutkan aktivitas POS,
  reminder hanya mengingatkan.
- Reminder merujuk pada shift milik kasir yang sedang login, di outlet aktif
  (`APP_ACTIVE_OUTLET`).

## Out-of-Scope

- Sistem TIDAK BOLEH menutup shift secara otomatis tanpa konfirmasi eksplisit dari
  kasir. Penutupan shift tetap harus melalui alur konfirmasi manual yang sudah ada
  (input kas akhir, dsb).
- Tidak mencakup perubahan pada alur buka shift maupun perhitungan selisih kas.
- Tidak mencakup notifikasi ke owner/manajer (dipertimbangkan sebagai iterasi
  terpisah di masa depan).
- Tidak mencakup laporan/dashboard rekap keterlambatan tutup shift.

## Dependency

- Modul `shifts` yang sudah ada (status open/close, waktu buka, cash in/out) —
  fitur ini murni menambahkan lapisan reminder di atas data shift yang sudah
  tercatat, tanpa mengubah skema atau logika inti shift.
- Konteks outlet aktif dari `APP_ACTIVE_OUTLET` di frontend untuk menentukan jam
  operasional outlet yang relevan.

## Pertanyaan Terbuka

- Reminder ini sebaiknya muncul lewat channel apa (push notification, in-app
  banner, atau keduanya), dan pada jam berapa persisnya relatif terhadap jam
  tutup operasional outlet (misal: 30 menit sebelum, tepat saat jam tutup, atau
  berulang tiap interval tertentu setelah lewat jam tutup)? Ini belum ditentukan
  dan perlu keputusan dari product owner sebelum masuk ke tahap ticketing.
