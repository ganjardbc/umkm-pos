# Tasks: GAN-122 — Convert Merchants List to Card View (Superadmin)

## Frontend Tasks

- [x] (apps/web) Refactor `apps/web/src/modules/merchants/pages/index.vue` to remove `<DataTable>` and replace with responsive `<UiCard>` grid layout.
- [x] (apps/web) Implement loading state (`UiLoading`) and empty state (`UiEmptyState` or empty container) in `index.vue`.
- [x] (apps/web) Implement card layout with merchant logo, name, created date, and RBAC-gated action buttons (`pi-eye`, `pi-pencil`, `pi-trash`).
- [x] (apps/web) Preserve existing search input, "Add Merchant" button, pagination controls (`UiPagination`), and delete confirmation flow.
