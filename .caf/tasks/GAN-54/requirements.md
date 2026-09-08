# Requirements: GAN-54

## Status: PLAN

## Ticket
- **ID**: GAN-54
- **Title**: [SECURITY] Potential tenant isolation bypass on product category association
- **Type**: Security / Bugfix
- **Scope**: `apps/api`

---

## Problem Statement
In UMKM-POS, tenant isolation is strictly bounded by `merchant_id`. In `products.service.ts`, when creating or updating a product with a `category_id`, validation is performed at the application layer via `categoriesService.findOne(dto.category_id, merchantId)`.

However, at the database/schema level:
1. `product_categories` only has single-column PK `id` and unique `[merchant_id, name]`.
2. `products` has a single-column FK `category_id` referencing `product_categories(id)`.
3. There is no composite foreign key constraint enforcing that `(category_id, merchant_id)` in `products` matches `(id, merchant_id)` in `product_categories`.
4. If application-level checks are bypassed or error handling regresses, a product belonging to Merchant A could potentially be linked to a category belonging to Merchant B, violating multi-tenant isolation.

---

## Scope & Target Files
- `apps/api/prisma/schema.prisma` — Add composite unique constraint `@@unique([id, merchant_id])` on `product_categories` and composite relation `[category_id, merchant_id]` on `products`.
- `apps/api/src/products/products.service.ts` — Ensure explicit tenant scoping and consistent error handling on create and update operations.
- `apps/api/src/products/products.service.spec.ts` — Comprehensive unit tests verifying category association and tenant isolation enforcement.

---

## Detailed Requirements

### 1. Database Schema & Prisma Relations (`apps/api/prisma/schema.prisma`)
- Add composite unique constraint `@@unique([id, merchant_id], map: "unique_category_id_merchant")` to `product_categories`.
- Update `products` model relation `product_categories`:
  ```prisma
  product_categories product_categories? @relation(fields: [category_id, merchant_id], references: [id, merchant_id], onDelete: SetNull, onUpdate: NoAction, map: "products_ibfk_category")
  ```
- Regenerate Prisma client (`pnpm --filter umkm-pos-api prisma generate` or via build).

### 2. Service Layer Enforcement (`apps/api/src/products/products.service.ts`)
- In `create()`:
  - If `dto.category_id` is provided, validate that the category exists and belongs to `merchantId`.
  - Throw `BadRequestException('Invalid category_id: category does not exist or belongs to another merchant')` when category is not found or belongs to another merchant.
- In `update()`:
  - If `dto.category_id` is provided (and not `null`), validate that the category exists and belongs to `merchantId`.
  - Throw `BadRequestException('Invalid category_id: category does not exist or belongs to another merchant')` when category is not found or belongs to another merchant.
  - Allow setting `category_id: null` to unassign category.
  - Ensure update queries enforce `merchant_id` boundary.

### 3. Automated Testing (`apps/api/src/products/products.service.spec.ts`)
- Unit test: creating product with valid category belonging to same merchant succeeds.
- Unit test: creating product with category belonging to a different merchant fails with `BadRequestException`.
- Unit test: updating product with valid category belonging to same merchant succeeds.
- Unit test: updating product with category belonging to another merchant fails with `BadRequestException`.
- Unit test: updating product to clear category (`category_id: null`) succeeds.

---

## Acceptance Criteria
1. Composite foreign key constraint `[category_id, merchant_id]` referencing `[id, merchant_id]` is defined in Prisma schema.
2. Cross-tenant category association is rejected at both application service layer and database schema relation layer.
3. Unit tests in `apps/api/src/products/products.service.spec.ts` pass with 100% success rate.
4. TypeScript compilation (`pnpm typecheck` / `pnpm build`) passes without errors across the monorepo.
