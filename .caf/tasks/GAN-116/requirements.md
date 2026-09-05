# Requirements: GAN-116 — Convert Products list to card view

## Status: PLAN

## Problem
`apps/web/src/modules/product-lists/pages/index.vue` (Products tab of Product module) currently renders products in a PrimeVue `<DataTable>`. This forces horizontal scrolling on tablet and mobile viewports (< 768px / 375px), creating an inconsistent user experience compared to already card-based list views in the app (e.g. `transaction`, `notification`).

## User Persona
- Outlet owners, managers, and cashiers/administrators viewing and managing the product catalog on mobile, tablet, and desktop devices.

## Scope
- Modify `apps/web/src/modules/product-lists/pages/index.vue` to replace `<DataTable>` with a responsive card grid layout.
- Layout responsive grid: 1 column on mobile (`grid-cols-1`), 2 columns on large screens (`lg:grid-cols-2`), and 3 columns on extra-large screens (`xl:grid-cols-3`).
- Use `UiCard` and `Divider` components, matching the visual and structural pattern established in `apps/web/src/modules/transaction/pages/index.vue`.
- Display essential product information per card:
  - Header: Product thumbnail/image (or fallback icon), product name, category name, status tag (`Active`/`Inactive`), and `#` index number (using `getNoTable`).
  - Body: Price (formatted via `getCurrency`), Cost (formatted via `getCurrency`), Min Stock, Qty (with low stock warning styling via `isLowStock`), Created At (formatted via `formatDateTime`).
  - Footer / Actions: Row action buttons (Adjust Stock `pi-cog`, View Detail `pi-eye`, Edit `pi-pencil`, Delete `pi-trash`) gated with the same RBAC permissions (`isCanAdjust`, `isCanUpdate`, `isCanDelete`).
- Preserve all existing functionality:
  - Search input with debounce (`UiSearch`).
  - Category filter dropdown.
  - Add product button with RBAC check (`isCanCreate`).
  - Pagination (`UiPagination`).
  - Loading state (`UiLoading` or skeleton).
  - Empty state messaging ("Products are empty.").
  - Modals (AdjustStockModal, delete confirmation dialog).

## Out-of-Scope
- Any other module list pages.
- Product create, edit, detail pages or components (`create.vue`, `edit.vue`, `detail.vue`, `AdjustStockModal.vue`).
- Backend API endpoints, DTOs, pagination contracts, or RBAC permission definitions.

## Acceptance Criteria
1. No `<DataTable>` or `<Column>` components remain in `apps/web/src/modules/product-lists/pages/index.vue`.
2. Products list renders as a responsive card grid (`grid gap-4 lg:grid-cols-2 xl:grid-cols-3` or similar 1-col mobile / 2-col lg / 3-col xl layout) using `UiCard`.
3. Cards cleanly display thumbnail image (or placeholder), product name, category, price, cost, min stock, stock qty (highlighted if low stock), created at, and active status tag.
4. Action buttons (adjust stock, view detail, edit, delete) are positioned in the card footer with their corresponding RBAC disabled states and handlers intact.
5. Search filtering, category filter, pagination, stock adjustment modal, and delete actions continue to function identically.
6. Empty state is displayed when product list is empty.
7. Loading state is displayed while products are being fetched.
8. No horizontal scrolling occurs on 375px mobile viewport.
9. TypeScript check (`pnpm --filter umkm-pos-app build` / `vue-tsc`) passes without errors.

## Open Questions
None.
