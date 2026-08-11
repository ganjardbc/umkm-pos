# Flow — Copy Nomor Invoice Transaksi

## Keputusan UX Designer

**Dipakai.**

Alasan: fitur ini menyentuh permukaan UI langsung — menambah elemen interaktif baru (ikon/tombol
copy) di dua titik tampilan (riwayat transaksi, detail transaksi) dan menambah pola feedback baru
(toast). Ini butuh keputusan desain eksplisit (placement, ukuran target sentuh mobile, bentuk
feedback error) supaya konsisten di kedua titik dan tidak diasumsikan sepihak oleh PM. Dokumen ini
menggantikan draft sementara PM Agent dan menegaskan keputusan yang sebelumnya ditandai
"belum diputuskan".

Keputusan desain kunci yang ditegaskan di dokumen ini:

1. **Placement & ukuran ikon copy** — ikon ditempatkan langsung setelah teks nomor invoice
   (inline, bukan di kolom aksi terpisah), dengan target sentuh minimal 44x44px (mengikuti
   guideline touch target umum) meskipun ukuran ikon visualnya kecil (~16-20px) — dicapai lewat
   padding pada elemen interaktif, bukan memperbesar ikon itu sendiri. Ini berlaku sama di mobile
   maupun desktop supaya perilaku konsisten lintas form factor.
2. **Bentuk feedback** — toast (notifikasi sesaat, non-blocking, auto-dismiss) dipilih untuk
   kondisi sukses maupun gagal, BUKAN inline text atau dialog. Alasan: aksi copy adalah aksi
   ringan/sekunder yang tidak boleh mengganggu alur baca list/detail transaksi; dialog terlalu
   berat (butuh dismiss manual) untuk aksi sekecil ini, dan inline text berisiko tidak terlihat
   kalau ikon copy ada di banyak baris list (particularly di riwayat transaksi yang scrollable).
   Rekomendasi implementasi: pakai komponen Toast PrimeVue yang sudah lazim dipakai untuk
   notifikasi sesaat di ekosistem PrimeVue — tim implementasi tetap perlu cek apakah pola ini
   sudah ada presedennya di `apps/web` supaya tidak menambah pola notifikasi baru yang berbeda.
3. **Struk digital** — TIDAK di-scope dalam iterasi ini (lihat detail di bawah).

## Entry Point

User berada di salah satu dari titik berikut, di mana nomor invoice transaksi ditampilkan:

1. **Riwayat transaksi (list)** — setiap baris/card transaksi menampilkan nomor invoice. Ikon
   copy diletakkan tepat setelah teks nomor invoice, inline dalam baris yang sama (bukan di kolom
   aksi terpisah di ujung baris), supaya hubungan visual antara ikon dan nomor yang di-copy jelas
   tanpa harus melihat baris/kolom lain.
2. **Detail transaksi** — halaman detail satu transaksi menampilkan nomor invoice sebagai salah
   satu informasi header. Ikon copy diletakkan langsung di sebelah nomor invoice tersebut, dengan
   treatment visual yang sama (ukuran ikon, warna, jarak dari teks) seperti di riwayat transaksi
   supaya user mengenali pola yang sama di kedua tempat.

## Alur Utama

1. User melihat nomor invoice yang ditampilkan berdampingan dengan ikon copy (ikon clipboard
   kecil, ~16-20px secara visual, dengan area sentuh/klik minimal 44x44px lewat padding).
2. User menekan/klik ikon copy.
3. Sistem memanggil Clipboard API browser (`navigator.clipboard.writeText`) untuk menyalin string
   nomor invoice ke clipboard.
4. Jika berhasil: sistem menampilkan toast singkat non-blocking (mis. "Nomor invoice disalin")
   yang muncul di posisi notifikasi standar aplikasi dan hilang otomatis setelah beberapa detik
   (rekomendasi: 2-3 detik), tanpa mengganggu scroll/interaksi list atau navigasi user selanjutnya.
5. User berpindah ke aplikasi lain (mis. WhatsApp) dan paste nomor invoice yang sudah tersalin
   akurat.

Micro-interaction tambahan yang perlu diperhatikan implementasi:

