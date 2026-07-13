## Ticket: GAN-51
## Agent: backend
## Status: SUCCESS

## Attempt Log
- Attempt 1: PASS

## Acceptance Criteria
- [x] BE-1: CategoriesQueryDto created — Terpenuhi di `apps/api/src/products/categories/dto/categories-query.dto.ts` baris 5
- [x] BE-2: CategoriesController uses DTO and ApiQuery — Terpenuhi di `apps/api/src/products/categories/categories.controller.ts` baris 69-90
- [x] BE-3: CategoriesService queries with OR contains search — Terpenuhi di `apps/api/src/products/categories/categories.service.ts` baris 21-36
- [x] DOC-1: Updated API contracts — Terpenuhi di `docs/api/api-contract.md` baris 127-133

## Quality Gate
- Typecheck: PASS
- Lint: PASS
- Test: PASS (171 tests passed)
- Multi-tenant scope: PASS (all categories endpoints scoped by `merchantId` derived from current user)
- RBAC coverage: PASS (all endpoints decorated with `@RequirePermission()`)

## Files Changed
- apps/api/src/products/categories/dto/categories-query.dto.ts
- apps/api/src/products/categories/categories.controller.ts
- apps/api/src/products/categories/categories.service.ts
- apps/api/src/products/categories/categories.controller.spec.ts
- apps/api/src/products/categories/categories.service.spec.ts
- docs/api/api-contract.md
