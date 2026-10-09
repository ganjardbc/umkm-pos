# Requirements: GAN-138 - [admin] Kolom pencarian permission tidak berfungsi

## Status: PLAN

## Overview
On the platform-admin permissions management page (`apps/admin/src/modules/permission/pages/index.vue`), the search input (`UiSearch`) has a stub `search` function that only calls `console.log(form.value)`. Furthermore, `fetchPermission` does not forward the search query, and the backend controller `GET /api/v1/admin/permissions` (`apps/api/src/admin/rbac/admin-permissions.controller.ts`) and service `RbacService.findAllPermissions` (`apps/api/src/rbac/rbac.service.ts`) only accept basic `PaginationDto` without support for keyword filtering.

This feature implements end-to-end search capability for permission list management:
1. **Backend (`apps/api`)**: Create `PermissionsQueryDto` extending `PaginationDto` with an optional `search` parameter. Update `AdminPermissionsController.findAll` and `RbacService.findAllPermissions` to filter permissions by `code` or `description` using Prisma `contains`.
2. **Frontend (`apps/admin`)**: Connect the search input in `apps/admin/src/modules/permission/pages/index.vue` to `fetchPermission` with a 400ms debounce (using `useDebounce`), pass `search` in the payload, and reset `pagination.page` to 1 upon search.

---

## Target User & Use Case
Platform administrators navigating `/permission` in `apps/admin` needing to locate specific permission codes (e.g. `product.create`, `outlet.delete`) or descriptions without manually paginating through all pages.

---

## Technical Specifications

### 1. Backend (`apps/api`)

#### A. DTO Creation (`apps/api/src/rbac/dto/permissions-query.dto.ts`) [NEW]
- Create `PermissionsQueryDto` class extending `PaginationDto`.
- Add `search?: string` decorated with:
  - `@IsOptional()`
  - `@IsString()`
  - `@ApiPropertyOptional({ description: 'Search permissions by code or description', example: 'product' })`

#### B. Controller Update (`apps/api/src/admin/rbac/admin-permissions.controller.ts`)
- Replace `PaginationDto` with `PermissionsQueryDto` in `findAll(@Query() query: PermissionsQueryDto)`.
- Forward `query` to `this.rbacService.findAllPermissions(query)`.

#### C. Service Update (`apps/api/src/rbac/rbac.service.ts`)
- Update `findAllPermissions(query: PermissionsQueryDto = new PermissionsQueryDto())`.
- Extract `page`, `limit`, `search`, and `skip`.
- When `search` is provided and non-empty, apply `where`:
  ```typescript
  const where = search
    ? {
        OR: [
          { code: { contains: search } },
          { description: { contains: search } },
        ],
      }
    : undefined;
  ```
- Pass `where` to both `this.prisma.permissions.findMany({ where, ... })` and `this.prisma.permissions.count({ where })`.

#### D. Unit Tests (`apps/api/src/rbac/rbac.service.spec.ts`)
- Add unit test suite for `findAllPermissions`:
  - Returns paginated permissions when no search term is provided.
  - Passes `OR` filter on `code` and `description` to `findMany` and `count` when `search` is provided.
  - Handles custom pagination parameters (`page`, `limit`).

---

### 2. Frontend (`apps/admin`)

#### A. Permission Page Update (`apps/admin/src/modules/permission/pages/index.vue`)
- Import `useDebounce` from `@umkm-pos/ui/helpers/utils`.
- In `fetchPermission`: include `search: form.value.search.trim() || undefined` (or `form.value.search || undefined`) in the `payload` sent to `getListPermission(payload)`.
- Replace the `search()` stub function (`console.log(form.value)`) with a debounced handler:
  ```typescript
  const search = useDebounce(() => {
    pagination.value.page = 1;
    fetchPermission();
  }, 400);
  ```

---

## Acceptance Criteria

### Backend Verification
- [ ] `GET /api/v1/admin/permissions?search=product` returns only permissions whose `code` or `description` contains "product", with accurate `meta.total` and `meta.totalPages`.
- [ ] `GET /api/v1/admin/permissions` without `search` returns all permissions ordered by `created_at: 'desc'`.
- [ ] Unit tests pass: `pnpm --filter umkm-pos-api test src/rbac/rbac.service.spec.ts`.
- [ ] Backend build passes: `pnpm --filter umkm-pos-api build`.
- [ ] Backend lint passes: `pnpm --filter umkm-pos-api lint:ci`.

### Frontend Verification
- [ ] Typing in `UiSearch` on `/permission` triggers debounced API requests to `GET /api/v1/admin/permissions?page=1&limit=10&search=...`.
- [ ] Changing search term resets `pagination.page` to 1.
- [ ] Console log stub in `search()` is removed.
- [ ] Admin frontend build passes: `pnpm --filter @umkm-pos/admin build`.

---

## Out of Scope
- Modifying role permissions assignment logic or other RBAC endpoints.
- Global changes to `PaginationDto` base class.
