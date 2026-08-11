# PRD — Copy Nomor Invoice Transaksi

## Problem

Saat ini, nomor invoice transaksi (mis. di riwayat transaksi, detail transaksi, atau tampilan
struk) hanya bisa didapat user dengan cara select teks manual lalu copy — atau, kalau UI tidak
mendukung selection dengan baik (misalnya elemen dirender dalam layout yang membatasi text
selection), user harus retype nomor invoice dari layar secara manual.

Dua konsekuensi nyata dari kondisi ini:

1. **Error-prone di mobile.** Kasir dan owner banyak mengakses aplikasi dari HP saat melayani
   pelanggan (mis. saat mengirim bukti transaksi lewat WhatsApp). Select-manual teks pendek di
   layar sentuh mudah salah pilih karakter (kepotong di awal/akhir, ke-select elemen lain di
   sebelahnya), sehingga nomor invoice yang di-share atau dicatat bisa typo.
2. **Friksi saat referensi komplain/retur.** Ketika pelanggan komplain atau minta retur, kasir
   perlu mencantumkan nomor invoice yang tepat sebagai referensi (ke owner, ke sistem pencatatan
   manual, atau ke pelanggan sendiri lewat chat). Proses select-manual + copy yang tidak reliable
   menambah waktu dan risiko salah input, terutama saat toko sedang ramai.

Belum ada mekanisme di aplikasi untuk memindahkan nomor invoice ke clipboard secara akurat dalam
satu aksi.

## Target User

- **Kasir** — user paling sering berinteraksi dengan nomor invoice, terutama saat menyelesaikan
  transaksi dan langsung mengirim konfirmasi/bukti ke pelanggan lewat WhatsApp/chat lain, atau
  saat harus mencatat referensi untuk retur/komplain di tempat.
- **Owner/pemilik outlet** — mengakses riwayat transaksi (biasanya dari HP atau desktop) untuk
  keperluan rekonsiliasi, menjawab pertanyaan pelanggan, atau melacak transaksi tertentu
  berdasarkan nomor invoice yang disebutkan pelanggan.

Kedua peran ini beririsan dengan konteks penggunaan mobile (di lantai toko/kasir) dan desktop
(back-office/rekonsiliasi), sehingga fitur perlu bekerja baik di kedua form factor.

## Success Metric

- **Reduksi kesalahan input manual**: berkurangnya laporan/komplain internal terkait nomor
  invoice yang salah kirim atau salah catat (baseline diambil dari observasi kualitatif/laporan
  dukungan sebelum rilis, karena saat ini tidak ada tracking kuantitatif atas insiden ini —
  dicatat sebagai keterbatasan pengukuran, lihat Pertanyaan Terbuka).
- **Adopsi fitur**: aksi "copy nomor invoice" digunakan minimal oleh sebagian user aktif dalam 30
  hari pertama setelah rilis (perlu event tracking baru — lihat Dependency).
- **Tidak ada regresi UX**: tidak ada peningkatan waktu rata-rata user untuk menyelesaikan alur
  yang melibatkan nomor invoice (mis. proses share bukti transaksi) dibanding sebelum fitur ini
  ada.

## Scope

- Menambahkan aksi "copy nomor invoice ke clipboard" di titik-titik di mana nomor invoice
  transaksi ditampilkan ke user, minimal:
  - Halaman/list riwayat transaksi (per baris transaksi).
  - Halaman detail transaksi.
- Memberikan feedback visual singkat ke user saat aksi copy berhasil (mis. toast/notifikasi
  sesaat), sehingga user yakin nomor sudah tersalin tanpa perlu verifikasi manual.
- Menangani kasus clipboard API tidak tersedia/gagal (mis. permission browser, konteks non-HTTPS,
  browser lama) dengan fallback yang tetap memungkinkan user mendapatkan nomor invoice (lihat
  detail penanganan di `flow.md`).
- Berlaku untuk kedua form factor: desktop dan mobile web.

## Out-of-Scope

- Copy elemen transaksi lain selain nomor invoice (mis. copy seluruh detail transaksi, copy daftar
  item, copy total pembayaran) — bisa jadi fitur terpisah di kemudian hari.
- Perubahan pada format atau struktur penomoran invoice itu sendiri.
- Fitur share langsung ke aplikasi eksternal (mis. tombol "share ke WhatsApp" yang langsung
  membuka WA dengan draft pesan) — scope fitur ini murni menyalin ke clipboard, bukan integrasi
  share.
- Perubahan pada tampilan/format struk cetak (thermal printer) — fitur ini menyasar tampilan
  layar (web), bukan output cetak fisik.
- Event tracking/analytics dashboard baru di luar kebutuhan minimal untuk mengukur Success Metric
  di atas (implementasi detail tracking adalah keputusan teknis, bukan bagian dari PRD ini).

## Dependency

- **Clipboard API browser**: fitur bergantung pada `navigator.clipboard` (atau fallback
  `document.execCommand('copy')` untuk browser/kondisi yang tidak mendukung Clipboard API modern).
  Perlu dicek dukungan pada browser mobile yang umum dipakai target user (mis. Chrome Android,
  Safari iOS) dan konteks HTTPS (Clipboard API modern umumnya butuh secure context).
- **Ketersediaan nomor invoice di response API existing**: perlu dipastikan field nomor invoice
  transaksi sudah tersedia di endpoint yang men-supply data riwayat transaksi dan detail
  transaksi (`apps/api`) — tidak ada perubahan skema database yang diantisipasi untuk fitur ini,
  hanya konsumsi field yang sudah ada. Perlu diverifikasi oleh tim implementasi apakah field ini
  memang sudah ter-expose di kedua endpoint tersebut.
- **Komponen UI/notifikasi PrimeVue**: implementasi feedback visual (toast) kemungkinan memakai
  komponen Toast/Message yang sudah ada di `apps/web` (PrimeVue) — perlu dicek konsistensi dengan
  pola notifikasi yang sudah dipakai di modul lain agar tidak menambah pola baru yang tidak
  konsisten.
- **Event tracking (opsional, untuk Success Metric adopsi)**: kalau tim ingin mengukur adopsi
  fitur secara kuantitatif, perlu ada mekanisme analytics/event logging yang belum tentu tersedia
  saat ini di codebase — ini bergantung pada keputusan/infra analytics yang berada di luar scope
  PRD ini.

## Pertanyaan Terbuka

- Apakah ada tooling analytics/event tracking yang sudah terpasang di `apps/web` untuk mengukur
  adopsi fitur ini? Kalau belum ada, Success Metric adopsi tidak bisa diukur secara otomatis dan
  perlu didiskusikan alternatif pengukurannya (manual survey, dsb).
- Apakah ada data/laporan historis (mis. dari tim support atau keluhan pelanggan) soal insiden
  salah kirim/salah catat nomor invoice, untuk dijadikan baseline kuantitatif Success Metric
  reduksi kesalahan?
