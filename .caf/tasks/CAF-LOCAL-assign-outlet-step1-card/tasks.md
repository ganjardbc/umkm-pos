# Tasks — CAF-LOCAL-assign-outlet-step1-card

## Order of Agents
1. Frontend (implementation — single app, `apps/web`, no other agents needed since there are
   no backend/API/store/router changes)
2. QA (manual/visual verification of the modal's Step 1 behavior)
3. Reviewer
4. PR creation (per orchestrator's standard flow)

Note: this ticket is scoped to a single app (`apps/web`), so per this project's Planner
convention, task lines below do NOT carry app-path tags.

## Frontend Tasks
- [ ] Open `apps/web/src/modules/user/components/AssignOutletModal.vue` and locate the
      Step 1 ("Outlet") `StepPanel :value="1"` block (currently a `DataTable` of outlets with
      columns NO/Nama/Lokasi/Merchant/action).
- [ ] Replace the `DataTable`/`Column` markup inside Step 1 with the same structure already
      shipped for Step 2 ("Role") in this file: a wrapping `div` with `v-if="loadingOutlets"`
      spinner, `v-else-if="!outlets.length"` empty message, and `v-else` a
      `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4` container that `v-for`s over
      `outlets`, rendering one `UiCard` per outlet with the same card classes as the Step 2
      role card (`rounded-xl border border-gray-200 dark:border-dark! dark:bg-dark! p-3 flex
      flex-col gap-2`).
- [ ] In each outlet card, show: `outlet.name`, `outlet.location`, and
      `outlet.merchants.name` — use judgment for exact layout (e.g. name as the card's header
      title, merchant name as a `Tag` or plain labelled row, location as a plain labelled row),
      keeping it visually consistent with the Step 2 card style (header row + body rows +
      button).
- [ ] Add the Pilih/Batal Pilih `Button` inside each card, with NO conditional exclusion
      (unlike Step 2's `v-if="role.name !== 'admin'"` — every outlet shows the button), with
      the same `severity`/`variant`/`label`/`icon` bindings driven by
      `isOutletSelected(outlet)` and `@click="onSelectOutlet(outlet)"` — do not change the
      underlying `onSelectOutlet`/`isOutletSelected`/`outletSelected` logic in the `<script>`
      block.
- [ ] Keep the `UiPagination` component (`v-model="outletPagination"`,
      `@page="onOutletPageChange"`) in place below the grid, inside the same wrapping `UiCard`
      that has the `Outlet` header slot, so pagination behavior against
      `getListOutlet`/`fetchOutlet()` is unchanged.
- [ ] Ensure the empty-state message ("Belum ada outlet.") shown when `outlets.length === 0`
      matches the current DataTable's `#empty` template copy exactly.
- [ ] Ensure a loading-state indicator (spinner) is shown when `loadingOutlets` is true, since
      the DataTable's built-in `:loading` prop no longer applies once the DataTable markup is
      removed — mirror the same spinner markup already used for Step 2's `loadingRoles` state.
- [ ] If `getNoTable` (used previously for the outlet table's NO column numbering) is no
      longer referenced anywhere in the file after this change, remove its now-unused import;
      otherwise leave the import as-is.
- [ ] Do not modify Step 2 (Role) card markup, Step 3 (Pratinjau) markup, the `<script>`
      block's existing refs/functions/interfaces (other than the `getNoTable` import cleanup
      above, if applicable), or any other file.
- [ ] Run `pnpm --filter umkm-pos-app typecheck` and `pnpm --filter umkm-pos-app lint` and fix
      any issues introduced by the template change.
- [ ] Manually sanity-check (or via existing test tooling if present) that: selecting an
      outlet card toggles it, selecting a different one deselects the previous one, every
      outlet always shows a button (no exclusion), pagination still fetches and re-renders
      outlets, and Step 3 preview still shows the selected outlet correctly.

## QA Tasks
- [ ] Open the user detail page, click "Tetapkan Outlet", view Step 1 ("Outlet").
- [ ] Verify outlets render as cards in a responsive grid (1 column on mobile, 2 on `md`, 3 on
      `lg`), not as a table, and that the visual style matches Step 2's card style (rounded
      border, header row, body fields, button).
- [ ] Verify each card shows outlet name, location, and merchant name.
- [ ] Verify clicking a card's Pilih button selects it (button flips to "Batal Pilih" /
      soft/default style with check icon) and clicking it again deselects it back to "Pilih".
- [ ] Verify selecting a second outlet's card automatically deselects the first
      (single-select).
- [ ] Verify every outlet card shows a Pilih/Batal Pilih button with no exclusions.
- [ ] Verify pagination (5 per page) still works: changing page fetches new outlets via the
      API and re-renders the card grid.
- [ ] Verify empty state message ("Belum ada outlet.") appears if there are no outlets, and a
      loading indicator shows while outlets are being fetched.
- [ ] Verify Step 2 (Role) is visually unchanged (still the card grid shipped previously).
- [ ] Verify Step 3 (Pratinjau) still correctly displays the selected outlet and role, and
      that Save/submit still works end-to-end — no regression.

## Reviewer Tasks
- [ ] Confirm the diff touches only
      `apps/web/src/modules/user/components/AssignOutletModal.vue` (template section for
      Step 1, plus optional unused-import cleanup), with no changes to Step 2/3 markup,
      `<script>` logic, API/store/router files.
- [ ] Confirm selection logic (`onSelectOutlet`, `isOutletSelected`, `outletSelected`) and
      pagination (`outletPagination`, `onOutletPageChange`, `fetchOutlet`) are reused as-is and
      not duplicated or reimplemented.
- [ ] Confirm the new card grid visually matches the Step 2 reference pattern already shipped
      in this file (rounded border card, header row, body rows, action button).
- [ ] Confirm no `admin`-style exclusion or any other conditional was introduced around the
      outlet card's button — it must always render.
- [ ] Confirm typecheck/lint pass and no unrelated files were modified.
