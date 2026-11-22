# Adjustment Insell untuk UMKM

Tanggal audit: 2026-11-22. Tujuan: kembali ke target awal, yaitu POS yang sederhana untuk UMKM yang mulai berkembang (kafe, toko oleh-oleh, agro-tourism, multi-outlet), dan mudah dipakai kasir dan pemilik tanpa pelatihan panjang.

**Status:** seluruh rencana (Fase 1 sampai 3, 15 butir) sudah dikerjakan dan di-commit, kecuali Fase 1 butir 5 yang sengaja ditahan bersama offline sync. Build merchant dan tes API lolos, tetapi **belum ada yang diuji manual di browser** (bagian 9). Sebelum deploy, baca bagian 10.

Tanda di dokumen ini:
- **[kode]** terbukti dari kode yang dibaca.
- **[riset]** berasal dari halaman publik kompetitor (Majoo, Moka, Kasir Pintar, Loyverse), bukan dari uji langsung.

## 1. Prinsip keputusan
1. Setiap fitur baru harus dipakai kasir atau pemilik pada hari biasa, bukan hanya pada kondisi khusus.
2. Tidak menambah pengaturan wajib sebelum transaksi pertama. Pengaturan lanjutan boleh, asal ada nilai awal yang masuk akal.
3. Hindari wilayah "all-in-one" (akuntansi, pajak, payroll, CRM, loyalty). Posisi Insell: sederhana, tapi cukup serius untuk bisnis yang tumbuh.
4. Klaim di copy marketing hanya untuk yang tertulis sebagai ada di tabel 2.

## 2. Yang sudah ada [kode]
| Area | Kondisi |
|---|---|
| Kasir | Tunai, debit, e-wallet, QRIS (dicatat manual, lihat catatan), bayar-nanti ("Buat Pesanan"), tambah item ke pesanan, catatan per item, meja opsional (field disembunyikan bila outlet tanpa meja) |
| Pembayaran tunai | Kalkulator, tombol "Uang Pas", tombol tambah pecahan, kembalian otomatis, tanpa konfirmasi ganda |
| Produk di kasir | Grid dipaginasi, filter kategori, label "Stok: n", tag "Habis" dan "Stok Menipis", tombol coba lagi bila gagal dimuat |
| Varian dan modifier | Grup opsi per produk (nama, wajib atau opsional, satu atau banyak pilihan) berisi opsi dengan tambahan harga, mis. "Ukuran" (wajib, satu) dan "Topping" (opsional, banyak). Diatur di form produk. Di kasir, produk beropsi membuka dialog pilihan. Baris keranjang dibedakan menurut produk dan opsi, stok tetap per produk. Harga satuan di transaksi sudah termasuk opsi, pilihan dibekukan di `transaction_items.options_snapshot` dan tampil di struk dan detail transaksi. Juga tersedia di menu QR pelanggan (lihat baris Self-order) |
| Diskon | Per transaksi, nominal Rp atau persen, hanya saat bayar langsung dan hanya untuk peran berizin `transaction.discount` (default owner, manager, admin). `total_amount` tetap nilai bersih yang dibayar, subtotal dan diskon tampil di struk |
| Struk | Terbuka otomatis setelah bayar (izin `transaction.print`), bisa dibuka dari daftar dan detail transaksi, cetak Bluetooth, unduh gambar. Tombol "Kirim" membuka WhatsApp dengan teks struk terisi (nomor Indonesia, terisi otomatis dari pelanggan terpilih). Bukan integrasi API: kasir menekan kirim sendiri |
| Pelanggan tetap | Menu "Pelanggan": daftar, cari (nama atau nomor), tambah, ubah, hapus, riwayat (jumlah transaksi, total belanja tanpa yang dibatalkan, terakhir datang, 10 transaksi terakhir). Nomor dinormalisasi ke 62..., unik per merchant. Dipilih atau didaftarkan di pembayaran kasir, tersimpan di `transactions.customer_id` plus snapshot nama dan nomor. Izin `customer.*`: owner, manager, admin penuh, kasir hanya lihat dan daftar. Tanpa loyalty |
| Pembatalan dan refund | Dialog dengan alasan **wajib** (3 sampai 255 karakter), stok dikembalikan. Kasir harus memasukkan PIN 6 digit manager atau owner di outlet itu, pemegang `transaction.cancel_approve` (default owner, manager, admin) membatalkan tanpa PIN. Tersimpan: `cancel_reason`, `cancelled_by`, `cancel_approved_by`, `cancelled_at`. PIN diatur di Pengaturan, "PIN Persetujuan" (bcrypt), 5 PIN salah mengunci pengguna itu 5 menit. **Refund tunai:** bila penjualan berasal dari shift yang sudah ditutup, otomatis dicatat kas keluar "Refund #id" (plus entri audit shift) di shift yang sedang terbuka, dan ditolak bila tidak ada shift terbuka. Bila shift asalnya masih terbuka, penjualan itu cukup keluar dari hitungan. Selalu seluruh transaksi |
| Shift dan kas | Buka/tutup kasir opsional per outlet, kas awal, kas akhir, selisih, kas masuk/keluar, peserta dan handoff, audit log |
| Stok | Stok per outlet, stok awal dan minimum diisi saat membuat produk, penyesuaian (termasuk stok terbuang: rusak, kedaluwarsa, hilang), **stok opname massal** (halaman "Stok Opname": isi hasil hitung per produk, selisih disesuaikan sekaligus dengan satu `ref_id` per sesi), riwayat stok, notifikasi stok rendah |
| Impor produk | Tombol "Impor" di daftar produk: CSV atau Excel dengan kolom nama dan harga, opsional modal, kategori, stok, stok minimum (nama kolom Indonesia atau Inggris, angka "15.000" dibaca benar), template CSV, pratinjau. Maks 500 produk, stok masuk ke outlet aktif, kategori baru dibuat otomatis. Semua atau tidak sama sekali: satu baris bermasalah menolak seluruh file dengan daftar kesalahan per baris |
| Panduan awal | Halaman setelah login menampilkan langkah awal (produk pertama, staf, transaksi pertama) sesuai izin peran. Statis, tidak mendeteksi langkah yang sudah selesai |
| Outlet dan akses | Multi-outlet, RBAC per outlet berbasis permission, meja (`store_tables`) |
| Self-order (menu QR) | Pelanggan memindai QR outlet, mengisi nama dan telepon (`customer_sessions`), memilih menu, meja, dan memesan. Produk dengan grup opsi menampilkan tombol "Pilih Opsi" dan dialog pilihan yang sama dengan kasir. Keranjang membedakan baris menurut produk dan opsi, dan pesanan mengirim `option_ids` yang divalidasi ulang di API. Produk yang stoknya 0 di outlet disembunyikan |
| Laporan | Ringkasan, tren harian, produk terlaris, perbandingan outlet, ekspor |

