# Requirements: GAN-133 - Add server-side search support for Users list

## Status: PLAN

## Problem
Currently, `apps/api/src/users/users.service.ts`'s `findAll` method uses the generic `PaginationDto`, which does not accept a `search` parameter. As a result, the users list backend cannot filter by search queries.
During discovery, it was unknown whether the frontend Users module had search UI present.

## Discovery Confirmation
- **UI Confirmation**: The Users page frontend (`apps/web/src/modules/user/pages/index.vue`) **already contains** a `UiSearch` component bound to `form.search` with `@input="search"`.
- However, the frontend search handler was a stub (`console.log(form.value)`) and `fetchUser()` did not include `search` in its API query payload.
- **Database Fields**: The `users` table contains `name`, `email`, and `username` columns (no `phone` column exists on the `users` schema). Therefore, `search` will filter across `name`, `email`, and `username` fields via case-insensitive contains / Prisma `contains` within the `merchant_id` tenant boundary.

## Scope of Work

### Backend (`apps/api`)
1. **Create `UsersQueryDto`**:
   - Location: `apps/api/src/users/dto/users-query.dto.ts`
   - Inherit from `PaginationDto`.
   - Add optional `@IsOptional() @IsString() search?: string` with Swagger documentation (`@ApiPropertyOptional`).
   - Export from `apps/api/src/users/dto/index.ts` or directly import.

2. **Update `UsersController`**:
   - Location: `apps/api/src/users/users.controller.ts`
   - Change `findAll(@CurrentUser('merchant_id') merchantId: string, @Query() pagination: PaginationDto)` to use `UsersQueryDto`.

3. **Update `UsersService`**:
   - Location: `apps/api/src/users/users.service.ts`
   - Update `findAll(merchantId: string, query: UsersQueryDto)` to apply Prisma `where` clause:
     - Always scope by `merchant_id: merchantId`.
     - When `query.search` is present and non-empty, apply `OR` conditions for `name`, `email`, and `username` containing `query.search`.

### Frontend (`apps/web`)
1. **Wire Search Debounce and Query in Users View**:
   - Location: `apps/web/src/modules/user/pages/index.vue`
   - Import `useDebounce` from `@/helpers/utils.ts`.
   - Update `search` handler to debounce (400ms), reset `pagination.value.page = 1`, and trigger `fetchUser()`.
   - Include `search: form.value.search || undefined` in `fetchUser()` payload sent to `getListUser()`.

## Acceptance Criteria
- [ ] `GET /api/v1/users?search=keyword` filters users belonging to the merchant where `name`, `email`, or `username` contains `keyword`.
- [ ] `GET /api/v1/users` without `search` continues to paginate all users for the merchant.
- [ ] All queries remain strictly scoped to the authenticated user's `merchant_id`.
- [ ] User typing into search input in web UI triggers debounced API call with `search` query and updates the displayed user list.
