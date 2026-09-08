# Tasks — GAN-56

## Order
Backend → QA → Reviewer → PR

## Backend Tasks
- [ ] (apps/api) In `apps/api/src/rbac/rbac.controller.ts` line 52, un-comment
      `@RequirePermission('role.read')` above `findAllRoles` (GET /rbac/roles).
- [ ] (apps/api) In `apps/api/src/rbac/rbac.controller.ts` line 110, un-comment
      `@RequirePermission('permission.read')` above `findAllPermissions` (GET /rbac/permissions).
- [ ] (apps/api) In `apps/api/src/rbac/rbac.controller.ts` line 210, un-comment
      `@RequirePermission('role.read')` above `getUserRoles` (GET /rbac/users/:userId/roles).
- [ ] (apps/api) Confirm `role.read` and `permission.read` permission codes already exist
      (seed/migration) — they're used elsewhere in this same controller, no new permission
      creation expected. If missing, flag in verify-report.md instead of inventing one.
- [ ] (apps/api) Run Verify Checklist for apps/api (lint, test, build) from caf-backend.md.

## QA Tasks
- [ ] Confirm GET /rbac/roles, GET /rbac/permissions, GET /rbac/users/:userId/roles now
      return 403 without the respective permission, 200 with it.
- [ ] Confirm no regression on other RBAC endpoints (create/update/delete role/permission,
      assign/revoke role).

## Reviewer Tasks
- [ ] Diff review: only decorator lines un-commented, no logic/behavior changes elsewhere.
- [ ] Confirm permission codes match sibling endpoints exactly (`role.read`, `permission.read`).
