# GAN-59 Backend Verify Report

Status: SUCCESS

## Summary
Fixed cross-tenant leak in `MerchantsService.findBySlug` — it did no access
check at all, letting any caller with a valid slug fetch another merchant's
full record. No controller route currently exposes `findBySlug` over HTTP
(grep confirmed zero callers besides the service method itself), so there
was no live HTTP leak today, but the method was unsafe dead code that could
be wired up later without a guard. Fixed at the service layer to match the
existing `findOne` pattern.

## Findings

### Controller guard/decorator audit (`merchants.controller.ts`)
- All 7 routes (`create`, `findAll`, `findOne`, `update`, `remove`,
  `setImage`, `removeImage`) are behind `@UseGuards(PermissionGuard)` at
  class level + a `@RequirePermission(...)` decorator per route. None are
  `@Public()`.
- `findBySlug` has **no route** in the controller — it is not called from
  anywhere in `src/` (confirmed via grep). It is unused/dead code today.

### Fix applied — `merchants.service.ts`
- `findBySlug(slug: string)` → `findBySlug(slug: string, userMerchantId: string)`.
  Now calls `validateMerchantAccess(merchant.id, userMerchantId)` after the
  slug lookup, mirroring `findOne`'s pattern (admin-merchant callers pass,
  everyone else is restricted to their own merchant — `ForbiddenException`
  otherwise). No caller exists yet, so this only hardens the method for
  future use; if/when a route is added for signup-lookup style public
  access, the `userMerchantId` gate should be swapped for a field-allowlist
  projection instead (documented inline via this report — flagging for
  human/product decision, not implemented since no route exists to decide
  the public-vs-authenticated shape for).

### `findAll`'s commented-out `isAdmin` branch (line ~70)
- Left unchanged per ticket scope (leak fix only, not feature restore).
  Current behavior: `where = { id: userMerchantId }` always — over-restrictive
  (admin-merchant users don't see all merchants despite `isAdminUser` helper
  existing and being used elsewhere in the file), never under-restrictive.
  Not a leak. **Flagging for human decision**: re-enabling the admin branch
  is a behavior change outside this ticket's leak-fix scope — do not silently
  toggle it in this PR.

### Sanity pass — `update`, `remove`, `setImage`, `removeImage`
- All still gate through `validateMerchantAccess` (directly or via `findOne`)
  before mutating. No regression, no changes needed.

## Tests
Added `apps/api/src/merchants/merchants.service.spec.ts` (new file) covering:
- `findBySlug`: not-found, cross-tenant forbidden, own-merchant success,
  admin-merchant-caller success (bypass).
- `findOne`, `update`, `remove`: foreign `merchant_id` still rejected
  (regression guard for existing behavior).

## Verify Checklist (apps/api)
- [x] `pnpm --filter umkm-pos-api run lint` — clean, no errors
- [x] `pnpm --filter umkm-pos-api run test -- merchants` — 7/7 passed
- [ ] `pnpm --filter umkm-pos-api run build` — **blocked, pre-existing
      environment issue, unrelated to this change**: `prisma generate` fails
      in this sandbox because `apps/api/prisma/schema.prisma`'s `datasource db`
      block has no `url = env("DATABASE_URL")` line (confirmed via grep — 0
      matches for `url` in the whole schema file, and this is unchanged in
      git HEAD, not something introduced here). No `.env` file present
      either (only `.env.example`). Without a generated Prisma Client, `nest
      build` fails with `TS2339: Property 'X' does not exist on type
      'PrismaService'` across many unrelated services (shifts, stock, etc.),
      not just `merchants`. Confirmed this is not caused by my edit: `git
      diff` on `schema.prisma` is empty, and the same failure reproduces
      with a dummy `DATABASE_URL` env var supplied to `prisma generate`.
      Flagging as NEEDS_HUMAN follow-up for repo/CI environment setup
      (separate from this ticket's scope) — lint and targeted unit tests for
      the changed file both pass cleanly.
- [ ] typecheck — no dedicated script in `apps/api/package.json`; `tsc
      --noEmit` blocked by the same missing Prisma Client issue above.

## Files changed
- `apps/api/src/merchants/merchants.service.ts`
- `apps/api/src/merchants/merchants.service.spec.ts` (new)
