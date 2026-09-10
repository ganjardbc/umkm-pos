# Verification Report: GAN-132

## Status: SUCCESS

## Checklist Verification
- [x] `pnpm --filter umkm-pos-api run lint`
- [x] `pnpm --filter umkm-pos-api run test`
- [x] `pnpm --filter umkm-pos-api run build`

## Summary of Changes
1. **`apps/api/src/outlets/dto/outlets-query.dto.ts`**:
   - Created `OutletsQueryDto` extending `PaginationDto` with optional `search?: string` property and Swagger / validation decorators.
2. **`apps/api/src/outlets/outlets.controller.ts`**:
   - Updated `findAll` method to accept `@Query() query: OutletsQueryDto`.
3. **`apps/api/src/outlets/outlets.service.ts`**:
   - Updated `findAll` method to apply search filtering over `name` and `location` using Prisma `OR` clause within merchant tenant scoping (`merchant_id`).
4. **Unit Tests**:
   - Added unit tests in `apps/api/src/outlets/outlets.controller.spec.ts` and `apps/api/src/outlets/outlets.service.spec.ts`.
