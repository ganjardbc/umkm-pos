# Requirements: GAN-123 - Convert Shift history list to card view

## Status: PLAN

## Overview
Convert `apps/web/src/modules/shift/pages/HistoryShift.vue` from `<DataTable>` to a responsive card grid layout, matching the visual and structural patterns established in `apps/web/src/modules/transaction/pages/index.vue`.

## Problem Statement
`HistoryShift.vue` currently renders shift history using PrimeVue `<DataTable>`, causing horizontal scrolling on tablet and mobile viewports (<768px). Other modules (e.g., Transaction, Notification) use responsive card grids (`UiCard`).

## Target User & Scope
- **Target User:** Outlet owners, managers, and cashiers reviewing shift history across desktop, tablet, and mobile.
- **In Scope:**
  - `apps/web/src/modules/shift/pages/HistoryShift.vue` only.
  - Converting the DataTable layout to responsive card grid (`UiCard`, `grid gap-4 lg:grid-cols-2 xl:grid-cols-3` or similar responsive grid).
  - Search input preservation (`UiSearch`).
  - Loading state (`UiLoading`) and empty state (`pi-inbox`, "Shifts are empty.").
  - Pagination (`UiPagination`) preservation.
  - RBAC / permission checks (using `isHasPermission(READ)` for detail action button).
  - Preserving data fields displayed per shift: No/index, outlet name, user/shift owner name, date, time range, duration, status tag, and action button(s).
  - Ensuring no horizontal scroll at 375px mobile viewport.
- **Out of Scope:**
  - `apps/web/src/modules/shift/pages/CurrentShift.vue` (unchanged).
  - Shift detail page / modals / edit forms.
  - Backend API or pagination contract changes.
  - Any other modules.

## Detailed Requirements

1. **Card Grid Structure:**
   - Loading State: Show `<UiLoading message="Loading shifts..." />` when `loading` is true.
   - Empty State: When `!loading && shifts.length === 0`, show centered empty container with icon `pi pi-inbox` and text "Shifts are empty.".
   - Card List: Render `<div class="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">` containing `<UiCard>` for each shift.
   - Card Header/Top:
     - Shift Owner name (`shift.shift_owner?.name || '-'`) with fallback text styling.
     - Row sequence number `#{{ getNoTable(index, pagination.page, pagination.rows) }}`.
     - Status `<Tag :value="shift.status" :severity="getStatusSeverity(shift.status)" class="capitalize text-xs!" />`.
   - Card Body / Key-Value Details:
     - Outlet: `shift.outlet?.name || '-'`
     - Date: `formatDate(shift.start_time)`
     - Time: `formatRangeTime(shift.start_time, shift.end_time)`
     - Duration: `getDuration(shift.start_time, shift.end_time)`
     - Grid layout with muted labels (`text-slate-400` / dark-mode support) and right-aligned values.
   - Card Footer / Actions:
     - View detail button: `<Button icon="pi pi-eye" severity="secondary" variant="outlined" size="small" :disabled="!isCanDetail || shift.status === 'open'" @click="onDetailShift(shift)" />`.
     - Detail permission gated via `isHasPermission(READ)`.

2. **Pagination & Controls:**
   - Search bar (`UiSearch`) preserved at top.
   - Pagination component `<UiPagination v-model="pagination" class="px-0!" @page="onPageChange" />` positioned below cards.

3. **Cleanup:**
   - Remove `<DataTable>` and `<Column>` imports/tags.
   - Ensure imports include `UiLoading`, `UiCard`, `UiSearch`, `UiPagination`, `isHasPermission`, `READ` from `@/modules/shift/services/rbac.ts`.

4. **Non-Functional & Responsive Constraints:**
   - Zero horizontal overflow at viewport width 375px.
   - TypeScript compilation check (`vue-tsc -b`) succeeds without errors.
