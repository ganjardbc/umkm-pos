## Ticket: HOTFIX-RBAC-CROSS-TENANT
## Agent: manual PIV (Claude Code, direct session)
## Status: SUCCESS

## Attempt Log
- Attempt 1: PASS (implement + test + lint + typecheck all green, no regression)

## Acceptance Criteria
- [x] `assignRoleToUser` validates `dto.outlet_id` belongs to caller's merchant before any mutation — `apps/api/src/rbac/rbac.service.ts` (private helper `assertOutletBelongsToMerchant`, called at top of `assignRoleToUser`)
- [x] `revokeRoleFromUser` gets the same validation — same helper, called at top of `revokeRoleFromUser`
- [x] Outlet not found → `NotFoundException` (distinct from mismatch case) — `assertOutletBelongsToMerchant` checks `!outlet` first
- [x] Outlet exists but belongs to a different merchant → `ForbiddenException` — `assertOutletBelongsToMerchant` checks `outlet.merchant_id !== callerMerchantId`
- [x] `callerMerchantId` sourced from `@CurrentUser('merchant_id')`, which resolves from `request.user` populated by `JwtStrategy.validate()` from JWT `payload.sub` → DB lookup — never from request body/query
- [x] Normal case (outlet in caller's own merchant) unaffected — regression test passes, behavior identical to pre-fix
- [x] Test coverage added for both functions × both new branches (Forbidden, NotFound) + happy path — `apps/api/src/rbac/rbac.service.spec.ts` (6 tests)

## Quality Gate
- Typecheck: PASS — `npx tsc --noEmit -p tsconfig.json` → "TypeScript: No errors found"
- Lint (scoped to changed files): PASS — `npx eslint src/rbac` → "No issues found" (after `--fix` for prettier formatting on the 3 touched files)
- Lint (full workspace): pre-existing 111 prettier errors across 21 files unrelated to this change (`stock.service.ts`, `auth.service.ts`, `transactions.service.ts`, etc.) — not introduced by this hotfix, not touched
- Test (rbac module): PASS — `npx jest src/rbac` → 6/6 tests pass
- Test (full suite): PASS — `npx jest` → 169/169 tests pass, no regression
- Multi-tenant scope: PASS — `callerMerchantId` always from `@CurrentUser('merchant_id')` (JWT-derived), never from `dto`/body
- RBAC coverage: unchanged for this hotfix's endpoints — both `POST /rbac/user-roles` and `DELETE /rbac/user-roles` already had `@RequirePermission('role.assign')` active (not part of the commented-guard finding)

## Files Changed
- apps/api/src/rbac/rbac.service.ts — added `assertOutletBelongsToMerchant` private helper; `assignRoleToUser` and `revokeRoleFromUser` now take `callerMerchantId` and validate outlet ownership before mutation
- apps/api/src/rbac/rbac.controller.ts — `assignRoleToUser` and `revokeRoleFromUser` handlers now inject `@CurrentUser('merchant_id')` and pass it through; added Swagger `403`/`404` response docs
- apps/api/src/rbac/rbac.service.spec.ts — new file, 6 tests covering both functions

## Catatan
- **`permission.guard.ts` sengaja TIDAK diubah** di hotfix ini. Fix dilakukan inline di service layer (blast radius kecil, tidak menyentuh guard yang dipakai puluhan endpoint lain). Generic outlet/merchant scope-check di level guard (mis. decorator `@ScopeByOutlet()`) diusulkan sebagai perbaikan arsitektural terpisah, bukan bagian hotfix critical ini.
- **`getUserRoles` (rbac.service.ts, endpoint `GET /rbac/users/:userId/roles`) TIDAK di-fix di sini** — punya masalah berbeda (permission guard di-comment + query tanpa merchant/outlet filter sama sekali, cross-tenant read bukan cross-tenant write). Perlu ticket terpisah:
  - Uncomment `@RequirePermission('role.read')` di controller.
  - Tambah validasi bahwa `userId` target berada di outlet/merchant yang sama dengan caller (permission check saja tidak cukup, sama seperti kasus `assignRoleToUser`).
- Dua endpoint lain dengan pola serupa yang sudah diverifikasi TIDAK vulnerable dengan cara yang sama: `assignPermissionToRole`/`revokePermissionFromRole` beroperasi di tabel `roles`/`permissions` yang memang global (tidak ada `merchant_id` di schema), jadi bukan kategori masalah "outlet_id dari body tanpa validasi scope" — di luar scope hotfix ini, dicatat sebagai temuan arsitektur (roles global padahal produk multi-tenant), bukan bug urgent.
- `GET /rbac/roles` dan `GET /rbac/permissions` juga punya `@RequirePermission(...)` yang di-comment (temuan audit awal) — tidak termasuk endpoint `role.assign` yang jadi scope hotfix ini, tapi tetap perlu di-uncomment di ticket terpisah karena keduanya accessible oleh siapapun yang punya JWT valid tanpa permission apapun.
