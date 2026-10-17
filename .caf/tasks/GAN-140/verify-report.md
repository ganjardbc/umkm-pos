# Verification Report: GAN-140 — [admin] Dropdown merchant terpotong di 100 entri pertama

**Status: SUCCESS**

## Summary
Implemented lightweight options endpoint `GET /api/v1/admin/merchants/options` for admin merchant dropdowns with optional `search` filtering and alphabetical ordering by merchant name.

## Implemented Changes
- Added `getOptions(search?: string)` method in `apps/api/src/admin/merchants/admin-merchants.service.ts` selecting `{ id: true, name: true, slug: true }`, sorting by `name: 'asc'`, and applying `OR: [{ name: { contains: search } }, { slug: { contains: search } }]` filter when search term is provided.
- Added `@Get('options')` endpoint in `apps/api/src/admin/merchants/admin-merchants.controller.ts` protected by `@RequirePermission('merchants.read')` and positioned before `@Get(':id')`.
- Added unit tests in `apps/api/src/admin/merchants/admin-merchants.service.spec.ts` covering alphabetical sorting and search filtering behavior.

## Verification Checklist

### apps/api
- [x] `pnpm --filter umkm-pos-api run lint:ci` (Passed with 0 warnings/errors)
- [-] `typecheck` (Gap: no `typecheck` script — `build` is the type gate)
- [x] `pnpm --filter umkm-pos-api run test` (All 24 suites, 261 tests passed)
- [x] `pnpm --filter umkm-pos-api run build` (Nest build succeeded with 0 errors)
