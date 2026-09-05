# Verify Report: GAN-121 - Convert Permissions list to card view

## Execution Summary
- **Target App:** `apps/web`
- **Status:** SUCCESS

## Checklist Verification
- [x] Removed PrimeVue `<DataTable>` and `<Column>` from `apps/web/src/modules/permission/pages/index.vue`.
- [x] Implemented responsive card grid layout (`grid gap-4 lg:grid-cols-2 xl:grid-cols-3`).
- [x] Displayed Permission Code prominently and `#` sequence number using `getNoTable`.
- [x] Displayed Description and formatted Created At date (`formatDateTime`).
- [x] Maintained Delete action with confirmation modal (`showConfirm`) and `isCanDelete` guard.
- [x] Added `UiLoading` component during data fetching.
- [x] Added `UiEmptyState` component when permissions array is empty.
- [x] Maintained search input, "Add Permission" button with `isCanCreate` guard, and `UiPagination`.
- [x] Verified build successfully with `pnpm --filter umkm-pos-app build` (`vue-tsc -b && vite build`).
