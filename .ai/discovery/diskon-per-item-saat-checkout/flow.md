## Keputusan UX Designer

dipakai — Fitur ini menyentuh antarmuka kasir secara langsung pada halaman POS/checkout, mencakup interaksi baru input/edit/reset diskon per baris item di keranjang belanja, ringkasan pembayaran, dan tampilan struk belanja.

## Entry Point

Titik masuk kasir saat memulai atau mengakses alur ini:
- Halaman Kasir POS (`/cashier` dan `/transaction/create`).
- Baris item di dalam keranjang belanja (Cart Item list).
- Tampilan struk preview & halaman detail transaksi (`/transaction/detail/:id`).

## Alur Utama

Langkah per langkah (happy path):
1. Kasir memilih produk dari katalog atau scan barcode sehingga masuk ke keranjang belanja (Cart).
2. Pada baris item di keranjang, kasir menekan tombol/ikon "Diskon" atau opsi "Tambah Diskon".
3. Modal atau popover input diskon muncul, menampilkan info produk, harga satuan snapshot, kuantitas saat ini, dan subtotal kotor.
4. Kasir memilih mode diskon:
   - Tab **Persen (`%`)**: Kasir memasukkan angka persentase (misal: 10). Sistem menampilkan preview nominal potongan (misal: Rp 2.500) dan subtotal baru.
   - Tab **Nominal (`Rp`)**: Kasir memasukkan nominal rupiah (misal: 5.000). Sistem menampilkan preview subtotal baru.
5. Kasir menekan tombol "Terapkan Diskon" (Apply).
6. Modal tertutup, baris item di cart kini menampilkan:
   - Harga asli tercoret / info diskon (badge atau teks: `Diskon 10% (-Rp 2.500)`).
   - Subtotal baru yang sudah terpotong diskon.
7. Ringkasan keranjang (Cart Total) mengkalkulasi ulang secara reaktif: Subtotal Bersih, Pajak (jika ada), dan Total Tagihan Akhir.
8. Kasir melanjutkan ke proses pembayaran (pilih metode bayar, input nominal tunai/non-tunai, konfirmasi pembayaran).
9. Transaksi berhasil dibuat, struk yang dicetak / ditampilkan menampilkan rincian item dengan harga normal dan baris potongan diskon.

## State Kosong & Error

Kondisi gagal, validasi, dan penanganan kesalahan:
1. *Input diskon persen tidak valid*: Kasir memasukkan nilai < 0% atau > 100%. Tombol "Terapkan" dinonaktifkan / muncul pesan peringatan inline: "Persentase diskon harus antara 0% dan 100%".
2. *Input diskon nominal melebihi harga kotor item*: Kasir memasukkan nominal Rp lebih besar dari `price * qty`. Tombol dinonaktifkan / muncul pesan: "Nominal diskon tidak boleh melebihi subtotal item".
3. *Input kosong / nol*: Jika kasir memasukkan 0 atau mengosongkan field saat menekan Terapkan, diskon dihapus dan kembali ke harga normal.
4. *Mengubah kuantitas item (qty +/-) setelah diskon diterapkan*:
   - Jika diskon berupa **Persen**: Nominal diskon dihitung ulang secara otomatis proporsional terhadap qty baru.
   - Jika diskon berupa **Nominal Tetap**: Sistem mempertahankan nominal diskon fixed atau memvalidasi ulang agar tidak melebihi subtotal baru; jika melebihi, berikan notifikasi penyesuaian.
5. *Reset Diskon*: Kasir dapat menekan tombol "Hapus Diskon" pada baris item atau di dalam modal diskon untuk menghapus potongan dan kembali ke harga normal.
6. *Validasi Server Gagal*: Jika ada kegagalan kalkulasi saat submit transaksi, tampilkan toast error informatif kepada kasir.

## Pertanyaan Terbuka

Hal yang perlu konfirmasi atau keputusan manusia:
- Apakah perlu batasan persentase maksimum diskon per role (misal: Kasir max 20%, di atas itu butuh pin/supervisor) untuk iterasi berikutnya?
- Apakah format tampilan diskon di printer termal 58mm/80mm cukup mencantumkan baris terpisah `-Disc (10%) Rp X` di bawah nama item?
