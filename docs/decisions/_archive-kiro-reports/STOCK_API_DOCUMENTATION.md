# Stock API Service Documentation

## Overview
The Stock API service manages inventory stock logs and adjustments for products in the UMKM POS system. It provides functionality to view stock history and manually adjust stock quantities with proper validation and audit trails.

## Architecture

### Module Structure
```
src/stock/
├── stock.module.ts          # Module definition
├── stock.controller.ts      # HTTP endpoints
├── stock.service.ts         # Business logic
└── dto/
    └── create-stock-adjustment.dto.ts  # Data validation
```

### Dependencies
- **DatabaseModule**: Provides Prisma client for database operations
- **PermissionGuard**: Enforces role-based access control
- **PaginationDto**: Handles pagination parameters

## API Endpoints

### 1. GET /api/v1/stock/logs
**Purpose**: Retrieve stock adjustment logs for a merchant

**Authentication**: Required (Bearer token)
**Permission**: `stock.read`

**Query Parameters**:
- `product_id` (optional, string): Filter logs by specific product UUID
- `page` (optional, number): Page number (default: 1)
- `limit` (optional, number): Items per page (default: 10, max: 100)

**Response**:
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "uuid",
        "product_id": "uuid",
        "change_qty": 10,
        "reason": "restock",
        "ref_id": null,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z",
        "created_by": "uuid",
        "updated_by": "uuid",
        "products": {
          "id": "uuid",
          "name": "Product Name",
          "slug": "product-slug",
          "stock_qty": 100
        }
      }
    ],
    "meta": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    }
  }
}
```

**Business Logic**:
1. Extracts merchant_id from authenticated user
2. If product_id provided, validates product belongs to merchant
3. Fetches all product IDs for the merchant
4. Queries stock_logs filtered by merchant's products
5. Returns paginated results with product details

**Error Responses**:
- `404`: Product not found or doesn't belong to merchant
- `401`: Unauthorized (no valid token)
- `403`: Forbidden (missing stock.read permission)

---

### 2. POST /api/v1/stock/adjust
**Purpose**: Manually adjust product stock quantity

**Authentication**: Required (Bearer token)
**Permission**: `stock.adjust`

**Request Body**:
```json
{
  "product_id": "550e8400-e29b-41d4-a716-446655440031",
  "change_qty": 10,
  "reason": "restock",
  "note": "Restocked from supplier delivery"
}
```

**Field Validations**:
- `product_id`: Required, must be valid UUID
- `change_qty`: Required, integer, cannot be 0
  - Positive values = add stock
  - Negative values = reduce stock
- `reason`: Required, must be one of:
  - `restock`: Adding stock from supplier
  - `damage`: Removing damaged items
  - `correction`: Fixing inventory errors
  - `manual`: Other manual adjustments
- `note`: Optional, max 255 characters

**Response**:
```json
{
  "success": true,
  "data": {
    "product": {
      "id": "uuid",
      "stock_qty": 110
    },
    "log": {
      "id": "uuid",
      "product_id": "uuid",
      "change_qty": 10,
      "reason": "restock",
      "ref_id": null,
      "created_at": "2024-01-01T00:00:00Z",
      "created_by": "uuid",
      "products": {
        "id": "uuid",
        "name": "Product Name",
        "slug": "product-slug",
        "stock_qty": 110
      }
    }
  }
}
```

**Business Logic**:
1. Validates change_qty is not zero
2. Verifies product exists and belongs to merchant
3. Calculates new stock quantity
4. Validates new stock won't go below 0
5. Atomically updates product stock and creates log entry
6. Returns updated product and log details

**Error Responses**:
- `400`: Invalid input (change_qty = 0, insufficient stock)
- `404`: Product not found or doesn't belong to merchant
- `401`: Unauthorized
- `403`: Forbidden (missing stock.adjust permission)

## Service Methods

### findLogs(merchantId, productId?, pagination?)
**Purpose**: Retrieve stock logs with optional filtering

**Parameters**:
- `merchantId` (string): Current user's merchant ID
- `productId` (string, optional): Filter by specific product
- `pagination` (PaginationDto): Page and limit parameters

**Returns**: Paginated list of stock logs with product details

**Key Features**:
- Merchant isolation: Only shows logs for merchant's products
- Product validation: Ensures product belongs to merchant
- Includes product details in response
- Ordered by created_at descending (newest first)

---

### adjust(dto, merchantId, userId)
**Purpose**: Adjust product stock quantity

**Parameters**:
- `dto` (CreateStockAdjustmentDto): Adjustment details
- `merchantId` (string): Current user's merchant ID
- `userId` (string): Current user's ID

**Returns**: Updated product and created log entry

**Key Features**:
- **Atomic Transaction**: Stock update and log creation happen together
- **Validation**:
  - Product ownership verification
  - Non-zero change quantity
  - Prevents negative stock
- **Audit Trail**: Records who made the change and when
- **Stock Safety**: Prevents stock from going below 0

## Data Models

### stock_logs Table
```sql
CREATE TABLE stock_logs (
  id CHAR(36) PRIMARY KEY,
  product_id CHAR(36) NOT NULL,
  change_qty INT NOT NULL,
  reason VARCHAR(50) NOT NULL,
  ref_id CHAR(36),              -- For future transaction references
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  created_by CHAR(36),
  updated_by CHAR(36),
  FOREIGN KEY (product_id) REFERENCES products(id)
);
```

### Relationships
- `stock_logs.product_id` → `products.id` (CASCADE delete)
- `stock_logs.created_by` → `users.id` (no relation defined yet)

## Security & Permissions

### Required Permissions
- `stock.read`: View stock logs
- `stock.adjust`: Adjust stock quantities

### Merchant Isolation
- All operations are scoped to the authenticated user's merchant
- Products are validated to belong to the merchant
- Cross-merchant access is prevented

### Audit Trail
- Every adjustment records:
  - Who made the change (created_by)
  - When it was made (created_at)
  - Why it was made (reason)
  - How much changed (change_qty)

## Usage Examples

### Frontend Integration

#### Fetch Stock Logs
```typescript
// Get all stock logs for merchant
const response = await api.get('/api/v1/stock/logs', {
  params: { page: 1, limit: 10 }
});

