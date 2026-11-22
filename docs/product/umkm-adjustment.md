# Adjustment Insell untuk UMKM

Status: DRAFT untuk diputuskan pemilik produk. Tanggal audit: 2026-11-22. Temuan kemudahan pakai (bagian 4) sudah diverifikasi ulang ke kode pada tanggal yang sama.
Tujuan: kembali ke target awal, yaitu POS yang sederhana untuk UMKM yang mulai berkembang (kafe, toko oleh-oleh, agro-tourism, multi-outlet), dan mudah dipakai kasir dan pemilik tanpa pelatihan panjang.

Tanda di dokumen ini:
- **[kode]** terbukti dari kode yang dibaca pada tanggal audit.
- **[belum dicek]** dugaan atau berasal dari audit sebelumnya, belum diverifikasi ulang.
- **[riset]** berasal dari halaman publik kompetitor (Majoo, Moka, Kasir Pintar, Loyverse), bukan dari uji langsung.

## 1. Prinsip keputusan
1. Setiap fitur baru harus dipakai kasir atau pemilik pada hari biasa, bukan hanya pada kondisi khusus.
2. Tidak menambah pengaturan wajib sebelum transaksi pertama. Pengaturan lanjutan boleh, asal ada nilai awal yang masuk akal.
3. Hindari wilayah "all-in-one" (akuntansi, pajak, payroll, CRM, loyalty). Posisi Insell: sederhana, tapi cukup serius untuk bisnis yang tumbuh.
4. Klaim di copy marketing hanya untuk yang tertulis sebagai ada di tabel 2.

## 2. Yang sudah ada [kode]
| Area | Kondisi |
|---|---|
| Kasir | Transaksi tunai, debit, e-wallet, QRIS (dicatat manual, lihat catatan), bayar-nanti ("Buat Pesanan", `pay_now: false`), tambah item ke pesanan, catatan per item, pilih meja opsional |
| Pembayaran tunai | Kalkulator angka, tombol "Uang Pas", tombol tambah pecahan (+1.000 sampai +100.000), kembalian otomatis. Tanpa konfirmasi kedua setelah "Bayar Sekarang" |
| Struk | Pratinjau dan cetak printer Bluetooth. Terbuka otomatis setelah bayar di kasir (bila punya izin `transaction.print`), dan bisa dibuka dari halaman daftar dan detail transaksi. Tombol "Kirim" membuka WhatsApp dengan teks struk terisi (nomor Indonesia opsional, terisi otomatis dari nomor pesanan self-order). Bukan integrasi API: kasir menekan kirim sendiri |
| Shift dan kas | Buka/tutup kasir opsional per outlet, kas awal, kas akhir, selisih, kas masuk/keluar, peserta dan handoff, audit log |
| Stok | Stok per outlet, stok awal dan stok minimum bisa diisi saat membuat produk (nilai awal 0), penyesuaian stok, riwayat stok, notifikasi stok rendah |
| Produk di kasir | Grid produk dipaginasi (`page`, `limit`), filter kategori, label "Stok: n", tag "Habis" dan "Stok Menipis", tombol coba lagi bila gagal dimuat |
| Pembatalan | Batal transaksi lewat dialog dengan alasan opsional (maks 255 karakter), stok dikembalikan, izin `transaction.cancel`. Alasan tersimpan di `transactions.cancel_reason` dan tampil di halaman detail |
| Diskon | Diskon per transaksi (nominal Rp atau persen) di pembayaran kasir, hanya untuk peran dengan izin `transaction.discount` (default: owner, manager, admin). Hanya saat bayar langsung. Disimpan di `transactions` (`discount_type`, `discount_value`, `discount_amount`), `total_amount` tetap nilai bersih yang dibayar. Tampil di struk (layar, gambar, Bluetooth) |
| Panduan awal | Halaman setelah login menampilkan langkah awal (produk pertama, staf, transaksi pertama), hanya untuk langkah yang diizinkan peran. Statis, tidak mendeteksi langkah yang sudah selesai |
| Outlet dan akses | Multi-outlet, RBAC per outlet berbasis permission, meja (`store_tables`) |
| Pelanggan | Self-order lewat katalog per outlet, sesi pelanggan dengan nama dan telepon |
| Laporan | Ringkasan, tren harian, produk terlaris, perbandingan outlet, ekspor (ringkasan, harian, produk terlaris, perbandingan outlet, transaksi) |

