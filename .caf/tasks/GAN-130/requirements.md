# Requirements: GAN-130 - Fix Merchant List Search Not Filtering

## Status: PLAN

## Context & Problem Statement
The merchant list page in the frontend dashboard (`apps/web/src/modules/merchants/pages/index.vue`) sends a `search` query parameter when users type into the search bar. However, `MerchantsController` and `MerchantsService.findAll` in `apps/api` currently use the generic `PaginationDto`, which does not define or handle a `search` field. Consequently, the search parameter is silently ignored, and search functionality on the merchant list page is non-functional.

## Target User & Flow
- **Target User**: Internal merchant staff / administrators managing merchant master data.
- **Flow**: User types a search query in the search input on `/merchants` -> Request sent: `GET /api/v1/merchants?page=1&limit=10&search=<term>` -> API filters merchants by `name` containing the search term scoped by the user's merchant ID -> Response returns filtered list and correct pagination metadata (total, totalPages) -> UI updates table seamlessly.

## Functional Requirements
1. **Merchants Query DTO**:
   - Create `MerchantsQueryDto` extending `PaginationDto`.
   - Add optional `@IsOptional() @IsString() search?: string` property with Swagger documentation `@ApiPropertyOptional({ description: 'Search merchants by name', example: 'demo' })`.
2. **Merchants Controller**:
   - Update `MerchantsController.findAll` to use `@Query() query: MerchantsQueryDto` instead of `PaginationDto`.
   - Pass the `MerchantsQueryDto` instance to `MerchantsService.findAll`.
3. **Merchants Service**:
   - Update `MerchantsService.findAll` signature to accept `(query: MerchantsQueryDto, userMerchantId: string)`.
   - In `findAll`, construct the Prisma `where` clause including:
     - `id: userMerchantId`
     - `...(search ? { name: { contains: search } } : {})`
   - Ensure both the `findMany` query and `count` query in `$transaction` use the updated `where` clause so total pagination metadata is accurate for filtered results.
4. **Testing**:
   - Ensure `findAll` with search filtering is covered by unit tests validating filtering behavior and pagination metadata.

## Out of Scope
- Full-text or fuzzy search engines.
- Frontend modifications (the web client already sends the search param properly).
- Modifying the global base `PaginationDto`.
- Cross-merchant search for non-admin users (tenant scoping by `id: userMerchantId` must be strictly preserved).

## Acceptance Criteria
- `GET /merchants?search=xxx` returns only merchants whose `name` contains `xxx` (case-insensitive where MySQL/Prisma default applies).
- When `search` is not provided or empty, `findAll` behaves exactly as before.
- Pagination metadata (`meta.total`, `meta.totalPages`) accurately reflects the count of search-filtered records.
- TypeScript compiles cleanly without errors (`pnpm typecheck` / `pnpm --filter umkm-pos-api build`).
- Existing and new unit tests pass cleanly.
