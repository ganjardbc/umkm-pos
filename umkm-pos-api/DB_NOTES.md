# DB_NOTES.md
# ==================

## Database Engine

MySQL 8
Accessed via Prisma ORM.

## ID Strategy

- UUID stored as string (char(36))
- Generated at app layer or DB default

## Key Tables

- merchants
- outlets
- users
- products
- transactions
- transaction_items
- shifts
- stock_logs
- daily_reports
- roles
- permissions
- role_permissions
- user_roles

## Snapshot Requirement

transaction_items must store:
- product_name_snapshot
- price_snapshot

Never rely on product table for history.

## Stock Integrity

Stock changes must happen only through:
- POS transaction commit
- Stock adjustment service

Both must write stock_logs.

## Offline Sync

Transactions may arrive late.

Sync endpoint must be:
- idempotent
- device_id aware
- duplicate safe

## Index Strategy

Index required on:

- merchant_id
- outlet_id
- created_at (transactions)
- product_id (stock_logs)
- unique slug per merchant

## Audit Fields

Tables include:

- created_at
- updated_at
- created_by
- updated_by

Values derived from auth user — not client.
