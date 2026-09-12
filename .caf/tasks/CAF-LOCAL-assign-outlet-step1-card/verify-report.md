# Verify Report — CAF-LOCAL-assign-outlet-step1-card

## Agent
Frontend (apps/web)

## Change Summary
In `apps/web/src/modules/user/components/AssignOutletModal.vue`, replaced Step 1's
(`StepPanel :value="1"`, "Outlet") `DataTable`/`Column` markup with a responsive `UiCard`
grid, mirroring the pattern already shipped for Step 2 ("Role") in the same file:

- Wrapping `div` with `v-if="loadingOutlets"` spinner, `v-else-if="!outlets.length"` empty
  message ("Belum ada outlet." — same copy as the removed DataTable `#empty` template), and
  `v-else` `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`.
- One `UiCard` per outlet with classes
  `rounded-xl border border-gray-200 dark:border-dark! dark:bg-dark! p-3 flex flex-col gap-2`,
  showing `outlet.name` as the header title, `outlet.merchants.name` as a `Tag`, and
  `outlet.location` as a labelled row.
- Pilih/Batal Pilih `Button` in every card (no exclusion, unlike Step 2's `admin` guard),
  reusing `isOutletSelected(outlet)` / `onSelectOutlet(outlet)` unchanged, with identical
  `severity`/`variant`/`label`/`icon` bindings as before.
- `UiPagination` (`v-model="outletPagination"`, `@page="onOutletPageChange"`) left in place
  below the grid, inside the same outer `UiCard`/header slot.
- Removed the now-unused `getNoTable` import from `@/helpers/utils.ts` (verified no other
  reference to it remains in the file); `getErrorMessage` import kept as-is.

Step 2 (Role) card grid and Step 3 (Pratinjau) markup were not touched. No changes to
`<script setup>` refs/functions/interfaces (`onSelectOutlet`, `isOutletSelected`,
`outletSelected`, `fetchOutlet`, `onOutletPageChange`, `OutletData`, emits, etc.) beyond the
one import line.

## Files Changed
- `apps/web/src/modules/user/components/AssignOutletModal.vue`

## Verify Checklist (apps/web)
- No lint script exists in `apps/web/package.json` (confirmed: only `dev`, `build`, `preview`,
  `new-module`) — not run.
- No standalone typecheck script exists in `apps/web/package.json` — covered by `build`, which
  runs `vue-tsc -b` before `vite build`.
- No test script exists in `apps/web/package.json` — not run.
- `pnpm --filter umkm-pos-app run build` — PASSED (`vue-tsc -b` typecheck + `vite build`
  completed with no errors, only pre-existing chunk-size warnings unrelated to this change).

## Status: SUCCESS
