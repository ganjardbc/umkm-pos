## Review Notes — CAF-LOCAL-assign-outlet-step1-card
Ticket: CAF-LOCAL-assign-outlet-step1-card
Agent: caf-reviewer
Verdict: APPROVE

### Security Audit
None. Pure frontend template change in a single component, no data-scoping, auth, or
input-handling code touched. No new API calls, no new user input surfaces.

### Qualitative Review
- Confirmed via `git diff main --stat` and full diff that the only file touched is
  `apps/web/src/modules/user/components/AssignOutletModal.vue` (33 insertions / 34 deletions,
  one hunk). No other file in the repo is modified.
- Change is confined to the Step 1 (`StepPanel :value="1"`) template block plus one import
  line (`getNoTable` removed from `@/helpers/utils.ts` import). Read the full current file
  (lines 1-445): Step 2 (`StepPanel :value="2"`, lines 74-123) and Step 3
  (`StepPanel :value="3"`, lines 126-214) are byte-identical to what the diff context shows as
  untouched — no lines inside those blocks appear in the diff.
- Selection/pagination logic reused, not reimplemented: `onSelectOutlet`, `isOutletSelected`,
  `outletSelected`, `outletPagination`, `onOutletPageChange`, `fetchOutlet` (lines 276-326 of
  the current file) are all unchanged by the diff — only the template call sites were rebound
  from `slotProps.data` to the `outlet` loop variable. Confirmed no duplicate/shadow state was
  introduced in the template (no local `ref`/computed added).
- No exclusion/guard was introduced on the outlet card's button. Contrasted directly against
  Step 2's button (`v-if="role.name !== 'admin'"`, line 105) — the outlet Button (lines 53-61)
  has no `v-if` at all, so every outlet always renders the Pilih/Batal Pilih button, per
  requirement #4.
- `v-for="outlet in outlets"` uses `:key="outlet.id"` (line 42) — correct, stable, unique key,
  matching the Step 2 pattern (`:key="role.id"`, line 92) and PrimeVue/Vue best practice (no
  index-based keys).
- Visual/structural consistency with the already-shipped Step 2 card: identical wrapper
  structure (`v-if="loading…"` spinner / `v-else-if="!….length"` empty message / `v-else` grid),
  identical grid classes (`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`), identical
  card classes (`rounded-xl border border-gray-200 dark:border-dark! dark:bg-dark! p-3 flex
  flex-col gap-2`), identical outer wrapping `div class="p-4"`, and identical `Button` sizing
  approach (`size="small" fluid`, no explicit width class — matching Step 2's button rather
  than the old DataTable button's `class="w-[120px]"`, which is the correct thing to drop
  since it was DataTable-column-width-driven and no longer applies).
- Field content matches requirements: `outlet.name` as card header title (`h3`), a `Tag` for
  `outlet.merchants.name`, and a labelled `Lokasi` row for `outlet.location` — Step 2's
  additional `description`/permission-count rows have no outlet analog, so their omission is
  correct rather than a gap.
- Empty state copy ("Belum ada outlet.") matches the removed DataTable's `#empty` template
  text exactly (confirmed via diff). Loading spinner markup (`pi pi-spin pi-spinner`) mirrors
  Step 2's `loadingRoles` spinner verbatim.
- `UiPagination` (`v-model="outletPagination"`, `@page="onOutletPageChange"`) remains in place
  below the grid, inside the same outer `UiCard` with the `Outlet` header slot — unchanged
  position and bindings.
- `getNoTable` import removal: confirmed via `grep -n "getNoTable"` on the file — zero
  remaining references anywhere in `AssignOutletModal.vue` after the change, so the import
  removal is correct and not a dead reference. `getErrorMessage` import retained (still used by
  both `fetchOutlet`/`fetchRole` catch blocks).
- No Vue/PrimeVue misuse found: `DataTable`/`Column`/`Tag`/`Button` are auto-resolved via
  `unplugin-vue-components` + `PrimeVueResolver` (confirmed in `apps/web/vite.config.ts`), so
  removing `DataTable`/`Column` usage required no explicit import cleanup for those tags, and
  introducing `Tag` in the new markup needed none either — consistent with how Step 2 already
  uses `Tag` without an explicit import.
- Independently re-ran `pnpm --filter umkm-pos-app run build` (the closest available
  equivalent to the nonexistent `typecheck`/`lint` scripts in `apps/web/package.json`, as both
  the implementation and QA reports correctly flagged) — build completed with 0 errors, only
  pre-existing unrelated chunk-size warnings.

### Verdict Rationale
The diff is scoped exactly as described in `requirements.md`/`tasks.md`: a template-only
refactor of Step 1 to mirror the already-shipped Step 2 card pattern, with no `<script>` logic
changes besides removing one now-dead import. All Reviewer Tasks in `tasks.md` are satisfied:
scope confined to the intended block, selection/pagination logic reused as-is, visual
consistency with Step 2, no exclusion introduced on the outlet button, and the build (standing
in for the nonexistent typecheck/lint scripts) passes. No security, RBAC, or multi-tenant
surface is touched, consistent with this being a pure frontend template ticket. No functional
defects or codebase-convention violations found.

### For Developer
None — no changes requested. The one pre-existing repo gap worth a follow-up ticket someday
(not blocking this one, and correctly called out by both prior reports): `apps/web/package.json`
has no `typecheck`/`lint` scripts, so acceptance criterion #9's literal commands can't run as
written anywhere in this repo; `pnpm --filter umkm-pos-app run build` is the best current
substitute.
