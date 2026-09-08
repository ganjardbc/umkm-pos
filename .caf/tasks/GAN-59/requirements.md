# GAN-59: [CONVENTION] Potensi Query Belum Merchant-Scoped

## Status: PLAN

## Source
Auditor Agent scan 2026-07-18, `.ai/audits/2026-07-18/audit-report.md`

## Location
`apps/api/src/merchants/merchants.service.ts`

## Problem
Potential cross-tenant data leakage — some queries in `MerchantsService` don't
scope/validate against caller's `merchant_id`.

## Findings (from code read)
- `findBySlug(slug)` — no access check at all. Any authenticated (or public,
  depending on route `@Public()` status) caller can fetch ANY merchant's full
  record by guessing/enumerating slug. No `validateMerchantAccess` call.
- `findAll(pagination, userMerchantId)` — `isAdmin` check is commented out
  (line 70), so admin-sees-all-merchants behavior intended but currently
  disabled. Not itself a leak (over-restrictive, not under-restrictive), but
  dead/misleading code — confirm intended behavior with ticket scope (leak
  fix only, not feature restore) before touching.
- `create(dto)` — slug-uniqueness check queries `merchants` table globally
  (expected: `merchants` is the tenant-root table itself, no parent
  `merchant_id` to scope by — this is correct as-is).
- `update`, `remove`, `setImage`, `removeImage` — all call
  `validateMerchantAccess` / `findOne` before mutating. These look correctly
  scoped already.
- `merchants` table has no `merchant_id` column (it IS the tenant). "Scope by
  merchant_id" for this file specifically means: gate every read/write by
  `validateMerchantAccess(targetId, userMerchantId)`, not add a `where:
  {merchant_id}` clause literally.

## Impact
Cross-tenant data leakage via `findBySlug` (confirmed gap). Other methods
already gated — verify no route bypasses guard/decorator during backend work.

## Proposal
Scope/validate every method against caller's merchant. Specifically:
- Add access validation to `findBySlug` (or confirm route is intentionally
  `@Public()` for signup-lookup flow — if so, restrict returned fields to
  non-sensitive ones instead of full record).
- Confirm `findAll`'s commented-out admin branch is intentional; leave as-is
  unless ticket scope says otherwise (do not silently re-enable — flag to
  human if ambiguous, but don't block whole ticket on it).
- Check the controller (`merchants.controller.ts`) for guard/decorator
  wiring (`@RequirePermission`, `@Public`) on each route, since service-level
  checks alone don't matter if guard is missing/misconfigured.

## Open Questions
None — ticket is self-contained (single small backend service file). No
discovery draft; ticket description used as-is.
