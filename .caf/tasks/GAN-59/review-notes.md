## Review Notes — GAN-59
Ticket: GAN-59
Agent: caf-reviewer
Verdict: APPROVE

### Security Audit
- Core leak fixed: `findBySlug` now runs `validateMerchantAccess(merchant.id, userMerchantId)` before returning full record — matches `findOne`'s established gate exactly. Verified via diff (`merchants.service.ts`, +3/-1) and re-derivation of `validateMerchantAccess` logic (admin bypass, else exact-match-or-403).
- Confirmed no HTTP route wires `findBySlug` today (grep across `apps/api/src` — zero controller callers, zero other callers besides its own spec). So today's live attack surface was already zero; fix hardens it for future wiring. Correctly flagged, not overstated.
- Confirmed all 7 `merchants.controller.ts` routes carry class-level `@UseGuards(PermissionGuard)` + per-route `@RequirePermission`, none `@Public()` — guard-level check present, service-level fix isn't the only line of defense.
- `update`/`remove`/`setImage`/`removeImage` unchanged, still route through `validateMerchantAccess`/`findOne` — no regression introduced.
- No new caller passes old 1-arg `findBySlug` signature anywhere (grep confirmed) — signature change is safe, won't break compile elsewhere.
- `findAll`'s commented-out admin branch left untouched, correctly out of scope (over-restrictive only, not a leak) — matches ticket's explicit instruction not to silently toggle it.

### Qualitative Review
- Diff is minimal and surgical (3 lines), consistent with existing `findOne` convention — no new pattern introduced.
- New `merchants.service.spec.ts` covers the right cases: not-found, cross-tenant forbidden, own-merchant success, admin-bypass success, plus regression guards on `findOne`/`update`/`remove`.
- `rbac.service.spec.ts` diff is a no-op trailing-newline change (`-});` → `+});` line-count noise only) — cosmetic, not a concern, but ideally shouldn't be in this PR's diff. Not blocking.
- `build`/`typecheck` blocked by pre-existing Prisma env issue (missing `url = env("DATABASE_URL")` in schema, confirmed unrelated via empty `git diff` on schema.prisma). Lint clean, targeted + full test suite (191/191) pass. Acceptable substitute gate given root cause is environment, not this change.

### Verdict Rationale
Fix is correct, minimal, matches codebase convention, well-tested, and scope-disciplined (didn't touch `findAll` admin branch or `create`'s global slug-uniqueness check, both correctly identified as out-of-scope/non-issues). QA independently re-verified at service level and full suite. No security gap remains within stated ticket scope.

### For Developer
- Drop the stray `rbac.service.spec.ts` whitespace-only change from this PR before merge (or fold into commit message as "no-op eof fix") — keeps diff scoped to the actual fix.
- `findBySlug` still has no route — if a future ticket wires it up for public signup-lookup, revisit per your own note: swap the `userMerchantId` gate for a field-allowlist projection instead of exposing full record even to authenticated cross-tenant callers.
- Flag the Prisma `DATABASE_URL` schema gap to whoever owns CI/env setup — separate ticket, blocks `build`/`typecheck` for everyone in this sandbox, not just this change.
