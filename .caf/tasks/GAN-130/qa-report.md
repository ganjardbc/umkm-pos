# QA Report: GAN-130 - Fix Merchant List Search Not Filtering

Status: SUCCESS

## Summary
The implementation for ticket **GAN-130** (Fix Merchant List Search Not Filtering) was verified and tested. All requirements and acceptance criteria have been met without regressions.

## Acceptance Criteria Verification

| Requirement | Status | Details |
|-------------|--------|---------|
| `MerchantsQueryDto` created | PASS | Located at `apps/api/src/merchants/dto/merchants-query.dto.ts`, extends `PaginationDto`, includes `@ApiPropertyOptional()`, `@IsOptional()`, `@IsString()` for `search?: string`. |
| `MerchantsController.findAll` updated | PASS | In `apps/api/src/merchants/merchants.controller.ts`, accepts `@Query() query: MerchantsQueryDto` and forwards it to `MerchantsService.findAll`. |
| `MerchantsService.findAll` search filter | PASS | In `apps/api/src/merchants/merchants.service.ts`, applies `...(search ? { name: { contains: search } } : {})` to Prisma `where` clause for both `findMany` and `count` operations inside `$transaction`. |
| Unit tests for merchant search & CRUD | PASS | In `apps/api/src/merchants/merchants.service.spec.ts`, 17 tests covering `findAll` with and without `search`, custom pagination, logo signed URLs, and CRUD operations. |
| Monorepo Build & Linting | PASS | All unit tests (201 passing across 15 suites), TypeScript typecheck, ESLint, API build, and Web build succeed cleanly. |

## Verification Details

- **Unit Tests:** `npx pnpm --filter umkm-pos-api test` (15 test suites passed, 201 tests passed)
- **Merchants Spec:** `npx pnpm --filter umkm-pos-api test -- merchants.service.spec.ts` (17 tests passed)
- **Lint:** `npx pnpm --filter umkm-pos-api lint` (0 errors)
- **Typecheck:** `npx pnpm typecheck` (PASSED)
- **Build (API):** `npx pnpm --filter umkm-pos-api build` (PASSED)
- **Build (Web):** `npx pnpm --filter umkm-pos-app build` (PASSED)

## Conclusion
Ready for review and merging.
