# ADR-004: DTO Inheritance for Endpoints with Mixed Query Parameters

**Status:** Accepted  
**Date:** 2026-07-01  
**Deciders:** Engineering team  
**Source:** `docs/decisions/_archive-kiro-reports/STOCK_API_ANOMALY_ANALYSIS.md`, `STOCK_API_FIX_SUMMARY.md`

---

## Context

NestJS is configured globally with `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })`. This means any query parameter not declared in the bound DTO causes a hard validation error.

A recurring pattern in list endpoints is to accept both pagination (`page`, `limit`) and one or more filter parameters (e.g. `product_id`, `outlet_id`). The naive approach mixes `@Query('param')` individual extraction with `@Query() dto: PaginationDto`:

```ts
// BROKEN — causes validation error when product_id is present
@Get('logs')
findLogs(
  @Query('product_id') productId?: string,
  @Query() pagination?: PaginationDto,   // ← ValidationPipe sees ALL params, rejects product_id
) {}
```

**Root cause:** When `@Query()` without a key is used, NestJS passes the entire query string object through `ValidationPipe`. With `forbidNonWhitelisted: true`, `product_id` is rejected because it is not declared in `PaginationDto`. This renders the filter parameter **completely unusable** despite being documented in Swagger.

Four solutions were evaluated:

| # | Approach | Verdict |
|---|---|---|
| 1 | Extract every param individually, build PaginationDto manually | Works but verbose; type conversion is manual |
| 2 | Extend `PaginationDto` into a resource-specific query DTO | Clean, type-safe, idiomatic NestJS ✅ |
| 3 | Disable `forbidNonWhitelisted` globally | Reduces API security — rejected |
| 4 | `ParseUUIDPipe` on the individual param | Doesn't fix it; ValidationPipe runs first |

---

## Decision

**Option 2.** Every endpoint that accepts pagination plus one or more filter parameters must declare a dedicated query DTO that extends `PaginationDto`. The controller uses a single `@Query() query: XxxQueryDto` — no mixing with `@Query('param')`.

Pattern:

```ts
// dto/stock-logs-query.dto.ts
export class StockLogsQueryDto extends PaginationDto {
  @IsOptional()
  @IsUUID('4')
  product_id?: string;
}

// stock.controller.ts
@Get('logs')
@RequirePermission('stock.read')
findLogs(
  @CurrentUser('merchant_id') merchantId: string,
  @Query() query: StockLogsQueryDto,
) {
  const { product_id, ...pagination } = query;
  return this.stockService.findLogs(merchantId, product_id, pagination);
}
```

---

## Consequences

### Positive

- Single `@Query()` binding — `ValidationPipe` sees one DTO with all declared fields, no conflicts.
- Filter parameters get proper class-validator decorators (`@IsUUID`, `@IsOptional`, `@IsEnum`, etc.).
- Swagger auto-documents all query params from one DTO class.
- Pattern is composable: add more filter fields by extending the DTO further.

### Negative

- Each filtered list endpoint needs its own `XxxQueryDto` file. Small overhead for simple cases.
- Service signatures may need adjustment when the query shape changes.

### If Violated

Mixing `@Query('param')` with `@Query() dto: PaginationDto` on the same endpoint will silently break filtering whenever `forbidNonWhitelisted` is true (the global config). Severity: 🟡 — feature broken in production, hard to catch in tests that don't test the full pipe stack.

---

## Scan for Existing Violations

Search for the broken pattern across the codebase:

```bash
grep -rn "@Query('" apps/api/src/ --include="*.ts" -l | xargs grep -l "@Query()"
```

Any file that appears in both passes uses both forms and should be reviewed.

---

## Related Rules

- `AGENTS.md` → "Controller Rules" (DTOs mandatory for request input)
- `docs/backend/nestjs-guidelines.md` — NestJS controller conventions
- ADR-001 — Query params never carry `merchant_id`; that comes from `@CurrentUser()`