Catatan QRIS, debit, e-wallet: layar pembayaran hanya meminta kasir menampilkan QR, memakai mesin EDC, atau meminta pelanggan membayar lewat aplikasi, lalu mengonfirmasi. Tidak ada integrasi payment gateway. Jangan diklaim sebagai "pembayaran terintegrasi".

## 3. Yang belum ada [kode]
- SKU, barcode atau pemindai, stok per opsi atau bahan baku (stok tetap per produk);
- promo otomatis, diskon per item, diskon pada pesanan bayar-nanti, pajak, multi-satuan produk;
- refund sebagian per item, refund non-tunai yang tercatat di kas (QRIS, debit, e-wallet dikembalikan di luar sistem), status "refund" terpisah dari "batal";
- pisah bayar (split bill);
- struk digital lewat email, tautan publik, atau lampiran gambar (WhatsApp hanya teks);
- layar dapur (KDS): status pesanan ada (`order_status`), tetapi tidak ada halaman dapur;
- loyalty, pelanggan pada pesanan bayar-nanti dan self-order, nama pelanggan di laporan.

Sengaja belum ada (sesuai catatan proyek): akuntansi, pajak, CRM, loyalty, pembelian ke supplier, multi-gudang, analitik lanjutan.

## 4. Temuan audit kemudahan pakai
Hasil verifikasi kode pada 2026-11-22 dan statusnya:

| # | Temuan | Hasil audit | Status |
|---|---|---|---|
| 1 | Tombol "Uang Pas" belum ada | Benar, hanya ada tombol tambah pecahan | Diperbaiki |
| 2 | Konfirmasi ganda saat bayar | Benar, modal lalu `showConfirm` lagi | Diperbaiki |
| 3 | Tidak ada struk setelah bayar | Benar, hanya toast | Diperbaiki |
| 4 | Grid produk belum dipaginasi | **Salah**, sudah dipaginasi sejak awal | Tidak perlu |
| 5 | Gagal muat shift hanya `console.error` | Benar, kasir tidak tahu muat gagal | Diperbaiki (pesan dan tombol coba lagi) |
| 5b | Gagal muat produk tanpa tombol coba lagi | Sebagian, ada toast | Diperbaiki |
| 6 | Dropdown meja tampil untuk retail | Benar | Diperbaiki (field disembunyikan) |
| 7 | Label stok membingungkan | Benar (`5x`, stok 0 ditandai "menipis") | Diperbaiki ("Stok: n", tag "Habis") |
| 8 | Alasan batal tidak tersimpan | Benar: DTO menerima `reason`, controller dan UI tidak meneruskannya | Diperbaiki |
| 9 | Halaman setelah login kosong | Benar, hanya logo | Diperbaiki (langkah awal) |
| 10 | Stok awal produk selalu 0 | **Salah**, form punya kolom stok | Tidak perlu |
| 11 | Pesanan kasir default `is_offline: true` | Benar, label menyesatkan | **Ditahan** (bagian 5) |

