# ARCHITECTURE.md
# ==================

## Backend Architecture — NestJS Modular Monolith

The system uses NestJS modular architecture. Each business domain has its own module.

## Module Map

- auth → authentication & JWT
- users → user management
- merchants → merchant root entity
- outlets → merchant outlets
- products → product catalog
- transactions → POS core logic
- transaction_items → snapshot items
- shifts → cashier shifts
- stock → stock logs & adjustments
- reports → aggregates & dashboard
- rbac → roles & permissions
- sync → offline sync endpoints (optional)

## Layer Rules

Controller:
- Accept DTO
- Validate input
- Call service
- Return response
- No DB logic

Service:
- Business rules
- Prisma queries
- Transactions
- Validation logic

Prisma:
- Only used inside services

## Transaction Pattern (POS)

All POS commits must use DB transaction:

- create transaction
- create items
- update product stock
- write stock_logs

Must be atomic.

## Guards

Global:
- JWT guard
- Permission guard

Decorators:
- @CurrentUser()
- @RequirePermission()

## Multi-Tenant Enforcement

Every query must be scoped by merchant_id (derived from auth user).
Never trust merchant_id from client input.
