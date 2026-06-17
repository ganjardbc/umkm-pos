# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> For app-specific details, read the nested CLAUDE.md files first:
> - `apps/web/CLAUDE.md` — Vue 3 frontend patterns, auth helpers, module conventions
> - `apps/api/CLAUDE.md` — NestJS backend layers, domain rules, API conventions

## Monorepo Commands

This is a **pnpm + Turbo** monorepo. Run from the repo root:

```bash
pnpm dev           # Start all dev servers in parallel (web + api)
pnpm build         # Build all workspaces (respects dependency order)
pnpm test          # Run all tests
pnpm lint          # Lint all workspaces
pnpm typecheck     # TypeScript check across all workspaces
```

Target a single workspace:

```bash
pnpm --filter umkm-pos-app <script>     # Frontend (apps/web)
pnpm --filter umkm-pos-api <script>     # Backend (apps/api)
pnpm --filter @umkm-pos/shared-types build
```

The `README.md` also uses `pnpm dev:web` / `pnpm dev:api` as aliases — these are workspace-level shortcuts, not defined at root.

## Architecture Overview

```
umkm-pos/
├── apps/web/          # Vue 3 + Vite + PrimeVue frontend
├── apps/api/          # NestJS + Prisma + MySQL backend
├── apps/landing/      # Marketing landing page
├── packages/
│   ├── shared-types/  # @umkm-pos/shared-types — auth, user, product types
│   ├── shared-utils/  # @umkm-pos/shared-utils
│   └── eslint-config/ # Shared ESLint config
├── infra/             # Docker artifacts + operational scripts
└── docs/              # Architecture docs + runbooks
```

**`shared-types` must be built before apps.** Turbo handles this via `"dependsOn": ["^build"]`.

## System Design: Multi-Tenant POS

The app is a **multi-tenant SaaS POS** for UMKM (Indonesian small businesses: cafés, souvenir shops, agro-tourism). The key tenant boundary is the **merchant**. Each merchant has one or more **outlets** (physical locations).

### Data Scoping Rules

- Every database query in the API must scope by `merchant_id`, extracted from the JWT — never from client input.
- User roles are scoped **per outlet**: a user can be a cashier at Outlet A and an owner at Outlet B.
- `APP_ACTIVE_OUTLET` in localStorage determines which outlet context the frontend operates in.

### Core Data Relationships

```
merchants
  └── outlets          (physical locations)
       └── users        (via user_roles, scoped per outlet)
       └── products     (catalog, shared across outlets)
            └── outlet_product_inventory  (per-outlet stock qty)
       └── transactions (POS orders)
            └── transaction_items         (price snapshot at time of sale)
       └── shifts       (cashier sessions with open/close cash)
       └── store_tables (restaurant table management)
```

Stock at `products.stock_qty` is the live count; `stock_logs` + `inventory_movements` are the audit trail. Transactions atomically reduce stock and write logs.

### Auth Flow (End-to-End)

1. Frontend POSTs to `POST /api/v1/auth/login`
2. API returns JWT + user/merchant/outlet/permissions payload
3. Frontend stores in localStorage under keys: `APP_TOKEN`, `APP_USER`, `APP_MERCHANT`, `APP_ACTIVE_OUTLET`, `APP_ACTIVE_ROLE`, `APP_ACTIVE_PERMISSIONS`, `APP_LIST_OUTLET`
4. Axios interceptor attaches `Authorization: Bearer <token>` to all requests
5. On 401, interceptor shows a confirm dialog then calls `removeAuth()` and redirects to login
6. Route guards check `meta.permission[]` against `isHasPermission()` before navigation

### RBAC

Permissions are **codes** (e.g. `"product.create"`), not role names. Role-based access is resolved server-side via `PermissionGuard` + `@RequirePermission()` and client-side via `isHasPermission()`. Role assignments are outlet-scoped in `user_roles`.

## Shared Packages

`@umkm-pos/shared-types` exports:
- `auth/auth.types.ts` — login response, JWT payload shapes
- `users/user.types.ts` — user entity type
- `products/product.types.ts` — product entity type
- `common/pagination.ts` — paginated response wrapper

Import in either app as `@umkm-pos/shared-types`. Always rebuild the package after changing types (`pnpm --filter @umkm-pos/shared-types build`).

## Environment Setup

**Frontend** (`apps/web/.env`):
```env
VITE_APP_VERSION=1.0.0
VITE_API_BASE_URL=http://localhost:3000
```

**Backend** (`apps/api/.env`):
```env
DATABASE_URL=mysql://user:pass@localhost:3306/umkm_pos
JWT_SECRET=your-secret
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

Optional backend vars: `AWS_*` for S3 uploads, `JWT_EXPIRES_IN` (default 7d).
