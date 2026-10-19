## QA Report — GAN-140
Ticket: GAN-140
Agent: caf-qa
Status: PASS

### Verification Matrix
| # | Acceptance Criteria (requirements.md) | How Verified | Result |
|---|---------------------------------------|--------------|--------|
| 1 | Checkable Backend Endpoint: `GET /api/v1/admin/merchants/options` returns status 200 with `{ success: true, data: [{ id, name, slug }] }` sorted by `name asc`, supports `?search=foo` filtering, and does not execute signed URL generation or `_count`. | Code inspection of `apps/api/src/admin/merchants/admin-merchants.controller.ts:53-67` and `apps/api/src/admin/merchants/admin-merchants.service.ts:68-88` verifying endpoint route ordering, permissions, selective querying (`id`, `name`, `slug`), `orderBy: { name: 'asc' }`, search `where: { OR: [...] }`, and lack of `_count` / `attachSignedUrl`. Unit tests in `apps/api/src/admin/merchants/admin-merchants.service.spec.ts:61-92` executed via `pnpm --filter umkm-pos-api test admin-merchants.service.spec.ts`. | PASS |
| 2 | Checkable Unit & Type Tests: `pnpm --filter umkm-pos-api test` passes including new tests in `admin-merchants.service.spec.ts`, and `pnpm --filter umkm-pos-api build` / `pnpm --filter @umkm-pos/admin build` succeed without type errors. | Ran `pnpm --filter umkm-pos-api run lint:ci` (passed with 0 warnings/errors), `pnpm --filter umkm-pos-api run test` (24 suites, 261 tests passed), `pnpm --filter umkm-pos-api run build` (build succeeded), and `pnpm --filter @umkm-pos/admin run build` (`vue-tsc -b` and vite build succeeded). | PASS |
| 3 | Checkable Dropdown Behavior: Dropdown options load via the options endpoint on mount. Typing in the filter box of the merchant `Select` triggers debounced server-side search, allowing selection of any merchant without truncation across Outlet filter, user filter, outlet creation, and user creation forms. | Code inspection (Vue apps have no test script — UI verified via code review): `apps/admin/src/modules/merchants/services/api.ts:10-15` exposes `getMerchantOptions`, `apps/admin/src/modules/merchants/helpers/composables.ts:15-47` provides debounced (300ms) `onFilterMerchants` and `fetchMerchantOptions`, and `@filter="onFilterMerchants"` is bound on merchant `<Select>` in `apps/admin/src/modules/outlet/pages/index.vue:24`, `apps/admin/src/modules/outlet/pages/create.vue:27`, `apps/admin/src/modules/user/pages/index.vue:24`, and `apps/admin/src/modules/user/pages/create.vue:27`. | PASS |

### Findings
None

### Notes
- Vue apps (`apps/admin`, `apps/merchant`) do not define lint or unit test scripts; UI acceptance criteria and bindings were validated via static code inspection and TypeScript type-checking (`vue-tsc -b` in build script).
- No application code was modified during QA verification.
