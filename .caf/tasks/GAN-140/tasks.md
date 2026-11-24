# Tasks: GAN-140 — [admin] Dropdown merchant terpotong di 100 entri pertama

## Backend Tasks

- [x] (apps/api) Add `getOptions(search?: string)` method in `apps/api/src/admin/merchants/admin-merchants.service.ts` selecting `{ id: true, name: true, slug: true }`, sorting by `name: 'asc'`, and filtering by `search` when provided.
- [x] (apps/api) Add `@Get('options')` route with `@RequirePermission('merchants.read')` in `apps/api/src/admin/merchants/admin-merchants.controller.ts` positioned before `@Get(':id')`.
- [x] (apps/api) Add unit tests for `getOptions` in `apps/api/src/admin/merchants/admin-merchants.service.spec.ts` covering alphabetical sorting and search filtering.

## Frontend Tasks

- [x] (apps/admin) Add `getMerchantOptions(params?: { search?: string })` in `apps/admin/src/modules/merchants/services/api.ts` calling `/api/v1/admin/merchants/options`.
- [x] (apps/admin) Update `useMerchantOptions` composable in `apps/admin/src/modules/merchants/helpers/composables.ts` to call `getMerchantOptions` and provide debounced `onFilterMerchants` / `fetchMerchantOptions(search?: string)`.
- [x] (apps/admin) Update `apps/admin/src/modules/outlet/pages/index.vue` to bind `@filter="onFilterMerchants"` on the merchant Select filter.
- [x] (apps/admin) Update `apps/admin/src/modules/outlet/pages/create.vue` to bind `@filter="onFilterMerchants"` on the merchant Select input.
- [x] (apps/admin) Update `apps/admin/src/modules/user/pages/index.vue` to bind `@filter="onFilterMerchants"` on the merchant Select filter.
- [x] (apps/admin) Update `apps/admin/src/modules/user/pages/create.vue` to bind `@filter="onFilterMerchants"` on the merchant Select input.

## Verification Tasks

- [x] (apps/api) Run unit tests via `pnpm --filter umkm-pos-api test` to ensure all tests pass.
- [x] (apps/api) Run build check via `pnpm --filter umkm-pos-api build`.
- [x] (apps/admin) Run build check via `pnpm --filter @umkm-pos/admin build`.
