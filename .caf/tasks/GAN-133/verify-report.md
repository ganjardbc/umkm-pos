# Verification Report: GAN-133

## Status: SUCCESS

## Target Scope
- `apps/api`

## Checklist Execution
- [x] `pnpm --filter umkm-pos-api run lint` — Passed (0 errors, 0 warnings)
- [x] `pnpm --filter umkm-pos-api run test` — Passed (16/16 test suites passed, 189 tests)
- [x] `pnpm --filter umkm-pos-api run build` — Passed (NestJS build succeeded)

## Changes Implemented
1. **`UsersQueryDto`**: Created `apps/api/src/users/dto/users-query.dto.ts` extending `PaginationDto` with `@IsOptional() @IsString() search?: string`.
2. **`UsersController`**: Updated `findAll` in `apps/api/src/users/users.controller.ts` to accept `@Query() query: UsersQueryDto` and forward it to `UsersService.findAll`.
3. **`UsersService`**: Updated `findAll` in `apps/api/src/users/users.service.ts` to parse `search`, build a Prisma `where` condition scoping by `merchant_id` and matching `OR: [{ name: { contains } }, { email: { contains } }, { username: { contains } }]` when `search` is provided.
4. **Unit Tests**: Added tests in `apps/api/src/users/users.controller.spec.ts` and `apps/api/src/users/users.service.spec.ts` validating search filtering, empty/whitespace search handling, and pagination calculations.
