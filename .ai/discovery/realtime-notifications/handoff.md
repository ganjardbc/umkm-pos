# Handoff: realtime-notifications

> Dibuat oleh `/discovery-to-ticket` pada 2026-08-11 02:59.
> Sumber: `prd.md` + `flow.md` di folder yang sama.
> Team Linear: Ganjar Workspaces.

## Ticket

| Ticket ID | Judul | URL | Catatan |
| --- | --- | --- | --- |
| GAN-78 | Setting ambang batas stok rendah per merchant | https://linear.app/ganjar-workspaces/issue/GAN-78/setting-ambang-batas-stok-rendah-per-merchant | apa adanya — label Feature/Backend/Frontend, priority Medium |
| GAN-79 | WebSocket gateway NestJS dengan room per-outlet | https://linear.app/ganjar-workspaces/issue/GAN-79/websocket-gateway-nestjs-dengan-room-per-outlet | apa adanya — label Feature/Backend/API, priority Medium |
| GAN-80 | Emitter event stock_low & new_order + persist ke modul notifications | https://linear.app/ganjar-workspaces/issue/GAN-80/emitter-event-stock-low-and-new-order-persist-ke-modul-notifications | apa adanya — label Feature/Backend/API, priority Medium; blocked by GAN-78, GAN-79 |
| GAN-81 | Client realtime Vue — badge, toast non-blocking, indikator reconnect | https://linear.app/ganjar-workspaces/issue/GAN-81/client-realtime-vue-badge-toast-non-blocking-indikator-reconnect | apa adanya — label Feature/Frontend/UI, priority Medium; blocked by GAN-79, GAN-80 |

Urutan dependency: GAN-78 → GAN-79 → GAN-80 → GAN-81. GAN-78 dan GAN-79 bisa jalan paralel.

## Tidak Dibuat

Tidak ada — keempat usulan di-approve user.

## Pertanyaan Terbuka yang Ikut Terbawa

Bukan blocker untuk memulai, tapi harus dijawab sebelum bagian terkait diimplementasi:

- **GAN-78** — penempatan field `low_stock_threshold` di halaman pengaturan mana, dan permission code apa yang boleh mengubahnya (`flow.md` § Pertanyaan Terbuka #2).
- **GAN-78** — perlu dicek dulu apakah modul/tabel setting merchant sudah ada di codebase; kalau belum, ticket ini yang membuatnya.
- **GAN-79** — kalau API pernah dijalankan multi-instance, broadcast antar-instance butuh adapter (mis. Redis). Keputusan design.
- **GAN-81** — isi toast order baru: info ringkas saja vs ada tombol aksi cepat "Lihat" (`flow.md` § Pertanyaan Terbuka #1).
