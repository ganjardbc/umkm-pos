# Task List: GAN-54

## Backend Tasks
- [x] (apps/api) Update `product_categories` model in `apps/api/prisma/schema.prisma` to include `@@unique([id, merchant_id], map: "unique_category_id_merchant")`
- [x] (apps/api) Update `products` model relation `product_categories` in `apps/api/prisma/schema.prisma` to use composite fields `[category_id, merchant_id]` referencing `[id, merchant_id]`
- [x] (apps/api) Run `npx prisma generate` in `apps/api` to generate updated Prisma Client types
- [x] (apps/api) Verify and refine category tenant validation in `apps/api/src/products/products.service.ts` for `create` and `update` methods
- [x] (apps/api) Update and add unit tests in `apps/api/src/products/products.service.spec.ts` covering tenant isolation for product category associations
- [x] (apps/api) Run test suite (`pnpm --filter umkm-pos-api test`) and typecheck (`pnpm typecheck`) to verify no regressions
