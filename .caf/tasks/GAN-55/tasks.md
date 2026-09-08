# GAN-55 Tasks

## Backend Tasks
- [ ] In `apps/api/src/products/products.controller.ts`: replace `@RequirePermission('product.create')` → `'products.create'` (line ~36), `'product.read'` → `'products.read'` (lines ~52, 63), `'product.update'` → `'products.update'` (lines ~82, 112, 126), `'product.delete'` → `'products.delete'` (line ~100)
- [ ] In `apps/api/src/products/categories/categories.controller.ts`: replace `'category.create'` → `'categories.create'` (line ~38), `'category.read'` → `'categories.read'` (lines ~65, 99, 120), `'category.update'` → `'categories.update'` (line ~144), `'category.delete'` → `'categories.delete'` (line ~179)
- [ ] In `apps/api/prisma/seed.ts`: update `permissionsData` array — rename `product.create/read/update/delete/view` → `products.create/read/update/delete/view`, `category.create/read/update/delete` → `categories.create/read/update/delete` (~lines 875-884)
- [ ] In `apps/api/prisma/seed.ts`: update all role permission-id arrays (`ownerPermIds`, `managerPermIds`, `cashierPermIds`, `viewerPermIds`) referencing old `product.*`/`category.*` codes to the new plural codes (~lines 937-1059) — do not drop or add permissions, only rename
- [ ] Grep whole repo (`apps/api`, `apps/web`, tests, docs/api/api-contract.md, docs/database seed docs) for remaining `'product.create'`, `'product.read'`, `'product.update'`, `'product.delete'`, `'product.view'`, `'category.create'`, `'category.read'`, `'category.update'`, `'category.delete'` string literals and rename to plural equivalents so no consumer is left pointing at the old codes
- [ ] Run `pnpm --filter umkm-pos-api build` and `pnpm --filter umkm-pos-api test` to confirm no breakage
- [ ] If a dev DB is available, run seed (`npx prisma db seed` or documented seed command inside `apps/api`) to verify no runtime errors from the renamed permission codes

## QA / Verify Notes
- Confirm no route now returns 403 for existing demo users (owner/manager/cashier/viewer) that previously had product/category access — permission code renamed, not removed, so role assignments should still resolve via the renamed arrays.
- Confirm `docs/api/api-contract.md` / any RBAC docs mentioning `product.*`/`category.*` codes are updated if they exist.
