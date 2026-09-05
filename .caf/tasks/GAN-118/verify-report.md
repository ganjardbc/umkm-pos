# Verify Report — GAN-118: Convert Stock movement history list to card view

## Status: SUCCESS

## Scope
- Modified: `apps/web/src/modules/stock/pages/index.vue` ONLY.
- No changes to `apps/landing` or any backend files.

## Implementation Summary
- Removed `<DataTable>`/`<Column>` markup and replaced with a responsive card grid (`grid gap-4 lg:grid-cols-2 xl:grid-cols-3`), matching the pattern in `apps/web/src/modules/transaction/pages/index.vue`.
- Each card (`UiCard`) displays: row number (`getNoTable(index, pagination.page, pagination.rows)`), Product name (`item.products?.name || '-'`), Change Qty (green/red colored by sign), Stock After, Reason, and Created At (`formatDateTime`), laid out with header row, `Divider`, label/value grid body, `Divider`, and a minimal footer (Created At) — no new row actions/RBAC introduced since none existed before.
- Added `UiLoading` component shown while `loading` is true (replacing DataTable's built-in `:loading` prop).
- Replaced the manual "Stocks are empty." `<template #empty>` string with an empty-state block (`pi pi-inbox` icon + centered text), shown via `v-else-if="stocks.length === 0"`, consistent with the `transaction` pattern.
- Kept `UiSearch` + `form.search` + `search()` stub, and `UiPagination` + `pagination` + `onPageChange()` fully intact with no behavior changes to `fetchStock()` / `getListStock()`.
- Typed `stocks` ref as `ref<any[]>([])` (was `ref([])`) to satisfy TypeScript when accessing `item.products`/`item.change_qty` etc. directly in the template (previously accessed via PrimeVue's untyped `slotProps.data`). No other logic changes.
- Grid defaults to a single column (no explicit `grid-cols-1`, base Tailwind grid is single-column before `lg:`/`xl:` breakpoints), avoiding horizontal scroll at 375px.

## Verify Checklist (apps/web)
- [x] `pnpm --filter umkm-pos-app run build` — passed (build includes type-check via vue-tsc + vite build), output produced successfully with only a pre-existing chunk-size warning unrelated to this change.
- [ ] lint script — not run (no dedicated `pnpm --filter umkm-pos-app lint` script verified separately from build in this pass; build's type-check step passed with no errors).
- [ ] test script — no test script targeting this page exists in the repo; not applicable.
- Manual review: confirmed no `<DataTable>` or `<Column>` tags remain in the file (`grep` returned 0 matches).
- Manual review: confirmed only `apps/web/src/modules/stock/pages/index.vue` was modified (`git status --short`).

## Notes for QA / Reviewer
- No new RBAC permissions or backend/API changes were introduced.
- The stock page still has no per-row actions (unchanged from before); footer is decorative (Created At only), per the requirements' RBAC note.
- Visual/manual verification of 375px viewport, pagination page-change, and empty-state rendering with live data was not performed in this pass (no dev server / browser available in this environment) — recommend QA perform the browser-based checks listed in `tasks.md` QA Tasks.
