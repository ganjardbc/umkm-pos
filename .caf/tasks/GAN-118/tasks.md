# Tasks — GAN-118: Convert Stock movement history list to card view

## Order of Agents
1. Frontend (apps/web)
2. QA
3. Reviewer

## Frontend Tasks
- [ ] (apps/web) In `apps/web/src/modules/stock/pages/index.vue`, remove the `<DataTable>`/`<Column>` block and replace it with a responsive card grid (`grid gap-4 lg:grid-cols-2 xl:grid-cols-3`, matching `apps/web/src/modules/transaction/pages/index.vue`), rendering one `UiCard` per stock log record.
- [ ] (apps/web) Each card must display, at minimum, the same data currently shown in the table columns: row number (via existing `getNoTable(index, pagination.page, pagination.rows)`), Product name (`item.products?.name || '-'`), Change Qty (kept green/red colored by sign, `item.change_qty || '-'`), Stock After (`item.stock_after || '-'`), Reason (`item.reason || '-'`), Created At (`formatDateTime(item.created_at)`). Follow the transaction card's layout convention (header row, `Divider`, label/value grid body, `Divider`, footer) — footer may be omitted or minimal since there are no existing row actions on this page.
- [ ] (apps/web) Do NOT add new row actions, edit/delete affordances, or new RBAC permission usage beyond what already exists (`stock.read`, `stock.adjust`) — this page currently has no per-row actions; keep it that way unless a genuine existing action is found on closer inspection of the file, in which case gate it with `isHasPermission()` per the existing pattern in `transaction`'s page.
- [ ] (apps/web) Replace the current manual "Stocks are empty." `<template #empty>` string with an empty-state block matching the `transaction`/`notification` pattern: `pi pi-inbox` icon + centered text, shown when `stocks.length === 0` and not loading.
- [ ] (apps/web) Add a loading state consistent with `transaction`'s page (`UiLoading` component) shown while `loading` is true, replacing/supplementing the previous `DataTable`'s built-in `:loading` prop behavior.
- [ ] (apps/web) Keep `UiSearch` + `form.search` + `search()` stub, and `UiPagination` + `pagination` + `onPageChange()` fully intact and wired the same way as before (no behavior changes to fetch/search/pagination logic, `fetchStock()`, or `getListStock()` call).
- [ ] (apps/web) Verify no horizontal scroll appears at a 375px viewport width (card grid must collapse to a single column on narrow screens, matching `grid-cols-1` default before the `lg:`/`xl:` breakpoints).
- [ ] (apps/web) Confirm no `<DataTable>` or `<Column>` tags remain anywhere in `apps/web/src/modules/stock/pages/index.vue`, and unused imports (`DataTable`, `Column`, if globally auto-registered no explicit import removal may be needed — check the top of the file for explicit imports before assuming).

## Notes for Frontend Agent
- Read `apps/web/src/modules/transaction/pages/index.vue` in full before starting — it is the canonical pattern reference for card layout, empty state, and loading state.
- Read `apps/web/src/modules/stock/pages/index.vue` in full before starting — current implementation, all fields, and existing script logic to preserve unchanged (`fetchStock`, `onPageChange`, `search`, `pagination` ref shape).
- This ticket touches `apps/web` only — do not touch `apps/landing` or any backend files.

## QA Tasks
- [ ] Manually verify (or via Playwright if available) that the stock history page renders as a card grid at desktop, tablet, and 375px mobile widths with no horizontal scroll.
- [ ] Verify pagination still changes pages correctly and search input still triggers `search()` (even though it is currently a console.log stub — confirm no regression, not new functionality).
- [ ] Verify empty state renders when the stock log list is empty.

## Reviewer Tasks
- [ ] Confirm scope was respected: only `apps/web/src/modules/stock/pages/index.vue` was modified.
- [ ] Confirm no `<DataTable>`/`<Column>` remain in the file.
- [ ] Confirm no new backend/API/RBAC permission changes were introduced.
- [ ] Confirm the card pattern is visually/structurally consistent with `apps/web/src/modules/transaction/pages/index.vue`.
