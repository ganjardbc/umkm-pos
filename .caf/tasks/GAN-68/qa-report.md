## Ticket: GAN-68
## Agent: qa
## Status: PASS

## Quality Gate Results
- Typecheck: PASS (no dedicated `typecheck` script in `apps/api`; used `pnpm --filter umkm-pos-api build` as equivalent per project convention — `nest build` completed with no TS errors)
- Lint: PASS (`pnpm --filter umkm-pos-api lint` — `eslint "{src,apps,libs,test}/**/*.ts" --fix`, no errors/warnings output)
- Test: PASS (`pnpm --filter umkm-pos-api test` — 15 suites, 188 tests, all passed, includes the 4 new tests in `apps/api/src/users/users.controller.spec.ts`)

## Security Check Results (backend)
- Multi-tenant scope: PASS — every method in `apps/api/src/users/users.service.ts` scopes by `merchant_id` (`findAll` L36-39, `findOne` L62-65, `create` L82-109, `update` L128-147, `remove`/`setAvatar`/`removeAvatar` all call `findOne(id, merchantId)` first at L132/L186/L208/L234). `merchantId` is always passed in from `@CurrentUser('merchant_id')` in the controller — never from body/DTO/query.
- RBAC coverage: PASS — all 7 handlers in `apps/api/src/users/users.controller.ts` now carry `@RequirePermission(...)`: `create` → `user.create` (L35), `findAll` → `user.read` (L51, **the fix**), `findOne` → `user.read` (L65), `update` → `user.update` (L77), `remove` → `user.delete` (L95), `setAvatar`/`removeAvatar` → `user.update` (L108, L122). No `@Public()` anywhere in this controller. Controller-level `@UseGuards(PermissionGuard)` (L30) combined with global `APP_GUARD: JwtAuthGuard` (`apps/api/src/app.module.ts:59-60`) means `request.user` is always populated before `PermissionGuard.canActivate` runs — no guard-ordering regression introduced by this change.
- Raw SQL: none found in `apps/api/src/users/`
- Secret exposure: none found (`console.log`/`logger` referencing password/token) in `apps/api/src/users/`

## Diff Verification
`git diff HEAD -- apps/api/src/users/users.controller.ts` shows exactly one line added:
```
+  @RequirePermission('user.read')
```
placed immediately after `@Get()` and before `@ApiOperation(...)`, matching the placement pattern used in `findOne()` (L64-66). No other lines in the controller, `usersService`, DTOs, or module registration were touched — matches the constraint "perubahan dibatasi pada `apps/api/src/users/users.controller.ts`".

