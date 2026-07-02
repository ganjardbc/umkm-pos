## Ticket: PROD-101
## Agent: frontend
## Status: SUCCESS

## Attempt Log
- Attempt 1: PASS

## Acceptance Criteria
- [x] Kolom Qty di halaman list cuma warning kalau stok <= min stock — `pages/index.vue` Qty column pakai `isLowStock(slotProps.data)` guard.
- [x] Halaman detail produk kasih tanda "Low Stock" — `pages/detail.vue` Tag `severity="warn"` muncul di field Stock Quantity, gated `v-if="isLowStock(productDetail)"`.
- [x] Produk stok aman gak nampilin warning — `isLowStock` require `min_stock > 0 && stock_qty <= min_stock`, false → no class/no Tag.

## Quality Gate
- Typecheck: PASS (via `pnpm --filter umkm-pos-app build` → `vue-tsc -b`)
- Lint: PASS (no new violations; 1 pre-existing unrelated Tailwind class-canonical warning on index.vue baris 15, tidak disentuh task ini)
- Build: PASS

## Files Changed
- apps/web/src/modules/product-lists/helpers/stock.ts (baru — shared `isLowStock` helper, dipakai index.vue & detail.vue biar gak duplicate, FE-3)
- apps/web/src/modules/product-lists/pages/index.vue (Qty col pakai isLowStock + text-orange-600; Min Stock col drop bogus primary-color binding)
- apps/web/src/modules/product-lists/pages/detail.vue (tambah Tag "Low Stock" severity=warn di field Stock Quantity)

## Catatan
Tidak ada deviasi dari plan. `min_stock` column jadi plain text (default), sesuai AC no.3 — tidak ikutan warning.
