# Requirements — CAF-LOCAL-assign-outlet-step1-card

## Status: PLAN

## Source
Local, developer-provided task (no Linear ticket, no tracker). Ticket description was given
directly in the prompt, as a direct follow-up to the already-merged
`CAF-LOCAL-assign-outlet-role-card` ticket. No `.caf/discovery/{TICKET-ID}/prd.md` draft
exists for this slug — proceeded directly from the ticket description as the requirement, per
the fallback rules (discovery draft not present).

## Summary
`AssignOutletModal.vue` (`apps/web/src/modules/user/components/AssignOutletModal.vue`) is a
3-step Stepper ("Tetapkan Outlet") opened from the "Informasi Outlet" section of the user
detail page (`apps/web/src/modules/user/pages/detail.vue`). Step 2 ("Role") was already
converted from a PrimeVue `DataTable` to a responsive `UiCard` grid in the prior, already-merged
ticket `CAF-LOCAL-assign-outlet-role-card`. This ticket applies the same treatment to Step 1
("Outlet"): replace its `DataTable`/`Column` markup with a responsive `UiCard` grid, matching
the visual pattern now already shipped for Step 2, while reusing all existing selection/
pagination logic as-is.

## Problem
Step 1's `DataTable` is now visually inconsistent with Step 2, which already uses a `UiCard`
grid. This is a pure visual/template consistency fix — no functional or data change is needed.

## Reference — current Step 2 (already merged) implementation
Confirmed by reading the current `apps/web/src/modules/user/components/AssignOutletModal.vue`
(post-merge of `CAF-LOCAL-assign-outlet-role-card`), Step 2 now renders (lines ~75-124):
- A `div` wrapping a `v-if="loadingRoles"` spinner block, a `v-else-if="!roles.length"` empty
  message ("Belum ada role."), and a `v-else` `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
  gap-4` of `UiCard`s.
- Each role `UiCard` has classes
  `rounded-xl border border-gray-200 dark:border-dark! dark:bg-dark! p-3 flex flex-col gap-2`,
  a header row (`h3` name + `Tag`), a description `p`, a permission-count row, and a
  Pilih/Batal Pilih `Button` (`fluid`, gated by `role.name !== 'admin'`).
- `UiPagination` remains below the grid, inside the same outer `UiCard` wrapper that has the
  `Role` header slot.

Step 1 must follow this same shape and Tailwind classes for consistency, adapted to outlet
fields and with no role-exclusion analog.

## Scope
- In scope: template-level change to Step 1 ("Outlet") of
  `apps/web/src/modules/user/components/AssignOutletModal.vue` only — replace the
  `DataTable`/`Column` markup for outlets with a `grid grid-cols-1 md:grid-cols-2
  lg:grid-cols-3 gap-4` of `UiCard` components, reusing the visual language already shipped for
  Step 2 (rounded border card, header row, body fields, Pilih/Batal Pilih button).
- Out of scope: Step 2 ("Role") — already card-based, unchanged. Step 3 ("Pratinjau") —
  already card-based, unchanged. No API/store/router changes. No backend changes. No changes
  to any other component or page besides the one template edit described above.

## Functional Requirements
1. Step 1 must render each outlet from the existing `outlets` ref as a `UiCard` inside a
   `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4` container (same Tailwind classes as
   the Step 2 pattern already shipped), instead of a `DataTable` row.
2. Each outlet card must show: outlet name (`outlet.name`), location (`outlet.location`), and
   merchant name (`outlet.merchants.name`). No exact Tag/badge analog is mandated — use
   judgment for a clean layout consistent with the Step 2 card style (e.g. name as the card's
   header/title similar to role name, merchant name either as a `Tag` or plain labelled text,
   location as plain labelled text). Keep visual consistency with the Step 2 card (rounded
   border, header row, body rows, button) rather than introducing a new unrelated layout.
3. Each outlet card must show a Pilih/Batal Pilih `Button`, identical in behavior to the
   current DataTable row button, just rebound from `slotProps.data` to the loop variable:
   - `severity`/`variant`/`label`/`icon` bound the same way based on `isOutletSelected(outlet)`
     (i.e. `default`/`soft`/"Batal Pilih"/`pi pi-check` when selected vs
     `secondary`/`outlined`/"Pilih"/`pi pi-plus` when not) — exactly as today's bindings.
   - `@click="onSelectOutlet(outlet)"` unchanged.
