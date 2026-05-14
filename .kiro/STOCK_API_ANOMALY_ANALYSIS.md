# Stock API Anomaly Analysis

## Critical Issue: Query Parameter Validation Conflict

### The Problem

The `GET /stock/logs` endpoint has a **design flaw** that causes validation errors when using the `product_id` query parameter.

### Root Cause

```typescript
@Get('logs')
findLogs(
  @CurrentUser('merchant_id') merchantId: string,
  @Query('product_id') productId?: string,      // ← Extracts product_id separately
  @Query() pagination?: PaginationDto,          // ← Tries to validate ALL query params
) {
  return this.stockService.findLogs(merchantId, productId, pagination);
}
```

**The Conflict:**
1. `@Query('product_id')` extracts `product_id` as a separate parameter
2. `@Query()` without a parameter name tries to bind **ALL** query parameters to `PaginationDto`
3. The `ValidationPipe` has `forbidNonWhitelisted: true`
4. When the request includes `?product_id=xxx&page=1&limit=10`:
   - NestJS tries to validate ALL params against `PaginationDto`
   - `PaginationDto` only defines `page` and `limit`
   - `product_id` is not in `PaginationDto`, so validation fails with: **"property product_id should not exist"**

### Why This Happens

The `ValidationPipe` configuration:
```typescript
const errors = await validate(object, {
  whitelist: true,              // Strip unknown properties
  forbidNonWhitelisted: true,   // ← THROW ERROR on unknown properties
  transform: true,
});
```

When `forbidNonWhitelisted: true`, any property not defined in the DTO class will cause a validation error.

### The Paradox

- The endpoint **needs** `product_id` as a query parameter (documented in `@ApiQuery`)
- But the validation **rejects** `product_id` because it's not in `PaginationDto`
- This makes the optional filtering feature **unusable**

## Impact

### What Works
```bash
# Without product_id filter - WORKS
GET /api/v1/stock/logs?page=1&limit=10
```

### What Fails
```bash
# With product_id filter - FAILS with validation error
GET /api/v1/stock/logs?product_id=xxx&page=1&limit=10

# Error Response:
{
  "success": false,
  "message": ["property product_id should not exist"],
  "code": "VALIDATION_ERROR"
}
```

## Solutions

### Solution 1: Extract Individual Parameters (Recommended)
Remove the `@Query() pagination` and extract each parameter individually:

```typescript
@Get('logs')
findLogs(
  @CurrentUser('merchant_id') merchantId: string,
  @Query('product_id') productId?: string,
  @Query('page') page?: number,
  @Query('limit') limit?: number,
) {
  const pagination = new PaginationDto();
  if (page) pagination.page = Number(page);
  if (limit) pagination.limit = Number(limit);
  
  return this.stockService.findLogs(merchantId, productId, pagination);
}
```

**Pros:**
- Simple and explicit
- No validation conflicts
- Easy to understand

**Cons:**
- More verbose
- Need to manually create PaginationDto instance
- Need to handle type conversion (query params are strings)

---

### Solution 2: Create a Custom DTO
Create a DTO that includes both pagination and product_id:

```typescript
// stock-logs-query.dto.ts
export class StockLogsQueryDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  product_id?: string;
}

// Controller
@Get('logs')
findLogs(
  @CurrentUser('merchant_id') merchantId: string,
  @Query() query: StockLogsQueryDto,
) {
  const { product_id, ...pagination } = query;
  return this.stockService.findLogs(merchantId, product_id, pagination);
}
```

**Pros:**
- Clean and type-safe
- Proper validation for product_id
- Follows NestJS best practices

**Cons:**
- Need to create a new DTO file
- Service signature needs adjustment

---

### Solution 3: Disable forbidNonWhitelisted Globally
Modify the ValidationPipe configuration:

```typescript
// main.ts
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: false,  // ← Change to false
  transform: true,
}));
```

**Pros:**
- Fixes the issue globally
- No code changes needed in controllers

**Cons:**
- **DANGEROUS**: Allows any extra properties in all endpoints
- Reduces API security
- May hide bugs where wrong parameters are sent
- Not recommended for production

---

### Solution 4: Use ParseUUIDPipe for product_id
Keep the current structure but add explicit validation:

```typescript
@Get('logs')
findLogs(
  @CurrentUser('merchant_id') merchantId: string,
  @Query('product_id', new ParseUUIDPipe({ optional: true })) productId?: string,
  @Query() pagination?: PaginationDto,
) {
  return this.stockService.findLogs(merchantId, productId, pagination);
}
```

**Pros:**
- Validates product_id format
- Minimal code change

**Cons:**
- **DOESN'T FIX THE ISSUE**: Still fails because ValidationPipe runs before ParseUUIDPipe
- The validation error happens at the DTO level, not the parameter level

## Recommended Fix

**Use Solution 2: Create a Custom DTO**

This is the most NestJS-idiomatic approach:

```typescript
// dto/stock-logs-query.dto.ts
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class StockLogsQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter logs by product ID',
    example: '550e8400-e29b-41d4-a716-446655440031',
  })
  @IsOptional()
  @IsUUID()
  product_id?: string;
}

// stock.controller.ts
@Get('logs')
@RequirePermission('stock.read')
@ApiOperation({
  summary: 'List all stock logs for the current merchant (optionally filter by product)',
})
@ApiResponse({ status: 200, description: 'Return stock logs' })
@ApiResponse({ status: 404, description: 'Product not found' })
findLogs(
  @CurrentUser('merchant_id') merchantId: string,
  @Query() query: StockLogsQueryDto,
) {
  const { product_id, ...pagination } = query;
  return this.stockService.findLogs(merchantId, product_id, pagination);
}
```

## Why This Matters

1. **User Experience**: The feature is documented but doesn't work
2. **API Consistency**: Other endpoints might have similar issues
3. **Frontend Integration**: Frontend developers will encounter errors when trying to filter by product
4. **Documentation Gap**: Swagger docs show product_id as a valid parameter, but it fails in practice

## Testing the Fix

After implementing the fix, test with:

```bash
# Should work without errors
curl -X GET "http://localhost:3000/api/v1/stock/logs?product_id=646cb592-1976-11f1-a28f-c4bb5d9f0847&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Should also work
curl -X GET "http://localhost:3000/api/v1/stock/logs?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Should return validation error (invalid UUID)
curl -X GET "http://localhost:3000/api/v1/stock/logs?product_id=invalid-uuid&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Related Issues

This same pattern might exist in other endpoints that use:
```typescript
@Query('some_param') param?: string,
@Query() pagination?: PaginationDto,
```

Search for this pattern across the codebase to identify similar issues.

## Conclusion

The current implementation has a **fundamental design flaw** where the documented API feature (filtering by product_id) is **broken by the validation layer**. This needs to be fixed before the API can be used in production with product filtering.

**Severity**: HIGH
**Impact**: Feature completely unusable
**Recommended Action**: Implement Solution 2 (Custom DTO)