Catatan QRIS, debit, e-wallet: layar pembayaran hanya meminta kasir menampilkan QR, memakai mesin EDC, atau meminta pelanggan membayar lewat aplikasi, lalu mengonfirmasi. Tidak ada integrasi payment gateway. Jangan diklaim sebagai "pembayaran terintegrasi".

Catatan alasan pembatalan: sebelum 2026-11-22, `CancelTransactionDto` menerima `reason` tetapi controller tidak meneruskannya dan UI tidak mengirimnya, sehingga alasan tidak pernah tersimpan. Sudah diperbaiki (kolom `cancel_reason`, dialog alasan, tampil di detail). Transaksi yang dibatalkan sebelum perbaikan tetap tanpa alasan. Alasan belum tampil di daftar transaksi atau ekspor, dan belum masuk audit log.

Catatan migrasi: kolom `cancel_reason` butuh `prisma migrate deploy` di setiap environment **sebelum** kode baru dideploy. Tanpa itu, endpoint transaksi mengembalikan 500.

## 3. Yang belum ada [kode]
Terverifikasi: schema Prisma (`apps/api/prisma/schema.prisma`) tidak punya model atau kolom untuk diskon, varian, modifier, SKU, barcode, pajak, refund, void, loyalty, atau layar dapur. Tidak ada modul API maupun halaman merchant untuk impor massal atau WhatsApp.
- varian, modifier (tambahan topping, ukuran), SKU, barcode atau pemindai;
- promo otomatis atau diskon per item, diskon pada pesanan bayar-nanti, pajak, multi-satuan produk;
- refund dan void dengan persetujuan manager. Pembatalan hanya butuh izin, tanpa PIN, dan alasan masih opsional;
- pisah bayar (split bill);
- data pelanggan tetap. Yang ada hanya `customer_sessions` per kunjungan;
- impor produk massal;
- struk digital lewat email atau tautan publik (WhatsApp sudah ada sebagai teks, tanpa lampiran atau tautan);
- layar dapur (KDS). Status pesanan ada (`order_status`), tetapi tidak ada halaman atau modul dapur.

Sengaja belum ada (sesuai catatan proyek): akuntansi, pajak, CRM, loyalty, pembelian ke supplier, multi-gudang, analitik lanjutan.

## 4. Temuan kemudahan pakai (hasil verifikasi kode)
Kolom "Hasil" mencatat kondisi saat audit. Temuan 1, 2, 3, 5, 5b, 6, dan 7 sudah diperbaiki di Fase 1 (commit `f6d3fbc`), tetapi belum diuji manual di browser.

| # | Temuan lama | Hasil | Bukti |
|---|---|---|---|
| 1 | Tombol "Uang Pas" belum ada | **Benar.** Hanya ada tombol tambah pecahan yang menjumlah ke nominal yang sudah ada, tidak ada "uang pas" atau pembulatan ke atas | `transaction/components/PaymentModal.vue` (`cashBills`, `addBill`) |
| 2 | Konfirmasi ganda saat bayar | **Benar.** "Lanjut ke Pembayaran" membuka modal, lalu "Bayar Sekarang" memunculkan `showConfirm` lagi sebelum `emit('confirm')` | `PaymentModal.vue` `onConfirm`, `cashier/components/Cart.vue` `onCheckout` |
| 3 | Tidak ada struk otomatis setelah bayar | **Benar.** Setelah `postTransaction` sukses hanya toast "Transaksi Berhasil", keranjang dikosongkan, modal ditutup. Struk hanya bisa dibuka dari daftar atau detail transaksi | `Cart.vue` `onCheckout`, `ReceiptModal` hanya dipakai di `transaction/pages` |
| 4 | Grid produk belum dipaginasi | **Salah, sudah diperbaiki.** Grid memakai paginasi server (`page`, `limit`, `@page`) | `cashier/components/Product.vue` |
| 5 | Gagal muat shift hanya `console.error` | **Benar.** `fetchOutletShift` menangkap error dan hanya `console.error`, lalu `isShiftLoaded = true`. Kasir melihat layar buka shift atau kasir biasa tanpa tahu bahwa muat gagal. `fetchShiftSetting` hanya `.finally` tanpa `catch` | `cashier/pages/index.vue` |
| 5b | (baru) Gagal muat produk | **Sebagian.** Ada toast error, tetapi tidak ada tombol coba lagi dan `console.log(error)` tertinggal | `Product.vue` |
| 6 | Dropdown meja tampil untuk toko retail | **Benar.** Field "Meja" selalu dirender. Bila outlet tanpa meja, dropdown hanya `disabled` dan muncul teks "Tidak ada meja aktif untuk outlet ini." | `Cart.vue` |
| 7 | Label stok membingungkan | **Benar.** Kartu produk menampilkan angka `{{ stock_qty }}x` tanpa kata "stok". Tag "Stok Menipis" muncul bila `stock_qty <= min_stock`, jadi produk dengan `min_stock` 0 dan stok 0 juga ditandai menipis, bukan habis | `Product.vue` |

