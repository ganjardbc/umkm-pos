# PRD — Realtime Notifications

> Discovery draft. Hasil `/discovery-start` untuk slug `realtime-notifications`.
> Belum jadi ticket. Review manusia diperlukan sebelum lanjut ke `/discovery-to-ticket`.
>
> **Revisi 2026-08-11** — empat pertanyaan terbuka awal sudah dijawab manusia dan hasilnya
> sudah dibakukan ke dalam dokumen ini: (1) ambang batas stok = setting level merchant,
> (2) kanal realtime = WebSocket gateway NestJS, (3) scope subscription = per-outlet
> otomatis, (4) koneksi putus = auto-reconnect dengan indikator "Reconnecting to server..".

## Ringkasan Pemersempitan Scope

"Realtime notifications" sebagai judul terlalu luas untuk langsung dieksekusi. Berdasarkan
`docs/feature-catalog.md`, sudah ada modul `notifications` (`GET /notification`,
`GET /notification/:id`, `PATCH /notification/:id/read`, `PATCH /notification/read-all`,
route frontend `/notification`). Modul ini kemungkinan besar bersifat **pull-based** (user
buka halaman/dropdown notifikasi, lalu fetch list) — tidak ada indikasi di catalog atau
CLAUDE.md soal WebSocket/SSE/push channel yang sudah berjalan.

Maka scope discovery ini dipersempit menjadi: **menambahkan kanal realtime (push) di atas
sistem notifikasi yang sudah ada**, bukan membangun ulang sistem notifikasi dari nol. Fokus
pada dua event kandidat yang paling bernilai untuk operasional kasir harian di POS
multi-outlet:

1. **Stok produk menipis/habis** — relevan untuk role yang mengelola inventori (owner/admin
   outlet), berdampak langsung ke kemampuan jual.
2. **Transaksi baru masuk** (khususnya order dari self-order/catalog pelanggan, modul
   `customer-catalog`, yang dibuat pelanggan tanpa interaksi kasir langsung) — kasir/staff di
   outlet perlu tahu ada order baru untuk diproses (misalnya order meja restoran dari
   `store_tables` + `catalog/orders`).

Alasan pemilihan dua ini dari beberapa kandidat lain (shift dibuka/ditutup, order meja):
- Shift buka/tutup adalah aksi yang dilakukan sendiri oleh user yang bersangkutan (dia sudah
  tahu status shift-nya sendiri) — nilai realtime-nya rendah, kecuali untuk owner memantau
  staf, yang bisa jadi iterasi berikutnya.
- Order meja restoran pada dasarnya adalah bentuk khusus dari "transaksi baru masuk" (order
  dari `customer-catalog` yang terikat ke `store_tables`) — sudah tercakup di poin 2, tidak
  perlu jadi kategori event terpisah di iterasi pertama.

Dua kandidat lain (stok menipis, transaksi baru) dipilih karena punya SLA respons yang jelas
(stok menipis butuh restock/keputusan cepat; transaksi baru dari self-order butuh diproses
sebelum pelanggan menunggu terlalu lama) — beda dengan notifikasi administratif (mis. RBAC
diubah) yang tidak time-sensitive.

## Problem

Saat ini modul notifikasi (`GET /notification`) bersifat pull-based: user harus membuka
halaman/dropdown `/notification` secara manual untuk tahu ada notifikasi baru. Ini
menyebabkan dua masalah operasional konkret di POS multi-outlet:

1. **Stok menipis tidak terdeteksi tepat waktu.** Pemilik/admin outlet baru sadar stok habis
   saat kasir sudah mencoba menjual produk tersebut (transaksi gagal/stock_qty minus), bukan
   sebelum itu terjadi — karena tidak ada dorongan proaktif untuk mengecek halaman stok.
2. **Order self-order (customer-catalog) berpotensi terlewat oleh staf outlet.** Pelanggan
   bisa memesan lewat `/menu/:outletId` tanpa kasir sadar ada order baru masuk, karena staf
   harus aktif me-refresh atau membuka halaman transaksi/dashboard untuk melihatnya. Ini
   berisiko order menunggu lama tanpa diproses, terutama di jam sibuk kafe/restoran.

Akar masalahnya adalah **tidak ada mekanisme dorong (push) dari server ke client** — semua
info baru harus "ditarik" (pull) oleh user secara aktif.

## Target User

