# Tasks: GAN-136 - Add search support to Shift History

## Backend Tasks
- [x] (apps/api) Add `search?: string` to `QueryShiftsDto` in `apps/api/src/shifts/dto/query-shifts.dto.ts` with class-validator `@IsOptional()`, `@IsString()` and Swagger `@ApiPropertyOptional`.
- [x] (apps/api) Update `ShiftsController.queryShifts` in `apps/api/src/shifts/shifts.controller.ts` to forward `search: query.search` to `ShiftsService.queryShifts`.
- [x] (apps/api) Update `ShiftsService.queryShifts` in `apps/api/src/shifts/shifts.service.ts` to accept `search?: string` and apply Prisma relation filter `shift_owner: { name: { contains: filters.search } }` to the `where` clause.
- [x] (apps/api) Ensure `ShiftsService.queryShifts` returns `meta` via `PaginationDto.calculateMeta(total, limit, page)` alongside `total`, `limit`, and `offset`.
- [x] (apps/api) Update `ShiftsService.findAll` in `apps/api/src/shifts/shifts.service.ts` to support optional search filtering for consistency.
- [x] (apps/api) Add unit tests for `queryShifts` search relation filtering in `apps/api/src/shifts/shifts.service.spec.ts`.

## Frontend Tasks
- [x] (apps/web) Update `fetchShift` in `apps/web/src/modules/shift/pages/HistoryShift.vue` to pass `search: form.value.search ? form.value.search.trim() : undefined` in `payload` to `getListShift`.
- [x] (apps/web) Replace `search()` stub in `apps/web/src/modules/shift/pages/HistoryShift.vue` with debounced search execution that resets `pagination.value.page = 1` and calls `fetchShift()`.
- [x] (apps/web) Verify search UI interactions in `HistoryShift.vue` (input typing, debouncing, empty state, pagination reset, card details).
- [x] (apps/web) Run frontend build (`pnpm --filter umkm-pos-app build`) and verify no TypeScript or template errors.