Temuan baru dari audit ini:
- **Pesanan kasir default bertanda offline.** `Cart.vue` menginisialisasi `is_offline: true`, dan `PaymentModal` menampilkan sakelar "Pesanan Offline?". Akibatnya hampir semua transaksi kasir tersimpan `is_offline = true`, padahal tidak ada mekanisme offline (lihat bagian 5). Label ini menyesatkan di data dan laporan.
- **Alasan batal tidak tersimpan.** Sudah diperbaiki (lihat catatan di bagian 2, commit `ca8f393`).
- **Setelah daftar atau login, pengguna diarahkan ke halaman landing** (`PRP_LANDING`) yang saat audit hanya berisi logo dan teks "The simple point of sale for UMKM." Tanpa panduan langkah awal. Sudah diperbaiki dengan langkah awal statis (commit `4548a70`).
- **Stok awal tidak selalu 0.** Form produk punya "Jumlah Stok" dan "Stok Minimum" (nilai awal 0, boleh diisi). Produk dan stok per outlet tetap tersimpan di dua tabel (`products`, `outlet_product_inventory`), tetapi dibuat dalam satu langkah dari form. Catatan lama di dokumen ini keliru.
- **Refactor `pos` menjadi `cashier` sudah di-commit** (`53483cf`). Catatan lama tentang berkas yang belum di-commit sudah usang. Working tree hanya berisi berkas tak terlacak `.caf/tasks/shift-kas/` dan dokumen ini.

## 5. Offline sync [kode]
Tidak ada bukti fitur offline di merchant app: tidak ada service worker, PWA/manifest, IndexedDB, atau antrean sinkronisasi (`package.json`, `vite.config.ts`, `public/`, dan `src` tidak memuatnya). Di API, `is_offline` hanya kolom boolean yang disimpan apa adanya (`dto.is_offline ?? false`), tanpa logika sinkronisasi atau penolakan terkait shift.
Konsekuensi:
- **Jangan diklaim di marketing.** Fitur offline sync belum ada.
- Kekhawatiran lama "transaksi offline ditolak di outlet yang shift-nya hidup" tidak ditemukan di kode API. Anggap tidak berlaku sampai ada desain offline yang nyata.
- Keputusan produk: hapus sakelar "Pesanan Offline?" dari kasir (atau default `false`) sampai fitur ada.

## 6. Perbandingan dengan kompetitor [riset]
Kompetitor menjual: integrasi GoFood/GrabFood/marketplace, QRIS terintegrasi, struk WhatsApp, loyalty dan CRM, KDS, varian dan modifier, otorisasi manager untuk void dan refund, absensi dan payroll, akuntansi. Majoo dan Moka sudah matang di semua itu dan menyasar "all-in-one", jadi bukan medan yang cocok untuk Insell sekarang.

Selisih yang bisa dijual Insell: shift dan kas opsional di paket dasar, self-order per outlet. Offline sync **tidak** termasuk (lihat bagian 5).

## 7. Rencana bertahap (usulan)
**Fase 1, kemudahan pakai (murah, dampak tiap transaksi)**
Status 2026-11-22: Fase 2 butir 8 (diskon) dan 11 (struk WhatsApp) juga sudah dikerjakan, lihat di bawah. Fase 1 butir 1 sampai 4, 6, dan 7 sudah dikerjakan dan di-commit (build merchant dan tes API transaksi lolos, belum diuji manual di browser). Butir 6: alasan batal opsional, disimpan di `transactions.cancel_reason`, migrasi `20261122000000_add_cancel_reason_to_transactions` belum dijalankan ke database mana pun. Butir 5 di-hold bersama offline sync.