- **Owner/Admin outlet** (role dengan permission `stock.view`/`product.view` di outlet
  tertentu) — perlu tahu segera saat `stock_qty` produk di outletnya menyentuh ambang batas
  rendah, saat sedang login ke aplikasi web (bukan notifikasi eksternal seperti email/SMS di
  iterasi ini).
- **Kasir/staff outlet yang sedang login dan aktif memakai halaman kasir/dashboard**
  (`/cashier`, `/dashboard`, `/transaction`) di outlet tempat dia bertugas (sesuai
  `APP_ACTIVE_OUTLET`) — perlu tahu segera saat ada transaksi baru dari self-order pelanggan
  masuk untuk outlet tersebut, supaya bisa diproses (konfirmasi/siapkan pesanan).

Kondisi eksplisit: user harus sedang membuka aplikasi web (tab aktif atau minimal sesi
login), karena iterasi ini tidak mencakup push notification saat aplikasi tertutup (lihat
Out-of-Scope).

## Success Metric

- **Latency notifikasi**: 90% notifikasi (stok menipis / transaksi baru self-order) diterima
  di client dalam ≤5 detik sejak event terjadi di server (diukur dari timestamp
  `stock_logs`/`transactions.created_at` ke timestamp diterima di client).
- **Adopsi**: dalam 30 hari setelah rilis, ≥50% merchant aktif (yang punya minimal 1 outlet
  dengan `customer-catalog` aktif atau stock tracking aktif) menerima minimal 1 notifikasi
  realtime tanpa perlu refresh manual.
- **Pengurangan keterlambatan pemrosesan order self-order**: waktu rata-rata antara
  `catalog/orders` dibuat dan status transaksi diubah oleh staf (`PATCH
  /transactions/:id/status`) berkurang dibanding baseline sebelum fitur ini (baseline diukur
  dari data existing sebelum rilis).

## Scope

- **Kanal realtime: WebSocket gateway di NestJS** (keputusan final, bukan lagi kandidat).
  SSE dan polling tidak dipakai. Gateway mem-push dua jenis event ke client yang sedang
  login:
  1. Event "stok menipis/habis" — dipicu saat `stock_qty` produk turun melewati ambang
     batas stok rendah milik merchant tersebut (lihat bullet setting merchant di bawah).
  2. Event "transaksi baru dari self-order" — dipicu saat `POST /catalog/orders` berhasil
     membuat transaksi baru untuk outlet terkait.
- **Ambang batas stok menipis disimpan sebagai setting level merchant** — satu nilai per
  merchant yang berlaku untuk semua produk di semua outlet merchant tersebut (mis.
  `low_stock_threshold` di tabel/konfigurasi setting merchant, default diisi saat merchant
  dibuat). Bukan konstanta hardcode dan bukan field per-produk. Owner/admin bisa mengubah
  nilainya lewat halaman pengaturan merchant existing.
- **Scope subscription: per-outlet.** Room WebSocket dibentuk per `outlet_id` (di bawah
  `merchant_id`). Client bergabung otomatis ke room outlet aktifnya (`APP_ACTIVE_OUTLET`)
  begitu koneksi terbuka — tidak ada mekanisme subscribe/follow manual oleh user. Keanggotaan
  room disaring server-side dengan `merchant_id` + `outlet_id` + permission code, sesuai
  aturan scoping tenant/outlet di `CLAUDE.md`. Ganti outlet aktif berarti keluar dari room
  lama dan masuk ke room baru.
- **Auto-reconnect** saat koneksi WebSocket putus: client mencoba menyambung ulang otomatis
  (backoff, detail interval diserahkan ke implementasi) sambil menampilkan indikator status
  bertuliskan `"Reconnecting to server.."`. Indikator hilang begitu koneksi pulih.
- Notifikasi yang diterima realtime tetap tercatat lewat mekanisme `notifications` yang
  sudah ada (`GET /notification`, `PATCH /notification/:id/read`) — kanal realtime adalah
  tambahan delivery, bukan pengganti storage/record notifikasi.
- Indikator visual di UI (badge/toast) saat notifikasi baru masuk selagi user aktif di
  aplikasi.

## Out-of-Scope

- Push notification saat aplikasi web tertutup/browser tidak aktif (mis. Web Push API,
  notifikasi mobile native) — di luar scope iterasi ini.
- Notifikasi lewat kanal eksternal (email, SMS, WhatsApp).
- Event realtime untuk shift dibuka/ditutup, perubahan RBAC, atau event administratif
  lainnya — dipertimbangkan sebagai iterasi berikutnya setelah dua event inti ini stabil.
