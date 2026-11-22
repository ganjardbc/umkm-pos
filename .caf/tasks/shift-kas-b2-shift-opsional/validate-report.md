## Validate Report — shift-kas-b2-shift-opsional
Ticket: shift-kas-b2-shift-opsional
Agent: caf-validator
Status: PASS
Unverified: 7 — AC-11, AC-12, AC-13, AC-14, AC-15, AC-20, AC-18

### Acceptance Criteria
| AC | Status | Evidence kind | Evidence |
|----|--------|---------------|----------|
| AC-1 | PASS | automated-test | outlets.service.spec.ts:112 exists; api test suite exit 0 (25 suites, 299 tests). Caveat: test only checks pass-through; default comes from the SQL column DEFAULT 1 (not applied/run by me). |
| AC-2 | PASS | automated-test | outlets.service.spec.ts:124; suite passed. |
| AC-3 | PASS | automated-test | outlets.controller.spec.ts:60; suite passed. |
| AC-4 | PASS | automated-test | outlets.service.spec.ts:157; suite passed. |
| AC-5 | PASS | automated-test | transactions.service.spec.ts:453, :473; suite passed. |
| AC-6 | PASS | automated-test | transactions.service.spec.ts:483; suite passed. |
| AC-7 | PASS | automated-test | transactions.service.spec.ts:503; suite passed. |
| AC-8 | PASS | automated-test | customer-catalog.service.spec.ts:54; suite passed. |
| AC-9 | PASS | automated-test | customer-catalog.service.spec.ts:68; suite passed. |
| AC-10 | PASS | automated-test | customer-catalog.service.spec.ts:81; suite passed. |
| AC-11 | UNVERIFIED | manual | Manual evidence only; nothing I ran shows POS behavior. |
| AC-12 | UNVERIFIED | manual | Manual; not run. |
| AC-13 | UNVERIFIED | manual | Manual; not run. |
| AC-14 | UNVERIFIED | manual | Full AC is manual. Backend part (shift_id ignored, stored null) is covered by the transactions test at :473, but attach-to-new-shift behavior is not shown. |
| AC-15 | UNVERIFIED | manual | Manual; not run. |
| AC-16 | PASS | command | `pnpm --filter umkm-pos-api run lint:ci` exit 0. |
| AC-17 | PASS | command | `pnpm --filter umkm-pos-api run test` exit 0, 25 suites, 299 tests. |
| AC-18 | PASS | command | `pnpm --filter @umkm-pos/merchant run build` exit 0. (Spec form is `pnpm --filter @umkm-pos/merchant build`; I ran the equivalent `run build` from the checklist.) |
| AC-19 | PASS | automated-test | shifts.service.spec.ts:175 exists; suite passed. |
| AC-20 | UNVERIFIED | manual | Manual; backend rejection is covered by AC-19 only. |

### Verification Gate
| Command | Result |
|---------|--------|
| `pnpm --filter umkm-pos-api run lint:ci` | 0 |
| `pnpm --filter umkm-pos-api run test` | 0 |
| `pnpm --filter umkm-pos-api run build` | 0 |
| `pnpm --filter @umkm-pos/merchant run build` | 0 |

### Verification Gate Gaps
- apps/api: no `typecheck` script (build is the type gate).
- apps/merchant: no `lint:ci`/`lint`, no `typecheck`, no `test` script.

### Notes
- AC-18 is listed PASS in the table (I ran it, exit 0); the Unverified line above wrongly includes it. Correct count: 6 — AC-11, AC-12, AC-13, AC-14, AC-15, AC-20.
- The migration `apps/api/prisma/migrations/add_outlets_shift_required.sql` is not applied; I did not touch any DB.
- verify-report deviation to confirm: `PayTransactionDto.shift_id` is now optional (changes the PATCH /transactions/:id/pay contract); `createOrder` now returns 404 for an inactive outlet before the shift check.
- AC-4 race is accepted per design; the test covers the sequential case only.
- Proposed Spec Changes: none.
