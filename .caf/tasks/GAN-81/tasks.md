## Ticket: GAN-81

## Status: BLOCKED — lihat `requirements.md` section "Blocker — Dependency Backend
Belum Ada"

Tidak ada task konkret yang bisa dieksekusi sekarang. WebSocket gateway NestJS
(room per-outlet) dan event emitter `stock_low`/`new_order` belum ada sama sekali di
`apps/api` (diverifikasi: tidak ada dependency WebSocket di `apps/api/package.json`,
tidak ada gateway module di `apps/api/src/app.module.ts`). Ticket GAN-81 secara scope
memang FE-only ("TIDAK ADA task backend baru" — instruksi eksplisit dari ticket),
sehingga membuat backend task di sini akan keluar dari scope ticket ini; namun
membuat FE task yang mengasumsikan gateway/event sudah ada akan menghasilkan
implementasi yang tidak bisa disambungkan ke backend apa pun dan tidak bisa
diverifikasi end-to-end.

**Tindakan yang disarankan (bukan bagian dari ticket ini, keputusan manusia):**
1. Buat ticket backend terpisah untuk WebSocket gateway NestJS dengan room per-outlet
   + event emitter `stock_low` dan `new_order` (lihat `requirements.md` untuk detail
   kontrak yang dibutuhkan FE).
2. Setelah ticket backend tersebut selesai dan endpoint/event WS terdokumentasi
   (mis. di `docs/api/api-contract.md`), jalankan ulang `/caf-plan-ticket GAN-81` agar
   planner bisa breakdown task FE konkret (store WS connection, toast handler, badge
   listener, reconnect indicator) berdasarkan kontrak WS yang sudah nyata.

## Backend Tasks
(none — di luar scope ticket ini; lihat requirements.md untuk dependency yang perlu
dibuat via ticket backend terpisah)

## Frontend Tasks
(none — belum di-breakdown karena akan mengasumsikan WebSocket gateway/event backend
yang belum ada; lihat requirements.md Acceptance Criteria untuk daftar target yang
akan di-breakdown ulang setelah blocker selesai)

## Shared Types Tasks
(none untuk saat ini)

## Docs Tasks
(none untuk saat ini — dokumentasi kontrak WebSocket event menjadi tanggung jawab
ticket backend gateway, bukan ticket ini)

## Skip Agents
- qa: tidak ada perubahan kode untuk ticket ini (BLOCKED, Backend Tasks dan Frontend
  Tasks sama-sama kosong, tidak ada implementasi yang dieksekusi).
- reviewer: tidak ada perubahan kode untuk ticket ini (BLOCKED, Backend Tasks dan
  Frontend Tasks sama-sama kosong, tidak ada implementasi yang dieksekusi).
- documentation: tidak ada perubahan kode/API dari ticket ini yang perlu
  didokumentasikan.

Catatan: `frontend` dan `backend` sengaja TIDAK ditandai skip di sini meskipun kedua
section task-nya kosong — sesuai aturan planner (tidak boleh skip kedua agent
implementasi sekaligus). Status ticket ini BLOCKED; keputusan untuk menjalankan atau
menahan agent frontend/backend pada pipeline diserahkan ke orchestrator/manusia
berdasarkan Status: BLOCKED di requirements.md, bukan lewat directive skip di sini.
