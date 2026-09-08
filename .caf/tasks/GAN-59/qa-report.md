# GAN-59 QA Report

Status: SUCCESS

## Checks performed

### 1. `pnpm --filter umkm-pos-api test` — full suite
Ran full suite (not just `merchants` filter used in verify-report):
```
Test Suites: 15 passed, 15 total
Tests:       191 passed, 191 total
```
Full pass, no regressions.

### 2. Manual/API-level cross-tenant check on `findBySlug`
Grepped `apps/api/src` for `findBySlug` usage: only definition in
`merchants.service.ts`, no controller route wires it up. Confirmed via
`merchants.controller.ts` read — 7 routes exist (`create`, `findAll`,
`findOne`, `update`, `remove`, `setImage`, `removeImage`), all gated by
class-level `@UseGuards(PermissionGuard)` + per-route `@RequirePermission`,
none `@Public()`. `findBySlug` has no HTTP route today, so a live
merchant-A-vs-merchant-B HTTP request test isn't possible/applicable.

Service-level equivalent verified instead (unit test in
`merchants.service.spec.ts`, re-read and confirmed correct):
- `findBySlug('other-merchant', ownMerchantId)` → `ForbiddenException`
  (cross-tenant denied) ✓
- `findBySlug('own-merchant', ownMerchantId)` → returns record ✓
- `findBySlug('other-merchant', adminMerchantId)` → returns record (admin
  bypass, matches `findOne`'s existing pattern) ✓
- not-found slug → `NotFoundException` ✓

Fix mirrors `findOne`'s established `validateMerchantAccess` gate exactly —
consistent with codebase convention, no new pattern introduced.

### Code review (service + controller)
- `findBySlug` (line 109-121): now takes `userMerchantId`, calls
  `validateMerchantAccess` after slug lookup, before returning — correct
  order (404 before 403 leak of existence... actually reveals existence via
  404 either way, acceptable, matches `findOne`).
- `findAll`, `update`, `remove`, `setImage`, `removeImage`: unchanged,
  still gated. No regression.
- `findAll`'s commented `isAdmin` branch (line 70): untouched, correctly
  left out-of-scope per ticket.

## Result
- Full test suite: PASS (191/191)
- Cross-tenant leak fix: verified correct at service layer (no route exists
  to test at HTTP layer — flagged already in verify-report, not a blocker)
- No regressions in `update`/`remove`/`findOne` foreign-merchant rejection

## Note carried forward for Reviewer/human
- `findAll` admin-branch decision still open (per verify-report, ticket
  scope excludes it) — reviewer should confirm PR notes explain this.
- `build`/`typecheck` blocked by pre-existing Prisma env issue, unrelated to
  this change (documented in verify-report) — lint + full test suite both
  pass, treated as sufficient QA gate here.
