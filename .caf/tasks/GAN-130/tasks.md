# Work Plan: GAN-130 - Fix Merchant List Search Not Filtering

## Backend Tasks

- [x] (apps/api) Create `MerchantsQueryDto` in `apps/api/src/merchants/dto/merchants-query.dto.ts` extending `PaginationDto` with optional `search?: string` property annotated with `@ApiPropertyOptional()`, `@IsOptional()`, and `@IsString()`.
- [x] (apps/api) Update `MerchantsController.findAll` in `apps/api/src/merchants/merchants.controller.ts` to accept `@Query() query: MerchantsQueryDto` and forward it to `MerchantsService.findAll`.
- [x] (apps/api) Update `MerchantsService.findAll` in `apps/api/src/merchants/merchants.service.ts` to accept `query: MerchantsQueryDto` and apply `...(search ? { name: { contains: search } } : {})` to the Prisma `where` clause for both `findMany` and `count` queries.
- [x] (apps/api) Add unit tests in `apps/api/src/merchants/merchants.service.spec.ts` testing `findAll` with and without `search` query parameter, verifying Prisma where clause and pagination metadata.
- [x] (apps/api) Run tests and linting (`pnpm --filter umkm-pos-api test`, `pnpm --filter umkm-pos-api lint`, `pnpm typecheck`) to verify no regressions.

