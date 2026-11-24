# Verify Report GAN-144
Status: SUCCESS

## Changes
- `apps/merchant/src/modules/product-lists/pages/index.vue` (only file changed): the empty-state block now shows the text "Belum ada produk" (trailing period removed) and a `Button` "Tambah Produk". The button calls `addProduct` and is `:disabled="!isCanCreate"`, the same as the toolbar button. The `loading` condition and the list layout are unchanged.

## Evidence
- AC-1: manual — open the Produk tab with a merchant that has no products. After loading ends, "Belum ada produk" shows. Not run in a browser; code is in the `v-else-if="products.length === 0"` block.
- AC-2: manual — same steps. A "Tambah Produk" button shows inside the empty-state area, in addition to the toolbar button.
- AC-3: manual — click the empty-state button as a user with the CREATE permission. The URL should become `/product/product-lists/create` and the add form should show. The button reuses the existing `addProduct`.
- AC-4: manual — open the Produk tab with a merchant that has products. The empty state must be absent. The block is guarded by `v-else-if="products.length === 0"`.
- AC-5: manual — throttle the network. Only "Memuat produk..." shows before the response. The empty state sits behind `v-if="loading"` in the same `v-if` chain.
- AC-6: command — `pnpm typecheck` | exit 0 (turbo, 2 tasks successful; it covers shared-types and ui only, not merchant). `pnpm --filter @umkm-pos/merchant run build` (runs `vue-tsc -b && vite build`) also exit 0.
- AC-7: command — `pnpm lint` | exit 0. Only `umkm-pos-api` has a lint script; merchant has none, so the change is not verifiable by lint — no script. The api `lint` script runs `eslint --fix`, but the working tree showed no extra modified files afterwards.
- AC-8: command — `pnpm test` | exit 0. Only `umkm-pos-api` tests ran; merchant has no test script or runner, so the change is not verifiable by tests — no script.

## Notes
- `node_modules` was missing. I ran `CI=true NODE_ENV=development pnpm install --frozen-lockfile --prod=false`, which did not change the lockfile. `git status` shows only the one source file changed, plus `.caf/tasks/GAN-144/`.
- AC-1 to AC-5 are manual. They are not counted as passed and need a human check.
- Assumptions A-1 and A-2 were followed: the empty state also shows when search or filter returns 0 products, and the button is disabled without the CREATE permission.
