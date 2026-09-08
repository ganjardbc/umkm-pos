# QA Report — GAN-57

## Ticket
GAN-57: [SECURITY] Endpoint List User Tanpa RBAC Guard

## Verified Against
`requirements.md` acceptance criteria + `tasks.md` backend tasks + `verify-report.md` claims.

## Checks Performed

1. **Fix present in code** — `apps/api/src/users/users.controller.ts`: confirmed
   `@RequirePermission('user.read')` added above `findAll()` (line ~50), same pattern
   as `findOne()`. Class-level `@UseGuards(PermissionGuard)` unchanged.
2. **Lint** — `pnpm --filter umkm-pos-api run lint` → pass, no errors.
3. **Unit tests** — `pnpm --filter umkm-pos-api run test` → 16 suites / 189 tests, all pass.
   New spec files present and executed:
   - `apps/api/src/common/guards/permission.guard.spec.ts`
   - `apps/api/src/users/users.controller.spec.ts`
4. **Build** — `pnpm --filter umkm-pos-api run build` fails (293 TS2339 errors, Prisma
   client not generated in sandbox — `datasource db` missing `url`, `prisma generate` fails
   with P1012). Reproduced independently: `git stash` (reverting the diff) yields identical
   293 errors, confirming failure is pre-existing/environmental and not caused by this change.
5. **Incidental diff** — `apps/api/src/rbac/rbac.service.spec.ts` shows a 1-line trailing-newline
   change (artifact of `eslint --fix`), functionally inert, not a regression.
6. **Scope check (ticket Notes)** — Task 2 (frontend `apps/web` consumer permission check) was
   flagged as out-of-scope/follow-up per ticket notes, not blocking — consistent with ticket intent.

## Acceptance Criteria Assessment

- [x] `GET /users` requires `user.read` permission (401/403 without it) — decorator confirmed,
      `PermissionGuard` unit-tested to throw `ForbiddenException` when permission missing/absent auth.
- [x] Existing callers with `user.read` permission unaffected — guard resolves `true` when permission present; controller test confirms `findAll` delegates correctly with merchant scope.
- [x] No regression on other `UsersController` endpoints — no other decorators/handlers touched; full suite green.
- [~] Lint/test/build pass for `apps/api` — lint and test pass; build fails for pre-existing/environmental reasons unrelated to this change (verified via git stash reproduction). Treated as non-blocking per verify-report's documented root cause.

## Result

No functional issues found. Fix is minimal, correctly scoped, matches existing pattern, covered
by new tests, and does not introduce regressions. Build failure is an environment/Prisma-generation
issue pre-dating this change.

## Status: SUCCESS
