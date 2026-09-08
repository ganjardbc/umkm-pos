# GAN-55 QA Report

## Status: NEEDS_HUMAN

## Checked against
`.caf/tasks/GAN-55/tasks.md`, `requirements.md`, `verify-report.md`.

## Re-verification (session 2026-09-08)

### Backend (apps/api) — OK
- Grep repo: no remaining `'product.create'/'product.read'/'product.update'/'product.delete'/'product.view'` or `'category.create'/'category.read'/'category.update'/'category.delete'` literals in `apps/api/src`, `apps/api/test`, `apps/api/prisma`. Only false-positive hit: `example: 'product.jpg'` in `uploads/dto/upload-response.dto.ts` (unrelated, a filename example, not a permission code).
- `prisma/seed.ts` `permissionsData` confirmed using `products.create` etc.
- Matches verify-report.md claims. No regression since last QA pass.

### Frontend (apps/web) — STILL FAIL, task 8 not done
Old singular codes still present (unchanged since prior QA pass):
- `apps/web/src/modules/product-lists/services/rbac.ts`:
  ```
  READ = 'product.read'
  CREATE = 'product.create'
  DELETE = 'product.delete'
  UPDATE = 'product.update'
  ```
- `apps/web/src/modules/product-categories/services/rbac.ts`:
  ```
  READ = 'category.read'
  CREATE = 'category.create'
  DELETE = 'category.delete'
  UPDATE = 'category.update'
  ```

Backend now issues/checks `products.*`/`categories.*` codes; frontend route guards / `isHasPermission()` still request old singular codes → permission mismatch. UI will incorrectly gate product/category features (buttons hidden, routes blocked) for all roles. Fails tasks.md line 8 acceptance criterion ("no consumer left pointing at old codes") and requirements.md scope item "Any other backend/frontend reference to the old singular codes ... do not break existing access."

No frontend agent pass has landed since the previous QA report flagged this exact gap — no progress made.

### Docs — OK
- `docs/api/api-contract.md` — no permission-code refs.
- `docs/decisions/_archive-kiro-reports/FRONTEND_CATEGORY_IMPLEMENTATION.md` — still has old `category.*` codes, correctly left untouched (archived historical doc, not live).

## Verdict
Ticket not done. Blocking issue unchanged from prior QA pass: rename `product.*`→`products.*` and `category.*`→`categories.*` in:
- `apps/web/src/modules/product-lists/services/rbac.ts`
- `apps/web/src/modules/product-categories/services/rbac.ts`

Also grep `apps/web` for any other consumers of these constants that may hardcode the literal strings separately.

Stopping pipeline per orchestrator rule — needs human/dev to route back to implementation for apps/web fix, then re-run QA.
