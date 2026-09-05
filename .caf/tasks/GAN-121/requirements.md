# Requirements: GAN-121 - Convert Permissions list to card view

## Status: PLAN

## Overview
Convert `apps/web/src/modules/permission/pages/index.vue` from a PrimeVue `<DataTable>` layout to a responsive card grid layout, matching the pattern established in `apps/web/src/modules/transaction/pages/index.vue`.

## Problem Statement
`apps/web/src/modules/permission/pages/index.vue` uses `<DataTable>`, forcing horizontal scroll on mobile/tablet devices and creating visual inconsistency with other modules that already use responsive card grids.

## Scope
- Target file: `apps/web/src/modules/permission/pages/index.vue`
- Replace `<DataTable>` with a responsive grid of `<UiCard>` components (`grid gap-4 lg:grid-cols-2 xl:grid-cols-3` or similar responsive grid)
- Card elements:
  - Header: Permission Code (`slotProps.data.code` / `permission.code`) and row number / ID index
  - Body: Description (`permission.description`), Created At (`formatDateTime(permission.created_at)`)
  - Footer / Actions: Delete button (RBAC gated by `isCanDelete`)
- Loading state: `<UiLoading v-if="loading" />` or skeleton/spinner matching app patterns
- Empty state: icon + message (`Permissions are empty.`) matching `transaction`/`notification` pattern
- Search, pagination (`UiPagination`), RBAC (`isCanCreate`, `isCanDelete`), and action handlers must remain fully functional
- Responsive design without horizontal scroll at 375px viewport

## Out of Scope
- Backend API, services, RBAC permission codes
- Other pages in permission module (`create.vue`, `edit.vue`, etc.)
- Any other modules

## Verification Criteria
- No `<DataTable>` or `<Column>` components used in `apps/web/src/modules/permission/pages/index.vue`
- Grid renders permission cards with code, description, created date, and delete action
- Empty state displayed when no permissions exist
- Loading state displayed while fetching data
- Delete action is gated with `isCanDelete`
- Add Permission button is gated with `isCanCreate`
- Search and pagination remain operational
- `pnpm --filter umkm-pos-app build` / typecheck passes cleanly
