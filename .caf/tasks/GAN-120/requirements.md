# Requirements: GAN-120 - Convert Outlets list to card view

## Status: PLAN

## Overview
Convert `apps/web/src/modules/outlet/pages/index.vue` from a `DataTable` layout to a responsive card grid layout following the existing pattern used in `apps/web/src/modules/transaction/pages/index.vue`.

## Problem Statement
`apps/web/src/modules/outlet/pages/index.vue` uses `<DataTable>`, forcing horizontal scroll on mobile and tablet screens, and is inconsistent with other module list views.

## User Persona
Outlet owners, managers, and administrators managing outlets on desktop, tablet, and mobile devices.

## Functional Requirements
1. **Remove DataTable**: Remove `<DataTable>` and `<Column>` components from `apps/web/src/modules/outlet/pages/index.vue`.
2. **Responsive Card Grid**:
   - Render outlets in a responsive grid (`grid gap-4 lg:grid-cols-2 xl:grid-cols-3` or similar responsive layout).
   - Use `UiCard` for each outlet item.
   - Mobile viewport (375px) should not have horizontal scroll.
3. **Card Content**:
   - Outlet Logo / Placeholder icon (fallback if logo missing).
   - Outlet Name and `#` index/number.
   - Status badge (Active/Inactive) using PrimeVue `Tag`.
   - Merchant Name.
   - Location / Address.
   - Created At date formatted with `formatDateTime`.
4. **Card Actions**:
   - Detail button (Eye icon) -> opens detail page.
   - Edit button (Pencil icon) -> gated by `isCanUpdate` -> opens edit page.
   - Delete button (Trash icon) -> gated by `isCanDelete` -> triggers delete confirmation dialog.
5. **Loading & Empty State**:
   - Loading indicator using `UiLoading` (or consistent loading pattern).
   - Empty state when `outlets.length === 0` (showing icon and text "Outlets are empty.").
6. **Search & Pagination**:
   - Maintain search input with `UiSearch`.
   - Maintain pagination with `UiPagination` component.
   - Top action bar with search and "Add Outlet" button (gated by `isCanCreate`).

## Non-Functional Requirements
- Maintain existing RBAC permission checks (`CREATE`, `UPDATE`, `DELETE`).
- Maintain existing routing, API calls (`getListOutlet`, `deleteOutlet`), and toast/confirm dialog behaviors.
- No changes to backend APIs or routes.
