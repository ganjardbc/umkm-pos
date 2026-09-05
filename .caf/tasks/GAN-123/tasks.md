# Tasks: GAN-123 - Convert Shift history list to card view

## Frontend Tasks
- [x] Refactor `apps/web/src/modules/shift/pages/HistoryShift.vue` to replace `<DataTable>` with responsive card grid layout (`UiCard`).
- [x] Add loading state (`UiLoading`) and empty state view matching `transaction/pages/index.vue`.
- [x] Render shift details in each card (Owner name, row index #, status tag, outlet name, date, time range, duration).
- [x] Integrate RBAC permission check `isHasPermission(READ)` for shift detail action button.
- [x] Retain search bar (`UiSearch`) and pagination (`UiPagination`) functionality.
- [x] Verify template styling, responsiveness, dark mode classes, and type safety with `pnpm --filter umkm-pos-app build`.
