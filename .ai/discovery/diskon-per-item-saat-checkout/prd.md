# Product Requirement Document (PRD)
## Diskon per-item saat checkout

---

## Problem
Dalam operasional harian UMKM, kasir sering menghadapi kebutuhan untuk memberikan potongan harga khusus pada baris produk tertentu saat transaksi berlangsung di meja kasir. Kondisi ini mencakup:
- Penjualan produk *clearance sale* atau stok lama yang mendekati masa kedaluwarsa.
- Produk dengan kerusakan minor pada kemasan (kemasan penyok/robek ringan) yang tetap layak jual dengan potongan harga khusus.
- Negosiasi harga *ad-hoc* atau diskon khusus langsung untuk pelanggan tertentu pada menu/item tertentu.
- Promo khusus item tunggal tanpa perlu mendiskon seluruh total tagihan transaksi atau mengubah master harga katalog produk.

Saat ini, sistem POS belum mendukung pemberian diskon per baris item. Kasir terpaksa mengubah harga master produk secara langsung (yang berisiko merusak histori data katalog produk lain) atau memberikan diskon menyeluruh pada level total tagihan (yang membuat laporan marjin dan performa per produk menjadi bias). Di sisi database, `transaction_items` saat ini hanya mencatat `price_snapshot`, `qty`, `subtotal`, dan `customer_note` tanpa rekaman diskon item, sehingga rincian diskon per produk tidak dapat dilacak secara akurat.

---

## Target User
1. **Kasir**: Petugas operasional garis depan yang memasukkan transaksi pesanan, mengaplikasikan potongan harga per item secara cepat saat melayani pelanggan, dan mencetak struk belanja.
2. **Kasir Senior**: Staf kasir berpengalaman yang menangani pesanan khusus dan negosiasi harga harian di outlet.
3. **Store Manager (Manajer Outlet)**: Penanggung jawab operasional outlet yang memantau performa penjualan, mengevaluasi konsistensi diskon per item, dan merekonsiliasi kas/laporan harian.
4. **Pemilik Usaha UMKM (Merchant Owner)**: Pengambil keputusan bisnis yang membutuhkan visibilitas penuh atas potongan harga per produk, laporan marjin kotor yang valid, serta data penjualan akurat per SKU.

---

## Success Metric
1. **Kecepatan Input Diskon**: Rata-rata waktu yang dibutuhkan kasir untuk mengaplikasikan diskon pada suatu baris item di cart < 5 detik per item.
2. **Akurasi Perhitungan Finansial**: 0 selisih hitung antara subtotal item, nilai diskon, perhitungan pajak, dan total akhir pembayaran pada frontend maupun backend.
3. **Integritas Pencatatan Data**: 100% item transaksi yang mendapatkan diskon tercatat tipe diskon (`percentage`/`fixed`), nilai input diskon, jumlah nominal potongan (`discount_amount`), dan `subtotal` akhirnya di database `transaction_items`.
4. **Kepatuhan Validasi**: 0 transaksi berhasil dibuat dengan nominal diskon melebihi nilai kotor (*gross subtotal*) item atau persentase di luar rentang valid (0–100%).

---

## Scope
1. **Input Diskon Manual per Item di Cart Kasir**:
   - Menyediakan antarmuka input diskon per baris item pada cart POS kasir.
   - Mendukung 2 mode diskon:
     - **Persen (`%`)**: Potongan berupa persentase nilai kotor item (contoh: `10%`, `25%`).
     - **Nominal Tetap (`Rp`)**: Potongan bernilai nominal rupiah langsung (contoh: `Rp 5.000`).
2. **Kalkulasi Otomatis Subtotal Item**:
   - Menghitung nilai potongan diskon (`discount_amount`):
     - Mode Persen: `discount_amount = (price_snapshot * qty) * (discount_value / 100)`.
     - Mode Nominal: `discount_amount = discount_value`.
   - Menghitung subtotal akhir baris item: `subtotal = (price_snapshot * qty) - discount_amount`.
   - Menghubungkan kalkulasi subtotal item ke ringkasan total kotor, pajak, dan total tagihan transaksi.
