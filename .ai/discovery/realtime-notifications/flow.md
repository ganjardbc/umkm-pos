# Flow — Realtime Notifications

> Discovery draft. Hasil tahap UX Klaster 1 untuk slug `realtime-notifications`.
> Acuan implementasi, bukan mockup visual/spesifikasi komponen.
>
> **Revisi 2026-08-11** — disesuaikan dengan keputusan manusia: threshold stok = setting
> merchant, kanal = WebSocket gateway NestJS, subscription = room per-outlet otomatis,
> koneksi putus = auto-reconnect dengan indikator `"Reconnecting to server.."`.

## Keputusan UX Designer

dipakai — fitur menambah permukaan UI baru (indikator realtime badge/toast di layar kasir
& dashboard) dan mengubah alur interaksi user untuk dua peran berbeda (owner/admin untuk
stok menipis, kasir untuk order baru dari self-order), plus butuh keputusan desain soal
kapan notifikasi muncul tanpa mengganggu transaksi berjalan di `/cashier` dan bagaimana
putusnya koneksi realtime terlihat ke user.

## Entry Point

Fitur ini tidak punya halaman/route baru sendiri — ia menempel sebagai lapisan tambahan di
atas UI yang sudah ada, aktif otomatis begitu user login dan sesi web-nya terbuka:

- **Owner/Admin outlet** (permission `stock.view`/`product.view`) — indikator realtime aktif
  begitu user login dan berada di outlet konteks (`APP_ACTIVE_OUTLET`) manapun di dalam
  aplikasi, bukan cuma saat membuka halaman stok. Notifikasi bisa muncul dari halaman mana
  saja selama sesi login aktif (mis. sedang di `/dashboard`, `/report`, dsb.).
- **Kasir/staff outlet** — indikator realtime aktif khususnya relevan saat user berada di
  `/cashier`, `/dashboard`, atau `/transaction` di outlet tempat dia bertugas. Di luar
  halaman-halaman ini notifikasi tetap bisa diterima (tersimpan di badge), tapi nilai
  operasionalnya paling tinggi saat user sedang aktif di layar kerja tersebut.
- **Titik masuk sekunder**: badge/dropdown notifikasi existing di route `/notification` —
  event yang diterima secara realtime tetap muncul di sana sebagai record permanen (via
  `GET /notification`), jadi user yang melewatkan toast/badge realtime masih bisa menemukan
  notifikasinya di sini.

Prasyarat: koneksi **WebSocket** ke gateway NestJS dibuka begitu user berhasil login dan
`APP_ACTIVE_OUTLET` tersedia di localStorage (handshake pakai `APP_TOKEN` yang sama dengan
REST). Client langsung join room outlet aktif tersebut. Koneksi ditutup saat logout atau
tab/sesi berakhir.

## Alur Utama

### A. Owner/Admin — notifikasi stok menipis/habis

1. User login, koneksi WebSocket dibuka dan client join room outlet aktifnya
   (`APP_ACTIVE_OUTLET`) secara otomatis — tanpa aksi/subscribe manual dari user.
2. Di server, `stock_qty` sebuah produk di outlet tersebut turun melewati **ambang batas
   stok rendah milik merchant** (setting level merchant, satu nilai untuk semua produk &
   outlet merchant itu) — dipicu dari alur stok existing (`POST /stock/adjust`, atau
   pengurangan stok saat transaksi).
3. Gateway mem-push event `stock_low` ke room outlet tersebut, diterima seluruh client yang
   sedang login di outlet itu dengan permission relevan, dan sekaligus dicatat lewat
   mekanisme `notifications` existing (jadi tetap muncul kalau user cek `GET /notification`
   manual nanti).
4. Client menerima event secara realtime:
   - Badge indikator notifikasi (di navigasi/header, mengikuti pola UI existing di
     `/notification`) bertambah jumlahnya.
   - Toast singkat muncul di pojok layar berisi nama produk dan info stok menipis/habis,
     tidak memblokir interaksi user dengan halaman yang sedang dibuka.
5. User bisa mengklik toast atau badge untuk lanjut ke detail (halaman stok/produk terkait,
   atau ke `/notification` untuk lihat daftar lengkap). Kalau diabaikan, toast hilang
   otomatis setelah beberapa detik tapi badge tetap menyala sampai notifikasi dibuka/ditandai
   sudah dibaca (`PATCH /notification/:id/read`, mekanisme existing — tidak diubah oleh
   fitur ini).
6. Jika user sedang login di outlet lain (bukan outlet yang stoknya menipis) atau tidak
   punya permission `stock.view`/`product.view` di outlet tersebut, sesi itu tidak ada di
   room outlet terkait sehingga event tidak sampai sama sekali (filtering server-side saat
   join room: `merchant_id` + `outlet_id` + permission).

### B. Kasir/Staff — notifikasi transaksi baru dari self-order

1. Kasir login dan sedang aktif di layar kerja (`/cashier`, `/dashboard`, atau
   `/transaction`) pada outlet tempat dia bertugas.
2. Pelanggan membuat order lewat `/menu/:outletId` (`customer-catalog`), yang berhasil
   memicu `POST /catalog/orders` dan membuat transaksi baru untuk outlet tersebut.
3. Gateway mem-push event `new_order` ke room outlet tersebut — diterima seluruh client yang
   sedang join room itu (sesuai `APP_ACTIVE_OUTLET` masing-masing sesi), dan dicatat lewat
   mekanisme `notifications` existing.
