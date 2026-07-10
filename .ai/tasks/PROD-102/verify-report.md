## Ticket: PROD-102
## Agent: backend
## Status: SUCCESS

## Attempt Log
- Attempt 1: PASS (build + lint fix + test all green)

## Acceptance Criteria (backend scope only)
- [x] Backend `GET /products` accepts `search` query param, filters `products.name` via `contains` — `apps/api/src/products/products.service.ts` line 40
- [x] `search` optional, validated `IsString` — `apps/api/src/products/dto/products-query.dto.ts`
- [x] No schema/migration change needed (BE-3 confirmed, `products.name` already exists)
- [x] `merchant_id` scope unchanged, still from JWT param

Note: FE-1..FE-7 dan DOC-1 di luar scope agent backend, tidak dikerjakan di sini.

## Quality Gate
- Typecheck: PASS (no `typecheck` script in apps/api package.json — verified via `nest build`, clean)
- Lint: PASS (full workspace lint has pre-existing 16k errors from stale compiled `.js`/`.d.ts` build artifacts unrelated to this change; scoped lint on changed files clean after `--fix` for prettier formatting)
- Test: PASS — `npm run test -- products` → 4 suites, 66 tests passed
- Multi-tenant scope: PASS — `merchant_id: merchantId` always from service param, never from query/body
- RBAC coverage: PASS — all routes in `products.controller.ts` have `@RequirePermission`, no `@Public()`
- Raw SQL: none found

## Files Changed
- apps/api/src/products/dto/products-query.dto.ts
- apps/api/src/products/products.service.ts

## Catatan
- Lint config di apps/api lint-check juga scan compiled `.js`/`.d.ts` files (stale build output committed di repo) — pre-existing issue, di luar scope ticket ini, tidak disentuh.
- FE tasks (FE-1..FE-7) dan DOC-1 perlu dikerjakan oleh agent lain (frontend/docs) sesuai scope masing-masing.

---

## Ticket: PROD-102 (frontend + docs)
## Agent: frontend
## Status: SUCCESS

## Attempt Log
- Attempt 1: FAIL — `vue-tsc -b` error TS2698 "Spread types may only be created from object types" di `form.value.category_id` (ref inferred type `null`)
- Attempt 2: PASS — fix dengan explicit type `ref<{ search: string; category_id: string | null }>`

## Acceptance Criteria
- [x] Search keyword filter produk via backend query, bukan client-side — `pages/index.vue` `search()` panggil `fetchProduct()` yang kirim `search` ke `getListProduct()`
- [x] Search debounce 300ms — `searchDebounceTimer` di `pages/index.vue`
- [x] Dropdown filter kategori, opsi dari `getActiveCategories()` — `pages/index.vue` template + `fetchCategories()`
- [x] Pilih kategori filter produk sesuai `category_id` — `onFilterChange()` + payload di `fetchProduct()`
- [x] Search + kategori bisa dipakai bersamaan (AND, query param bareng) — `fetchProduct()` payload spread keduanya
- [x] `onPageChange()` tetap kirim filter aktif — tidak reset `form.value`, `fetchProduct()` selalu baca `form.value` terkini
- [x] Ganti kategori/search reset `pagination.page` ke 1 — di `search()` dan `onFilterChange()`
- [x] Dropdown ada opsi "All Categories" (clear) — `showClear` prop pada `Dropdown`
- [x] DOC-1: `docs/api/api-contract.md` — query params `outlet_id`, `category_id`, `search` ditambahkan di bagian Product Endpoints

## Quality Gate
- Typecheck: PASS (via `vue-tsc -b` dalam `pnpm --filter umkm-pos-app build`)
- Lint: N/A — `apps/web/package.json` tidak punya script `lint`
- Build: PASS — `pnpm --filter umkm-pos-app build`

## Files Changed
- apps/web/src/modules/product-lists/pages/index.vue
- docs/api/api-contract.md

## Catatan
- Tidak restrukturisasi ke Pinia store, tetap pakai local `ref` sesuai constraint requirements.
- Dropdown PrimeVue auto-imported via `unplugin-vue-components` (resolver `PrimeVueResolver`), tidak perlu import manual, konsisten dengan pola `create.vue`.
