# Requirements: GAN-122 — Convert Merchants List to Card View (Superadmin)

## Status: PLAN

## Overview
Refactor `apps/web/src/modules/merchants/pages/index.vue` from using `<DataTable>` with horizontal scroll to a responsive card grid layout, aligning with other card-based modules like `transaction` and using `UiCard`, `UiPagination`, `UiLoading`/`UiEmptyState`.

## Functional Requirements
1. **Responsive Card Grid Layout**:
   - Replace PrimeVue `<DataTable>` component completely.
   - Display merchants in a responsive grid (`grid gap-4 lg:grid-cols-2 xl:grid-cols-3` or similar responsive column layout).
   - Ensure clean rendering and no horizontal scrolling on mobile/tablet screens down to 375px viewport.
2. **Merchant Card Content**:
   - Merchant Logo (with fallback placeholder icon if null/empty).
   - Merchant Name.
   - Created At date formatted with `formatDateTime`.
   - Sequential item numbering or card header display.
3. **Card Actions**:
   - Action buttons in card footer/header using outlined secondary icon buttons matching current actions:
     - View Details (`pi-eye`, links to `${PREFIX_ROUTE_NAME}-detail`)
     - Edit (`pi-pencil`, links to `${PREFIX_ROUTE_NAME}-edit`, RBAC gated with `isCanUpdate`)
     - Delete (`pi-trash`, triggers confirm dialog & delete, RBAC gated with `isCanDelete`)
4. **Empty and Loading States**:
   - Loading state: show `UiLoading` or skeleton when `loading` is true.
   - Empty state: show empty indicator (e.g. `UiEmptyState` or standard empty view like `transaction`/`notification` pattern: "Merchants are empty.") when `merchants.length === 0`.
5. **Search & Pagination**:
   - Keep `UiSearch` and "Add Merchant" header controls intact.
   - Retain `UiPagination` with page and row count controls.
6. **RBAC & Guards**:
   - Preserve permission checks `isCanCreate`, `isCanUpdate`, `isCanDelete`.

## Non-Functional / Out of Scope Requirements
- No changes to backend API, contracts, or routes.
- No changes to create, edit, or detail views of merchants module.
- No changes to other module list pages.
