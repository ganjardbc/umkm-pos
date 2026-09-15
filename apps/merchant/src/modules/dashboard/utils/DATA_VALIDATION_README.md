# Data Format Validation Implementation

## Overview

This document describes the data format validation implementation for the Dashboard Reports API responses, as specified in task 7.2 of the dashboard-reports-page spec (Requirement 11.4).

## Purpose

The data validation layer ensures that:
1. API responses match expected TypeScript interfaces
2. All required fields are present in response data
3. Field types are correct (numbers, strings, dates)
4. Malformed or unexpected data structures are caught before rendering
5. User-friendly error messages are displayed when data is invalid

## Architecture

### Validation Flow

```
API Response → Data Validation → Validated Data → Chart Component
                     ↓
              Invalid Data? → DataValidationError → Error Display
```

### Components

1. **Validation Utilities** (`utils/validation.ts`)
   - Core validation functions for each API endpoint
   - Type checking and format validation
   - Custom error class for validation failures

2. **API Service Integration** (`services/api.ts`)
   - Validates responses before returning data
   - Wraps validation errors with descriptive messages
   - Maintains type safety throughout the flow

3. **Error Display** (Chart Components)
   - Displays validation errors in chart error states
   - Provides retry mechanism for failed requests
   - Prevents chart rendering with invalid data

## Validation Functions

### validateSalesSummaryData(data: any)

Validates sales summary response structure.

**Required Fields:**
- `total_revenue` (number)
- `total_transactions` (number)
- `average_transaction_value` (number)
- `total_items_sold` (number)
- `date_from` (string, YYYY-MM-DD format)
- `date_to` (string, YYYY-MM-DD format)

**Example Valid Data:**
```typescript
{
  total_revenue: 1000000,
  total_transactions: 150,
  average_transaction_value: 6666.67,
  total_items_sold: 450,
  date_from: '2024-01-01',
  date_to: '2024-01-31'
}
```

**Example Error:**
```
DataValidationError: Sales summary: 'total_revenue' must be a valid number
```

### validateDailyReportsData(data: any)

Validates daily reports array structure.

**Required Structure:**
- Must be an array
- Each item must have:
  - `date` (string, YYYY-MM-DD format)
  - `revenue` (number)
  - `transactions` (number)
  - `items_sold` (number)

**Example Valid Data:**
```typescript
[
  {
    date: '2024-01-01',
    revenue: 50000,
    transactions: 25,
    items_sold: 75
  },
  {
    date: '2024-01-02',
    revenue: 60000,
    transactions: 30,
    items_sold: 90
  }
]
```

**Example Error:**
```
DataValidationError: Daily report item at index 1: 'date' must be a valid date string (YYYY-MM-DD)
```

### validateTopProductsData(data: any)

Validates top products array structure.

**Required Structure:**
- Must be an array
- Each item must have:
  - `product_id` (non-empty string)
  - `product_name` (non-empty string)
  - `quantity_sold` (number)
  - `revenue` (number)

**Example Valid Data:**
```typescript
[
  {
    product_id: 'prod-123',
    product_name: 'Product A',
    quantity_sold: 100,
    revenue: 500000
  }
]
```

**Example Error:**
```
DataValidationError: Top product item at index 0: 'product_name' must be a valid string
```

### validateOutletComparisonData(data: any)

Validates outlet comparison array structure.

**Required Structure:**
- Must be an array
- Each item must have:
  - `outlet_id` (non-empty string)
  - `outlet_name` (non-empty string)
  - `revenue` (number)
  - `transactions` (number)
  - `items_sold` (number)

**Example Valid Data:**
```typescript
[
  {
    outlet_id: 'outlet-123',
    outlet_name: 'Outlet A',
    revenue: 1000000,
    transactions: 200,
    items_sold: 600
  }
]
```

**Example Error:**
```
DataValidationError: Outlet comparison item at index 0: 'outlet_name' must be a valid string
```

### validateDashboardData(data: any)

Validates consolidated dashboard response structure.

**Required Structure:**
- Must be an object with:
  - `summary` (object with numeric fields)
  - `top_products` (array of product items)
  - `daily_trend` (array of daily report items)
  - `outlet_summary` (array of outlet items)

**Example Valid Data:**
```typescript
{
  summary: {
    total_revenue: 1000000,
    total_transactions: 150,
    average_transaction_value: 6666.67,
    total_items_sold: 450
  },
  top_products: [...],
  daily_trend: [...],
  outlet_summary: [...]
}
```

**Example Error:**
```
DataValidationError: Dashboard data: summary section is missing or invalid
```

## Validation Rules

### Number Validation