Additionally out-of-scope-but-present in the working tree (not part of this diff's core change, reviewed for safety):
- `docs/api/api-contract.md` — DOC-1 task completed: added a "Required Permissions" section documenting `GET /users: user.read` among others. Content is accurate and consistent with controller code. No issue.
- `apps/api/src/rbac/rbac.service.spec.ts` — trivial 1-line whitespace/newline diff, unrelated to this ticket's scope, no functional change, no concern.

## Acceptance Criteria Verification
- [x] `UsersController.findAll` (route `GET /users`) memiliki decorator `@RequirePermission('user.read')`, ditempatkan konsisten dengan pola decorator handler lain — PASS: `apps/api/src/users/users.controller.ts:51`, tepat setelah `@Get()` (L50) dan sebelum `@ApiOperation` (L52), identik pola dengan `findOne()` (L64-66).
- [x] User tanpa permission `user.read` menerima `403 Forbidden` dengan pesan `Permission denied. Required: user.read` — PASS: dibuktikan lewat guard logic itself (`apps/api/src/common/guards/permission.guard.ts:68-72`) dan unit test `apps/api/src/users/users.controller.spec.ts:99-114`, yang meng-drive `PermissionGuard.canActivate` langsung dengan handler context `UsersController.prototype.findAll` dan user_roles mock tanpa `user.read` — hasil: `ForbiddenException('Permission denied. Required: user.read')`.
- [x] User dengan permission `user.read` tetap menerima `200 OK` dengan payload list ter-paginasi tak berubah — PASS: (a) guard-level: `apps/api/src/users/users.controller.spec.ts:116-128` membuktikan `canActivate` resolves `true` saat user punya `user.read`; (b) response-shape: `apps/api/src/users/users.controller.spec.ts:44-61` membuktikan `findAll(merchantId, pagination)` meneruskan argumen dan mengembalikan payload paginated (`{data, meta}`) tanpa transformasi — kedua test bersama-sama membuktikan end-to-end behavior 200 OK + shape tak berubah tanpa butuh full e2e HTTP harness (proyek ini tidak punya per-module e2e-spec, konsisten dengan pola `scope-by-outlet.guard.spec.ts`).
- [x] Tidak ada perubahan pada signature `findAll`, query params, atau `usersService.findAll` — PASS: `git diff HEAD -- apps/api/src/users/users.controller.ts` menunjukkan hanya 1 baris ditambahkan (`+1 -0`), tidak menyentuh signature method apa pun; `apps/api/src/users/users.service.ts` tidak ada di diff sama sekali.

## Edge Cases Tested
| Skenario | Expected | Actual | Status |
|---|---|---|---|
| `GET /users` dari user tanpa role/permission `user.read` (mock: only `transaction.create`) | 403 `Permission denied. Required: user.read` | 403 dengan pesan sama | ✅ |
| `GET /users` dari user dengan permission `user.read` | `canActivate` → `true`, lanjut ke handler, 200 dengan payload paginated | `true`, service dipanggil dengan `merchantId`+`pagination` tak berubah, return `{data, meta}` | ✅ |
| `request.user` tidak ada (unauthenticated, hipotetis lewat PermissionGuard tanpa JwtAuthGuard) | `ForbiddenException('User not authenticated')` | Sesuai guard code L39-41 (tidak ada test langsung untuk case ini di ticket ini, tapi behavior guard sudah ada sebelumnya dan tidak berubah oleh fix ini — tidak regresi) | ✅ (unchanged pre-existing behavior) |
| user_roles kosong (user baru tanpa role sama sekali) | `permissionCodes` array kosong → 403 | Sesuai guard logic L63-72 (`flatMap` atas array kosong = `[]`, `includes` = `false` → 403) — tidak ada test eksplisit untuk case ini tapi logic guard generik dan tidak diubah oleh ticket ini | ✅ (unchanged pre-existing behavior, logically sound) |
| `merchantId` kosong/invalid dari JWT | `findAll` tetap query `where: { merchant_id: merchantId }` — akan return list kosong (bukan error) jika merchantId tidak match apa pun, tidak bocor data merchant lain | Tidak berubah oleh ticket ini (di luar scope — murni decorator RBAC) | N/A — out of scope, tidak ada regresi |
| Regresi pada endpoint sibling lain (`findOne`, `update`, `remove`, `setAvatar`, `removeAvatar`) | Semua tetap punya `@RequirePermission` masing-masing, tidak berubah | Diverifikasi via grep — semua 6 handler lain masih punya decorator permission yang sama seperti sebelum fix | ✅ |

## Issues Found

### CRITICAL (harus diperbaiki sebelum PR)
Tidak ada.

### NON-CRITICAL (bisa di task terpisah)
1. Tidak ada full e2e HTTP test (real `supertest` request through `JwtAuthGuard` + `PermissionGuard` + controller + service end-to-end) untuk membuktikan status code HTTP literal `403`/`200` pada `GET /users` — implementasi saat ini menguji `PermissionGuard.canActivate` secara terisolasi (unit-level) plus controller method secara terpisah, yang secara logis ekuivalen tapi tidak menguji integrasi NestJS routing/guard-pipeline secara utuh. Ini konsisten dengan pola test existing di proyek (tidak ada e2e-spec per-modul), jadi bukan blocker, tapi dicatat sebagai gap coverage jika proyek nantinya menambah e2e-spec khusus modul users.
2. Ticket description (`requirements.md` L21, out of scope) mencatat kemungkinan ada endpoint lain di codebase dengan pola silent-missing `@RequirePermission` serupa. QA run ini hanya scoped ke `apps/api/src/users/users.controller.ts` sesuai constraint ticket — audit controller lain di luar `users` module tidak dilakukan dan tetap menjadi temuan terpisah seperti dicatat backend agent.

## Verdict

PASS — semua acceptance criteria terpenuhi dengan bukti file:line yang jelas, diff minimal dan tepat sesuai constraint (1 baris di 1 file), semua quality gate (build/lint/test) hijau, tidak ada regresi pada endpoint sibling atau multi-tenant scoping, tidak ada critical security issue. Dua catatan non-critical di atas tidak menghalangi PR.
