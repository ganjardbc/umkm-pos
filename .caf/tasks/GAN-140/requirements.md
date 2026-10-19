# Requirements: GAN-140 — [admin] Dropdown merchant terpotong di 100 entri pertama

## Status: PLAN

## Problem Statement
In `apps/admin`, merchant dropdowns used in forms and filters (Outlet list filter, User list filter, Outlet create form, User create form) are capped at the first 100 merchants.

`useMerchantOptions` in `apps/admin/src/modules/merchants/helpers/composables.ts` calls `getListMerchants({ page: 1, limit: 100 })` once and never loads older or subsequent merchants. Because `GET /api/v1/admin/merchants` orders records by `created_at desc`, older merchants are excluded once the merchant count exceeds 100. Furthermore, `<Select filter>` only filters client-side over the loaded 100 records.

Additionally, `GET /api/v1/admin/merchants` returns heavy full entity payloads with `_count` (`outlets`, `users`) and resolves S3 signed URLs for merchant logos via `attachSignedUrl()`, which is unnecessary overhead for dropdown options requiring only `id`, `name`, and `slug`.

## Scope
- **Backend (`apps/api`)**:
  - Add lightweight options endpoint `GET /api/v1/admin/merchants/options` with optional `search` query parameter.
  - Implement `getOptions(search?: string)` in `AdminMerchantsService` selecting only `id`, `name`, `slug`, ordered by `name: 'asc'`.
  - Add unit test in `admin-merchants.service.spec.ts`.
- **Frontend (`apps/admin`)**:
  - Update `apps/admin/src/modules/merchants/services/api.ts` to add `getMerchantOptions(params?: { search?: string })`.
  - Update `apps/admin/src/modules/merchants/helpers/composables.ts` (`useMerchantOptions`) to fetch from `getMerchantOptions` and support server-side debounced search / `@filter` handling.
  - Integrate `@filter="onFilterMerchants"` in `<Select>` components across:
    - `apps/admin/src/modules/outlet/pages/index.vue`
    - `apps/admin/src/modules/outlet/pages/create.vue`
    - `apps/admin/src/modules/user/pages/index.vue`
    - `apps/admin/src/modules/user/pages/create.vue`

---

## Detailed Requirements

### 1. Backend (`apps/api`)

#### 1.1 Endpoint `GET /api/v1/admin/merchants/options`
- **Location**: `apps/api/src/admin/merchants/admin-merchants.controller.ts`
- **Guards**: `@UseGuards(AdminGuard, PermissionGuard)`, `@RequirePermission('merchants.read')`
- **Route order**: MUST be placed before `@Get(':id')` to avoid NestJS matching `'options'` as an `:id` parameter.
- **Query DTO**: Accept optional `search?: string` query parameter.
- **Response**: Return `{ success: true, data: MerchantOptionDto[] }` where each item contains `{ id: string, name: string, slug: string }`.

#### 1.2 Service `AdminMerchantsService.getOptions`
- **Location**: `apps/api/src/admin/merchants/admin-merchants.service.ts`
- **Query Logic**:
  - Filter: If `search` is provided, filter by `{ OR: [{ name: { contains: search } }, { slug: { contains: search } }] }`.
  - Selection: `select: { id: true, name: true, slug: true }`.
  - Ordering: `orderBy: { name: 'asc' }`.
  - No `_count` aggregation and no `attachSignedUrl` execution.

#### 1.3 Unit Tests
- **Location**: `apps/api/src/admin/merchants/admin-merchants.service.spec.ts`
- Test `getOptions` returning lightweight `{ id, name, slug }` sorted by name ascending.
- Test `getOptions` with search query applying `where: { OR: [...] }`.

---

### 2. Frontend (`apps/admin`)

#### 2.1 API Service
- **Location**: `apps/admin/src/modules/merchants/services/api.ts`
- Export `getMerchantOptions(params?: { search?: string })` calling `GET /api/v1/admin/merchants/options`.

#### 2.2 Composable `useMerchantOptions`
- **Location**: `apps/admin/src/modules/merchants/helpers/composables.ts`
- Replace `getListMerchants({ page: 1, limit: 100 })` with `getMerchantOptions(params)`.
- Support `fetchMerchantOptions(search?: string)` to query options by search term.
- Provide `onFilterMerchants(event: { value: string })` with debouncing (e.g. 300ms) so typing in the dropdown filter queries matching merchants from the backend.
- Maintain `merchantOptions` ref and `loadingMerchants` ref.

#### 2.3 UI Views Integration
- **`apps/admin/src/modules/outlet/pages/index.vue`**:
  - Connect `onFilterMerchants` to `<Select @filter="onFilterMerchants" ... />`.
- **`apps/admin/src/modules/outlet/pages/create.vue`**:
  - Connect `onFilterMerchants` to `<Select @filter="onFilterMerchants" ... />`.
- **`apps/admin/src/modules/user/pages/index.vue`**:
  - Connect `onFilterMerchants` to `<Select @filter="onFilterMerchants" ... />`.
- **`apps/admin/src/modules/user/pages/create.vue`**:
  - Connect `onFilterMerchants` to `<Select @filter="onFilterMerchants" ... />`.

---

## Acceptance Criteria

1. **Checkable Backend Endpoint**:
   - `GET /api/v1/admin/merchants/options` returns status 200 with `{ success: true, data: [{ id, name, slug }] }` sorted by `name asc`.
   - `GET /api/v1/admin/merchants/options?search=foo` returns only merchants matching "foo".
   - Response payload does NOT execute logo signed URL generation or `_count`.

2. **Checkable Unit & Type Tests**:
   - `pnpm --filter umkm-pos-api test` passes including new tests in `admin-merchants.service.spec.ts`.
   - `pnpm --filter umkm-pos-api build` succeeds without type errors.
   - `pnpm --filter @umkm-pos/admin build` succeeds without type errors.

3. **Checkable Dropdown Behavior**:
   - Dropdown options load via the options endpoint on mount.
   - Typing in the filter box of the merchant `Select` triggers debounced server-side search, allowing selection of any merchant in the database regardless of total merchant count.
   - Outlet filter, user filter, outlet creation, and user creation forms all allow selecting any merchant without truncation.
