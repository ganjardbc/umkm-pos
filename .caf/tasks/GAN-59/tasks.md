# GAN-59 Tasks

## Order
Backend → QA → Reviewer → PR

## Backend Tasks
- [ ] Read `apps/api/src/merchants/merchants.controller.ts` — confirm guard/
      decorator (`@RequirePermission`, `@Public`) on every route, note if
      `findBySlug` route is meant to be public
- [ ] Fix `findBySlug` in `merchants.service.ts`: add
      `validateMerchantAccess` check when caller is authenticated, OR if
      route must stay public (signup lookup), restrict the returned shape to
      non-sensitive fields only (no internal ids/settings) — pick based on
      controller finding above
- [ ] Re-check `findAll`'s commented-out `isAdmin` branch (line 70): confirm
      with existing tests/usage whether admin-sees-all is expected; if
      ambiguous, leave commented and note in PR description, do not silently
      change behavior
- [ ] Sanity-pass remaining methods (`update`, `remove`, `setImage`,
      `removeImage`) — confirm `validateMerchantAccess`/`findOne` guard stays
      intact, no regression
- [ ] Add/adjust unit tests in `merchants.service.spec.ts` (or create if
      missing) covering: cross-tenant `findBySlug` access denied/restricted,
      `findOne`/`update`/`remove` still reject foreign `merchant_id`
- [ ] Run `pnpm --filter umkm-pos-api lint` and
      `pnpm --filter umkm-pos-api typecheck`

## QA Tasks
- [ ] Run `pnpm --filter umkm-pos-api test` — full pass
- [ ] Manual/API-level check: authenticate as merchant A, attempt
      `findBySlug` for merchant B's slug — verify no full-record leak

## Reviewer Tasks
- [ ] Confirm no route relies on service-level check alone without guard
- [ ] Confirm no `merchant_id`/tenant field added where none needed (this
      table has no `merchant_id` column — scoping is via `validateMerchantAccess`)
- [ ] Confirm PR notes explain `findAll` admin-branch decision if left
      unchanged
