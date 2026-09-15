# Parameter Validation Implementation

## Overview

This document describes the parameter validation implementation for the Dashboard Reports API service layer, as specified in task 7.1 of the dashboard-reports-page spec.

## Implementation Details

### Location
- **File**: `src/modules/dashboard/services/api.ts`
- **Functions**: `validateLimit()`, `validateOutletId()`

### Validation Functions

#### 1. validateLimit(limit: number | undefined): void

Validates that the `limit` parameter is within the valid range (1-50).

**Rules:**
- Must be an integer
- Must be between 1 and 50 (inclusive)
- Can be undefined (will use default value)

**Error Message:**
```
"Limit parameter must be an integer between 1 and 50"
```

**Valid Examples:**
```typescript
validateLimit(1);      // ✓ Minimum valid value
validateLimit(25);     // ✓ Middle value
validateLimit(50);     // ✓ Maximum valid value
validateLimit(undefined); // ✓ Uses default (10)
```

**Invalid Examples:**
```typescript
validateLimit(0);      // ✗ Below minimum
validateLimit(51);     // ✗ Above maximum
validateLimit(-5);     // ✗ Negative value
validateLimit(25.5);   // ✗ Non-integer
```

#### 2. validateOutletId(outletId: string | undefined): void

Validates that the `outlet_id` parameter is a valid UUID format or null/undefined.

**Rules:**
- Must match UUID v4 format: 8-4-4-4-12 hexadecimal characters
- Can be undefined, null, or empty string (optional parameter)
- Case-insensitive

**UUID Format:**
```
xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

**Error Message:**
```
"outlet_id must be a valid UUID format"
```

**Valid Examples:**
```typescript
validateOutletId('550e8400-e29b-41d4-a716-446655440000'); // ✓ Valid UUID
validateOutletId('a1b2c3d4-e5f6-7890-abcd-ef1234567890'); // ✓ Lowercase
validateOutletId('A1B2C3D4-E5F6-7890-ABCD-EF1234567890'); // ✓ Uppercase
validateOutletId(undefined); // ✓ Optional parameter
```

**Invalid Examples:**
```typescript
validateOutletId('550e8400e29b41d4a716446655440000'); // ✗ Missing dashes
validateOutletId('550e8400-e29b-41d4-a716');           // ✗ Wrong length
validateOutletId('550e8400-e29b-41d4-a716-44665544000g'); // ✗ Invalid char
validateOutletId('not-a-uuid');                        // ✗ Not UUID format
validateOutletId('12345');                             // ✗ Numeric string
```

### API Functions with Validation

All API service functions now include parameter validation:

1. **getSalesSummary(params: BaseReportParams)**
   - Validates: `outlet_id`

2. **getDailyReports(params: BaseReportParams)**
   - Validates: `outlet_id`

3. **getTopProducts(params: TopProductsParams)**
   - Validates: `limit`, `outlet_id`

4. **getOutletComparison(params: BaseReportParams)**
   - Validates: `outlet_id`

5. **getDashboardData(params: DashboardParams)**
   - Validates: `limit`, `outlet_id`

### Error Handling Flow

```
User Input → API Function Call → Parameter Validation
                                         ↓
                                   Valid? → Continue to API Request
                                         ↓
                                   Invalid? → Throw Error
                                         ↓
                                   Caught in Dashboard Page
                                         ↓
                                   Displayed in Chart Component
```

### Integration with Dashboard UI

The validation errors are automatically integrated with the existing error handling mechanism in the dashboard page:

1. **Error Catching**: The `fetchAllReports()` function and individual retry functions catch validation errors
2. **Error Display**: Validation error messages are displayed in the chart components' error states
3. **User Feedback**: Users see descriptive error messages explaining what went wrong
4. **Retry Mechanism**: Users can retry with corrected parameters

### Example Error Display

When a validation error occurs:

```typescript
// Invalid limit parameter
await getTopProducts({ 
  date_from: '2024-01-01', 
  date_to: '2024-01-31', 
  limit: 100 // Invalid!
});

// Error caught and displayed:
// "Limit parameter must be an integer between 1 and 50"
```

```typescript
// Invalid outlet_id parameter
await getSalesSummary({ 
  date_from: '2024-01-01', 
  date_to: '2024-01-31', 
  outlet_id: 'invalid-uuid' // Invalid!
});

// Error caught and displayed:
// "outlet_id must be a valid UUID format"
```

## Testing

### Manual Testing

To manually test the validation:

1. Open the dashboard page in the browser
2. Open browser console
3. Try calling API functions with invalid parameters:

```javascript
// Test invalid limit
await getTopProducts({ 
  date_from: '2024-01-01', 
  date_to: '2024-01-31', 
  limit: 100 
});
// Expected: Error message displayed in Top Products chart

// Test invalid outlet_id
await getSalesSummary({ 
  date_from: '2024-01-01', 
  date_to: '2024-01-31', 
  outlet_id: 'not-a-uuid' 
});
// Expected: Error message displayed in Sales Summary chart
```

### Automated Testing

A comprehensive test suite is available in `api.validation.test.ts` that covers:

- Valid limit values (1, 25, 50, undefined)
- Invalid limit values (0, 51, -5, 25.5)
- Valid UUID formats (lowercase, uppercase, mixed case)
- Invalid UUID formats (missing dashes, wrong length, invalid characters)
- Combined parameter validation
- Error message verification

To run the tests (once vitest is configured):
```bash
npm test -- api.validation.test.ts --run
```

## Requirements Validation

This implementation satisfies the following requirements:

- **Requirement 2.4**: outlet_id is validated as a valid UUID format or null/undefined
- **Requirement 2.5**: limit is validated as a number in the range 1-50
- **Task 7.1**: Parameter validation is implemented in the API service layer
- **Error Display**: Validation errors are displayed to users through the existing error handling mechanism

## Future Enhancements

Possible improvements for future iterations:

1. **Client-side validation**: Add validation in the UI before API calls
2. **Custom error types**: Create specific error classes for validation errors
3. **Validation middleware**: Extract validation into a reusable middleware pattern
4. **Additional validations**: Add date format validation, date range validation, etc.
5. **Internationalization**: Support multiple languages for error messages
