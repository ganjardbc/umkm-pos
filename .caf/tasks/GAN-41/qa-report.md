# GAN-41 QA Report

## Status: SUCCESS

## Env note
App can't run/build live — pre-existing Prisma env issue (missing generated client +
corrupted `schema.prisma`), confirmed by backend on unmodified HEAD too. No live
HTTP 403/200 run possible. Verified via static code review + existing guard logic
instead (guard mechanism identical to already-proven sibling endpoints).

## Checks

### 1. GET /rbac/roles — 403 w/o `role.read`, 200 with it
`rbac.controller.ts` line 51-52: `@RequirePermission('role.read')` now active on
`findAllRoles`. `PermissionGuard.canActivate` (common/guards/permission.guard.ts):
throws `ForbiddenException` (403) if user's resolved permission codes don't include
required code; returns true (200 passthrough) if present. Same guard already governs
`GET /rbac/roles/:id` w/ same code — proven pattern, no new logic introduced. PASS
(by code inspection, live HTTP not runnable in this env).

### 2. GET /rbac/permissions — 403 w/o `permission.read`, 200 with it
Line 109-110: `@RequirePermission('permission.read')` now active on
`findAllPermissions`. Same guard, same pattern as `GET /rbac/permissions/:id`. PASS
(by code inspection).

### 3. Regression — apps/web role/permission list screens
Per backend verify-report: `apps/web/src/modules/role/services/api.ts` and
`apps/web/src/modules/permission/services/api.ts` call these two endpoints.
Frontend already defines/gates on `role.read` / `permission.read` permission
constants client-side (`.../role/services/rbac.ts`, `.../permission/services/rbac.ts`)
— confirms UI already assumed these codes required, so enabling backend guard
matches existing frontend expectation, no new break. Seed data (`prisma/seed.ts`)
confirms owner/admin-tier roles already carry both codes — those users keep 200 access.
PASS.

## Scope check
Diff limited to two `@RequirePermission(...)` uncomments in `rbac.controller.ts`.
`GET /users/:userId/roles` (line ~210) left untouched, commented guard intact —
correct per ticket scope. No other endpoint touched.

## Test/build results (re-run)
- `pnpm --filter umkm-pos-api run lint` — pass, no errors.
- `pnpm --filter umkm-pos-api run test` — pass, 14 suites / 184 tests.
- `pnpm --filter umkm-pos-api run build` — not re-verified here; backend already
  confirmed failure is pre-existing/unrelated (identical failure on unmodified HEAD).

## Gaps / follow-ups for Reviewer
- No dedicated unit/e2e test added for 403/200 behavior on these two endpoints
  specifically (relies on generic `PermissionGuard` already covered by sibling
  endpoints' pattern). Consider recommending a follow-up test, not a blocker for
  this ticket.
- `GET /users/:userId/roles` guard re-enable — separate ticket needed, already
  flagged by backend, reconfirmed here.
- Prisma/schema env issue blocking `build` and live HTTP verification — separate
  infra ticket needed, out of GAN-41 scope.
