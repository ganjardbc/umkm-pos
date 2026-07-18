## Ticket: GAN-62
## Agent: backend
## Status: SUCCESS

## Attempt Log
- Attempt 1: PASS

## Acceptance Criteria
- [x] API `POST /api/rbac/user-roles` (`assignRoleToUser`) memvalidasi `dto.user_id` milik merchant yang sama dengan caller (`merchant_id` dari JWT). — Terpenuhi di `apps/api/src/rbac/rbac.controller.ts` baris 171-189 dan `apps/api/src/rbac/rbac.service.ts` baris 214-254.
- [x] API `DELETE /api/rbac/user-roles` (`revokeRoleFromUser`) memvalidasi `dto.user_id` milik merchant yang sama dengan caller (`merchant_id` dari JWT). — Terpenuhi di `apps/api/src/rbac/rbac.controller.ts` baris 190-209 dan `apps/api/src/rbac/rbac.service.ts` baris 255-296.
- [x] Jika `user_id` tidak ditemukan atau tidak berada di bawah merchant yang sama dengan caller, API melempar `NotFoundException` dengan pesan yang sesuai (misal: `User not found or does not belong to your merchant`). — Terpenuhi di `apps/api/src/rbac/rbac.service.ts` baris 221-228 dan 257-264.
- [x] Service unit tests di `apps/api/src/rbac/rbac.service.spec.ts` diperbarui untuk mencakup skenario validasi `user_id` milik merchant (baik skenario sukses maupun gagal). — Terpenuhi di `apps/api/src/rbac/rbac.service.spec.ts` baris 56-227.

## Quality Gate
- Typecheck: PASS
- Lint: PASS
- Test: PASS
- Multi-tenant scope: PASS
- RBAC coverage: PASS

## Files Changed
- apps/api/src/rbac/rbac.service.ts
- apps/api/src/rbac/rbac.controller.ts
- apps/api/src/rbac/rbac.service.spec.ts

## Catatan
Semua unit test di modul `rbac` telah diperbarui dan berhasil dijalankan secara sukses.

## Skipped Agents
- frontend: SKIPPED — Fitur ini sepenuhnya merupakan perbaikan validasi otorisasi di sisi backend (API), tidak memerlukan perubahan UI atau state frontend.

## Skipped Agents
- documentation: SKIPPED — Tidak ada perubahan skema database atau kontrak API publik (parameter/URL/body DTO tidak berubah).
