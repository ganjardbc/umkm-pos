## Ticket: GAN-48
## Agent: backend
## Status: SUCCESS

## Attempt Log
- Attempt 1: PASS

## Acceptance Criteria
- [x] Modifikasi API `GET /transactions` untuk membatasi list transaksi hanya pada outlet-outlet yang diperbolehkan bagi user. Jika user menyertakan `outlet_id` di query parameter, periksa kepemilikan merchant dan otorisasi user ke outlet tersebut. Jika tidak disertakan, kembalikan hanya transaksi dari outlet yang di-assign ke user. — Terpenuhi di `apps/api/src/transactions/transactions.service.ts` baris 38
- [x] Modifikasi API `POST /transactions` untuk menolak request dengan status 403 Forbidden jika user tidak memiliki akses/role pada `outlet_id` yang dikirim di body payload. — Terpenuhi di `apps/api/src/transactions/transactions.service.ts` baris 529 dan 541
- [x] Modifikasi API `GET /transactions/:id`, `POST /transactions/:id/cancel`, dan `PATCH /transactions/:id/status` untuk memastikan transaksi yang dicari berada di outlet yang diperbolehkan bagi user. Jika transaksi berada di outlet lain yang tidak dapat diakses user, kembalikan status 404 Not Found atau 403 Forbidden. — Terpenuhi di `apps/api/src/transactions/transactions.service.ts` baris 88 (findOne), 224 (updateStatus), dan 275 (cancel)
- [x] Otorisasi outlet-level dilewati/diberikan secara penuh untuk user dengan role `owner` pada merchant tersebut. — Terpenuhi di `apps/api/src/transactions/transactions.service.ts` baris 793 (getAllowedOutletIds)

## Quality Gate
- Typecheck: PASS
- Lint: PASS
- Test: PASS (182 tests passed successfully, including new coverage for access control checks)
- Multi-tenant scope: PASS
- RBAC coverage: PASS

## Files Changed
- apps/api/src/transactions/transactions.controller.ts
- apps/api/src/transactions/transactions.service.ts
- apps/api/src/transactions/transactions.service.spec.ts

## Catatan
- Tenant checking dan outlet checking terintegrasi dengan baik menggunakan method helper `getAllowedOutletIds` yang mengambil seluruh user roles untuk user dalam merchant yang bersangkutan. Jika user memiliki role `owner` pada merchant tersebut, seluruh list outlet dikembalikan. Jika tidak, hanya list outlet spesifik yang di-assign ke user yang dikembalikan.
- Validasi berjalan secara aman: query filtering menggunakan `{ in: allowedOutletIds }` sehingga data dari tenant / outlet lain tidak akan pernah bocor ke user yang tidak berhak.
- Method `createCatalogOrder` (yang melayani pemesanan catalog guest) berjalan tanpa input `userId`, sehingga bypass validasi user-level dan tetap diproteksi di level session token/outlet-to-merchant association.

## Skipped Agents
- frontend: SKIPPED — Perubahan hanya terjadi di backend untuk memvalidasi input outlet_id dari client.