## 5. Offline sync [kode]
Tidak ada fitur offline di merchant app: tidak ada service worker, PWA/manifest, IndexedDB, atau antrean sinkronisasi. Di API, `is_offline` hanya kolom boolean yang disimpan apa adanya, tanpa logika sinkronisasi atau penolakan terkait shift. Kasir menginisialisasinya `true` dan `PaymentModal` menampilkan sakelar "Pesanan Offline?", jadi hampir semua transaksi kasir tersimpan `is_offline = true`.

Konsekuensi:
- **Jangan diklaim di marketing.** Offline sync belum ada.
- Kekhawatiran lama "transaksi offline ditolak di outlet yang shift-nya hidup" tidak ditemukan di kode API.
- Fase 1 butir 5 (hapus sakelar atau default `false`) ditahan sampai ada keputusan membangun offline sync atau tidak.

## 6. Perbandingan dengan kompetitor [riset]
Kompetitor menjual: integrasi GoFood/GrabFood/marketplace, QRIS terintegrasi, struk WhatsApp, loyalty dan CRM, KDS, varian dan modifier, otorisasi manager untuk void dan refund, absensi dan payroll, akuntansi. Majoo dan Moka sudah matang di semua itu dan menyasar "all-in-one", jadi bukan medan yang cocok untuk Insell sekarang.

Selisih yang bisa dijual Insell: shift dan kas opsional di paket dasar, refund tunai yang tercatat di kas shift, self-order per outlet. Offline sync **tidak** termasuk (bagian 5).

## 7. Rencana dan statusnya
✅ selesai, ⏸ ditahan. Kolom "Belum ada" adalah batas yang diketahui.

**Fase 1, kemudahan pakai**
| # | Butir | Status | Belum ada |
|---|---|---|---|
| 1 | Tombol "Uang Pas" | ✅ | Pembulatan nominal cepat selain tombol pecahan |
| 2 | Hapus konfirmasi ganda, struk otomatis setelah bayar | ✅ | |
| 3 | Status error dengan tombol coba lagi (shift, produk) | ✅ | |
| 4 | Sembunyikan meja untuk retail, label stok | ✅ | |
| 5 | Sakelar "Pesanan Offline?" | ⏸ | Ditahan bersama offline sync |
| 6 | Alasan pembatalan tersimpan | ✅ | Tampil di daftar transaksi dan ekspor |
| 7 | Langkah awal di halaman pertama | ✅ | Deteksi progres langkah |

**Fase 2, kebutuhan harian**
| # | Butir | Status | Belum ada |
|---|---|---|---|
| 8 | Diskon per transaksi | ✅ | Diskon pesanan bayar-nanti, batas maksimum per peran, laporan total diskon |
| 9 | Varian dan modifier (kafe) | ✅ | Ubah satu opsi tanpa mengganti seluruh grup (id opsi ikut berubah, keranjang terbuka perlu diisi ulang), opsi per outlet, stok per opsi, laporan per opsi |
| 10 | PIN manager untuk pembatalan | ✅ | Entri audit log umum (yang ada khusus shift), nama pembatal dan penyetuju di UI, penguncian PIN tahan restart dan multi-server (sekarang di memori proses), PIN untuk diskon |
| 11 | Struk digital WhatsApp | ✅ | Tautan publik, lampiran gambar, kirim otomatis, nomor luar negeri |

**Fase 3, kontrol lanjutan**
| # | Butir | Status | Belum ada |
|---|---|---|---|
| 12 | Pelanggan tetap | ✅ | Pelanggan di bayar-nanti dan self-order, nama pelanggan di struk dan laporan, impor, gabung data ganda |
| 13 | Impor produk CSV/Excel | ✅ | Memperbarui produk yang sudah ada (nama sama ditolak), impor opsi, gambar, SKU, stok multi-outlet |
| 14 | Stok opname dan stok terbuang | ✅ | Jadwal atau pengingat rutin, daftar riwayat sesi opname, persetujuan selisih besar, produk tanpa baris stok di outlet tidak terdaftar. Stok terbuang sudah ada sejak awal lewat penyesuaian stok |
| 15 | Refund yang menyentuh kas shift | ✅ | Refund sebagian per item, refund non-tunai di kas, laporan refund. Pembatalan tunai sebelum 2026-11-22 tidak punya entri kas dan tidak dikoreksi mundur |