4. Client menerima event:
   - Toast muncul memberi tahu ada order baru masuk (mis. info meja/nomor order, tanpa perlu
     detail lengkap di toast itu sendiri).
   - Badge notifikasi bertambah.
   - **Kondisi khusus — kasir sedang di tengah transaksi aktif di `/cashier`** (mis. sedang
     input item/pembayaran pelanggan yang berdiri di depannya): toast tetap muncul tapi
     didesain non-blocking dan tidak mengambil fokus dari form transaksi yang sedang
     dikerjakan (tidak ada modal/dialog yang menghentikan alur input). Kasir bebas
     mengabaikan toast dan menyelesaikan transaksi berjalan dulu; order baru tetap tercatat
     dan bisa diproses belakangan dari badge/daftar transaksi.
5. Kasir mengklik toast/badge untuk masuk ke detail order baru tersebut (halaman transaksi
   terkait) dan memprosesnya (mis. `PATCH /transactions/:id/status`).
6. Kasir di outlet lain, atau user yang login tapi tidak sedang di konteks outlet yang sama
   (`APP_ACTIVE_OUTLET` berbeda), berada di room berbeda sehingga tidak menerima event ini.

## State Kosong & Error

- **Tidak ada notifikasi baru**: badge tidak menampilkan angka/dot, tidak ada toast — tidak
  ada state kosong khusus untuk ditampilkan karena ini indikator pasif, bukan halaman
  dengan konten yang perlu placeholder.
- **Koneksi WebSocket gagal terhubung saat load awal**: aplikasi tetap berfungsi normal
  (semua fitur non-realtime tidak terganggu). Client langsung masuk mode auto-reconnect dan
  menampilkan indikator kecil non-blocking di area badge notifikasi bertuliskan
  `"Reconnecting to server.."`, supaya user tidak salah asumsi "tidak ada notifikasi baru"
  padahal koneksinya belum terbentuk. Selama itu user tetap bisa mengandalkan
  `GET /notification` manual dan refresh halaman.
- **Koneksi WebSocket putus di tengah sesi** (mis. laptop kasir sleep, WiFi kafe tidak
  stabil — disebut eksplisit di `prd.md` sebagai risiko lingkungan UMKM): client mencoba
  menyambung ulang otomatis (backoff, interval detail diserahkan ke implementasi) sambil
  menampilkan indikator yang sama, `"Reconnecting to server.."`. Tidak ada toast/alert/modal
  mengganggu untuk ini — cukup indikator pasif di area badge, karena kasir bisa saja sedang
  di tengah transaksi. Begitu koneksi pulih, indikator hilang tanpa aksi tambahan dari user
  dan client otomatis join ulang room outlet aktif. Tidak ada fallback polling: kalau
  reconnect terus gagal, indikator tetap tampil dan user mengandalkan refresh manual.
  Event yang terjadi selagi putus tidak di-replay lewat WebSocket, tapi tetap tercatat di
  `GET /notification` (konsisten dengan Out-of-Scope di `prd.md`).
- **User tidak punya akses (RBAC)**: user tanpa permission `stock.view`/`product.view` di
  outlet aktifnya tidak di-join-kan ke room event `stock_low` outlet itu, jadi tidak pernah
  menerima eventnya (bukan ditampilkan lalu disembunyikan — difilter di server saat join,
  konsisten dengan pola RBAC existing di `CLAUDE.md`). Tidak ada pesan error yang perlu ditampilkan ke user untuk kasus ini karena
  dari sisi UI, user tersebut memang tidak pernah menerima event itu.
- **User pindah outlet aktif di tengah sesi** (ganti `APP_ACTIVE_OUTLET`): client keluar dari
  room outlet lama dan join room outlet baru — user berhenti menerima event outlet lama dan
  mulai menerima event outlet baru. Kalau di outlet baru user tidak punya permission yang
  relevan, dia tidak join room event itu (lihat poin RBAC di bawah). Tidak ada pesan error
  yang perlu ditampilkan; ini transisi implisit mengikuti pola ganti outlet yang sudah ada
  di aplikasi. Badge/daftar notifikasi ikut menampilkan konteks outlet baru.
- **Gagal menandai notifikasi sebagai dibaca** (`PATCH /notification/:id/read` gagal): pakai
  pola error existing di modul `notifications` — di luar scope perubahan discovery ini,
  hanya dicatat di sini supaya tidak terlewat saat implementasi toast/badge baru dipasang
  di atas mekanisme lama.

## Pertanyaan Terbuka

Tiga pertanyaan sebelumnya (ambang batas stok, reconnect behavior, mekanisme follow) sudah
dijawab manusia 2026-08-11 dan hasilnya sudah dibakukan ke alur di atas — lihat tabel
"Keputusan yang Sudah Dibakukan" di `prd.md`. Sisa yang masih terbuka:

1. **Isi/detail toast notifikasi transaksi baru** — apakah toast cukup menampilkan info
   ringkas (nomor meja/order) atau perlu tombol aksi cepat langsung dari toast (mis. tombol
   "Lihat" yang membuka detail transaksi tanpa navigasi manual). Perlu konfirmasi PM/human
   reviewer sebelum masuk ke ticket implementasi, karena mempengaruhi kompleksitas komponen
   toast yang akan dibangun tim implementasi.
2. **Penempatan UI setting ambang batas stok merchant** — keputusan produk sudah jelas
   (setting level merchant), tapi belum ditentukan di halaman pengaturan mana field-nya
   ditaruh dan siapa yang boleh mengubah (permission code apa). Bukan blocker untuk alur
   notifikasinya sendiri, tapi harus diputuskan sebelum ticket setting merchant dikerjakan.
