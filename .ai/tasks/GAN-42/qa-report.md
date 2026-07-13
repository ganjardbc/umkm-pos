## Ticket: GAN-42
## Agent: qa
## Status: FAIL

## Quality Gate Results

- Typecheck: PASS
  ```
  pnpm --filter umkm-pos-api exec tsc -p tsconfig.json --noEmit
  # zero output — no errors
  ```
- Lint: PASS
  ```
  pnpm --filter umkm-pos-api lint
  # no errors, no warnings
  ```
- Test: FAIL
  ```
  Test Suites: 1 failed, 13 passed, 14 total
  Tests:       2 failed, 172 passed, 174 total

  FAIL src/rbac/rbac.service.spec.ts
  ● RbacService › assignRoleToUser › throws ForbiddenException when outlet belongs to a different merchant
      Expected constructor: ForbiddenException
      Received constructor: NotFoundException
      Received message: "Role with ID role-1 not found"
      at RbacService.findOneRole (rbac/rbac.service.ts:70:13)

  ● RbacService › revokeRoleFromUser › throws ForbiddenException when outlet belongs to a different merchant
      Expected constructor: ForbiddenException
      Received constructor: NotFoundException
      Received message: "Role assignment not found"
      at RbacService.revokeRoleFromUser (rbac/rbac.service.ts:250:13)
  ```

## Security Check Results (backend)

- Multi-tenant scope: PASS — `merchant_id` read exclusively from `request.user.merchant_id` (JWT) at `scope-by-outlet.guard.ts:53`. Never from body/params/query.
- RBAC coverage: PARTIAL (pre-existing, out of scope for GAN-42)
  - `GET /rbac/roles` (line 52): `@RequirePermission` commented out — pre-existing issue
  - `GET /rbac/permissions` (line 110): `@RequirePermission` commented out — pre-existing issue
  - `GET /rbac/users/:userId/roles` (line 206): `@RequirePermission` commented out — pre-existing issue
  - `POST /rbac/user-roles` (line 172): `@RequirePermission('role.assign')` ✅ + `@ScopeByOutlet` ✅
  - `DELETE /rbac/user-roles` (line 191): `@RequirePermission('role.assign')` ✅ + `@ScopeByOutlet` ✅
- Raw SQL: PASS — no `$queryRaw`/`$executeRaw` found in common/ or rbac/
- Secret exposure: PASS — no console.log/logger with password or token found

## Acceptance Criteria Verification

- [x] Decorator `@ScopeByOutlet(fieldPath: string)` tersedia — `apps/api/src/common/decorators/scope-by-outlet.decorator.ts:9`
- [x] Decorator simpan metadata via `SetMetadata(SCOPE_BY_OUTLET_KEY, fieldPath)` — `scope-by-outlet.decorator.ts:10`
- [x] Guard `ScopeByOutletGuard implements CanActivate` tersedia — `apps/api/src/common/guards/scope-by-outlet.guard.ts:19`
- [x] Guard baca `fieldPath` dari metadata, ekstrak dari `request[source][fieldName]`, query `outlets` — `scope-by-outlet.guard.ts:26-47`
- [x] Guard throw `NotFoundException` jika outlet tidak ditemukan — `scope-by-outlet.guard.ts:50`
- [x] Guard throw `ForbiddenException` jika `merchant_id` tidak cocok — `scope-by-outlet.guard.ts:54`
- [x] Guard return `true` jika metadata tidak ada — `scope-by-outlet.guard.ts:32-34`
- [x] `POST /rbac/user-roles` pakai `@ScopeByOutlet('body.outlet_id')` + `@UseGuards(ScopeByOutletGuard)` — `rbac.controller.ts:173-174`
- [x] `DELETE /rbac/user-roles` pakai `@ScopeByOutlet('body.outlet_id')` + `@UseGuards(ScopeByOutletGuard)` — `rbac.controller.ts:192-193`
- [x] `assertOutletBelongsToMerchant` dihapus dari `RbacService` — grep returns empty, confirmed absent
- [x] `assignRoleToUser(dto, assignedBy)` — 2 params only, no `callerMerchantId` — `rbac.service.ts:214`
- [x] `revokeRoleFromUser(dto)` — 1 param only, no `callerMerchantId` — `rbac.service.ts:241`
- [x] `ScopeByOutletGuard` didaftarkan ke `RbacModule` providers — `rbac.module.ts:10`
- [x] Tidak ada endpoint lain yang perilakunya berubah — semua endpoint non-target masih pakai PermissionGuard saja
- [ ] Unit test `ScopeByOutletGuard` 5 test case — PASS di `scope-by-outlet.guard.spec.ts` ✅
- [ ] **FAIL**: `rbac.service.spec.ts` — 2 test case failing karena spec file TIDAK diupdate setelah retrofit (lihat Issues Found)

## Edge Cases Tested

