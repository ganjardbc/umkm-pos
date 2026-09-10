# Tasks: GAN-133

## Backend Tasks
- [x] (apps/api) Create `UsersQueryDto` in `apps/api/src/users/dto/users-query.dto.ts` extending `PaginationDto` with optional `search` field
- [x] (apps/api) Update `UsersController.findAll` in `apps/api/src/users/users.controller.ts` to use `@Query() query: UsersQueryDto`
- [x] (apps/api) Update `UsersService.findAll` in `apps/api/src/users/users.service.ts` to filter by `merchant_id` and search across `name`, `email`, and `username` in Prisma query

## Frontend Tasks
- [x] (apps/web) Update `apps/web/src/modules/user/pages/index.vue` to debounce `search` input (300ms) and reset page to 1
- [x] (apps/web) Pass `search` query parameter in payload when calling `getListUser` inside `fetchUser` in `apps/web/src/modules/user/pages/index.vue`
