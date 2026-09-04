## Status: SUCCESS

## Agent: QA

## Ticket: GAN-40 — [RBAC] Fix cross-tenant read in getUserRoles (missing permission guard + scope check)

---

## QA Plan

1. Read tasks.md, requirements.md, and verify-report.md for acceptance criteria
2. Inspect all three changed files directly (rbac.controller.ts, rbac.service.ts, rbac.service.spec.ts)
3. Run the unit test suite (`npx jest --testPathPatterns=rbac.service.spec --verbose`)
4. Run TypeScript check and verify any new errors are not regressions from GAN-40 changes
5. Cross-check each task checklist item against actual code

---

## File Inspection Results

### `apps/api/src/rbac/rbac.controller.ts`

- **`@RequirePermission('role.read')`** is active (uncommented) on the `getUserRoles` handler at line 210. ✅
- **`@CurrentUser('merchant_id') merchantId: string`** parameter is present at line 221. ✅
- Service call is `this.rbacService.getUserRoles(userId, merchantId)` — passes `merchantId`. ✅
- **`@ApiResponse({ status: 404, description: 'User not found or not in your merchant' })`** is present at lines 215–218. ✅

### `apps/api/src/rbac/rbac.service.ts`

- **`getUserRoles(userId: string, merchantId: string)`** — correct two-parameter signature at line 294. ✅
- **Tenant scope check** at the top of method (lines 296–303):
  - Queries `prisma.users.findFirst({ where: { id: userId, merchant_id: merchantId } })` — identical pattern to `assignRoleToUser` / `revokeRoleFromUser`. ✅
  - Throws `NotFoundException('User not found or does not belong to your merchant')` if null. ✅
  - Returns 404 (not 403) — does not leak cross-tenant user existence. ✅
- **`user_roles.findMany`** is only called after the scope check succeeds. ✅
- Include shape matches the technical design spec (users, roles with role_permissions, outlets). ✅

### `apps/api/src/rbac/rbac.service.spec.ts`

- **`findMany: jest.fn()`** added to `user_roles` mock (line 23). ✅
- **`describe('getUserRoles')`** block present with two tests:
  1. `throws NotFoundException when user does not exist or does not belong to merchant` — mocks `users.findFirst` returning `null`, asserts `NotFoundException`, asserts `user_roles.findMany` NOT called. ✅
  2. `returns user roles when user belongs to caller's merchant` — mocks valid user + role list, asserts result equals mocked value, asserts correct `findFirst` and `findMany` call arguments. ✅

---

## Test Execution

```
PASS src/rbac/rbac.service.spec.ts
  RbacService
    assignRoleToUser
      ✓ throws NotFoundException when user does not exist or does not belong to merchant (28 ms)
      ✓ throws NotFoundException when role does not exist (4 ms)
      ✓ throws ConflictException when role already assigned (4 ms)
      ✓ assigns role successfully (4 ms)
    revokeRoleFromUser
      ✓ throws NotFoundException when user does not exist or does not belong to merchant (5 ms)
      ✓ throws NotFoundException when role assignment not found (4 ms)
      ✓ revokes role successfully (15 ms)
    getUserRoles
      ✓ throws NotFoundException when user does not exist or does not belong to merchant (2 ms)
      ✓ returns user roles when user belongs to caller's merchant (2 ms)

Test Suites: 1 passed, 1 total
Tests:       9 passed, 9 total
Snapshots:   0 total
```

All 9 tests pass: 7 pre-existing + 2 new `getUserRoles` tests. Zero failures.

---

## TypeScript Check

- Baseline (before GAN-40 changes): 293 TypeScript errors — all pre-existing, caused by Prisma generated client not being present in this environment (`@prisma/client` not generated).
- With GAN-40 changes: 294 errors (+1).
- The single additional error is `src/rbac/rbac.service.ts(296,36): error TS2339: Property 'users' does not exist on type 'PrismaService'` — this is the same class of pre-existing Prisma client error affecting every service file in the codebase. The new `this.prisma.users.findFirst(...)` call at line 296 is structurally identical to the same call in `assignRoleToUser` (line 219) and `revokeRoleFromUser` (line 258), which both carry the same class of error.
- **No new logic errors introduced by GAN-40 changes.** The +1 Prisma type error is expected and consistent with the environment constraint confirmed by the backend agent.

---

## Acceptance Criteria Checklist

| Criterion | Result |
|---|---|
| `GET /rbac/users/:userId/roles` requires `role.read` permission; callers without it receive 403 | ✅ `@RequirePermission('role.read')` uncommented and active |
| Service rejects requests where `userId` belongs to different merchant; response is 404 (not 403) | ✅ `NotFoundException` thrown after `users.findFirst` scope check |
| Existing tests for `assignRoleToUser` / `revokeRoleFromUser` continue to pass | ✅ All 7 pre-existing tests pass |
| New unit tests cover two guard conditions for `getUserRoles` | ✅ 2 new tests added and passing |
| `findMany: jest.fn()` added to `user_roles` mock | ✅ Present at line 23 |
| `@ApiResponse` 404 annotation added to controller | ✅ Present |
| `merchantId` extracted from JWT via `@CurrentUser('merchant_id')` — not from client input | ✅ Correct |
| TypeScript: no new logic errors | ✅ Only pre-existing Prisma client generation errors |

---

## Conclusion

All acceptance criteria from the ticket are met. The implementation correctly fixes both vulnerabilities:
1. The missing `@RequirePermission('role.read')` guard is now active.
2. The missing tenant scope check is now enforced in `getUserRoles`, mirroring the existing pattern in the write path.

All tests pass. No regressions detected.
