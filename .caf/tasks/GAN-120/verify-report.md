# Verify Report: GAN-120

## Summary
- Converted `apps/web/src/modules/outlet/pages/index.vue` from `DataTable` to responsive card grid layout.
- Added loading state with `UiLoading` and empty state container when outlets list is empty.
- Outlets are displayed in a responsive grid (`grid gap-4 lg:grid-cols-2 xl:grid-cols-3`) using `UiCard`.
- Displayed Logo (or fallback image placeholder), Name, `#` index, Status badge (`Tag`), Merchant Name, Location, and formatted Created At date.
- Card actions include Detail button, Edit button (gated by `isCanUpdate`), and Delete button (gated by `isCanDelete`).
- Verified search filter, pagination controls with `UiPagination`, and Delete confirmation dialog flow.

## Verification Checklist
- [x] apps/web build: `corepack pnpm --filter umkm-pos-app build` passed successfully.

Status: SUCCESS