A valid number must:
- Be of type `number`
- Not be `NaN`
- Not be `Infinity` or `-Infinity`

### String Validation

A valid string must:
- Be of type `string`
- Have length > 0 after trimming whitespace

### Date String Validation

A valid date string must:
- Match format `YYYY-MM-DD`
- Represent a valid calendar date
- Parse successfully to a Date object

## Error Handling

### DataValidationError Class

Custom error class for validation failures:

```typescript
class DataValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DataValidationError';
  }
}
```

### Error Message Format

Validation errors are wrapped with a prefix for clarity:

```
Data format error: [Original validation error message]
```

### Error Display in UI

When validation fails:
1. Chart component receives error message via props
2. Error state is displayed with warning icon
3. User sees descriptive error message
4. Retry button allows user to attempt request again
5. Chart does not render with invalid data

## Integration with API Service

Each API service function includes validation:

```typescript
export async function getSalesSummary(
  params: BaseReportParams
): Promise<SalesSummaryResponse['data']> {
  try {
    const response = await api.get<SalesSummaryResponse>(
      `${REPORTS_BASE_PATH}/summary`,
      { params }
    );
    
    // Validate response data structure
    const validatedData = validateSalesSummaryData(response.data.data);
    return validatedData;
  } catch (error) {
    if (error instanceof DataValidationError) {
      throw new Error(`Data format error: ${error.message}`);
    }
    throw error;
  }
}
```

## Testing

### Unit Tests

Comprehensive unit tests are provided in:
- `utils/__tests__/validation.test.ts` - Tests validation functions
- `services/__tests__/api.dataValidation.test.ts` - Tests API integration

### Test Coverage

Tests cover:
- ✓ Valid data acceptance
- ✓ Missing field detection
- ✓ Invalid type detection
- ✓ Invalid format detection
- ✓ Array validation
- ✓ Nested object validation
- ✓ Error message format
- ✓ Edge cases (empty arrays, null values, NaN, Infinity)

### Running Tests

Once vitest is configured:

```bash
# Run all validation tests
npm test -- validation.test.ts --run

# Run API integration tests
npm test -- api.dataValidation.test.ts --run
```

## Benefits

1. **Type Safety**: Ensures runtime data matches TypeScript interfaces
2. **Early Error Detection**: Catches data issues before rendering
3. **Better UX**: Provides clear error messages to users
4. **Debugging**: Makes it easier to identify API response issues
5. **Reliability**: Prevents crashes from unexpected data structures
6. **Maintainability**: Centralized validation logic

## Common Validation Errors

### Missing Required Fields

```
Error: Data format error: Sales summary: 'total_revenue' must be a valid number
```

**Cause**: API response is missing a required field
**Solution**: Check API endpoint implementation

### Invalid Data Types

```
Error: Data format error: Top product item at index 0: 'quantity_sold' must be a valid number
```

**Cause**: Field has wrong type (e.g., string instead of number)
**Solution**: Verify API response serialization

### Invalid Date Format

```
Error: Data format error: Daily report item at index 1: 'date' must be a valid date string (YYYY-MM-DD)
```

**Cause**: Date is not in YYYY-MM-DD format
**Solution**: Ensure API returns dates in correct format

### Empty Strings

```
Error: Data format error: Top product item at index 0: 'product_id' must be a valid string
```

**Cause**: String field is empty or whitespace-only
**Solution**: Ensure API returns non-empty strings

### Non-Array Data

```
Error: Data format error: Daily reports data must be an array
```

**Cause**: Expected array but received object or other type
**Solution**: Check API response structure

## Requirements Validation

This implementation satisfies:

- **Requirement 11.4**: "WHEN Reports_API returns invalid data format, THE Dashboard_Page SHALL display a data format error message"
- **Task 7.2**: "Implement data format validation"
  - ✓ Add runtime validation for API response data structures
  - ✓ Display data format error messages when validation fails
  - ✓ Prevent chart rendering with invalid data

## Future Enhancements

Possible improvements:

1. **Schema Validation**: Use Zod or Yup for more robust validation
2. **Partial Validation**: Allow rendering partial data when some fields are invalid
3. **Validation Warnings**: Distinguish between errors and warnings
4. **Custom Validators**: Add domain-specific validation rules
5. **Validation Logging**: Log validation failures for monitoring
6. **Recovery Strategies**: Attempt to fix common data issues automatically

## Related Documentation

- [Parameter Validation](../services/__tests__/VALIDATION_README.md)
- [Design Document](../../../../.kiro/specs/dashboard-reports-page/design.md)
- [Requirements Document](../../../../.kiro/specs/dashboard-reports-page/requirements.md)
