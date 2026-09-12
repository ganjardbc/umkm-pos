# Verification Report: GAN-131 - Fix: Role list search not filtering

Status: SUCCESS

## Overview
Implemented role list search filtering on the backend (`apps/api`) so that when the search parameter is provided by the frontend, roles are filtered by matching either `name` or `description` (case-insensitive in MySQL collation / Prisma `contains`).

## Changes Implemented
1. **`apps/api/src/rbac/dto/roles-query.dto.ts`**:
   - Created `RolesQueryDto` extending `PaginationDto`.
   - Added `@ApiPropertyOptional()` Swagger decorator.
   - Added `@IsOptional()` and `@IsString()` class-validator decorators for `search?: string`.

2. **`apps/api/src/rbac/rbac.controller.ts`**:
   - Updated `findAllRoles(@Query() query: RolesQueryDto)` to bind incoming query to `RolesQueryDto`.
   - Passed `query` to `this.rbacService.findAllRoles(query)`.

3. **`apps/api/src/rbac/rbac.service.ts`**:
   - Updated `findAllRoles(query: RolesQueryDto = new RolesQueryDto())` to handle optional `search`.
   - Constructed Prisma `where` clause:
     - `search` present: `{ OR: [{ name: { contains: search } }, { description: { contains: search } }] }`
     - `search` absent: `undefined`
   - Applied `where` clause to both `this.prisma.roles.findMany` and `this.prisma.roles.count`.

4. **`apps/api/src/rbac/rbac.service.spec.ts`**:
   - Added unit tests for `findAllRoles`:
     - Returns paginated roles when no search term is provided.
     - Passes search filter on name and description to `findMany` and `count` when search query is provided.
     - Handles custom pagination parameters correctly.

## Verification Checklist Results
- [x] `pnpm --filter umkm-pos-api run lint` (Passed with 0 errors)
- [x] `pnpm --filter umkm-pos-api run test` (All 14 test suites, 187 tests passed)
- [x] `pnpm --filter umkm-pos-api run build` (Passed, NestJS build succeeded)
- [x] `pnpm typecheck` (Passed across all packages)
- [x] `pnpm build` (Passed across entire monorepo)
