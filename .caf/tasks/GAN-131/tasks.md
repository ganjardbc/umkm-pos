# Tasks: GAN-131 - Fix: Role list search not filtering

## Backend Tasks
- [x] (apps/api) Create `RolesQueryDto` in `apps/api/src/rbac/dto/roles-query.dto.ts` extending `PaginationDto` with optional `search?: string` property and Swagger/validator decorators.
- [x] (apps/api) Update `RbacController.findAllRoles` in `apps/api/src/rbac/rbac.controller.ts` to use `@Query() query: RolesQueryDto`.
- [x] (apps/api) Update `RbacService.findAllRoles` in `apps/api/src/rbac/rbac.service.ts` to accept `RolesQueryDto` and apply `where` clause with `search` filter on `name` and `description` to `findMany` and `count`.
- [x] (apps/api) Add unit tests for `findAllRoles` with and without `search` in `apps/api/src/rbac/rbac.service.spec.ts`.
- [x] (apps/api) Run tests and linting to ensure all checks pass.
