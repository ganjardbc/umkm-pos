# GAN-41 Tasks

## Order of Agents
1. caf-backend
2. caf-qa
3. caf-reviewer

## Backend Tasks
- [x] (apps/api) In `apps/api/src/rbac/rbac.controller.ts`, before touching code: search
      `apps/web` for calls to `GET /rbac/roles` and `GET /rbac/permissions` (role
      management / permission list screens) and confirm the caller flows already
      require a permission set that includes `role.read` / `permission.read` (or
      would still work once the guard is enabled). Note findings in
      `verify-report.md`.
- [x] (apps/api) Uncomment `@RequirePermission('role.read')` above `findAllRoles`
      (`GET /rbac/roles`, currently line ~52).
- [x] (apps/api) Uncomment `@RequirePermission('permission.read')` above
      `findAllPermissions` (`GET /rbac/permissions`, currently line ~110).
- [x] (apps/api) Verify `role.read` and `permission.read` permission codes exist and
      are already assigned to the roles that need them (check seed data /
      migrations under `apps/api`). If missing for a role that legitimately needs
      list access, flag in `verify-report.md` — do not invent new seed data unless
      ticket scope allows.
- [x] (apps/api) Do NOT touch `GET /users/:userId/roles` (line ~210) — its
      commented `@RequirePermission('role.read')` is out of scope for GAN-41.
      Leave a one-line follow-up note in `verify-report.md` flagging it for a
      separate ticket.
- [x] (apps/api) Run Verify Checklist: `pnpm --filter umkm-pos-api run lint`,
      `pnpm --filter umkm-pos-api run test`, `pnpm --filter umkm-pos-api run build`.
      (lint + test pass; build fails on pre-existing unrelated Prisma/schema
      environment issue — see verify-report.md.)

## QA Tasks
- [ ] (apps/api) Confirm `GET /rbac/roles` returns 403 without `role.read`
      permission, 200 with it.
- [ ] (apps/api) Confirm `GET /rbac/permissions` returns 403 without
      `permission.read` permission, 200 with it.
- [ ] (apps/api) Regression-check any `apps/web` screen that lists roles/permissions
      still works for an owner/admin-role user (should already carry
      `role.read`/`permission.read`).

## Reviewer Tasks
- [ ] Confirm only the two in-scope guards were re-enabled, no unrelated
      endpoint changed (especially `GET /users/:userId/roles`, left untouched
      per scope).
- [ ] Confirm permission codes match existing sibling endpoints
      (`role.read`, `permission.read`) — no ad-hoc new codes introduced without
      justification.
