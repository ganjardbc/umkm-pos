# Tasks: GAN-119 - Convert Roles list to card view

## Frontend Tasks

- [x] (apps/web) Refactor `apps/web/src/modules/role/pages/index.vue` to use responsive card grid layout:
  - Replace `<DataTable>` with a grid container (`grid gap-4 md:grid-cols-2 xl:grid-cols-3` or similar) using `UiCard`.
  - Add `UiLoading` component for the loading state (`loading`).
  - Add empty state handling (`UiEmptyState` or empty container with icon and text) when `!loading && roles.length === 0`.
  - Implement role card layout displaying:
    - Role title/name and `#` sequence number (`getNoTable(index, pagination.page, pagination.rows)`) in header.
    - Description, Total Permissions (`role.role_permissions?.length || 0`), and Created At (`formatDateTime(role.created_at)`).
    - Footer / Action buttons row with Detail (`onDetailRole`), Edit (`onEditRole`, `:disabled="!isCanUpdate"`), and Delete (`onDeleteRole`, `:disabled="!isCanDelete"`).
  - Ensure debounced search triggers `fetchRole` when typing in `UiSearch`.
  - Maintain `UiPagination` component at the bottom with page change handler.
  - Verify styling and responsiveness at 375px mobile viewport width.
