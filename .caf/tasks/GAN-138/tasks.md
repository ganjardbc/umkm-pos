# Tasks: GAN-138 - [admin] Kolom pencarian permission tidak berfungsi

## Execution Plan
1. **caf-backend**: Implement `PermissionsQueryDto` with search filter in `apps/api/src/rbac/dto/permissions-query.dto.ts`, update `AdminPermissionsController.findAll` and `RbacService.findAllPermissions` to filter on permission code & description, and add unit tests in `RbacService.spec.ts`.
2. **caf-frontend**: Update `apps/admin/src/modules/permission/pages/index.vue` to pass `search` query in `fetchPermission` and replace console.log stub with a 400ms debounced search handler resetting `pagination.page` to 1.

---

## Backend Tasks

- [x] (apps/api) Create `PermissionsQueryDto` extending `PaginationDto` with `@IsOptional() @IsString() search?: string` in `apps/api/src/rbac/dto/permissions-query.dto.ts`.
- [x] (apps/api) Update `AdminPermissionsController.findAll` in `apps/api/src/admin/rbac/admin-permissions.controller.ts` to use `PermissionsQueryDto` and forward it to `rbacService.findAllPermissions`.
- [x] (apps/api) Update `RbacService.findAllPermissions` in `apps/api/src/rbac/rbac.service.ts` to apply `OR: [{ code: { contains: search } }, { description: { contains: search } }]` filter to `findMany` and `count` when `search` is provided.
- [x] (apps/api) Add unit tests for `findAllPermissions` in `apps/api/src/rbac/rbac.service.spec.ts` covering pagination and search filtering.

---

## Frontend Tasks

- [x] (apps/admin) Update `fetchPermission` in `apps/admin/src/modules/permission/pages/index.vue` to include `search: form.value.search.trim() || undefined` in the API payload.
- [x] (apps/admin) Replace `search()` console.log stub in `apps/admin/src/modules/permission/pages/index.vue` with `useDebounce` handler resetting `pagination.value.page` to 1.
