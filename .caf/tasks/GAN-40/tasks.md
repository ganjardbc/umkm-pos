## Ticket: GAN-40
## Agent Order: Backend → QA/Reviewer

---

## Backend Tasks

- [ ] **rbac.controller.ts** — Uncomment `@RequirePermission('role.read')` on the `getUserRoles` handler (line 210, currently `// @RequirePermission('role.read')`)
- [ ] **rbac.controller.ts** — Add `@CurrentUser('merchant_id') merchantId: string` parameter to `getUserRoles` handler and pass it through to the service call: `this.rbacService.getUserRoles(userId, merchantId)`
- [ ] **rbac.controller.ts** — Add `@ApiResponse({ status: 404, description: 'User not found or not in your merchant' })` to `getUserRoles` Swagger annotations
- [ ] **rbac.service.ts** — Update `getUserRoles` signature to accept `merchantId: string` as a second parameter
- [ ] **rbac.service.ts** — Add tenant scope check at the top of `getUserRoles`: query `prisma.users.findFirst({ where: { id: userId, merchant_id: merchantId } })` and throw `NotFoundException('User not found or does not belong to your merchant')` if null — identical pattern to `assignRoleToUser`
- [ ] **rbac.service.spec.ts** — Add `describe('getUserRoles')` block with two unit tests:
  - `throws NotFoundException when user does not exist or does not belong to merchant` (mock `users.findFirst` returning `null`, assert `NotFoundException`, assert `user_roles.findMany` not called)
  - `returns user roles when user belongs to caller's merchant` (mock `users.findFirst` returning a valid user, mock `user_roles.findMany` returning role list, assert result equals mocked value)
- [ ] **rbac.service.spec.ts** — Add `findMany: jest.fn()` to the `user_roles` entry in `mockPrisma` (currently only `findFirst`, `create`, `delete` are mocked; `getUserRoles` needs `findMany`)

---

## Verification

After implementation, run:
```bash
pnpm --filter umkm-pos-api test -- --testPathPattern=rbac.service.spec
```
All existing tests plus the new `getUserRoles` tests must pass with zero failures.

Also confirm no TypeScript errors:
```bash
pnpm --filter umkm-pos-api typecheck
```
