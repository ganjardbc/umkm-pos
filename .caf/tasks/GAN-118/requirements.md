# Requirements — GAN-118: Convert Stock movement history list to card view

## Status: PLAN

## Source
- Ticket: GAN-118
- Discovery reference: `.caf/discovery/table-list-to-card-all-modules/prd.md` + `flow.md` (not read directly — ticket description is self-contained and sufficient to plan; discovery files were not present under the ticket's own folder, so no open-questions gate applies here)

## Problem
`apps/web/src/modules/stock/pages/index.vue` renders the Stock movement history using PrimeVue `<DataTable>`, which forces horizontal scroll on tablet/mobile viewports and is inconsistent with modules that have already been converted to card view (e.g. `transaction`).

## Target User
Outlet owners/managers/admins reviewing stock movement history on desktop and tablet/mobile.

## Scope
- File: `apps/web/src/modules/stock/pages/index.vue` ONLY.
- Convert the `<DataTable>` rendering of stock logs into a responsive card grid, following the pattern already implemented in `apps/web/src/modules/transaction/pages/index.vue`.
- Preserve: search input behavior (`UiSearch` + `form.search`, currently a no-op `search()` stub — keep as-is, do not implement new filter logic), pagination via `UiPagination` + `onPageChange`, empty-state messaging equivalent to current "Stocks are empty." message (styled per the `transaction`/`notification` empty-state pattern: icon + centered text), and RBAC-gated row actions if/when applicable.
- Out of scope: any other module's list page, `create.vue`/`edit.vue`/`detail.vue` forms, backend API/pagination contract/RBAC permission code changes, and deciding on a new shared `UiListCard` component (implementer's call — may reuse `UiCard` directly as `transaction` does, no shared list-card abstraction required).

## Current State (read directly from source)
- `apps/web/src/modules/stock/pages/index.vue` (127 lines) uses `<UiCard><DataTable>...</DataTable><UiPagination /></UiCard>` with columns: NO, Product (`products.name`), Change Qty (green/red colored by sign), Stock After, Reason, Created At (`formatDateTime`).
- No row actions exist in the current file (it is a read-only movement log — no edit/delete/detail buttons, no RBAC checks currently wired in). `apps/web/src/modules/stock/services/rbac.ts` defines `READ` (`stock.read`) and `ADJUST` (`stock.adjust`), but `ADJUST` is not referenced from this page today.
- Data comes from `getListStock()` in `apps/web/src/modules/stock/services/api.ts`, called in `fetchStock()`, returning `{ data, meta }`.
- Reference pattern: `apps/web/src/modules/transaction/pages/index.vue` uses `UiLoading` while loading, a manual empty-state block (`pi pi-inbox` icon + text) when the list is empty, and a `grid gap-4 lg:grid-cols-2 xl:grid-cols-3` grid of `UiCard` items otherwise, each card with a header (title + tags), a `Divider`, a body grid of label/value rows, another `Divider`, and a footer row for totals/actions.

## RBAC note
Since the current stock history page has no row actions, there is nothing to RBAC-gate for the card footer. The implementer should NOT invent new actions (e.g. delete/edit of a stock log) — that is out of scope and would touch API/RBAC contracts, which is explicitly excluded. If the card design calls for a footer, it may be omitted or left empty/decorative (e.g. just showing "Created At"), consistent with the "no actions currently" state. If a genuine per-row action already exists elsewhere in a related file not yet read, the implementer must recheck before assuming none.

## Success Metric
- No `<DataTable>` (or `<Column>`) remaining in `apps/web/src/modules/stock/pages/index.vue`.
- Search input, pagination, and (if introduced) RBAC-gated actions remain functional.
- No horizontal scroll at 375px viewport width.
- Empty-state messaging present and styled consistent with `transaction`/`notification` pattern.

## Dependency
- `UiCard`, `UiPagination`, `UiSearch`, `UiLoading` shared components (already imported in `transaction`'s page — reuse the same import paths: `@/components/UiCard.vue`, `@/components/UiPagination.vue`, `@/components/UiSearch.vue`, `@/components/UiLoading.vue`).
- `transaction` module (`apps/web/src/modules/transaction/pages/index.vue`) as the design/pattern reference.

## Open Questions
None — no unanswered discovery Open Questions apply to this ticket (ticket description is fully specified and no `.caf/discovery/GAN-118/prd.md` draft exists to pull open questions from).
