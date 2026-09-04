## Review Notes — GAN-40
Ticket: GAN-40
Agent: caf-reviewer
Verdict: APPROVE

---

### Security Audit

**GAN-40 vulnerabilities (both fixed correctly):**

1. **Missing `@RequirePermission('role.read')` guard** — Uncommented and active at line 210 of `rbac.controller.ts`. The `PermissionGuard` is applied at controller class level via `@UseGuards(PermissionGuard)`, so the decorator takes effect properly. Callers without `role.read` permission will now receive 403. ✅

2. **Missing tenant scope check in `getUserRoles`** — `RbacService.getUserRoles` now accepts `merchantId: string` extracted from JWT via `@CurrentUser('merchant_id')` (not from client input). The scope check queries `prisma.users.findFirst({ where: { id: userId, merchant_id: merchantId } })` before executing `user_roles.findMany`. If the user does not belong to the caller's merchant, a `NotFoundException` is thrown — correctly returning 404 (not 403) so that cross-tenant user existence is not leaked. ✅

3. **`merchantId` source** — Correctly derived from the JWT payload via `@CurrentUser('merchant_id')`, not from any client-controlled input (path param, query, body). This matches the tenant isolation pattern mandated by the architecture. ✅

4. **JwtAuthGuard is globally applied** — Confirmed in `app.module.ts` via `APP_GUARD`. All RBAC endpoints require a valid JWT regardless of whether `@RequirePermission` is present. The two pre-existing commented-out permission guards on `GET /rbac/roles` and `GET /rbac/permissions` (lines 52–53 and 110–111 of `rbac.controller.ts`) mean those listing endpoints are authenticated but not permission-gated. This is a **pre-existing concern outside GAN-40 scope** — it is explicitly noted in `requirements.md` as a non-goal and should be tracked as a separate ticket.

5. **No new attack surface introduced** — The diff adds only: a decorator, a parameter extraction, a scope-check block, and tests. No new routes, no new DTOs, no relaxation of any existing guard.

**Overall security verdict: the two vulnerabilities are properly remediated with no regressions or new exposure.**

---

### Qualitative Review

**Pattern consistency:** The implementation is an exact mirror of the patterns already established for `assignRoleToUser` and `revokeRoleFromUser`:
- Same `prisma.users.findFirst({ where: { id, merchant_id } })` scope check at the top of the method.
- Same `NotFoundException('User not found or does not belong to your merchant')` message on null result.
- Same `@CurrentUser('merchant_id')` extraction in the controller.

This is precisely the pattern the ticket specifies and the codebase establishes as the standard. No deviation.

**Response shape:** `getUserRoles` returns the full `user_roles.findMany` result with includes for `users`, `roles` (with nested `role_permissions`/`permissions`), and `outlets`. This is consistent with the technical design spec in `requirements.md` and is unchanged from the original (unguarded) implementation — the fix adds security without altering the response contract.

**Test quality:** The two new unit tests in `describe('getUserRoles')` are well-structured:
- Test 1 (rejection path): mocks `users.findFirst` to return `null`, asserts `NotFoundException`, and critically asserts `user_roles.findMany` is **not called** — confirming the guard is a short-circuit, not just an error after the query.
- Test 2 (happy path): mocks both `users.findFirst` (valid user) and `user_roles.findMany` (role list), asserts result equality, and asserts the exact call arguments to `findMany` including the full `include` shape. This locks in the contract precisely.
- `findMany: jest.fn()` was correctly added to the `user_roles` mock (line 23) — previously missing.
- All 9 tests (7 pre-existing + 2 new) pass with zero failures per QA report.

**TypeScript note:** The +1 Prisma type error flagged by QA (`Property 'users' does not exist on type 'PrismaService'`) is a known environment artifact — Prisma client is not generated in the dev environment. The identical pattern exists on `assignRoleToUser` (line 219) and `revokeRoleFromUser` (line 258) in the same file, neither of which is a new issue. No new logic errors.

**Minor observation (non-blocking):** The `@ApiResponse({ status: 403 })` annotation is absent from the `getUserRoles` handler in the controller. Since `@RequirePermission('role.read')` is now active, a 403 response is possible (no permission). All other guarded handlers in this controller document their 403 via the global `PermissionGuard` behaviour, so omitting it is consistent with the existing pattern in this file. Low priority; not a blocker.

---

### Verdict Rationale

Both security vulnerabilities described in GAN-40 are correctly and completely fixed:
- The permission guard is active and enforced.
- The tenant scope check uses `merchant_id` from the JWT, not from client input.
- The error response is 404 (not 403) for cross-tenant access, preventing user existence disclosure.
- Implementation follows the exact same pattern as the already-reviewed and merged write path (`assignRoleToUser` / `revokeRoleFromUser`).
- All unit tests pass; no regressions.
- No new attack surface.

The implementation is minimal, targeted, and consistent. No changes required.

---

### For Developer

- **Pre-existing issue (out of scope, separate ticket):** `GET /rbac/roles` (line 52) and `GET /rbac/permissions` (line 110) both have `@RequirePermission` commented out. These list endpoints are authenticated (JWT required globally) but any authenticated user can list all roles/permissions. This mirrors a separate audit finding noted in `requirements.md` as out of scope for GAN-40. Consider creating a follow-up ticket to enable those guards when the permission assignment for listing operations is confirmed correct for the product.
- No action required for this PR — the above is informational only.
