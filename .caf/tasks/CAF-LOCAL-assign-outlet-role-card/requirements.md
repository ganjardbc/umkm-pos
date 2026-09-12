# Requirements — CAF-LOCAL-assign-outlet-role-card

## Status: PLAN

## Source
Local, developer-provided task (no Linear ticket, no tracker). Ticket description was given
directly in the prompt. No `.caf/discovery/{TICKET-ID}/prd.md` draft exists for this slug —
proceeded directly from the ticket description as the requirement, per the fallback rules
(discovery draft not present).

## Summary
`AssignOutletModal.vue` (`apps/web/src/modules/user/components/AssignOutletModal.vue`) is a
3-step Stepper ("Tetapkan Outlet") opened from the "Informasi Outlet" section of the user
detail page (`apps/web/src/modules/user/pages/detail.vue`). Step 2 ("Role") currently renders
roles as a PrimeVue `DataTable` with a Pilih/Batal Pilih button per row. This must be changed
to a responsive grid of `UiCard` components (one card per role), matching the existing
role-card visual pattern already used in `detail.vue` (lines ~110-136) for the assigned
outlet/role list.

## Problem
The Role step's DataTable is visually inconsistent with the rest of the app, which already
uses a `UiCard` grid pattern for outlet/role pairs elsewhere on the same page. This is a
pure visual/template consistency fix — no functional or data change is needed.

## Scope
- In scope: template-level change to Step 2 ("Role") of
  `apps/web/src/modules/user/components/AssignOutletModal.vue` only — replace the
  `DataTable`/`Column` markup for roles with a `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
  gap-4` of `UiCard` components, reusing the visual language already established in
  `apps/web/src/modules/user/pages/detail.vue` (rounded border card, role name + Tag/badge,
  description, permission count, Pilih/Batal Pilih button).
- Out of scope: Step 1 ("Outlet") — stays exactly as-is, DataTable unchanged. Step 3
  ("Pratinjau") — already card-based, unchanged. No API/store/router changes. No backend
  changes. No changes to any other component or page besides the one template edit described
  above.

## Functional Requirements
1. Step 2 must render each role from the existing `roles` ref as a `UiCard` inside a
   `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4` container (same Tailwind classes as
   the reference pattern in `detail.vue`), instead of a `DataTable` row.
2. Each role card must show: role name, a `Tag` (or badge) for the role, the role's
   description, and the permission count (`role.role_permissions?.length`).
3. Each role card must show a Pilih/Batal Pilih `Button`, identical in behavior to the current
   one:
   - `severity`/`variant`/`label`/`icon` bound the same way based on `isRoleSelected(role)`
     (i.e. `soft`/`default`/"Batal Pilih"/`pi pi-check` when selected vs
     `outlined`/`secondary`/"Pilih"/`pi pi-plus` when not).
   - `@click="onSelectRole(role)"` unchanged.
4. The `admin` role must NOT show the Pilih/Batal Pilih button — same guard as the current
   `v-if="slotProps.data.name !== 'admin'"` (adapted to the card's role variable).
5. Selection remains single-select: selecting a role deselects any previously selected role
   (existing `onSelectRole`/`isRoleSelected`/`roleSelected` logic is unchanged, only the
   template markup around it changes).
6. Pagination must continue to work exactly as before: `UiPagination` bound to
   `rolePagination`, 5 rows/page, driven by the same `getListRole` API call via `fetchRole()` /
   `onRolePageChange()`. The pagination component's position (below the grid, inside the same
   `UiCard` wrapper that today wraps the DataTable) is preserved.
7. Empty state ("Belum ada role.") must still be shown when `roles` is empty (equivalent of
   the current `DataTable` `#empty` template), and the loading state (`loadingRoles`) must
   still be visually represented (e.g. a spinner, consistent with the loading pattern already
   used in `detail.vue`'s `loadingUserRoles` block) since the DataTable's built-in `:loading`
   affordance goes away once the DataTable is removed.
8. No change to: `activeStep`, `disabledSave`, `onSave`, `onCancel`, `onSelectOutlet`,
   `isOutletSelected`, `fetchOutlet`, `onOutletPageChange`, Step 1 DataTable, Step 3 preview
   markup, `RoleData`/`OutletData` interfaces, imports of `getListOutlet`/`getListRole`, or any
   emits (`submit`/`cancel`).
9. No new API calls, no new Pinia store, no new route — purely a template/markup change to
   Step 2 inside the one existing `.vue` file.

## Non-Functional / Constraints
- Frontend-only (`apps/web`). No backend (`apps/api`) changes.
- Must remain responsive per the existing pattern's breakpoints
  (`grid-cols-1` / `md:grid-cols-2` / `lg:grid-cols-3`).
- Must not regress TypeScript types (`RoleData` interface) or existing lint/typecheck rules
  for `apps/web`.
- This is a single-app task: `apps/web` is the only relevant app in scope for the
  Frontend agent on this ticket, so task lines in `tasks.md` do NOT need app-path tags.

## Open Questions
None outstanding. The ticket description confirms the requested change was already discussed
and agreed with the user (single-select behavior, admin guard, pagination, and visual
language to reuse are all explicitly specified in the ticket).

## Acceptance Criteria
- [ ] Step 1 (Outlet) DataTable is byte-for-byte unchanged.
- [ ] Step 2 (Role) renders roles as a responsive `UiCard` grid
      (`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`), one card per role.
- [ ] Each role card shows: name, Tag/badge, description, permission count, and (except for
      `admin`) a Pilih/Batal Pilih button with the same selected/unselected styling as before.
- [ ] Clicking a role card's button toggles single-select the same way the DataTable row
      button did (`onSelectRole` / `isRoleSelected` reused, unchanged).
- [ ] `admin` role never shows a selectable button in the new card grid.
- [ ] `UiPagination` + `rolePagination` (5 rows/page) still drives `getListRole` and still
      updates the rendered role cards on page change.
- [ ] Empty and loading states for the Role step are still represented visually.
- [ ] Step 3 (Pratinjau) is unchanged and still reflects the selected outlet/role correctly.
- [ ] `pnpm --filter umkm-pos-app typecheck` and `pnpm --filter umkm-pos-app lint` pass.
