# Adjustment fitur Shift menjadi Buka/Tutup Kasir

Status: DRAFT untuk diputuskan pemilik produk. Tanggal: 2026-11-23.
Tanda: **[kode]** terbukti dari kode yang dibaca hari ini. **[riset]** dari halaman publik kompetitor. **[belum dicek]** dugaan.

## 1. Latar belakang
Shift sekarang sudah memuat kas awal, kas akhir, selisih, kas masuk/keluar, refund tunai, dan setelan aktif/mati per outlet. Namanya dan tampilannya masih peninggalan versi awal yang berfokus pada peserta dan handoff, bukan pada uang.

Kondisi sekarang [kode]:
- Menu "Shift" berisi dua tab: "Shift Saat Ini" dan "Riwayat Shift".
- "Shift Saat Ini" menampilkan kartu status (tombol Buka/Tutup Shift, jumlah peserta, total transaksi, waktu shift), manajemen peserta, dan metrik per peserta.
- Tombol "Catat Kas" hanya ada di halaman detail shift, tidak di layar kasir atau halaman "Shift Saat Ini". Daftar kas masuk/keluar juga hanya di detail.
- Respons shift memuat kas awal, kas akhir, kas seharusnya, selisih, daftar catatan kas, total kas masuk dan keluar. Rincian penjualan tunai per shift tidak ada di respons.
- Refund tunai dicatat sebagai kas keluar di shift yang sedang terbuka (alasan berawalan "Refund #").
- Tutup kasir tidak memeriksa pesanan yang masih terbuka atau belum dibayar (`closeShift` di `apps/api/src/shifts/shifts.service.ts`).
- Kas awal harus diketik manual setiap buka.

## 2. Temuan riset kompetitor [riset]
- Majoo memakai istilah "Buka Kasir" dan "Tutup Kasir", ada laporan tutup kasir yang bisa dicetak, kas awal default yang terisi otomatis, tutup kasir otomatis pada jam tertentu, batas kas keluar harian, otorisasi PIN, dan "tutup toko" yang merangkum semua shift dalam satu laporan.
- Loyverse dan Square menaruh Pay In/Pay Out di menu shift yang sama dengan buka/tutup. Square menampilkan kas seharusnya selama sesi berjalan.
- Shopify menyebut menghitung kas lebih dulu sebelum melihat angka sistem (blind closing) sebagai praktik baik.
- Poster dan Aloha dapat melarang tutup shift bila masih ada pesanan terbuka. Aloha memakai kode alasan untuk pay in/out.

## 3. Keputusan yang diusulkan
### 3.1 Penamaan (hanya label, bukan kode)
| Sekarang | Usulan |
|---|---|
| Menu "Shift" | "Buka/Tutup Kasir" |
| Tab "Shift Saat Ini" / "Riwayat Shift" | "Hari Ini" / "Riwayat" |
| "Buka Shift" / "Tutup Shift" | "Buka Kasir" / "Tutup Kasir" |
| "Oper Shift" | "Serah Terima Kasir" |
| "Peserta" | "Kasir Bertugas" |
| "Detail Shift" | "Laporan Kasir" |
| "Kas Masuk / Keluar", "Catat Kas" | tetap |
Nama tabel, endpoint, permission (`shift.*`), dan nama berkas tidak diubah.

### 3.2 Prinsip tampilan
1. Uang lebih dulu, peserta belakangan. Halaman "Hari Ini" membuka dengan kas awal, kas masuk, kas keluar, dan jumlah transaksi.
2. Satu tindakan utama per keadaan: Buka Kasir bila tutup, Tutup Kasir bila buka.
3. Catat Kas bisa dicapai dari layar kasir tanpa pindah halaman.
4. Bagian peserta dan serah terima dilipat, dan hanya tampil bila outlet punya lebih dari satu pengguna.
5. Setelah tutup, tampil satu ringkasan yang bisa dibagikan.

