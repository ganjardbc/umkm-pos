# Work Plan: GAN-132 — Fix Outlet list server-side search

## Backend Tasks

- [x] (apps/api) Create `OutletsQueryDto` in `apps/api/src/outlets/dto/outlets-query.dto.ts` extending `PaginationDto` with optional `search?: string` validation.
- [x] (apps/api) Update `OutletsController.findAll` in `apps/api/src/outlets/outlets.controller.ts` to consume `OutletsQueryDto`.
- [x] (apps/api) Update `OutletsService.findAll` in `apps/api/src/outlets/outlets.service.ts` to accept `OutletsQueryDto` and apply Prisma `where` clause searching `name` and `location` with `merchant_id` scoping.

## Frontend Tasks

- [x] (apps/web) Update `fetchOutlet()` in `apps/web/src/modules/outlet/pages/index.vue` to include `search` param in payload when `form.search` is present.
- [x] (apps/web) Implement 300ms debounced `search()` function in `apps/web/src/modules/outlet/pages/index.vue` resetting `pagination.page = 1` and triggering `fetchOutlet()`, with `onUnmounted` timer cleanup.
- [x] (apps/web) Remove `filteredOutlets` computed property in `apps/web/src/modules/outlet/pages/index.vue` and update template bindings from `filteredOutlets` to `outlets`.

## Verification Tasks

- [x] (apps/api) Run typecheck / build on API workspace to ensure no compilation errors.
- [x] (apps/web) Run typecheck / build on Web workspace to ensure no compilation errors.
