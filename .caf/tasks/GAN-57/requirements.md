## Status: PLAN

## Ticket
GAN-57: [SECURITY] Endpoint List User Tanpa RBAC Guard

## Source
Auditor Agent scan 2026-07-18, file: `.ai/audits/2026-07-18/audit-report.md`

## Location
`apps/api/src/users/users.controller.ts:51` — `findAll` handler on `GET /users`.

## Problem
`GET /users` has no `@RequirePermission()` decorator. All other endpoints in
`UsersController` (`create`, `findOne`, `update`, `remove`, `setAvatar`,
`removeAvatar`) require permission via `@RequirePermission(...)`. Controller
has `@UseGuards(PermissionGuard)` class-level but `PermissionGuard` only
enforces permission when `@RequirePermission` metadata is present — without
it, any authenticated user (any permission set) can list all users for a
merchant.

## Impact
Any authenticated user, regardless of role/permission, can access full user
list (name, email, roles, etc — minus password_hash) of the merchant. Breaks
RBAC boundary — unauthorized access to merchant user data.

## Proposed Fix
Add `@RequirePermission('user.read')` above `findAll()` in
`apps/api/src/users/users.controller.ts`, consistent with `findOne()` which
already uses `user.read`.

## Acceptance Criteria
- `GET /users` requires `user.read` permission (401/403 without it).
- Existing callers with `user.read` permission unaffected.
- No regression on other `UsersController` endpoints.
- Lint/test/build pass for `apps/api`.

## Open Questions
None.
