## Status: PLAN

## Ticket
GAN-40: [RBAC] Fix cross-tenant read in getUserRoles (missing permission guard + scope check)

## Source
Auditor Agent scan 2026-07-10 — `apps/api/src/rbac/rbac.service.ts` (`getUserRoles`),
endpoint `GET /rbac/users/:userId/roles`

---

## Problem Statement

Two compounding vulnerabilities exist on `GET /rbac/users/:userId/roles`:

1. **Missing permission guard** — `@RequirePermission('role.read')` is commented out in
   `rbac.controller.ts` on the `getUserRoles` handler. Any authenticated user (any role)
   can call this endpoint with no permission check.

2. **Missing tenant scope check** — `RbacService.getUserRoles(userId)` queries
   `user_roles` filtering only on `user_id`, without verifying the target user belongs to
   the same merchant as the caller. This allows cross-tenant information disclosure
   (reading role assignments of users in other merchants).

Both issues mirror the pattern fixed in `assignRoleToUser` / `revokeRoleFromUser` in a
recent RBAC hotfix: the write path now carries both a `@RequirePermission` guard and a
`merchant_id` scope check in the service. The read path (`getUserRoles`) was missed.

---

## Success Criteria

- `GET /rbac/users/:userId/roles` requires `role.read` permission; callers without it
  receive `403 Forbidden`.
- The service rejects requests where `userId` belongs to a different merchant than the
  caller; response is `404 Not Found` (not `403` — do not leak existence of cross-tenant
  users).
- Existing tests for `assignRoleToUser` / `revokeRoleFromUser` continue to pass.
- New unit tests cover the two new guard conditions for `getUserRoles`.

---

## Scope

Backend only. No frontend changes required. No migrations required.

Files in scope:
- `apps/api/src/rbac/rbac.controller.ts` — uncomment `@RequirePermission('role.read')`
- `apps/api/src/rbac/rbac.service.ts` — add `merchantId` param + tenant scope query
- `apps/api/src/rbac/rbac.service.spec.ts` — add unit tests for `getUserRoles`

---

## Technical Design

### Controller (`rbac.controller.ts`)

Uncomment the `@RequirePermission('role.read')` decorator on `getUserRoles`. Pass the
caller's `merchant_id` from JWT to the service via `@CurrentUser('merchant_id')`:

```typescript
@Get('users/:userId/roles')
@RequirePermission('role.read')
@ApiOperation({ summary: 'List all roles assigned to a user (with permissions)' })
@ApiResponse({ status: 200, description: 'Return user role assignments' })
@ApiResponse({ status: 404, description: 'User not found or not in your merchant' })
getUserRoles(
  @Param('userId') userId: string,
  @CurrentUser('merchant_id') merchantId: string,
) {
  return this.rbacService.getUserRoles(userId, merchantId);
}
```

### Service (`rbac.service.ts`)

Add `merchantId: string` parameter. Before returning results, verify the target user
exists and belongs to the caller's merchant (same pattern as `assignRoleToUser`):

```typescript
async getUserRoles(userId: string, merchantId: string) {
  // Scope check: target user must belong to caller's merchant
  const user = await this.prisma.users.findFirst({
    where: { id: userId, merchant_id: merchantId },
  });
  if (!user) {
    throw new NotFoundException(
      'User not found or does not belong to your merchant',
    );
  }

  return this.prisma.user_roles.findMany({
    where: { user_id: userId },
    include: {
      users: { select: { id: true, name: true, email: true, is_active: true } },
      roles: {
        include: {
          role_permissions: { include: { permissions: true } },
        },
      },
      outlets: { select: { id: true, name: true, slug: true } },
    },
  });
}
```

### Tests (`rbac.service.spec.ts`)

Add a `describe('getUserRoles')` block with:
- `throws NotFoundException when user not found or belongs to another merchant`
- `returns user roles when user belongs to caller's merchant`

---

## Non-Goals

- No changes to `GET /rbac/roles` or `GET /rbac/permissions` list endpoints (those are
  separately commented-out; that's out of scope for this ticket).
- No frontend changes.
- No database migrations.
