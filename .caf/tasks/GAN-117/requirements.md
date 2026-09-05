# Requirements: GAN-117 - Convert Categories list to card view

## Status: PLAN

## Overview
Convert `apps/web/src/modules/product-categories/pages/index.vue` from `<DataTable>` to a responsive card grid layout, matching the pattern used in `apps/web/src/modules/transaction/pages/index.vue`.

## Target User
Outlet owners, managers, and admins managing Product Categories on desktop, tablet, and mobile devices.

## Requirements & Scope
1. **Remove `<DataTable>` & `<Column>` components** from `apps/web/src/modules/product-categories/pages/index.vue`.
2. **Implement Card Grid View**:
   - Responsive grid layout (`grid gap-4 sm:grid-cols-2 lg:grid-cols-3` or similar matching POS design patterns).
   - Render each category inside `<UiCard>`.
   - Card content displays:
     - Category name (bold/prominent)
     - Row sequence number (`#{{ getNoTable(index, pagination.page, pagination.rows) }}`)
     - Status tag (`Tag` with active: `'Active'` / `'Inactive'`, severity: `'success'` / `'danger'`)
     - Description (with text truncate/clamp or clear layout handling empty/long descriptions)
     - Created at timestamp formatted via `formatDateTime(category.created_at)`
   - Card footer / action section contains icon action buttons:
     - View Detail: `pi pi-eye`, calls `onDetailCategory(category)` (if read permission applies / standard navigation)
     - Edit: `pi pi-pencil`, `:disabled="!isCanUpdate"`, calls `onEditCategory(category)`
     - Delete: `pi pi-trash`, `:disabled="!isCanDelete"`, calls `onDeleteCategory(category)`
3. **Loading & Empty States**:
   - Replace table-level loading/empty state with standalone UI components:
     - Loading state: `<UiLoading>` when `loading` is true.
     - Empty state: Icon (`pi pi-inbox`) + "Categories are empty." message when `!loading && categories.length === 0`.
4. **Preserve Existing Features**:
   - Debounced search functionality (`UiSearch`).
   - Add Category button (`Button` with `icon="pi pi-plus"`, `:disabled="!isCanCreate"`, calls `addCategory`).
   - Pagination with `<UiPagination>` preserving page index and page changes (`onPageChange`).
   - RBAC permission gating (`isCanCreate`, `isCanUpdate`, `isCanDelete`).
   - Confirmation dialog for delete (`showConfirm`, `deleteCategories`).
5. **Responsiveness**:
   - Ensure clean rendering at 375px viewport with no horizontal scrolling.

## Non-Functional / Constraints
- No changes to backend API, database schemas, or RBAC permission codes.
- No changes to category create/edit/detail pages.
- Follow existing codebase conventions in `apps/web`.
