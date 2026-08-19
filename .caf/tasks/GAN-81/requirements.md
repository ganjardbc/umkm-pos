## Ticket: GAN-81
## Status: BLOCKED

## Deskripsi
Menambahkan lapisan UI realtime di frontend (Vue) di atas modul `notifications` yang
sudah ada — badge bertambah otomatis, toast non-blocking untuk event `stock_low` dan
`new_order`, dan indikator kecil "Reconnecting to server.." saat koneksi WebSocket
putus/reconnect. Tidak ada route/halaman baru; tidak ada perubahan pada mekanisme
`GET /notifications` / `PATCH /notifications/:id/read` yang sudah ada.

## Blocker — Dependency Backend Belum Ada

Ticket ini secara eksplisit mensyaratkan verifikasi codebase sebelum breakdown task,
dengan aturan: kalau dependency backend berikut belum ada sama sekali, ini blocker
nyata (bukan ambiguity) dan wajib dilaporkan STOP tanpa breakdown task frontend yang
mengasumsikan backend sudah tersedia.

Hasil verifikasi:

1. **WebSocket gateway NestJS dengan room per-outlet** — TIDAK ADA.
   - `apps/api/package.json` tidak memiliki dependency WebSocket sama sekali:
     tidak ada `@nestjs/websockets`, `@nestjs/platform-socket.io`, `socket.io`,
     maupun `ws`.
   - `apps/api/src/app.module.ts` hanya mengimpor module REST biasa (Auth, Merchants,
     Outlets, Products, Transactions, TransactionItems, Shifts, AuditLogs, Metrics,
     Stock, Users, Rbac, Reports, Settings, Uploads, Notifications, StoreTables,
     CustomerCatalog) — tidak ada gateway module apa pun.
   - `docs/api/api-contract.md` section Notification Endpoints hanya mendaftar
     `GET /notifications`, `PATCH /notifications/:id/read`,
     `PATCH /notifications/read-all` — murni REST, tidak menyebut WebSocket/gateway.

2. **Emitter event `stock_low` & `new_order`** — TIDAK ADA.
   - Tidak ditemukan modul/service yang mem-broadcast event tersebut (tidak ada
     gateway untuk di-emit-kan ke).

3. **Frontend WS client library** — TIDAK ADA.
   - `apps/web/package.json` tidak memiliki `socket.io-client` atau library WebSocket
     client lain.

4. **Sumber discovery yang dirujuk ticket** — TIDAK ADA di repo.
   - `.ai/discovery/realtime-notifications/prd.md` dan `flow.md`: file tidak ditemukan.
   - `.caf/discovery/realtime-notifications/prd.md` dan `flow.md`: file tidak ditemukan.
   - Konteks lengkap tetap tersedia dari body ticket Linear GAN-81 itu sendiri, jadi
     ini tidak menghalangi pemahaman requirement — hanya dicatat sebagai temuan bahwa
     draft discovery yang dirujuk tidak persist di repo.

**Kesimpulan**: Ticket GAN-81 secara scope memang FE-only (sesuai instruksi ticket:
"TIDAK ADA task backend baru"), tetapi FE tidak bisa dikerjakan tanpa gateway
WebSocket + emitter event di backend. Membuat task FE yang mengasumsikan endpoint
WS/room/event sudah ada berisiko menghasilkan kode yang tidak bisa diverifikasi jalan
end-to-end dan menyesatkan agent eksekusi. Ticket ini di-BLOCK sampai ada ticket
backend terpisah yang mengimplementasikan:
- WebSocket gateway NestJS dengan room per-outlet (handshake pakai `APP_TOKEN`,
  join/leave room berdasarkan outlet aktif).
- Event emitter `stock_low` (saat stok produk melewati threshold rendah) dan
  `new_order` (saat order self-order/customer masuk) yang di-broadcast ke room
  outlet terkait.
- Kontrak event (payload shape, nama event, path/namespace WS) didokumentasikan di
  `docs/api/api-contract.md` atau dokumen setara, supaya FE punya kontrak yang jelas
  untuk diimplementasikan.

## Acceptance Criteria (target — BELUM bisa dieksekusi sampai blocker di atas selesai)

Daftar berikut adalah target akhir fitur ini untuk referensi ticket backend
pendamping dan untuk dieksekusi ulang setelah blocker selesai — bukan untuk
dieksekusi sekarang:

- [ ] WebSocket client di FE konek otomatis setelah login DAN `APP_ACTIVE_OUTLET`
      tersedia di localStorage, menggunakan `APP_TOKEN` untuk handshake.
