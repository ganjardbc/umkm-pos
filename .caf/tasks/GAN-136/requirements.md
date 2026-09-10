# Requirements: GAN-136 - Add search support to Shift History

## Status: PLAN

## Overview
Currently, the Shift History page (`/shift`) contains a search input (`UiSearch`) hooked up to a stub method `search()` that only logs to the console (`console.log`). Furthermore, the backend endpoint `GET /api/v1/shifts` and `ShiftsService.queryShifts()` / `ShiftsService.findAll()` do not accept a `search` parameter or perform relation filtering on the shift owner name.

This ticket implements end-to-end search capability for Shift History:
1. Backend: Accept `search` in `QueryShiftsDto`, and apply a Prisma relation filter (`shift_owner: { name: { contains: search } }`) to filter shifts by cashier/owner name.
2. Frontend: Connect `HistoryShift.vue`'s search input to `fetchShift()` via `getListShift({ search, ... })`, reset pagination to page 1 upon search, and debounce user keystrokes.

## User Story
As a Cashier or Outlet Admin reviewing shift history (`/shift`),
I want to search shift history by cashier / shift owner name,
So that I can quickly locate specific shifts for reconciliation, auditing, or handover review.

---

## Technical Specifications

### 1. Backend (`apps/api`)

#### A. DTO Update (`apps/api/src/shifts/dto/query-shifts.dto.ts`)
- Add optional `search?: string` property to `QueryShiftsDto` (extends `PaginationDto`).
- Decorate with `@IsOptional()`, `@IsString()`, and `@ApiPropertyOptional({ description: 'Search shifts by shift owner name', example: 'Budi' })`.

#### B. Controller Update (`apps/api/src/shifts/shifts.controller.ts`)
- In `@Get() queryShifts(...)`, pass `search: query.search` from `QueryShiftsDto` into `filters` object for `this.shiftsService.queryShifts(merchantId, filters)`.

#### C. Service Update (`apps/api/src/shifts/shifts.service.ts`)
- In `queryShifts(merchantId, filters)`:
  - Extend the `filters` argument type to include `search?: string`.
  - When `filters.search` is present and non-empty, add a Prisma relation filter to `where`:
    ```typescript
    if (filters.search) {
      where.shift_owner = {
        name: {
          contains: filters.search,
        },
      };
    }
    ```
  - Ensure `meta` metadata is included in the returned object (using `PaginationDto.calculateMeta(total, page, limit)`) alongside `data`, `total`, `limit`, and `offset` for consistent frontend contract.
- In `findAll(merchantId, outletId?, pagination?, search?)`:
  - Optionally support `search` in `findAll` as well for backward compatibility.

#### D. Service Unit Tests (`apps/api/src/shifts/shifts.service.spec.ts`)
- Add unit tests verifying `queryShifts` applies the relation filter correctly when `search` is provided.

---

### 2. Frontend (`apps/web`)

#### A. Shift History Page (`apps/web/src/modules/shift/pages/HistoryShift.vue`)
- In `fetchShift()`:
  - Include `search: form.value.search ? form.value.search.trim() : undefined` in the `payload` sent to `getListShift(payload)`.
- In `search()`:
  - Debounce search input (e.g. 300ms debounce using a timeout or watcher) to avoid excessive API requests.
  - Reset `pagination.value.page = 1` before fetching.
  - Call `fetchShift()`.
- Ensure loading state (`UiLoading`), empty state ("Riwayat shift masih kosong."), and pagination (`UiPagination`) seamlessly react to search results.
- Verify status severity tags, date/time formatting, and detail navigation continue to function normally.

---

## Acceptance Criteria

1. **Search by Shift Owner Name**:
   - Entering text in the search input on `/shift` filters the shift list by shift owner name.
   - Matching is case-insensitive (standard Prisma MySQL behavior).
   - Clearing the search input restores the unfiltered list for the selected outlet.

2. **Pagination Reset**:
   - Searching from page > 1 resets the current page back to 1.
   - Total pages and record counts update according to the filtered results.

3. **No Filter Regressions**:
   - Scoping by `merchant_id` (JWT) and `outlet_id` remains strictly enforced.
   - Date range and status filtering (if applied) combine correctly with the search filter.

4. **Code Quality**:
   - Backend TypeScript build and unit tests pass (`pnpm --filter umkm-pos-api test`, `pnpm --filter umkm-pos-api build`).
   - Frontend TypeScript checks and build pass (`pnpm --filter umkm-pos-app build`).
