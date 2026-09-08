# GAN-41 Backend Verify Report

## Status: SUCCESS

## Changes
- `apps/api/src/rbac/rbac.controller.ts`
  - Uncommented `@RequirePermission('role.read')` on `GET /rbac/roles` (`findAllRoles`).
  - Uncommented `@RequirePermission('permission.read')` on `GET /rbac/permissions` (`findAllPermissions`).
  - `GET /users/:userId/roles` (`getUserRoles`, line ~215) left untouched — its
    commented `@RequirePermission('role.read')` is a separate follow-up, out of
    scope for GAN-41. **Follow-up needed: file separate ticket to re-enable the
    guard on `GET /users/:userId/roles`.**

## Pre-implementation checks

### apps/web caller flows (task 1)
- `apps/web/src/modules/role/services/api.ts` calls `GET /api/v1/rbac/roles`.
- `apps/web/src/modules/permission/services/api.ts` calls `GET /api/v1/rbac/permissions`.
- Both modules define permission constants `role.read` (`apps/web/src/modules/role/services/rbac.ts`)
  and `permission.read` (`apps/web/src/modules/permission/services/rbac.ts`), used to gate the
  role/permission list screens client-side. Frontend already expects these permission codes
  to be required — enabling the backend guards aligns backend behavior with the frontend's
  existing assumption, no breaking flow found.

### Permission codes / seed data (task 4)
- `apps/api/prisma/seed.ts`: `role.read` and `permission.read` codes exist (seed lines ~861, ~867)
  and are assigned to multiple seeded roles (lines ~947-949, ~993-994, ~1048-1049) — i.e. owner/admin
  tier roles already carry both codes. No new seed data required, no gaps found for roles that
  need list access.

## Verify Checklist (apps/api)
- [x] `pnpm --filter umkm-pos-api run lint` — pass, no errors.
- [x] `pnpm --filter umkm-pos-api run test` — pass, 14 suites / 184 tests.
- [ ] `pnpm --filter umkm-pos-api run build` — **fails, but pre-existing and unrelated to this change.**
      293 TS2339 errors (`Property 'X' does not exist on type 'PrismaService'`) caused by
      missing generated Prisma client in this sandbox (`node_modules/.prisma/client` absent,
      and `prisma generate` itself fails: `prisma/schema.prisma` datasource block is missing
      `url = env("DATABASE_URL")` plus the schema file has stray trailing `}` lines after
      `daily_reports` model, i.e. schema file looks corrupted independent of this ticket).
      Verified by `git stash`-ing this change and re-running the build: identical 293 errors
      occur on unmodified HEAD, confirming this is a pre-existing environment/repo issue, not
      introduced by the GAN-41 diff. Flagging for human follow-up — not fixed here as it is
      out of GAN-41 scope (schema/env repair, not RBAC guard re-enable).

## Notes for QA / Reviewer
- Only two guards re-enabled: `role.read` on `GET /rbac/roles`, `permission.read` on
  `GET /rbac/permissions`. No other endpoint touched.
- `GET /users/:userId/roles` guard intentionally left commented — separate follow-up ticket needed.
- Build failure above is environmental (missing/corrupted Prisma generated client + schema.prisma
  missing `url` in datasource), reproduced identically on pre-change HEAD. Recommend human check
  DATABASE_URL / prisma generate setup for this sandbox, and inspect `prisma/schema.prisma` for
  corruption, separately from GAN-41.
