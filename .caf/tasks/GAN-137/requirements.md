# Requirements: GAN-137 - Add search support to Stock/Inventory log (frontend stub + backend missing)

## Status: PLAN

## Overview
The stock and inventory log page (`apps/web/src/modules/stock/pages/index.vue`) contains a search UI component (`UiSearch`) that is currently wired to a stub `search()` function logging to console, and backend `StockService.findLogs()` (`apps/api/src/stock/stock.service.ts`) only filters by `product_id` and `outlet_id` without handling search query strings. This feature implements full search capability across both backend and frontend layers for stock logs.

## Target User & Use Case
Outlet owners and managers reviewing stock movement history on `/stock` to audit inventory changes, investigate discrepancies, or locate adjustments for specific products or adjustment reasons.

## Functional Requirements

### 1. Backend (apps/api)
- **DTO Update (`apps/api/src/stock/dto/stock-logs-query.dto.ts`)**:
  - Add optional `search` field of type string with `@IsOptional()` and `@IsString()`.
  - Add Swagger `@ApiPropertyOptional({ description: 'Search stock logs by product name or reason', example: 'kopi' })`.
- **Controller Update (`apps/api/src/stock/stock.controller.ts`)**:
  - Update `findLogs` method to pass the `search` parameter from `StockLogsQueryDto` to `StockService.findLogs`.
- **Service Update (`apps/api/src/stock/stock.service.ts`)**:
  - Update `findLogs(merchantId, productId, outletId, pagination, search)` to filter `inventory_movements` with case-insensitive `contains` on:
    - `products.name`
    - `reason`
  - Ensure the search condition is combined with existing tenant scoping (`merchant_id: merchantId`) and optional filters (`product_id`, `outlet_id`).
  - Total count for pagination must reflect the filtered query results.

### 2. Frontend (apps/web)
- **Stock Log View (`apps/web/src/modules/stock/pages/index.vue`)**:
  - Update `fetchStock()` to include `search: form.search.trim()` in the payload when `form.search` is present.
  - Replace the `search()` stub function with a debounced handler (e.g. 300ms) that resets `pagination.value.page = 1` and triggers `fetchStock()`.
  - Ensure pagination navigation works seamlessly with active search queries.

## Non-Functional Requirements & Constraints
- Must enforce tenant boundaries: all database queries must scope by `merchant_id` from JWT.
- Search must not degrade performance of existing filtering (preserve indexes where applicable).
- No regression to existing product or outlet filtering.
- Consistent with search patterns used in other modules (e.g., `product-lists`).

## Out of Scope
- Full-text or fuzzy search engines (e.g. Elasticsearch).
- Cross-module global search.
- Global modifications to `PaginationDto`.