- Klik ikon copy TIDAK memicu navigasi (mis. tidak ikut men-trigger klik ke baris transaksi kalau
  ikon berada di dalam elemen list yang seluruhnya clickable menuju detail transaksi) — perlu
  `stopPropagation`/setara supaya aksi copy dan aksi "buka detail" tidak konflik di riwayat
  transaksi.
- Ikon boleh punya state visual sesaat saat baru saja berhasil di-copy (mis. ganti ikon jadi
  checkmark selama ~1-2 detik) sebagai reinforcement tambahan selain toast — ini opsional/nice-to-
  have, bukan requirement wajib, karena toast sudah cukup sebagai feedback utama.

## State Kosong & Error

- **Clipboard API tidak tersedia / gagal** (mis. permission ditolak browser, konteks tidak
  secure/HTTPS, browser lama tanpa dukungan `navigator.clipboard`): sistem mencoba fallback
  `document.execCommand('copy')`. Kalau fallback ini juga gagal, sistem menampilkan **toast error**
  (bukan dialog, bukan inline text) dengan pesan singkat, mis. "Gagal menyalin, coba lagi" —
  konsisten dengan keputusan bentuk feedback di atas supaya user tidak melihat dua pola notifikasi
  berbeda untuk sukses vs gagal. Nomor invoice tetap terlihat di layar (tidak disembunyikan) supaya
  user masih bisa select manual sebagai jalan terakhir kalau memang perlu.
- **Nomor invoice kosong/null** (kondisi data tidak wajar, seharusnya tidak terjadi kalau setiap
  transaksi selalu punya nomor invoice): ikon copy tidak ditampilkan sama sekali untuk baris/detail
  tersebut (bukan ditampilkan dalam state disabled) — menghindari user bingung kenapa ikon ada tapi
  tidak bisa diklik. Perlu konfirmasi ke tim backend bahwa nomor invoice memang selalu ter-generate
  untuk setiap transaksi (tidak nullable secara bisnis); kalau ternyata bisa null, kondisi ini jadi
  relevan.
- **Tap ganda cepat (double-tap) di mobile**: aksi copy idempotent — menekan berkali-kali hanya
  menyalin ulang string yang sama. Toast tidak boleh menumpuk (stacking) untuk aksi yang sama;
  toast baru menggantikan toast sebelumnya kalau user menekan ikon copy berkali-kali dalam waktu
  singkat, bukan menambah antrian toast baru di layar.
- **Loading/delay state**: aksi copy adalah operasi instan (tidak butuh network call), jadi tidak
  perlu spinner atau loading state — feedback (toast sukses/gagal) muncul langsung setelah
  Clipboard API resolve.

## Pertanyaan Terbuka

- **Struk digital**: PRD men-scope fitur ini ke riwayat transaksi dan detail transaksi saja. Kalau
  di kemudian hari ada tampilan struk digital/preview terpisah (bukan hasil cetak fisik thermal
  printer, yang sudah eksplisit out-of-scope di PRD), placement ikon copy di struk digital
  BELUM di-scope dalam iterasi ini — perlu PRD/ticket terpisah kalau memang dibutuhkan. Keputusan
  UX Designer: tidak menambah scope struk digital secara sepihak di sini karena tidak ada
  konfirmasi PM soal keberadaan tampilan struk digital saat ini di codebase.
- **Precedent pola ikon & Toast di `apps/web`**: dokumen ini merekomendasikan pola PrimeVue Toast
  dan styling ikon konsisten dengan pola icon-button yang mungkin sudah ada di modul lain, tapi
  UX Designer tidak melakukan inspeksi kode `apps/web` (di luar scope tool discovery ini) untuk
  memverifikasi presedennya. Tim implementasi (Klaster 2) perlu mengecek apakah ada komponen
  icon-button/Toast pattern existing yang bisa dipakai ulang, supaya tidak menambah pola visual
  baru yang tidak konsisten.
- **Durasi auto-dismiss toast**: direkomendasikan 2-3 detik, tapi angka pasti belum divalidasi
  dengan pola toast lain yang mungkin sudah ada di aplikasi (kalau modul lain pakai durasi
  berbeda, sebaiknya disamakan demi konsistensi lintas aplikasi, bukan angka baru khusus fitur
  ini).
