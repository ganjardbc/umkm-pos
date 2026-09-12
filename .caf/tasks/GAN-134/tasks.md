# Tasks: GAN-134 - Fix: Cashier product picker search does nothing (stub function)

## Frontend Tasks
- [x] (apps/web) Add `search` parameter `...(form.value.search && { search: form.value.search })` to `getListProduct` payload in `fetchProduct` in `apps/web/src/modules/transaction/components/Product.vue`
- [x] (apps/web) Replace stub `search()` function in `apps/web/src/modules/transaction/components/Product.vue` with 300ms debounced search that sets `pagination.value.page = 1` and calls `fetchProduct()`
- [x] (apps/web) Verify type checking and production build for `apps/web` (`pnpm --filter umkm-pos-app build`)

## Backend Tasks
(None - frontend only change)
