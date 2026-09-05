# QA Report: GAN-120 - Convert Outlets list to card view

## Acceptance Criteria & Requirements Verification

| Requirement / Criterion | Status | Notes |
| :--- | :--- | :--- |
| Replace `DataTable` in `apps/web/src/modules/outlet/pages/index.vue` with responsive card grid | PASS | `DataTable` replaced with `UiCard` components in a grid (`grid gap-4 lg:grid-cols-2 xl:grid-cols-3`). |
| Add loading state and empty state | PASS | Uses `UiLoading` during fetch and empty state container with inbox icon when no outlets match/exist. |
| Display Logo, Name, # Index, Status badge, Merchant, Location, and Created At | PASS | Logo image rendered with fallback placeholder, formatted date with `formatDateTime`, status Tag (Active/Inactive), merchant name, and location. |
| Preserve Action Buttons and RBAC permissions | PASS | Detail, Edit (gated by `isCanUpdate`), and Delete (gated by `isCanDelete`) buttons properly wired. |
| Search and Pagination functionality | PASS | Search filtering computed property working with name/location/merchant and `UiPagination` hooked to page changes. |
| Build & Type-checking | PASS | `corepack pnpm --filter umkm-pos-app build` (`vue-tsc -b && vite build`) passed with exit code 0 and zero TypeScript/Vite errors. |

## Verification Results
- **Command:** `corepack pnpm --filter umkm-pos-app build`
- **Output:** Built successfully without errors.

Status: SUCCESS
