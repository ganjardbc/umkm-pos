# Requirements: GAN-119 - Convert Roles list to card view

## Status: PLAN

## Overview
Refactor `apps/web/src/modules/role/pages/index.vue` to replace the PrimeVue `<DataTable>` component with a responsive card grid layout using `UiCard`, matching the pattern established in `apps/web/src/modules/transaction/pages/index.vue`.

## Problem Statement
The current role list page (`apps/web/src/modules/role/pages/index.vue`) uses `<DataTable>`, which causes horizontal scrolling on tablet and mobile viewports (< 768px / 375px) and is inconsistent with modernized card-based modules in the application.

## User Persona & User Story
- **Persona:** Outlet owners, managers, and administrators managing custom roles and permissions.
- **User Story:** As an administrator using desktop, tablet, or mobile, I want to view the list of roles in a responsive card grid so that I can easily browse roles and manage their permissions without horizontal scrolling.

## Scope of Work
- **In Scope:**
  - Convert `apps/web/src/modules/role/pages/index.vue` from `<DataTable>` to a responsive card grid using `UiCard`.
  - Include loading state (`UiLoading` or skeleton/spinner) and empty state (`UiEmptyState` or standard empty view).
  - Display role information on each card:
    - Role Name (card header / title)
    - Sequential index / Number (`#{{ getNoTable(...) }}`)
    - Description
    - Total Permissions count (`role_permissions.length`)
    - Created At (`formatDateTime(role.created_at)`)
  - Maintain card action buttons in footer/action bar:
    - Detail button (`pi pi-eye`, routed to role detail)
    - Edit button (`pi pi-pencil`, disabled if not `isCanUpdate`, routed to role edit)
    - Delete button (`pi pi-trash`, disabled if not `isCanDelete`, triggers confirmation dialog and delete API)
  - Retain top bar:
    - Search input (`UiSearch`) with debounced search query triggering `fetchRole`
    - "Add Role" button (`Button`, disabled if not `isCanCreate`, routed to role create)
  - Retain bottom pagination (`UiPagination`) bound to pagination state and handling `@page`.
  - Ensure full responsiveness without horizontal scroll down to 375px viewport.

- **Out of Scope:**
  - Modifications to `create.vue`, `edit.vue`, or `detail.vue` in role module.
  - Changes to backend API endpoints (`/api/v1/rbac/roles`), pagination contracts, or RBAC permission codes.
  - Any changes to other module list pages.

## Success Criteria & Acceptance Criteria
- [x] No `<DataTable>` or `<Column>` components remain in `apps/web/src/modules/role/pages/index.vue`.
- [x] Roles display in a responsive card grid layout (e.g. 1 col on mobile, 2 cols on lg, 3 cols on xl).
- [x] Role cards display name, number, description, total permissions count, created date, and action buttons.
- [x] Action buttons respect RBAC permissions (`CREATE`, `UPDATE`, `DELETE`, `READ`).
- [x] Search input filters the list with debounce.
- [x] Pagination functions correctly (`UiPagination`).
- [x] Empty state renders when there are 0 roles.
- [x] Loading state renders while data is loading.
- [x] Zero horizontal scrolling at 375px mobile viewport width.
- [x] Production build passes (`pnpm --filter umkm-pos-app build` / typecheck).

## Open Questions
None.
