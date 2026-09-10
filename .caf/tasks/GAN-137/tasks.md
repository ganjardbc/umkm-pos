# Tasks: GAN-137 - Add search support to Stock/Inventory log

## Execution Plan
1. **caf-backend**: Implement `search` query parameter in backend DTO, controller, and Prisma service query in `apps/api`.
2. **caf-frontend**: Replace `search()` stub with debounced `fetchStock()` call and pagination reset in `apps/web`.

---

## Backend Tasks

- [x] (apps/api) Add `search` property with `@IsOptional()` and `@IsString()` in `apps/api/src/stock/dto/stock-logs-query.dto.ts`.
- [x] (apps/api) Update `findLogs` endpoint in `apps/api/src/stock/stock.controller.ts` to forward `query.search` to `stockService.findLogs`.
- [x] (apps/api) Update `StockService.findLogs` in `apps/api/src/stock/stock.service.ts` to apply `OR` search on `products.name` and `reason` when `search` is provided.

---

## Frontend Tasks

- [x] (apps/web) Update `fetchStock` in `apps/web/src/modules/stock/pages/index.vue` to pass `search` query parameter in `getListStock` payload.
- [x] (apps/web) Replace `search()` stub in `apps/web/src/modules/stock/pages/index.vue` with 300ms debounced search handler that resets `pagination.value.page` to 1.
