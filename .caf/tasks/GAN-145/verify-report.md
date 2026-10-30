# Verify Report GAN-145
Status: SUCCESS

## Changes
- `apps/merchant/src/modules/product-lists/pages/index.vue`: added `Tag` "Stok Menipis" (severity `warn`) in the "Jumlah Stok" cell of the product card, shown only when `isLowStock(product)`. `isLowStock` helper unchanged. `Tag` is auto-imported like in `detail.vue`.

## Evidence
- AC-1: manual — open merchant product list with active outlet; product with stock 5 / min stock 10 (or adjust via "Atur Stok"); badge "Stok Menipis" shows on card. Not run (no browser). Logic: `isLowStock` in `helpers/stock.ts` (`min_stock` > 0 and `stock_qty` <= `min_stock`).
- AC-2: manual — product with stock 50 / min 10; no badge. Not run.
- AC-3: manual — product with min stock 0 and stock 0; no badge. Not run.
- AC-4: manual — adjust stock via "Atur Stok" from low to enough; after list reload badge gone. Not run.
- AC-5: command — pnpm --filter @umkm-pos/merchant run build | exit code 0 (vue-tsc -b + vite build passed; only chunk-size warning)

## Not verifiable
- lint, typecheck, test: no script in `@umkm-pos/merchant`. Not run.
- AC-1..AC-4 need human check (manual, not counted as passed).