**Tidak dikerjakan sekarang:** akuntansi, pajak, payroll, loyalty, CRM, integrasi marketplace dan pesan-antar, pembelian ke supplier, multi-gudang, analitik lanjutan, offline sync.

## 8. Keputusan yang masih terbuka
1. **Offline sync:** dibangun atau tidak? Bila ya, perlu desain sendiri (penyimpanan lokal, antrean, aturan shift). Bila tidak, hapus sakelar offline (Fase 1 butir 5) dan jangan diklaim.
2. **Alasan pembatalan:** sekarang wajib dan disimpan di `transactions`. Perlu juga masuk tabel audit log umum?
3. **Panduan awal:** cukup statis, atau perlu mendeteksi langkah yang sudah selesai?
4. **Pengguna uji pertama:** adakah? Bila ada, pakai untuk uji manual (bagian 9) dan amati langkah awal serta alur pembatalan dengan PIN.

Keputusan yang sudah diambil: urutan fase, kafe sebagai target pertama varian, izin diskon lewat `transaction.discount`, PIN manager untuk pembatalan, refund tunai sebagai kas keluar di shift berjalan dan hanya seluruh transaksi.

## 9. Yang belum diverifikasi
- **Tidak ada yang diuji manual di browser.** Yang lolos: build merchant (`vue-tsc` dan Vite), 368 tes API, `lint:ci` API. Tidak ada tes otomatis untuk frontend.
- Hasil cetak struk (termasuk nama outlet, lokasi, kasir yang diisi dari sesi login karena respons `POST /transactions` tidak memuat relasi) belum dicek di printer Bluetooth nyata.
- Hasil insert izin di migrasi (`transaction.discount`, `transaction.cancel_approve`, `customer.*`) ke peran owner, manager, admin, cashier belum diperiksa langsung di database.
- Halaman pengaturan peran belum dicek apakah menampilkan izin baru, yang dibutuhkan bila kasir perlu diberi diskon.
- Alur impor dengan file Excel nyata (hanya CSV yang diuji lewat skrip).
- Alur menu QR dengan opsi: dialog pilihan di perangkat pelanggan, keranjang tersimpan (pelanggan yang keranjangnya dibuat sebelum fitur ini tetap berfungsi lewat fallback kunci baris), dan pesanan tambahan ke pesanan yang masih aktif. Hanya logika API dan build yang dicek.

## 10. Catatan operasional
**Urutan deploy.** Jalankan `prisma migrate deploy` di setiap environment **sebelum** kode API baru dideploy. Kode baru memilih kolom dan tabel baru, jadi tanpa migrasi endpoint terkait mengembalikan 500. Migrasi baru, berurutan:

| Migrasi | Isi |
|---|---|
| `20261122000000_add_cancel_reason_to_transactions` | `transactions.cancel_reason` |
| `20261122010000_add_discount_to_transactions` | kolom diskon, izin `transaction.discount` |
| `20261122020000_add_cancel_approval` | `users.pin_hash`, `cancelled_by`, `cancel_approved_by`, `cancelled_at`, izin `transaction.cancel_approve` |
| `20261123000000_add_product_options` | tabel grup dan opsi, `transaction_items.options_snapshot` |
| `20261123010000_add_customers` | tabel `customers`, `transactions.customer_id`, izin `customer.*` |

Tabel baru memakai `utf8mb4_unicode_ci` seperti tabel lain, karena FK antar kolom `CHAR(36)` menolak collation yang berbeda. Jangan memakai `prisma migrate dev` di database lokal yang riwayat migrasinya menyimpang (ada migrasi lama yang tidak ada di folder), pakai `migrate deploy`.

**Setelah deploy.**
- Pengguna harus **login ulang** agar izin baru terbaca di frontend.
- Atur PIN persetujuan manager atau owner di tiap outlet (Pengaturan, "PIN Persetujuan") **sebelum** kasir dipakai. Tanpa itu kasir tidak bisa membatalkan transaksi (pesan: "No manager with an approval PIN is set for this outlet").
- Kasir tidak mendapat izin diskon secara default.

**Dev server.** Setelah `prisma generate` atau migrasi, restart dev server API (`pnpm --filter umkm-pos-api start:dev`). Pada 2026-11-22, setelah beberapa kali `prisma generate`, `nest build`, dan migrasi saat `nest start --watch` hidup, proses aplikasi di bawah watcher mati sementara watcher-nya tetap berjalan: tidak ada yang mendengarkan port 3030 dan file yang disentuh tidak memicu start ulang. Server yang dijalankan bersih dengan build terbaru dan database termigrasi menjawab 200 di semua endpoint utama. Dugaan (belum terbukti): proses yang hidup selama `generate` membawa Prisma client yang tidak cocok dengan database dan mengembalikan 500.