// Get stock logs for specific product
const response = await api.get('/api/v1/stock/logs', {
  params: { 
    product_id: 'product-uuid',
    page: 1, 
    limit: 10 
  }
});
```

#### Adjust Stock
```typescript
const response = await api.post('/api/v1/stock/adjust', {
  product_id: 'product-uuid',
  change_qty: 10,        // Add 10 items
  reason: 'restock',
  note: 'Supplier delivery'
});

// Reduce stock
const response = await api.post('/api/v1/stock/adjust', {
  product_id: 'product-uuid',
  change_qty: -5,        // Remove 5 items
  reason: 'damage',
  note: 'Damaged during handling'
});
```

## Known Issues & Limitations

### Current Limitations
1. **No User Relation**: `stock_logs.created_by` doesn't have a foreign key to users table
   - Can't include user details in queries
   - No referential integrity for created_by field

2. **Validation Pipe Issue**: Using `@Query() pagination?: PaginationDto` causes validation errors when additional query params (like product_id) are present
   - The ValidationPipe has `forbidNonWhitelisted: true`
   - Extra query parameters are rejected

3. **Limited Reason Types**: Only 4 predefined reasons
   - Consider adding more specific reasons
   - Or allow custom reasons with validation

4. **No Note Field in Database**: The DTO accepts `note` but it's not stored
   - Need to add `note` column to stock_logs table

### Recommended Improvements
1. Add foreign key relation from stock_logs to users
2. Add `note` column to stock_logs table
3. Fix validation pipe to allow product_id query parameter
4. Add more adjustment reasons or make it configurable
5. Add search/filter capabilities (by date range, reason, etc.)
6. Add bulk adjustment support
7. Add stock alert notifications when below min_stock

## Testing Considerations

### Test Cases
1. **findLogs**:
   - ✓ Returns logs for merchant's products only
   - ✓ Filters by product_id correctly
   - ✓ Pagination works correctly
   - ✓ Returns 404 for non-existent product
   - ✓ Returns 404 for other merchant's product

2. **adjust**:
   - ✓ Successfully adds stock
   - ✓ Successfully reduces stock
   - ✓ Prevents stock from going negative
   - ✓ Rejects zero change_qty
   - ✓ Validates product ownership
   - ✓ Creates log entry atomically
   - ✓ Updates product stock atomically

## API Flow Diagrams

### Stock Adjustment Flow
```
User Request → Controller → Service
                              ↓
                         Validate change_qty ≠ 0
                              ↓
                         Find product by ID
                              ↓
                         Verify merchant ownership
                              ↓
                         Calculate new stock
                              ↓
                         Validate stock ≥ 0
                              ↓
                    [Transaction Start]
                         Update product.stock_qty
                         Create stock_logs entry
                    [Transaction Commit]
                              ↓
                         Return result
```

### Stock Logs Query Flow
```
User Request → Controller → Service
                              ↓
                    Validate product (if provided)
                              ↓
                    Get all merchant's product IDs
                              ↓
                    Query stock_logs
                    WHERE product_id IN (merchant's products)
                              ↓
                    Include product details
                              ↓
                    Apply pagination
                              ↓
                    Return paginated results
```
