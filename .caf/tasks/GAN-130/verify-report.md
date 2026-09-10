# Verification Report: GAN-130

Status: SUCCESS

## Changes Summary
- Created `MerchantsQueryDto` in `apps/api/src/merchants/dto/merchants-query.dto.ts` extending `PaginationDto` with optional `@IsOptional() @IsString() search?: string`.
- Updated `MerchantsController.findAll` in `apps/api/src/merchants/merchants.controller.ts` to accept `MerchantsQueryDto` instead of `PaginationDto` and forward it to `MerchantsService.findAll`.
- Updated `MerchantsService.findAll` in `apps/api/src/merchants/merchants.service.ts` to filter by name using `...(search ? { name: { contains: search } } : {})` on Prisma `where` clause for both `findMany` and `count` operations.
- Added comprehensive unit tests in `apps/api/src/merchants/merchants.service.spec.ts` covering `findAll` (with/without search, custom pagination, signed URLs) and full CRUD operations.

## Verification Checklist Results
- [x] `pnpm --filter umkm-pos-api run lint` - PASSED (0 errors)
- [x] `pnpm --filter umkm-pos-api run test` - PASSED (15 test suites, 201 tests passing)
- [x] `pnpm --filter umkm-pos-api run build` - PASSED (clean nest build)
- [x] `pnpm typecheck` - PASSED
