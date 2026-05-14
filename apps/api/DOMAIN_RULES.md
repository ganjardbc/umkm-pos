# DOMAIN_RULES.md
# ==================

## Multi Tenant Rules

- Each user belongs to one merchant
- Merchant owns outlets
- All data must be merchant scoped
- Slugs unique per merchant (not global except merchant slug)

## Outlet Rules

- Transactions always belong to outlet
- Shifts belong to outlet
- User roles are outlet-scoped

## Product Rules

- Price & cost stored in product
- Transaction item must snapshot:
  - product_name_snapshot
  - price_snapshot

Never read live price for historical reports.

## Transaction Rules

- Must be atomic
- Must reduce stock
- Must write stock_logs
- May have shift_id nullable
- May be offline source

## Stock Rules

- product.stock_qty = current stock
- stock_logs = audit trail
- Every adjustment must log

## Shift Rules

- Shift has start_time
- Shift end_time optional until closed
- Transactions may attach shift

## RBAC Rules

- Roles grant permissions
- Permissions are action-based
- User roles scoped per outlet
- Guards check permission, not role name
