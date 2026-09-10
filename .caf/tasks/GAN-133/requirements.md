# Requirements: GAN-133

## Status: PLAN

## Ticket ID
GAN-133

## Title
Add server-side search support for Users list (confirm UI first, then implement)

## Summary
Add server-side search filtering support to the merchant-scoped users list API (`GET /api/v1/users`) and connect the existing `UiSearch` component in the users list frontend view (`apps/web/src/modules/user/pages/index.vue`) to perform debounced searches.

## Findings & UI Confirmation
1. **Frontend UI Search Verification**:
   - `apps/web/src/modules/user/pages/index.vue` **already includes** a `<UiSearch>` input component bound to `form.search`.
   - Currently, `@input="search"` only executes `console.log(form.value)` and `fetchUser()` does not include the search term in query parameters.
   - Conclusion: UI search component already exists. Per ticket specification, backend search implementation and frontend wiring must proceed.

2. **Search Fields & Schema Analysis**:
   - In Prisma schema (`model users`), searchable text fields are `name`, `email`, and `username`.
   - The `phone` field does not exist on the `users` table.
   - The server-side search filter will cover `name`, `email`, and `username` using case-insensitive contains match (`mode: 'insensitive'` or standard Prisma contains within merchant scope).

## Backend Requirements (`apps/api`)
1. **Create Query DTO (`UsersQueryDto`)**:
   - Location: `apps/api/src/users/dto/users-query.dto.ts`
   - Extends `PaginationDto`.
   - Field `search?: string` (optional string with `@ApiPropertyOptional`, `@IsOptional`, `@IsString`).
2. **Update `UsersController` (`apps/api/src/users/users.controller.ts`)**:
   - Update `findAll` parameter decorator from `@Query() pagination: PaginationDto` to `@Query() query: UsersQueryDto`.
   - Pass `query` to `usersService.findAll(merchantId, query)`.
3. **Update `UsersService` (`apps/api/src/users/users.service.ts`)**:
   - Update `findAll(merchantId: string, query: UsersQueryDto)` signature.
   - Build Prisma `where` clause:
     - Scoped strictly to `merchant_id: merchantId`.
     - When `query.search` is present and non-empty: add `OR: [{ name: { contains: search } }, { email: { contains: search } }, { username: { contains: search } }]`.
   - Calculate pagination and count using the search-filtered `where` clause.

## Frontend Requirements (`apps/web`)
1. **Update `apps/web/src/modules/user/pages/index.vue`**:
   - Implement debounced search handler (300ms) that resets `pagination.page = 1` and calls `fetchUser()`.
   - In `fetchUser()`, include `search: form.value.search` (or trim value) in the query payload sent to `getListUser(payload)`.
   - Handle empty state and loading states appropriately.

## Acceptance Criteria
- [ ] `GET /api/v1/users?search=alice` returns only users belonging to the caller's merchant whose `name`, `email`, or `username` match "alice".
- [ ] Calling `GET /api/v1/users` without `search` continues to return paginated users as before.
- [ ] Users belonging to other merchants are never returned regardless of search query.
- [ ] Typing in the search input on the frontend users page triggers a debounced request to `GET /api/v1/users?search=...` and displays filtered results.
- [ ] Clearing the search input reloads all users for the current merchant.
- [ ] Pagination correctly reflects total count and pages of the search-filtered results.

## Out of Scope
- Full-text or fuzzy search engines (e.g., Elasticsearch, Meilisearch).
- Adding new UI components outside existing user list view.
- Global modification to `PaginationDto`.
- Cross-tenant user search.
