# Work Plan: GAN-132

## Order of Execution
1. Backend (`caf-backend`)
2. Frontend (`caf-frontend`)

## Backend Tasks
- [x] (apps/api) Create `OutletsQueryDto` in `apps/api/src/outlets/dto/outlets-query.dto.ts` extending `PaginationDto` with optional `search?: string` field and Swagger metadata.
- [x] (apps/api) Update `apps/api/src/outlets/outlets.controller.ts` `findAll` method to accept `OutletsQueryDto` via `@Query()`.
- [x] (apps/api) Update `apps/api/src/outlets/outlets.service.ts` `findAll` to incorporate `search` filter over `name` and `location` fields in the Prisma `where` clause while maintaining `merchant_id` scoping.

## Frontend Tasks
- [x] (apps/web) Update `fetchOutlet` in `apps/web/src/modules/outlet/pages/index.vue` to include `search` query parameter when `form.search` is present.
- [x] (apps/web) Remove `filteredOutlets` computed property and update template bindings in `apps/web/src/modules/outlet/pages/index.vue` to use `outlets` directly.
- [x] (apps/web) Implement 300ms debounced search handler in `apps/web/src/modules/outlet/pages/index.vue` that resets `pagination.page` to 1 and calls `fetchOutlet()`.
- [x] (apps/web) Clean up search debounce timer on `onUnmounted` lifecycle hook in `apps/web/src/modules/outlet/pages/index.vue`.
