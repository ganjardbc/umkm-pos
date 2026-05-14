# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UMKM-POS API is a multi-tenant Point of Sale system for UMKM tourism businesses (cafés, souvenir shops, agro-tourism, small multi-booth merchants). Built with NestJS, Prisma, and MySQL.

## Quick Commands

| Command | Description |
|---------|-------------|
| `npm run start:dev` | Development server with hot reload |
| `npm run start:prod` | Production build |
| `npm run test` | Run unit tests |
| `npm run test:cov` | Run tests with coverage |
| `npm run lint` | Run ESLint with auto-fix |
| `npm run format` | Format code with Prettier |
| `npx prisma studio` | Open Prisma schema viewer |
| `npx prisma migrate dev` | Create and apply migration |
| `npx prisma db pull` | Sync schema from existing DB |
| `npm run docs` | Swagger docs at `/docs` |

## Architecture

**Modular Monolith** with clear layer boundaries:

```
src/
├── auth/          # JWT authentication
├── users/         # User management
├── merchants/     # Merchant tenants
├── outlets/       # Multi-outlet support
├── products/      # Product catalog + categories
├── transactions/  # POS core (atomic commits)
├── transaction_items/ # Price snapshots
├── shifts/        # Cashier shift tracking
├── stock/         # Stock logs + adjustments
├── reports/       # Aggregates + dashboard
├── rbac/          # Roles + permissions
├── sync/          # Offline sync endpoints
├── database/      # Prisma service
├── common/        # Guards, pipes, interceptors
└── migrations/    # Database migrations
```

### Layer Rules

- **Controller**: DTO input, validation, service call, response. No DB queries.
- **Service**: Business logic, Prisma access, transactions, domain rules.
- **Prisma**: Only inside services.

### Multi-Tenant Enforcement

- `merchant_id` derived from auth header — never trust client input
- All queries must scope by `merchant_id`
- Slugs unique per merchant (not global)

## Domain Rules

- **Transactions**: Atomic commits must create transaction, items, reduce stock, write logs
- **Stock**: `products.stock_qty` = current; `stock_logs` = audit trail
- **Shifts**: Belong to outlet, has `start_time`, `end_time` nullable until closed
- **RBAC**: Permissions grant access (not role names), user roles scoped per outlet

## Common Module

| Component | Purpose |
|-----------|---------|
| `@CurrentUser()` | Get authenticated user from request |
| `@RequirePermission()` | Require specific permission |
| `@Public()` | Skip auth for endpoint |
| `JwtAuthGuard` | Global JWT protection |
| `PermissionGuard` | Permission-based access |
| `TransformInterceptor` | Wrap responses in `{success, data}` |
| `ValidationPipe` | DTO validation + transform |
| `HttpExceptionFilter` | Standardize error responses |

## API Conventions

**Success Response**:
```json
{ "success": true, "data": {} }
```

**Error Response**:
```json
{ "success": false, "message": "...", "code": "..." }
```

**Swagger**: Available at `/docs`

## Environment

Required `.env` variables:
- `DATABASE_URL` - MySQL connection string
- `JWT_SECRET` - Secret for JWT tokens
- `PORT` - Server port (default: 3000)
- `CORS_ORIGIN` - CORS allowed origin