### 3.3 Aturan hitung buta
Aturan B-1 tetap: kas seharusnya tidak tampil ke kasir sebelum kas akhir diisi. Usulan: pemilik (pengguna dengan izin laporan) boleh melihat kas seharusnya selama shift berjalan, kasir tidak. **Perlu keputusan** (lihat bagian 6).

## 4. Perubahan UI
| Layar | Perubahan |
|---|---|
| Hari Ini, kasir buka | Kartu status hijau (siapa, sejak jam berapa), tombol Tutup Kasir. Tiga ubin uang (kas awal, kas masuk, kas keluar), ubin transaksi, ubin "kas seharusnya" terkunci untuk kasir. Tombol Kas Masuk dan Kas Keluar. Daftar catatan kas. Bagian "Kasir Bertugas" dilipat. |
| Hari Ini, kasir tutup | Keadaan kosong dengan satu tombol Buka Kasir. Petunjuk: kas awal terisi dari kas akhir shift terakhir. |
| Dialog Buka Kasir | Kas awal terisi otomatis dan bisa diubah. Bila beda dari kas akhir terakhir, tampilkan selisihnya. |
| Dialog Tutup Kasir | Penghitung pecahan uang (jumlah lembar per nominal) yang mengisi total kas akhir. Peringatan bila masih ada pesanan belum dibayar. |
| Ringkasan tutup kasir | Kas awal, penjualan tunai, kas masuk, kas keluar, kas seharusnya, kas akhir, selisih (hijau, kuning, atau merah). Tombol Bagikan dan Cetak. |
| Riwayat | Daftar dengan kolom tanggal, kasir, kas awal, kas akhir, selisih. Selisih memakai penanda warna. Filter periode dan filter "ada selisih". |
| Layar kasir | Bar tipis: status, kas awal, tombol Catat Kas, tombol Tutup Kasir. Menggantikan kartu status besar yang sekarang. |

Rancangan visual: lihat artifak "Buka/Tutup Kasir, rancangan UI".

## 5. Pekerjaan teknis yang dibutuhkan
Tanpa perubahan API (hanya frontend): ganti label, susun ulang halaman, pintasan Catat Kas di layar kasir, daftar catatan kas di "Hari Ini", lipat bagian peserta, kolom selisih di riwayat.

Perlu perubahan API:
- kas akhir terakhir outlet, untuk kas awal otomatis;
- rincian penjualan tunai per shift di respons shift (sekarang hanya total yang disimpan sebagai kas seharusnya);
- jumlah pesanan belum dibayar di outlet saat tutup kasir, dan aturan apakah memblokir atau hanya memperingatkan;
- izin atau penanda untuk melihat kas seharusnya selama shift berjalan (bagian 3.3);
- data untuk bagikan atau cetak ringkasan [belum dicek: struk dan printer Bluetooth sudah ada untuk transaksi, perlu diperiksa untuk laporan].

Pekerjaan lanjutan, tidak masuk batch pertama: tutup kasir otomatis pada jam tertentu, batas kas keluar harian, kode alasan kas keluar, laporan harian outlet ("tutup toko"), peringatan shift lupa ditutup.

## 6. Keputusan yang dibutuhkan
1. Kas seharusnya selama shift berjalan: dikunci untuk kasir dan terbuka untuk pemilik (usulan), atau dikunci untuk semua sampai tutup?
2. Pesanan belum dibayar saat tutup kasir: blokir, atau peringatan yang bisa dilewati?
3. Setelan aktif/mati: tetap bawaan hidup, atau bawaan mati untuk outlet baru yang hanya punya satu pengguna?
4. Nama menu: "Buka/Tutup Kasir" atau "Kasir & Kas"?

## 7. Urutan pengerjaan (usulan)
1. Ganti label dan susun ulang halaman "Hari Ini" tanpa mengubah API.
2. Pintasan Catat Kas dan bar status di layar kasir.
3. Kas awal otomatis dan ringkasan tutup kasir yang bisa dibagikan.
4. Penghitung pecahan uang dan peringatan pesanan belum dibayar.
5. Riwayat dengan selisih dan filter.
6. Lanjutan: tutup kasir otomatis, batas kas keluar, kode alasan, laporan harian outlet.
