# Tasks: GAN-116 — Convert Products list to card view

## Frontend Tasks

- [x] Refactor `apps/web/src/modules/product-lists/pages/index.vue` to replace `<DataTable>` and `<Column>` with a responsive card grid (`grid gap-4 lg:grid-cols-2 xl:grid-cols-3`) using `UiCard`, `Divider`, `Tag`, and `Button`.
- [x] Implement card layout in `apps/web/src/modules/product-lists/pages/index.vue`:
  - Card header: Thumbnail/fallback image, product name, category name, number index (`getNoTable`), and status tag (`Tag` Active/Inactive).
  - Card body: Price, Cost, Min Stock, Stock Qty (with `isLowStock` indicator), Created At.
  - Card footer: Action buttons for Adjust Stock, View Detail, Edit, and Delete with existing RBAC computed checks (`isCanAdjust`, `isCanUpdate`, `isCanDelete`).
- [x] Add `UiLoading` component or loading placeholder during `loading` state, and an empty state view when `products.length === 0`.
- [x] Ensure `UiPagination` is placed below the card grid and works properly with `onPageChange`.
- [x] Verify clean build via `pnpm --filter umkm-pos-app build` (runs `vue-tsc -b && vite build`).
