## Review Notes — GAN-118
Ticket: GAN-118
Agent: caf-reviewer
Verdict: APPROVE

### Security Audit
None. No new API calls, no new RBAC permission usage, no new backend/route/contract changes. `getListStock()` call and its `outlet_id` param (sourced from `getOutlet()`, not client-editable input) are unchanged from before. No data previously hidden is now exposed in the card — same six fields (row number, product name, change qty, stock after, reason, created at) that were already rendered in the table are rendered in the card, with the same `|| '-'` null-coalescing.

### Qualitative Review
- Scope respected: `git status --short` / `git diff` confirm only `apps/web/src/modules/stock/pages/index.vue` was modified. No other files touched.
- `<DataTable>`/`<Column>` fully removed — verified by reading the full current file and by `grep` (0 matches). No stray imports of `DataTable`/`Column` remain in the script block.
- Card pattern is structurally consistent with `apps/web/src/modules/transaction/pages/index.vue`: same `UiLoading` → empty-state (`pi pi-inbox` + centered text) → `grid gap-4 lg:grid-cols-2 xl:grid-cols-3` → `UiPagination` skeleton; each `UiCard` follows the same header/`Divider`/body-grid/`Divider`/footer internal structure, same `text-slate-*` / `dark:text-slate-*` styling conventions, same use of `getNoTable()` for the row-number badge and `formatDateTime()` for the timestamp. The `Divider` component is used unimported in both files (relies on the project's global-component auto-registration convention noted in `apps/web/CLAUDE.md`), so this is not a regression specific to this diff.
- Footer is intentionally minimal (Created At only, no actions) — consistent with the requirements' explicit note that stock has no per-row actions and none should be invented.
- `stocks` was retyped from `ref([])` to `ref<any[]>([])`, a narrowly-scoped type change needed because the template now accesses `item.products`/`item.change_qty` directly (previously via PrimeVue's untyped `slotProps.data`). This is consistent with how `transaction` and other already-converted modules type their list refs.
- `UiPagination` moved from inside `UiCard` (old table pattern) to being a sibling of the grid, matching `transaction`'s already-accepted layout — a correct and deliberate deviation from the old stock page's structure, not scope creep.
- Search (`UiSearch` + `form.search` + `search()` stub) and pagination (`UiPagination` + `pagination` + `onPageChange()`) wiring are byte-for-byte unchanged aside from the DOM location shift described above.
- Ran `pnpm --filter umkm-pos-app run lint` — no lint script exists for this package (confirmed, not a gap introduced by this change).

### Verdict Rationale
All four Reviewer Tasks from `tasks.md` are satisfied: (1) scope is limited to the single file, (2) no `<DataTable>`/`<Column>` remain, (3) no backend/API/RBAC changes, (4) the card pattern is a faithful structural match to the `transaction` reference. Verify report (SUCCESS, build/type-check passed) and QA report (PASS, no CRITICAL findings) both corroborate this. The one open item — no live-browser check of the 375px viewport, pagination click-through, and empty-state with real data — is a NON-CRITICAL, low-risk gap already disclosed by both prior agents, given the implementation is a structural clone of an already-shipped, presumably-validated pattern. This does not block approval.

### For Developer
No changes requested. Optional/non-blocking suggestion for a future pass: if a live environment becomes available, do a quick manual smoke test of the 375px viewport and pagination click-through, per the QA report's NON-CRITICAL note — not required before merge.
