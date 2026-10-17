## Review Notes — GAN-140
Ticket: GAN-140
Agent: caf-reviewer
Verdict: APPROVE

### Security Audit
None. The new endpoint `GET /api/v1/admin/merchants/options` is protected by `AdminGuard` and `@RequirePermission('merchants.read')`, properly restricting access to authorized platform administrators. The optional `search` parameter is safely parameterized by Prisma ORM without SQL injection risk.

### Qualitative Review
- **Backend (`apps/api`)**:
  - Implemented lightweight `getOptions(search?: string)` in `AdminMerchantsService` selecting only `{ id, name, slug }`, eliminating heavy `_count` aggregation and S3 signed URL generation.
  - Added `@Get('options')` in `AdminMerchantsController` positioned correctly before `@Get(':id')` to prevent parameter collision.
  - Unit tests in `admin-merchants.service.spec.ts` comprehensively cover alphabetical sorting (`name: 'asc'`) and search filtering.
- **Frontend (`apps/admin`)**:
  - Encapsulated dropdown retrieval and server-side debounced search (`300ms`) in `useMerchantOptions` composable.
  - Bound `@filter="onFilterMerchants"` on PrimeVue `<Select>` components across all four affected admin views (`outlet/index.vue`, `outlet/create.vue`, `user/index.vue`, `user/create.vue`).
  - Clean separation of concerns with HTTP calls isolated in `modules/merchants/services/api.ts`.
- **Quality Gates**:
  - `pnpm --filter umkm-pos-api run lint:ci` passed with 0 warnings/errors.
  - `pnpm --filter umkm-pos-api test` passed all 24 suites (261 tests).
  - `pnpm --filter umkm-pos-api build` and `pnpm --filter @umkm-pos/admin build` built cleanly without type or bundling errors.

### Verdict Rationale
The implementation completely resolves the 100-merchant truncation bug with a well-designed lightweight options endpoint and debounced server-side search. All acceptance criteria and architecture rules have been verified and satisfied.

### For Developer
No further action required. The change is verified and approved.
