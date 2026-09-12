# Tasks — CAF-LOCAL-assign-outlet-role-card

## Order of Agents
1. Frontend (implementation — single app, `apps/web`, no other agents needed since there are
   no backend/API/store/router changes)
2. QA (manual/visual verification of the modal's Step 2 behavior)
3. Reviewer
4. PR creation (per orchestrator's standard flow)

Note: this ticket is scoped to a single app (`apps/web`), so per this project's Planner
convention, task lines below do NOT carry app-path tags.

## Frontend Tasks
- [ ] Open `apps/web/src/modules/user/components/AssignOutletModal.vue` and locate the
      Step 2 ("Role") `StepPanel :value="2"` block (currently a `DataTable` of roles).
- [ ] Replace the `DataTable`/`Column` markup inside Step 2 with a
      `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4` container that `v-for`s over
      `roles`, rendering one `UiCard` per role — reuse the visual language from
      `apps/web/src/modules/user/pages/detail.vue` lines ~110-136 (rounded border card, role
      name + `Tag`, description, permission count row, action button).
- [ ] In each role card, show: `role.name`, a `Tag` (e.g. `:value="role.name"` or similar,
      consistent with the reference pattern), `role.description`, and
      `role.role_permissions?.length` (labelled e.g. "Hak Akses").
- [ ] Add the Pilih/Batal Pilih `Button` inside each card, gated by
      `v-if="role.name !== 'admin'"` (same guard as today, adapted from `slotProps.data` to
      the card's loop variable), with the same `severity`/`variant`/`label`/`icon` bindings
      driven by `isRoleSelected(role)` and `@click="onSelectRole(role)"` — do not change the
      underlying `onSelectRole`/`isRoleSelected`/`roleSelected` logic in the `<script>` block.
- [ ] Keep the `UiPagination` component (`v-model="rolePagination"`, `@page="onRolePageChange"`)
      in place below the grid, inside the same wrapping `UiCard` that previously wrapped the
      DataTable, so pagination behavior against `getListRole`/`fetchRole()` is unchanged.
- [ ] Add an empty-state message ("Belum ada role.") shown when `roles.length === 0`,
      equivalent to the DataTable's current `#empty` template.
- [ ] Add a loading-state indicator shown when `loadingRoles` is true (e.g. a centered
      spinner), since the DataTable's built-in `:loading` prop no longer applies once the
      DataTable markup is removed.
- [ ] Do not modify Step 1 (Outlet) DataTable, Step 3 (Pratinjau) markup, the `<script>`
      block's existing refs/functions/interfaces, or any other file.
- [ ] Run `pnpm --filter umkm-pos-app typecheck` and `pnpm --filter umkm-pos-app lint` and fix
      any issues introduced by the template change.
- [ ] Manually sanity-check (or via existing test tooling if present) that: selecting a role
      card toggles it, selecting a different one deselects the previous one, `admin` shows no
      button, pagination still fetches and re-renders roles, and Step 3 preview still shows
      the selected role correctly.

## QA Tasks
- [ ] Open the user detail page, click "Tetapkan Outlet", advance to Step 2 ("Role").
- [ ] Verify roles render as cards in a responsive grid (1 column on mobile, 2 on `md`, 3 on
      `lg`), not as a table.
- [ ] Verify each card shows name, a Tag/badge, description, and permission count.
- [ ] Verify clicking a card's Pilih button selects it (button flips to "Batal Pilih" /
      soft/default style with check icon) and clicking it again deselects it back to "Pilih".
- [ ] Verify selecting a second role's card automatically deselects the first (single-select).
- [ ] Verify the `admin` role card shows no Pilih/Batal Pilih button.
- [ ] Verify pagination (5 per page) still works: changing page fetches new roles via the API
      and re-renders the card grid.
- [ ] Verify empty state message appears if there are no roles, and a loading indicator shows
      while roles are being fetched.
- [ ] Verify Step 1 (Outlet) is visually unchanged (still a DataTable).
- [ ] Verify Step 3 (Pratinjau) still correctly displays the selected outlet and role, and
      that Save/submit still works end-to-end (role gets assigned to the user via the existing
      `assignRoleToUser` flow — no regression).

## Reviewer Tasks
- [ ] Confirm the diff touches only
      `apps/web/src/modules/user/components/AssignOutletModal.vue` (template section for
      Step 2), with no changes to Step 1/3 markup, `<script>` logic, API/store/router files.
- [ ] Confirm selection logic (`onSelectRole`, `isRoleSelected`, `roleSelected`), the `admin`
      exclusion guard, and pagination (`rolePagination`, `onRolePageChange`, `fetchRole`) are
      reused as-is and not duplicated or reimplemented.
- [ ] Confirm the new card grid visually matches the reference pattern in
      `apps/web/src/modules/user/pages/detail.vue` (rounded border card, Tag, permission
      count row, action button).
- [ ] Confirm typecheck/lint pass and no unrelated files were modified.