3. **Validasi Aturan Diskon**:
   - Validasi diskon persentase: nilai berada dalam rentang `0` sampai `100%`.
   - Validasi diskon nominal: nilai `discount_value >= 0` dan tidak boleh melebihi gross subtotal (`price_snapshot * qty`). Subtotal item tidak boleh bernilai negatif (`subtotal >= 0`).
   - Validasi dilakukan secara konsisten di client-side (antarmuka kasir) dan server-side (backend payload validation).
4. **Penyimpanan Atribut Diskon pada Item Transaksi**:
   - Menambahkan atribut diskon pada tabel `transaction_items` dan DTO transaksi:
     - `discount_type`: tipe diskon (`percentage` / `fixed` / `null`).
     - `discount_value`: nilai input diskon awal (persen atau nominal rupiah).
     - `discount_amount`: total nominal rupiah potongan yang diterapkan pada baris item tersebut.
     - `subtotal`: nilai bersih baris item setelah dikurangi diskon.
5. **Rekapitulasi Breakdown Diskon Item**:
   - Menampilkan label diskon dan nominal potongan pada masing-masing baris item di ringkasan cart kasir.
   - Menampilkan detail harga awal, potongan diskon per item, dan harga akhir pada struk transaksi fisik/bluetooth dan receipt preview.
   - Menampilkan rincian diskon per baris item pada halaman detail transaksi POS (`/transaction/detail/:id`).
6. **Reset / Hapus Diskon per Item**:
   - Kasir dapat menghapus atau mereset diskon pada baris item sebelum pembayaran diselesaikan, mengembalikan subtotal item ke harga normal (`price_snapshot * qty`).

---

## Out-of-Scope
1. **Diskon Otomatis via Promo Engine / Voucher / Kupon**:
   - Aturan promosi berbasis kode voucher/kupon, *buy 1 get 1*, atau *bundle deal* otomatis dikerjakan pada inisiatif terpisah (*promo/voucher engine*).
2. **Diskon Bertingkat / Multi-Tier Diskon Gabungan**:
   - Penggabungan diskon bertingkat (misal: diskon 20% kemudian ditambah potongan Rp 10.000 pada satu baris item yang sama) tidak didukung; satu baris item hanya menerima satu konfigurasi diskon aktif.
3. **Diskon per Item pada Customer Self-Order**:
   - Fitur diskon manual per item dinonaktifkan pada katalog publik pelanggan mandiri (*customer self-order* di `/menu/:outletId`) dan hanya dapat diakses melalui antarmuka kasir POS.
4. **Approval PIN / Otorisasi Manajer Khusus**:
   - Mekanisme approval bertingkat atau otorisasi PIN manajer untuk diskon di atas batas nominal tertentu tidak termasuk dalam fase rilis awal ini dan akan dievaluasi pada iterasi lanjutan.

---

## Dependency
1. **Modul Transaksi & Transaksi Item Backend**:
   - Modul `apps/api/src/transactions` dan `apps/api/src/transaction_items`.
   - Penyesuaian Prisma schema `transaction_items` untuk menyimpan kolom `discount_type`, `discount_value`, dan `discount_amount`.
   - Validasi payload DTO `create-transaction.dto.ts` dan logika kalkulasi harga di `transactions.service.ts`.
2. **Modul POS Kasir Frontend**:
   - Antarmuka cart kasir di `apps/web/src/modules/transaction` (`/cashier`, `/transaction/create`).
   - Komponen modal/popover/inline input diskon per baris item dan state management cart.
3. **Komponen Print Struk & Receipt Generator**:
   - Template cetak struk di `apps/web/src/modules/transaction/utils/receiptGenerator.ts`, `ReceiptPreview.vue`, dan utility `bluetoothPrinter.ts` untuk menampilkan breakdown diskon per item.
4. **Sinkronisasi Kalkulasi Pajak dan Total Pembayaran Akhir**:
   - Harmonisasi kalkulasi subtotal bersih, penambahan pajak/biaya layanan (jika ada), dan total pembayaran akhir (`total_amount`) antara frontend cart dan backend transaction creation engine.