- Konfigurasi ambang batas stok menipis **per-produk** atau **per-outlet** — iterasi pertama
  hanya satu nilai per merchant (lihat Scope). Threshold yang lebih granular ditunda ke
  iterasi berikutnya.
- Mekanisme subscribe/follow manual per user (halaman pengaturan preferensi notifikasi) —
  keanggotaan room ditentukan otomatis dari outlet aktif + permission, tidak bisa diatur
  user.
- Fallback ke polling saat WebSocket tidak tersedia — tidak ada; kalau reconnect gagal
  terus, user mengandalkan `GET /notification` manual/refresh halaman.
- Riwayat/replay notifikasi yang terjadi saat user offline (di luar apa yang sudah tercatat
  lewat `GET /notification` biasa) — tidak ada guaranteed delivery/queue khusus untuk event
  yang terlewat saat user tidak terkoneksi.
- Perubahan pada modul `customer-catalog` atau `stock` selain menambahkan trigger event —
  tidak mengubah alur bisnis existing di modul tersebut.

## Dependency

- Modul `notifications` (backend `notifications` module + frontend route `/notification`,
  lihat `docs/feature-catalog.md`) — fitur ini dibangun DI ATAS modul ini, memerlukan review
  apakah modul existing sudah punya struktur data yang cukup untuk menandai
  event `stock_low` dan `new_order` (kategori/tipe notifikasi), atau perlu penyesuaian
  schema. Ini keputusan implementasi, bukan discovery.
- Modul `stock` (`GET /stock/logs`, `GET /stock/inventory`, `POST /stock/adjust`) — sumber
  event stok menipis; perlu titik pemicu (trigger) di service stok saat `stock_qty` berubah
  turun, dibandingkan terhadap threshold merchant.
- **Setting merchant** — perlu tempat menyimpan `low_stock_threshold` per merchant plus
  UI pengaturannya. Kalau belum ada tabel/modul setting merchant di codebase, ini prasyarat
  yang harus dibuat lebih dulu (kemungkinan ticket terpisah). Perlu dicek tim implementasi
  sebelum ticket utama dikerjakan.
- Modul `customer-catalog` (`POST /catalog/orders`) dan `transactions` — sumber event
  transaksi baru dari self-order.
- Auth/RBAC (`APP_ACTIVE_OUTLET`, permission code) — penentuan siapa yang berhak menerima
  event mana, mengikuti aturan scoping per-outlet yang sudah ada di sistem RBAC.
- **WebSocket gateway NestJS** — belum ada indikasi infrastruktur realtime di codebase saat
  ini (tidak tercatat di `docs/feature-catalog.md` atau CLAUDE.md), jadi gateway ini komponen
  baru. Konsekuensi yang perlu diperhatikan tim implementasi: autentikasi handshake pakai JWT
  yang sama dengan REST (`APP_TOKEN`), dan kalau API pernah dijalankan multi-instance,
  broadcast antar-instance butuh adapter (mis. Redis) — bukan blocker untuk single-instance,
  tapi harus diputuskan saat design.

## Keputusan yang Sudah Dibakukan

Empat pertanyaan terbuka awal sudah dijawab manusia (2026-08-11) dan sudah masuk ke section
Scope/Out-of-Scope/Dependency di atas:

| Pertanyaan | Keputusan |
| --- | --- |
| Ambang batas stok menipis | Setting level merchant — satu nilai berlaku untuk semua produk & outlet merchant itu |
| Kanal teknis | WebSocket gateway NestJS (bukan SSE, bukan polling) |
| Cakupan subscription | Per-outlet — room per `outlet_id`, join otomatis dari `APP_ACTIVE_OUTLET`, tanpa subscribe manual |
| Koneksi putus | Auto-reconnect + indikator `"Reconnecting to server.."`, tanpa fallback polling |

## Pertanyaan Terbuka

Tidak ada yang blocking di level produk — keempat pertanyaan awal sudah terjawab (lihat tabel
di atas). Satu hal yang masih perlu dikonfirmasi saat design, bukan saat discovery:

- Apakah modul setting merchant sudah ada di codebase sebagai tempat menyimpan
  `low_stock_threshold`, atau perlu dibuat lebih dulu (lihat Dependency). Ini pengecekan
  teknis, bukan keputusan produk.
- Detail desain toast transaksi baru (info ringkas saja vs ada tombol aksi cepat) masih
  terbuka di `flow.md` — keputusan UX, tidak mengubah scope produk di dokumen ini.
