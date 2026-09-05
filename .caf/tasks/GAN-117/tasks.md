# Tasks: GAN-117 - Convert Categories list to card view

## Frontend Tasks

- [x] (apps/web) Refactor `apps/web/src/modules/product-categories/pages/index.vue`:
  - [x] Remove `<DataTable>` and `<Column>` markup and imports.
  - [x] Add `<UiLoading>` when `loading` is true.
  - [x] Add empty state view (`pi pi-inbox` + "Categories are empty.") when `categories.length === 0` and not loading.
  - [x] Add responsive grid container (`grid gap-4 sm:grid-cols-2 lg:grid-cols-3` or `xl:grid-cols-3`) with `<UiCard>` for category cards.
  - [x] Build card content: Header with Category name, sequence number (#no), Status Tag (`Active`/`Inactive`), Description, and Created At date.
  - [x] Build card action buttons: Detail (`pi pi-eye`), Edit (`pi pi-pencil` gated with `isCanUpdate`), Delete (`pi pi-trash` gated with `isCanDelete`).
  - [x] Ensure `<UiPagination>` is placed cleanly below the grid container.
- [x] (apps/web) Verify component build and typecheck with `pnpm --filter umkm-pos-app build` / `pnpm --filter umkm-pos-app typecheck`.