1. ✅ Tombol "Uang Pas" di pembayaran tunai (temuan 1). Pembulatan nominal cepat selain tombol pecahan yang sudah ada belum dibuat.
2. ✅ Konfirmasi ganda dihapus. Struk terbuka otomatis setelah bayar, dengan tombol cetak (temuan 2, 3).
3. ✅ Status error dengan tombol coba lagi untuk shift dan grid produk, `console.log` dibersihkan (temuan 5, 5b).
4. ✅ Field meja disembunyikan untuk outlet tanpa meja. Label stok jadi "Stok: n", dengan tag "Habis" dan "Stok Menipis" (temuan 6, 7).
5. ⏸ **Ditahan bersama offline sync.** Sakelar "Pesanan Offline?" dan default `is_offline: true` di kasir belum diubah (bagian 5).
6. ✅ Alasan pembatalan tersimpan di `transactions.cancel_reason`, opsional, dengan dialog di daftar dan detail transaksi.
7. ✅ Langkah awal di halaman landing: produk pertama (dengan stok awal), staf, transaksi pertama. Statis, belum mendeteksi progres.

(Paginasi grid produk sudah ada sebelum audit, tidak perlu dikerjakan.)

**Fase 2, kebutuhan harian umum**
8. ✅ Diskon sederhana per transaksi (nominal atau persen), disimpan sebagai snapshot di transaksi. Dibatasi izin `transaction.discount`, hanya saat bayar langsung. Belum ada: diskon pada pesanan bayar-nanti, batas maksimum diskon per peran, laporan total diskon, dan UI untuk memberi izin ke peran kasir (lewat pengaturan peran).
9. Varian dan modifier produk (ukuran, topping) untuk kafe, dengan harga snapshot per item.
10. Otorisasi PIN manager untuk pembatalan dan void, alasan wajib, tercatat di audit log. Kolom alasan sudah ada (Fase 1 butir 6), tinggal mewajibkannya dan menambah PIN.
11. ✅ Struk digital lewat WhatsApp: teks struk dikirim lewat `wa.me` (bagikan, bukan integrasi API). Belum ada: tautan publik ke struk, lampiran gambar, pengiriman otomatis, dan nomor luar negeri (hanya nomor Indonesia).

**Fase 3, kontrol lanjutan**
12. Pelanggan tetap sederhana (nama, telepon, riwayat), tanpa loyalty.
13. Impor produk dari Excel atau CSV, untuk toko dengan banyak SKU.
14. Stok opname terjadwal dan stok terbuang.
15. Refund yang menyentuh kas shift. Perlu keputusan aturan kas.

**Tidak dikerjakan sekarang**
Akuntansi, pajak, payroll, loyalty, CRM, integrasi marketplace dan pesan-antar, pembelian ke supplier, multi-gudang, analitik lanjutan, offline sync.

## 8. Keputusan yang dibutuhkan
1. Setuju dengan urutan fase di atas, atau ada kebutuhan dari calon pengguna yang mengubah urutan?
2. Varian dan modifier (butir 9): apakah target pertama kafe, atau toko oleh-oleh dulu? Ini menentukan apakah butir 9 naik atau turun.
3. Offline sync: apakah memang mau dibangun? Bila ya, perlu desain sendiri (penyimpanan lokal, antrean, aturan shift). Bila tidak, hapus sakelar offline dan jangan diklaim.
4. Alasan pembatalan: saat ini opsional dan disimpan di kolom `transactions.cancel_reason` (asumsi sementara, belum diputuskan). Perlu diputuskan: wajib atau tetap opsional, dan apakah juga dicatat di audit log?
5. Apakah ada pengguna uji pertama? Fase 1 sudah selesai kecuali butir 5. Bila ada, pakai untuk uji manual dan amati langkah awal di halaman landing.
6. Panduan awal: cukup statis seperti sekarang, atau perlu mendeteksi langkah yang sudah selesai (butuh hitung produk, staf, transaksi per outlet)?

## 9. Yang belum diverifikasi
- Semua perubahan Fase 1 belum diuji manual di browser. Yang lolos hanya build merchant (`vue-tsc` dan Vite) dan 23 tes transaksi API. Tidak ada tes otomatis untuk frontend.
- Struk otomatis setelah bayar: nama outlet, lokasi, dan nama kasir diisi dari sesi login karena respons `POST /transactions` tidak memuat relasi `outlets` dan `users`. Hasil cetaknya belum dicek di printer nyata.
- Aturan shift di API tidak ditemukan terkait `is_offline`, tetapi pencarian terbatas pada nama berkas `shifts` dan `transactions`.
- Isi lengkap alur cetak Bluetooth tidak diuji di perangkat nyata.
- `pnpm --filter umkm-pos-api lint:ci` gagal karena error prettier di `src/stock/dto/stock-logs-query.dto.ts`. Sudah ada sebelum Fase 1 dan tidak terkait.
