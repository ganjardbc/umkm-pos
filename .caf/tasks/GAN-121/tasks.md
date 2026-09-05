# Tasks: GAN-121 - Convert Permissions list to card view

## Frontend Tasks

- [x] (apps/web) Refactor `apps/web/src/modules/permission/pages/index.vue` to replace PrimeVue `<DataTable>` with responsive `UiCard` card grid.
  - Implement card grid layout (`grid gap-4 lg:grid-cols-2 xl:grid-cols-3` or responsive single/multi-column).
  - Include code, index/sequence `#`, description, and formatted creation date in each card.
  - Position Delete button in card action area with `isCanDelete` guard and existing confirmation dialog logic.
  - Add `UiLoading` component or clean loading state when fetching data.
  - Add empty state using `UiEmptyState` or module pattern when `permissions.length === 0`.
  - Maintain `UiPagination`, search input, and "Add Permission" functionality.
- [x] (apps/web) Verify responsive layout and ensure build passes (`pnpm --filter umkm-pos-app build`).