- [ ] WebSocket client menutup koneksi saat logout atau sesi berakhir (token invalid/401).
- [ ] Saat outlet aktif berganti (`APP_ACTIVE_OUTLET` berubah), client leave room outlet
      lama dan join room outlet baru tanpa perlu reload halaman.
- [ ] Badge notifikasi existing (dropdown `/notification`) bertambah jumlahnya otomatis
      saat event `stock_low` atau `new_order` diterima, tanpa refresh manual.
- [ ] Toast non-blocking muncul di pojok layar berisi nama produk untuk event
      `stock_low`, dan info meja/nomor order untuk event `new_order`.
- [ ] Toast tidak memunculkan modal/dialog yang menghentikan input form di `/cashier` —
      diverifikasi dengan mensimulasikan toast muncul saat form transaksi aktif dan
      memastikan fokus/input form tidak terganggu.
- [ ] Toast hilang otomatis setelah beberapa detik tanpa interaksi user.
- [ ] Badge tetap menyala (count tidak berkurang) sampai notifikasi ditandai dibaca
      lewat `PATCH /notification/:id/read` yang sudah ada.
- [ ] Klik toast atau klik item badge/dropdown untuk notifikasi `stock_low` membuka
      halaman stok/produk terkait; untuk `new_order` membuka halaman transaksi terkait.
- [ ] Saat koneksi WebSocket gagal/putus, client melakukan reconnect otomatis dengan
      backoff, dan menampilkan indikator kecil non-blocking bertuliskan
      "Reconnecting to server.." di area badge notifikasi — tanpa toast/alert/modal.
- [ ] Indikator reconnect hilang begitu koneksi pulih dan client berhasil join ulang
      room outlet aktif.
- [ ] User tanpa permission terkait (`stock.view`/`product.view`) tidak pernah menerima
      event apa pun dan tidak menampilkan pesan error apa pun akibat itu.
- [ ] Tidak ada polling fallback ditambahkan; tidak ada replay event yang terjadi
      selama koneksi putus.

## Constraints

- Multi-tenant: room WebSocket per-outlet, join berdasarkan `APP_ACTIVE_OUTLET` —
  tidak pernah trust outlet dari input client tanpa validasi server terhadap
  `merchant_id` JWT (constraint ini berlaku ke ticket backend gateway, dicatat di
  sini karena FE bergantung padanya).
- RBAC: event WebSocket hanya diterima user dengan permission yang relevan
  (`stock.view`/`product.view`); tidak ada perubahan pola RBAC existing.
- FE: tidak ada route/halaman baru; hanya lapisan UI (badge, toast, indikator) di atas
  modul `notification` existing.
- FE: tidak boleh mengambil fokus dari form transaksi `/cashier` — toast dan indikator
  reconnect wajib non-blocking (bukan modal/dialog).
- Tidak menambahkan fallback polling.
- Tidak mengubah pola error existing modul `notifications` (mis. gagal
  `PATCH /notification/:id/read`).

## Out of Scope

- Perubahan/pembuatan WebSocket gateway backend (dependency terpisah, saat ini belum
  ada — lihat section Blocker).
- Fallback polling.
- Replay event yang terjadi selama koneksi WebSocket putus.
- Push notification saat aplikasi tertutup (Web Push API, mobile native).
- Perubahan pola error existing modul `notifications`.
- Route/halaman baru.

## Dependensi

- **BLOCKING — belum ada di codebase**: WebSocket gateway NestJS dengan room
  per-outlet di `apps/api`.
- **BLOCKING — belum ada di codebase**: Event emitter `stock_low` dan `new_order` di
  backend yang di-broadcast ke room outlet.
- Modul `notifications` frontend + route `/notification` existing (badge,
  mark-as-read) — sudah ada, dipakai sebagai basis, tidak diubah.
- `APP_TOKEN`, `APP_ACTIVE_OUTLET` di localStorage (auth flow existing) — sudah ada.

## Pertanyaan Terbuka (dari sumber ticket, sudah diberi default aman — dicatat untuk transparansi)

- Isi/detail toast notifikasi transaksi baru (`new_order`): ticket memperbolehkan
  default aman "toast klik = buka detail, tanpa tombol aksi cepat terpisah, sesuai
  pola 'Klik toast/badge membuka detail'". Default ini DIPAKAI dalam Acceptance
  Criteria di atas (tidak ada tombol aksi cepat "Lihat" terpisah pada toast — seluruh
  body toast bersifat clickable menuju detail transaksi). Ini bukan blocker eksekusi;
  dicatat di sini semata untuk transparansi asumsi sesuai instruksi ticket.
