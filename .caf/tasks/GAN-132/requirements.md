# Requirements: GAN-132 — Fix: Outlet list search only filters current page (server-side search)

## Status: PLAN

## Overview
Currently, the Outlet list page (`apps/web/src/modules/outlet/pages/index.vue`) performs client-side filtering via a `filteredOutlets` computed property over data that has already been paginated by the API (e.g. 10 items per page). When a merchant has more outlets than fit on one page, search only narrows the current page's 10 items rather than searching across all outlets belonging to the merchant.

This ticket updates the Outlet list search to be server-side, matching the established pattern in other modules (e.g. `product-categories`).

## Problem Statement
- **Current Behavior**: `fetchOutlet()` fetches page 1 (10 outlets). `UiSearch` updates `form.search`. `filteredOutlets` filters the in-memory 10 items. Outlets on page 2+ are never searched.
- **Expected Behavior**: `UiSearch` triggers a debounced call to `GET /api/v1/outlets?search=<keyword>&page=1&limit=10`. The backend queries Prisma across all merchant outlets matching `name` or `location`, and returns the matching outlets with accurate pagination metadata (`total`, `totalPages`).

---

## User Stories & Acceptance Criteria

### User Story
As an internal merchant staff / merchant owner managing multiple outlets,
I want to search outlets by keyword across my entire outlet dataset,
So that I can quickly locate any outlet regardless of how many pages of outlets I have.

### Acceptance Criteria
1. **Server-Side Search**:
   - `GET /api/v1/outlets` accepts an optional `search` query parameter.
   - When `search` is provided, backend filters outlets by `name` OR `location` (case-insensitive contains), strictly scoped to `merchant_id`.
   - Pagination metadata (`meta.total`, `meta.totalPages`) accurately reflects the total count of matched records.
2. **Frontend Search Integration**:
   - Typing in `UiSearch` on the Outlet list page triggers a debounced (300ms) server fetch.
   - Search keyword change automatically resets `pagination.page` to 1.
   - `fetchOutlet()` passes `search` in the query payload when `form.search` has text.
   - `filteredOutlets` computed property is removed; template binds directly to `outlets`.
3. **No Regressions**:
   - Loading indicator (`UiLoading`) displays while fetching.
   - Empty state displays correctly when no outlets match search or no outlets exist.
   - Pagination controls reflect total matched records.
   - Clearing search resets the filter and fetches the complete first page.

---

## Technical Specifications

### 1. Backend (`apps/api`)
- **Query DTO**:
  - Create `apps/api/src/outlets/dto/outlets-query.dto.ts` extending `PaginationDto`.
  - Add property:
    ```typescript
    @ApiPropertyOptional({
      description: 'Search outlets by name or location',
      example: 'cabang',
    })
    @IsOptional()
    @IsString()
    search?: string;
    ```
- **Controller (`apps/api/src/outlets/outlets.controller.ts`)**:
  - Update `findAll`:
    ```typescript
    @Get()
    @RequirePermission('outlet.read')
    @ApiOperation({ summary: 'List all outlets for the current merchant' })
    @ApiResponse({ status: 200, description: 'Return all outlets (paginated)' })
    findAll(
      @CurrentUser('merchant_id') merchantId: string,
      @Query() query: OutletsQueryDto,
    ) {
      return this.outletsService.findAll(merchantId, query);
    }
    ```
- **Service (`apps/api/src/outlets/outlets.service.ts`)**:
  - Update `findAll(merchantId: string, query: OutletsQueryDto)`:
    - Build `where` clause:
      ```typescript
      const { page = 1, limit = 10, search } = query;
      const skip = query.skip;
      const where: any = {
        merchant_id: merchantId,
        ...(search && {
          OR: [
            { name: { contains: search } },
            { location: { contains: search } },
          ],
        }),
      };
      ```
    - Execute Prisma transaction with `findMany` and `count` using the updated `where`.

### 2. Frontend (`apps/web`)
- **Page Component (`apps/web/src/modules/outlet/pages/index.vue`)**:
  - Update `fetchOutlet`:
    ```typescript
    const payload = {
      page: pagination.value.page,
      limit: pagination.value.rows,
      ...(form.value.search && { search: form.value.search }),
    };
    const response = await getListOutlet(payload);
    ```
  - Implement debounced search handler:
    ```typescript
    let searchDebounceTimer: ReturnType<typeof setTimeout>;
    const search = () => {
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => {
        pagination.value.page = 1;
        fetchOutlet();
      }, 300);
    };

    onUnmounted(() => {
      clearTimeout(searchDebounceTimer);
    });
    ```
  - Template changes:
    - Replace `v-else-if="filteredOutlets.length === 0"` with `v-else-if="outlets.length === 0"`.
    - Replace `v-for="(outlet, index) in filteredOutlets"` with `v-for="(outlet, index) in outlets"`.
  - Remove unused `filteredOutlets` computed property.

---

## Open Questions & Assumptions
- **Covered Search Fields**: Outlet search covers `name` and `location` fields on the `outlets` table. (Assumed confirmed per discovery draft and current client-side filter logic). Note: `merchants.name` is redundant since merchant_id is already scoped to the authenticated tenant.

---

## Out of Scope
- Full-text indexing or fuzzy search engines (e.g. Elasticsearch/Meilisearch).
- Cross-tenant or global multi-merchant search.
- Altering base `PaginationDto` globally.
