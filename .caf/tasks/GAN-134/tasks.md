# Tasks: GAN-134 - Fix: Cashier product picker search does nothing (stub function)

## Frontend Tasks
- [x] (apps/web) In `apps/web/src/modules/transaction/components/Product.vue`, update `fetchProduct()` payload to include `...(form.value.search && { search: form.value.search })`.
- [x] (apps/web) In `apps/web/src/modules/transaction/components/Product.vue`, replace `search()` stub with a debounced search implementation (300ms timer) resetting `pagination.value.page = 1` and triggering `fetchProduct()`, matching `apps/web/src/modules/product-lists/pages/index.vue`.
- [x] (apps/web) Verify frontend builds cleanly with `pnpm --filter umkm-pos-app build` / typecheck.

## Backend Tasks
*(None required - backend already supports `search` parameter on `GET /api/v1/products`)*
