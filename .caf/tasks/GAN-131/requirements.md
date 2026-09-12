# Ticket GAN-131: Fix: Role list search not filtering (backend ignores search param)

## Status: PLAN

## Overview
The Role list page in the web frontend (`apps/web/src/modules/role/pages/index.vue`) provides a search bar (`UiSearch`) that sends a `search` query parameter to `GET /api/v1/rbac/roles?search=...`. However, the backend endpoint currently accepts the generic `PaginationDto` and `rbac.service.ts`'s `findAllRoles` method ignores query filters, returning all roles regardless of the search term.

This ticket fixes the issue by introducing a dedicated `RolesQueryDto` with an optional `search` property and wiring the filtering logic into `RbacService.findAllRoles`.

---

## Scope & Requirements

### In Scope
1. **Roles Query DTO (`apps/api/src/rbac/dto/roles-query.dto.ts`)**:
   - Create `RolesQueryDto` extending `PaginationDto`.
   - Add `@ApiPropertyOptional({ description: 'Search roles by name or description', example: 'cashier' })`.
   - Add `@IsOptional()` and `@IsString()` validation decorators on `search?: string`.

2. **RBAC Controller (`apps/api/src/rbac/rbac.controller.ts`)**:
   - Update `findAllRoles(@Query() query: RolesQueryDto)` to use `RolesQueryDto` instead of generic `PaginationDto`.
   - Forward `query` to `rbacService.findAllRoles(query)`.

3. **RBAC Service (`apps/api/src/rbac/rbac.service.ts`)**:
   - Update `findAllRoles(query: RolesQueryDto = new RolesQueryDto())`.
   - Construct Prisma `where` clause:
     - When `search` is provided (non-empty string): filter `name` and `description` using `OR: [{ name: { contains: search } }, { description: { contains: search } }]` (or `name: { contains: search }`).
     - When `search` is not provided: no filter applied (`where: undefined` or `{}`).
   - Pass `where` into both `prisma.roles.findMany({ where, ... })` and `prisma.roles.count({ where })`.

4. **Unit Testing (`apps/api/src/rbac/rbac.service.spec.ts`)**:
   - Add unit tests for `findAllRoles`:
     - Returns paginated roles when no search term is provided.
     - Passes `where` clause with search filters to `findMany` and `count` when `search` query param is provided.

5. **Frontend Compatibility**:
   - No frontend code changes needed; `apps/web/src/modules/role/pages/index.vue` already sends `search` in query parameters.

### Out of Scope
- Global modifications to `PaginationDto`.
- Full-text or fuzzy search engines.
- Frontend role list UI changes.

---

## Acceptance Criteria
- [ ] `GET /api/v1/rbac/roles` without search returns paginated roles and accurate total count as before.
- [ ] `GET /api/v1/rbac/roles?search=xyz` filters roles matching `name` or `description` containing `xyz` and returns filtered count in `meta.total`.
- [ ] Unit tests for `RbacService.findAllRoles` pass.
- [ ] TypeScript type checks and linting pass with no regressions.
