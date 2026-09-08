# Requirements — GAN-56

## Status: PLAN

## Source
Auditor Agent scan 2026-07-18, `.ai/audits/2026-07-18/audit-report.md`

## Problem
`apps/api/src/rbac/rbac.controller.ts:52` has `@RequirePermission` commented out on
`GET /rbac/roles`. Endpoint reachable by any authenticated user regardless of permission —
missing authorization check.

## Additional findings (same root cause, in-scope)
File scan found 2 more commented `@RequirePermission` guards, same pattern, same file:
- Line 110 — `GET /rbac/permissions` (`findAllPermissions`) — commented `@RequirePermission('permission.read')`
- Line 210 — `GET /rbac/users/:userId/roles` (`getUserRoles`) — commented `@RequirePermission('role.read')`

All three are read-list endpoints that leak RBAC config (roles/permissions/assignments) to
any authenticated user, not just those meant to have `role.read`/`permission.read`. Fixing
only line 52 leaves the other two exposed under the same audit finding class — include all
three in scope of this ticket.

## Success Criteria
- All three commented `@RequirePermission` decorators restored (un-commented) with correct
  existing permission codes (matches sibling endpoints in same resource group: `role.read`,
  `permission.read`).
- `PermissionGuard` (already applied at controller level via `@UseGuards(PermissionGuard)`)
  enforces these on the affected routes.
- No behavior change to any other endpoint.
- Lint/test/build pass for `apps/api`.

## Open Questions
None — permission codes already exist and are used identically on sibling endpoints
(`findOneRole` uses `role.read`, `findOnePermission` uses `permission.read`), so no new
permission/role needs to be created. Proceeding without escalation.