4. Unlike Step 2 (which excludes the `admin` role from showing a button), Step 1 has NO
   exclusion of any kind — every outlet card always shows the Pilih/Batal Pilih button.
5. Selection remains single-select: selecting an outlet deselects any previously selected
   outlet (existing `onSelectOutlet`/`isOutletSelected`/`outletSelected` logic in
   `<script setup>` is unchanged, only the template markup around it changes).
6. Pagination must continue to work exactly as before: `UiPagination` bound to
   `outletPagination`, 5 rows/page, driven by the same `getListOutlet` API call via
   `fetchOutlet()` / `onOutletPageChange()`. The pagination component's position (below the
   grid, inside the same outer `UiCard` wrapper that today has the `Outlet` header slot) is
   preserved.
7. Empty state ("Belum ada outlet." — same copy as the current DataTable's `#empty` template)
   must still be shown when `outlets` is empty, and an explicit loading state (spinner) must be
   shown when `loadingOutlets` is true, since the DataTable's built-in `:loading`/`#empty`
   affordances go away once the DataTable is removed — mirroring exactly how this was done for
   Step 2 (`v-if="loadingOutlets"` spinner / `v-else-if="!outlets.length"` empty message /
   `v-else` grid).
8. No change to: `activeStep`, `disabledSave`, `onSave`, `onCancel`, `onSelectRole`,
   `isRoleSelected`, `fetchRole`, `onRolePageChange`, Step 2 card markup (already shipped), Step
   3 preview markup, `OutletData`/`RoleData` interfaces, imports of
   `getListOutlet`/`getListRole`, `getNoTable` helper (no longer needed once the `NO` column is
   removed — leave the import/usage elsewhere alone; only remove its usage from Step 1 if no
   longer referenced anywhere else in the file), or any emits (`submit`/`cancel`).
9. No new API calls, no new Pinia store, no new route — purely a template/markup change to
   Step 1 inside the one existing `.vue` file.

## Non-Functional / Constraints
- Frontend-only (`apps/web`). No backend (`apps/api`) changes.
- Must remain responsive per the existing pattern's breakpoints
  (`grid-cols-1` / `md:grid-cols-2` / `lg:grid-cols-3`).
- Must not regress TypeScript types (`OutletData` interface) or existing lint/typecheck rules
  for `apps/web`.
- This is a single-app task: `apps/web` is the only relevant app in scope for the Frontend
  agent on this ticket, so task lines in `tasks.md` do NOT need app-path tags.

## Open Questions
None outstanding. The ticket description confirms the requested change was already discussed
and agreed with the user (card fields to show, no admin-style exclusion, pagination, and
reuse of the Step 2 visual language are all explicitly specified in the ticket). Card-internal
layout details not pinned down exactly (e.g. whether merchant appears as a `Tag` or plain
text) are explicitly left to implementer judgment per the ticket ("use your judgment for a
clean layout... keep it visually consistent with the Step 2 card style already shipped").

## Acceptance Criteria
- [ ] Step 2 (Role) card grid and Step 3 (Pratinjau) markup are byte-for-byte unchanged.
- [ ] Step 1 (Outlet) renders outlets as a responsive `UiCard` grid
      (`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`), one card per outlet, visually
      consistent with the Step 2 card style (rounded border, header row, body fields, button).
- [ ] Each outlet card shows: name, location, and merchant name.
- [ ] Each outlet card always shows a Pilih/Batal Pilih button (no exclusion, unlike Step 2's
      `admin` guard) with the same selected/unselected styling as before.
- [ ] Clicking an outlet card's button toggles single-select the same way the DataTable row
      button did (`onSelectOutlet` / `isOutletSelected` reused, unchanged).
- [ ] `UiPagination` + `outletPagination` (5 rows/page) still drives `getListOutlet` and still
      updates the rendered outlet cards on page change.
- [ ] Empty state ("Belum ada outlet.") and loading state (spinner) for Step 1 are visually
      represented.
- [ ] Step 3 (Pratinjau) is unchanged and still reflects the selected outlet/role correctly.
- [ ] `pnpm --filter umkm-pos-app typecheck` and `pnpm --filter umkm-pos-app lint` pass.
