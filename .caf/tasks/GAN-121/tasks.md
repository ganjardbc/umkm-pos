# Tasks: GAN-121 - Convert Permissions list to card view

## Frontend Tasks

- [x] (apps/web) Refactor `apps/web/src/modules/permission/pages/index.vue` to replace `<DataTable>` with responsive `<UiCard>` grid
  - Implement loading state using `<UiLoading>` or equivalent pattern
  - Implement empty state (`pi-inbox`, "Permissions are empty.")
  - Implement card grid (`grid gap-4 lg:grid-cols-2 xl:grid-cols-3` or responsive grid)
  - Display code, description, created_at, and row index on each card
  - Include delete action icon button in card footer gated with `:disabled="!isCanDelete"`
  - Keep `<UiSearch>`, Add Permission button (`:disabled="!isCanCreate"`), and `<UiPagination>` intact
- [x] (apps/web) Verify build and typecheck with `pnpm --filter umkm-pos-app build`
