# Work Plan: GAN-133 - Add server-side search support for Users list

## Backend Tasks
- [x] (apps/api) Create `UsersQueryDto` in `apps/api/src/users/dto/users-query.dto.ts` extending `PaginationDto` with optional `search?: string` and Swagger annotations.
- [x] (apps/api) Update `apps/api/src/users/users.controller.ts` `findAll` endpoint to accept `UsersQueryDto` in `@Query()`.
- [x] (apps/api) Update `apps/api/src/users/users.service.ts` `findAll` method to filter with `OR` on `name`, `email`, and `username` contains `search` when provided, scoped by `merchant_id`.

## Frontend Tasks
- [x] (apps/web) Update `apps/web/src/modules/user/pages/index.vue` to wire `UiSearch` with `useDebounce` (400ms delay), reset pagination page to 1, and pass `search: form.search || undefined` in `fetchUser` payload.

## Verification
- [x] Run backend typecheck and lint (`pnpm --filter umkm-pos-api typecheck` / `pnpm --filter umkm-pos-api lint`).
- [x] Run frontend typecheck and lint (`pnpm --filter umkm-pos-app typecheck` / `pnpm --filter umkm-pos-app lint`).
- [x] Verify unit tests / build (`pnpm build`).
