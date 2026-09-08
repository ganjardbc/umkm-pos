# GAN-41: Re-enable permission guards on GET /rbac/roles and GET /rbac/permissions

## Status: PLAN

## Source
Auditor Agent scan 2026-07-10, `.ai/audits/2026-07-10/audit-report.md`

## Problem
`@RequirePermission(...)` commented out on two RBAC read endpoints in
`apps/api/src/rbac/rbac.controller.ts`:
- `GET /rbac/roles` (line 52, `findAllRoles`)
- `GET /rbac/permissions` (line 110, `findAllPermissions`)

Any authenticated user (valid JWT, any/no permission) can currently list all
roles and all permissions in the system. Not cross-tenant (roles/permissions
are global, not merchant-scoped), but unintended information disclosure.

## Also found (out of ticket scope, flag only — do not fix here)
`GET /users/:userId/roles` (line 210, `getUserRoles`) also has
`@RequirePermission('role.read')` commented out. Ticket GAN-41 only covers
`/rbac/roles` and `/rbac/permissions`. Note in `tasks.md` as a follow-up, do
not touch in this ticket.

## Impact
Information disclosure — global role/permission enumeration without any
permission check. No cross-tenant data leak.

## Proposed Fix
1. Uncomment `@RequirePermission('role.read')` on `GET /rbac/roles`.
2. Uncomment `@RequirePermission('permission.read')` on `GET /rbac/permissions`.
   (Both permission codes already used elsewhere in the same controller —
   `role.read` on `GET /rbac/roles/:id`, `permission.read` on
   `GET /rbac/permissions/:id` — so no new permission code needs to be
   created/seeded, assuming these codes are already granted to relevant
   roles in seed/migration data. Backend agent must verify this.)
3. Before enabling, verify no internal UI/flow depends on calling these two
   endpoints without holding `role.read` / `permission.read` — check
   `apps/web` usages of the roles/permissions list endpoints (e.g. role
   management screens) and confirm the calling user roles already carry
   these permission codes. If any flow would break, flag it — do not
   silently ship a break.

## Open Questions
None — ticket is unambiguous on which two endpoints to fix and proposes
`role.read` / `permission.read` as the permission codes, matching existing
sibling endpoints in the same controller.

## Out of Scope
- `GET /users/:userId/roles` commented guard (flagged as follow-up, not part
  of this ticket).
- Any change to `role.assign` hotfix scope (already handled elsewhere per
  ticket source note).
