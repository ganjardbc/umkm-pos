# Merchant Access Control

## Overview

The merchant access control system ensures that users can only access merchants they belong to, with special privileges for admin users.

## How It Works

### User Types

1. **Admin Users** (from "Merchant Admin")
   - Can see ALL merchants in the system
   - Can create, read, update, and delete any merchant
   - Identified by belonging to the merchant with slug `merchant-admin`

2. **Regular Users** (from other merchants)
   - Can ONLY see their own merchant
   - Can only update their own merchant (if they have permission)
   - Cannot access other merchants' data

### Implementation

#### Controller Changes
- All merchant endpoints now receive `@CurrentUser('merchant_id')` to identify the user's merchant
- The merchant_id is passed to service methods for access control

#### Service Changes
- `isAdminUser()`: Checks if user belongs to admin merchant
- `validateMerchantAccess()`: Validates if user can access a specific merchant
- `findAll()`: Filters merchants based on user type
  - Admin: Returns all merchants
  - Regular: Returns only their merchant
- `findOne()`, `update()`, `remove()`: Validates access before performing operations

### Example Scenarios

#### Scenario 1: Admin User Lists Merchants
```
User: admin@demo.com (merchant_id: merchant-admin)
Request: GET /merchants
Result: Returns all merchants in the system
```

#### Scenario 2: Regular User Lists Merchants
```
User: owner@demo.com (merchant_id: demo-store)
Request: GET /merchants
Result: Returns only "Demo Store" merchant
```

#### Scenario 3: Regular User Tries to Access Another Merchant
```
User: owner@demo.com (merchant_id: demo-store)
Request: GET /merchants/{other-merchant-id}
Result: 403 Forbidden - "You do not have access to this merchant"
```

## Configuration

The admin merchant slug is defined in `merchants.service.ts`:

```typescript
const ADMIN_MERCHANT_SLUG = 'merchant-admin';
```

If you need to change the admin merchant identifier, update this constant.

## Security Notes

- Access control is enforced at the service layer
- All merchant operations validate user access before execution
- Admin users are identified by their merchant slug, not by role
- This approach works alongside the RBAC permission system
