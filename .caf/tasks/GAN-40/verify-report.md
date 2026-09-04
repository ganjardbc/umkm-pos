## Status: SUCCESS

## Agent: Backend

## Ticket: GAN-40 — [RBAC] Fix cross-tenant read in getUserRoles (missing permission guard + scope check)

## Changes Made

### `apps/api/src/rbac/rbac.controller.ts`
- Uncommented `@RequirePermission('role.read')` on `getUserRoles` handler
- Added `@CurrentUser('merchant_id') merchantId: string` parameter
- Added `@ApiResponse({ status: 404, description: 'User not found or not in your merchant' })` Swagger annotation
- Updated service call to `this.rbacService.getUserRoles(userId, merchantId)`

### `apps/api/src/rbac/rbac.service.ts`
- Updated `getUserRoles` signature to accept `merchantId: string` as second parameter
- Added tenant scope check: queries `prisma.users.findFirst({ where: { id: userId, merchant_id: merchantId } })` and throws `NotFoundException('User not found or does not belong to your merchant')` if null

### `apps/api/src/rbac/rbac.service.spec.ts`
- Added `findMany: jest.fn()` to `user_roles` mock entry
- Added `describe('getUserRoles')` block with two unit tests:
  1. `throws NotFoundException when user does not exist or does not belong to merchant`
  2. `returns user roles when user belongs to caller's merchant`

## Verification Results

### Lint (`pnpm --filter umkm-pos-api run lint`)
- Status: PASS — No lint/prettier errors in rbac files

### Tests (`jest --testPathPatterns=rbac.service.spec`)
- Status: PASS — 9 tests passed (7 existing + 2 new `getUserRoles` tests), 0 failures

### Build (`pnpm --filter umkm-pos-api run build`)
- Pre-existing failures due to Prisma client not being generated in this environment (missing `node_modules/.prisma/client`)
- Confirmed pre-existing by running on original git state before changes — same errors present
- No new TypeScript errors introduced by this change

## Checklist

- [x] `@RequirePermission('role.read')` uncommented on `getUserRoles`
- [x] `merchantId` parameter added to controller and passed to service
- [x] `@ApiResponse` 404 annotation added
- [x] `getUserRoles` service method accepts and uses `merchantId`
- [x] Tenant scope check added (identical pattern to `assignRoleToUser`)
- [x] `findMany` mock added to `user_roles` in test setup
- [x] Two new unit tests for `getUserRoles` added and passing
- [x] All existing tests continue to pass
- [x] Lint clean
