## Ticket: GAN-62

## Backend Tasks
- [x] BE-1: Update `assignRoleToUser` method signature and implementation in `apps/api/src/rbac/rbac.service.ts` to accept `merchantId: string` and query/verify `user_id` belongs to the merchant before assigning the role.
- [x] BE-2: Update `revokeRoleFromUser` method signature and implementation in `apps/api/src/rbac/rbac.service.ts` to accept `merchantId: string` and query/verify `user_id` belongs to the merchant before revoking the role.
- [x] BE-3: Update `assignRoleToUser` and `revokeRoleFromUser` endpoints in `apps/api/src/rbac/rbac.controller.ts` to pass `merchant_id` from the JWT token (using `@CurrentUser('merchant_id')`) to the service methods.
- [x] BE-4: Update unit tests in `apps/api/src/rbac/rbac.service.spec.ts` to mock the `users.findFirst` query and assert that both methods throw `NotFoundException` if the user is not found under the caller's merchant.

## Frontend Tasks
- (none)

## Shared Types Tasks
- (none)

## Docs Tasks
- (none)

## Skip Agents
- frontend: Fitur ini sepenuhnya merupakan perbaikan validasi otorisasi di sisi backend (API), tidak memerlukan perubahan UI atau state frontend.
- documentation: Tidak ada perubahan skema database atau kontrak API publik (parameter/URL/body DTO tidak berubah).