| Skenario | Expected | Actual | Status |
|---|---|---|---|
| `@ScopeByOutlet` tidak ada di handler | Guard skip, return true | return true, no DB call | ✅ |
| `outlet_id` valid, `merchant_id` cocok | return true | return true | ✅ |
| outlet tidak ditemukan di DB | `NotFoundException` | `NotFoundException` | ✅ |
| `merchant_id` berbeda | `ForbiddenException` | `ForbiddenException` | ✅ |
| `outlet_id` tidak ada di request body | `BadRequestException` | `BadRequestException` | ✅ |
| `fieldPath` format `params.outlet_id` | parse correctly | correct (split('.')[0]='params') | ✅ |
| `fieldPath` format `query.outlet_id` | parse correctly | correct (split('.')[0]='query') | ✅ |
| `request.user` null (e.g. `@Public` + `@ScopeByOutlet`) | safe error | TypeError: Cannot read properties of null — 500 | ⚠️ NON-CRITICAL |
| `assignRoleToUser` called without `callerMerchantId` | guard handles scope | service signature correct | ✅ |
| `ScopeByOutletGuard` sebagai global guard | harus TIDAK global | only in RbacModule providers | ✅ |
| Guard order: PermissionGuard (class) sebelum ScopeByOutletGuard (handler) | correct order | NestJS applies class→handler order | ✅ |
| `getUserRoles` cross-tenant (pre-existing) | out of scope GAN-42 | no merchant_id scope — pre-existing | ⚠️ OUT OF SCOPE |

## Issues Found

### CRITICAL (harus diperbaiki sebelum PR)

1. **`apps/api/src/rbac/rbac.service.spec.ts` — stale test file, 2 tests FAILING**

   Root cause: `rbac.service.spec.ts` was NOT updated after the retrofit in BE-5. The spec still tests the old behavior where `assertOutletBelongsToMerchant` lived in the service.

   **Failing test 1** (`rbac.service.spec.ts:56-71`):
   ```
   service.assignRoleToUser(dto, assignedBy, merchantA)  // old 3-arg signature
   → expects ForbiddenException (old: service checked merchant)
   → actual: NotFoundException("Role with ID role-1 not found")
     because mock for outlets.findUnique is set but service no longer queries outlets
     and roles.findFirst mock returns undefined → throws NotFoundException from findOneRole
   ```

   **Failing test 2** (`rbac.service.spec.ts:127-138`):
   ```
   service.revokeRoleFromUser(dto, merchantA)  // old 2-arg signature
   → expects ForbiddenException (old: service checked merchant)
   → actual: NotFoundException("Role assignment not found")
     because service no longer queries outlets, goes straight to user_roles.findFirst
     which returns undefined from unmocked mock → throws NotFoundException
   ```

   **Additional stale tests** (pass for wrong reasons):
   - `rbac.service.spec.ts:73-85`: `assignRoleToUser` NotFoundException test — `outlets.findUnique` mock returns null, but service never calls it. Test passes because `roles.findFirst` is also unmocked → throws NotFoundException from wrong place.
   - `rbac.service.spec.ts:87-123`: success test for `assignRoleToUser` — passes 3rd arg `merchantA` (extra arg silently ignored), mocks `outlets.findUnique` which service never calls. Test passes but tests stale assumptions.
   - `rbac.service.spec.ts:140-182`: same pattern for `revokeRoleFromUser` success/NotFoundException tests.

   **Required fix**: Update `apps/api/src/rbac/rbac.service.spec.ts` to:
   - Remove `outlets.findUnique` mock (service no longer queries outlets)
   - Remove `merchantA`/`merchantB` constants (no longer needed in service tests)
   - Remove 3rd arg `merchantA` from all `assignRoleToUser(...)` calls
   - Remove 2nd arg `merchantA` from all `revokeRoleFromUser(...)` calls
   - Delete test cases that tested merchant scope (that coverage now belongs to `scope-by-outlet.guard.spec.ts`)
   - Fix success test for `assignRoleToUser`: ensure `roles.findFirst` mock returns a valid role (currently succeeds by luck because outlets mock was primary setup)

### NON-CRITICAL (bisa di task terpisah)

1. **`apps/api/src/common/guards/scope-by-outlet.guard.ts:53`** — no null-safety on `request.user`

   If guard is mistakenly applied alongside `@Public()` (unauthenticated endpoint), `request.user` will be `null`/`undefined` and line 53 throws `TypeError: Cannot read properties of undefined (reading 'merchant_id')` → unhandled 500.

   Current usage is safe (all RBAC endpoints are JWT-protected via global `JwtAuthGuard`), but defensive check would prevent future misuse:
   ```typescript
   if (!request.user?.merchant_id) {
     throw new UnauthorizedException('User context not available');
   }
   ```

2. **Pre-existing (out of scope GAN-42)**: `GET /rbac/users/:userId/roles` (line 206) has `@RequirePermission` commented out AND `getUserRoles` has no `merchant_id` scope in service (line 266-285). Any authenticated user can query any user's roles across tenants. Tracked as separate audit item per requirements.md.

## Verdict

**FAIL** — 2 critical test failures in `apps/api/src/rbac/rbac.service.spec.ts`. The spec file was not updated after BE-5 retrofit. Implementation code is correct; test file is stale. Must fix `rbac.service.spec.ts` before PR.
