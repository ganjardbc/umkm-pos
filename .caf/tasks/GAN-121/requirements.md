# Requirements: GAN-121 - Convert Permissions list to card view

## Status: PLAN

## Overview
Convert `apps/web/src/modules/permission/pages/index.vue` from using PrimeVue `<DataTable>` to a responsive card grid using `UiCard`, matching the card layout pattern used across other modules (such as `transaction`).

## Problem Statement
`apps/web/src/modules/permission/pages/index.vue` currently renders data inside `<DataTable>`, which causes horizontal scrolling on tablet and mobile viewports (e.g., 375px width) and is inconsistent with the modern card-based listing UI adopted in other modules.

## Scope
- Modify `apps/web/src/modules/permission/pages/index.vue` to replace `<DataTable>` with a responsive card grid layout (`grid gap-4 lg:grid-cols-2 xl:grid-cols-3` or similar responsive grid).
- Card presentation:
  - Header: Permission code (prominent/bold) and sequence number (`#{{ getNoTable(...) }}`).
  - Body / Details: Description and Created At date (`formatDateTime(item.created_at)`).
  - Footer / Action bar: Delete action button (icon button `pi pi-trash`, gated by `isCanDelete` and `isHasPermission(DELETE)`).
- Add permission button (`isCanCreate`) in the top search/action bar preserved.
- Preserve search input and pagination (`UiPagination`).
- Include loading state (`UiLoading` or skeleton) and empty state (`UiEmptyState` or standard empty state message).
- Ensure mobile responsiveness (no horizontal scroll at 375px viewport).

## Out of Scope
- Any other module list pages.
- Create, edit, or detail views for permissions.
- Backend API or shared types changes.
- Modifying RBAC permissions logic or keys.

## User Flow
1. User navigates to the Permissions page (`/permission`).
2. Page displays search bar and "Add Permission" button at the top.
3. If data is loading, loading indicator is shown.
4. If no records exist, empty state is displayed.
5. When permissions exist, items render in a responsive card grid showing Code, Description, Created At, and row action (Delete).
6. Clicking Delete prompts confirmation dialog (`showConfirm`), then deletes permission upon confirmation.
7. Bottom pagination controls (`UiPagination`) allow navigating pages.

## Acceptance Criteria
1. `<DataTable>` and `<Column>` components are completely removed from `apps/web/src/modules/permission/pages/index.vue`.
2. Permission items are displayed as responsive cards using `UiCard`.
3. Each card displays:
   - Code
   - Sequence number `#` (via `getNoTable`)
   - Description
   - Created At (formatted via `formatDateTime`)
   - Delete action button (with confirmation modal via `showConfirm`, disabled if `!isCanDelete`).
4. Search bar and "Add Permission" button remain intact and functional.
5. `UiPagination` remains functional and correctly bound.
6. Empty state is handled cleanly when permissions list is empty.
7. Loading state is cleanly presented during API fetch.
8. No horizontal scroll on mobile viewport (tested down to 375px).
9. Frontend builds with no TypeScript or lint errors (`pnpm --filter umkm-pos-app build`).
