## Ticket: GAN-61
## Agent: backend
## Status: SUCCESS

## Attempt Log
- Attempt 1: PASS

## Acceptance Criteria
- [x] Endpoint `GET /api/v1/rbac/users/:userId/roles` terlindungi oleh permission guard `@RequirePermission('role.read')` — terpenuhi di `apps/api/src/rbac/rbac.controller.ts` baris 210
- [x] Melakukan pemanggilan `GET /api/v1/rbac/users/:userId/roles` dengan `userId` milik merchant lain akan mengembalikan status code `404 Not Found` (throws `NotFoundException` dengan pesan "User not found or does not belong to your merchant") — terpenuhi di `apps/api/src/rbac/rbac.service.ts` baris 295-306
- [x] Melakukan pemanggilan `GET /api/v1/rbac/users/:userId/roles` dengan `userId` milik merchant yang sama dengan caller akan berhasil mengembalikan daftar role dari user tersebut (status code `200 OK`) — terpenuhi di `apps/api/src/rbac/rbac.service.ts` baris 308-323
- [x] Unit test untuk method `RbacService.getUserRoles` telah mencakup pengujian validasi kecocokan `merchant_id` dan melempar `NotFoundException` jika user tidak ditemukan/bukan milik merchant yang bersangkutan — terpenuhi di `apps/api/src/rbac/rbac.service.spec.ts` baris 230-297

## Quality Gate
- Typecheck: PASS
- Lint: PASS
- Test: PASS (186 unit tests pass, src/rbac unit tests pass)
- Multi-tenant scope: PASS (merchant_id validation on user fetching inside RbacService.getUserRoles)
- RBAC coverage: PASS (@RequirePermission('role.read') added to Get('users/:userId/roles'))

## Files Changed
- apps/api/src/rbac/rbac.service.ts
- apps/api/src/rbac/rbac.controller.ts
- apps/api/src/rbac/rbac.service.spec.ts

## Catatan
Semua fungsionalitas dan celah keamanan telah diperbaiki dengan baik dan unit test telah ditambahkan untuk menjamin keamanan multi-tenancy pada method ini.

## Skipped Agents
- documentation: SKIPPED — Tidak ada perubahan endpoint baru atau schema database baru yang perlu didokumentasikan di API contract atau ERD.
