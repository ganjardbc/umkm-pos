## Ticket: GAN-68
## Agent: caf-backend
## Status: SUCCESS

## Attempt Log
- Attempt 1: PASS — build, lint, and test all passed on first run after implementing BE-1 and BE-2.

## Acceptance Criteria
- [x] `UsersController.findAll` (route `GET /users`) memiliki decorator `@RequirePermission('user.read')` — `apps/api/src/users/users.controller.ts:51`, ditempatkan tepat setelah `@Get()` dan sebelum `@ApiOperation(...)`, mengikuti urutan yang sama dengan `findOne()` (baris 64-65).
- [x] User dengan role yang tidak memiliki permission `user.read` menerima `403 Forbidden` — diverifikasi lewat unit test terhadap `PermissionGuard.canActivate` dengan handler context `UsersController.prototype.findAll` dan `user_roles` mock tanpa permission `user.read`; test mengasersi `ForbiddenException` dengan pesan `Permission denied. Required: user.read` (`apps/api/src/users/users.controller.spec.ts:102-114`).
- [x] User dengan role yang memiliki permission `user.read` tetap menerima akses (guard `canActivate` resolves `true`, yang secara end-to-end menghasilkan `200 OK` dengan payload paginated tak berubah — diverifikasi terpisah lewat unit test `should pass merchantId and pagination through to usersService.findAll`, `apps/api/src/users/users.controller.spec.ts:47-61`) dan test guard permission match (`apps/api/src/users/users.controller.spec.ts:116-127`).
- [x] Tidak ada perubahan pada signature method `findAll`, query params, atau `usersService.findAll` — hanya satu baris decorator ditambahkan; `apps/api/src/users/users.service.ts` tidak disentuh.

## Quality Gate
- Typecheck: PASS (`pnpm --filter umkm-pos-api build`)
- Lint: PASS (`pnpm --filter umkm-pos-api lint`)
- Test: PASS (`pnpm --filter umkm-pos-api test` — 15 suites, 188 tests, semua passed, termasuk 4 test baru di `users.controller.spec.ts`)
- Multi-tenant scope: PASS — `merchant_id` di `users.service.ts` selalu berasal dari parameter `merchantId` (diteruskan dari `@CurrentUser('merchant_id')` di controller), tidak ada dari body/DTO
- RBAC coverage: PASS — semua handler di `users.controller.ts` (`create`, `findAll`, `findOne`, `update`, `remove`, `setAvatar`, `removeAvatar`) sekarang memiliki `@RequirePermission(...)`, tidak ada `@Public()` di modul ini
- Raw SQL: Tidak ditemukan `$queryRaw`/`$executeRaw` di `apps/api/src/users/`

## Files Changed
- apps/api/src/users/users.controller.ts (BE-1: tambah `@RequirePermission('user.read')` pada `findAll`)
- apps/api/src/users/users.controller.spec.ts (BE-2: test baru — metadata permission check + unit test `PermissionGuard` untuk 403 tanpa permission dan allow (200 path) dengan permission)

## Catatan
- Task BE-2 diimplementasikan sebagai unit test terhadap `PermissionGuard.canActivate` (bukan full e2e HTTP test), mengikuti pola test guard yang sudah ada di proyek ini (`apps/api/src/common/guards/scope-by-outlet.guard.spec.ts`). Tidak ada e2e-spec khusus per-modul di `apps/api/test/` (hanya `app.e2e-spec.ts` generik), jadi pendekatan unit test pada guard + controller adalah yang paling konsisten dengan konvensi existing dan tetap membuktikan behavior 403/200 sesuai acceptance criteria.
- DOC-1 (update `docs/api/api-contract.md` jika ada) tidak dikerjakan oleh agent ini karena di luar scope `caf-backend` (task Docs, bukan Backend) — perlu ditangani terpisah jika relevan.
