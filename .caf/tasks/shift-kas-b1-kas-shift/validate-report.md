## Validate Report — shift-kas-b1-kas-shift
Ticket: shift-kas-b1-kas-shift
Agent: caf-validator
Status: PASS
Unverified: 4 — AC-12, AC-13, AC-14, AC-15

### Acceptance Criteria
| AC | Status | Evidence kind | Evidence |
|----|--------|---------------|----------|
| AC-1 | PASS | automated-test | shifts.service.spec.ts "stores opening_cash when opening a shift" (line 677) exists; api test suite exit 0 (282 passed). |
| AC-2 | PASS | automated-test | shifts.service.spec.ts "rejects invalid opening_cash %p with 400" (line 718) exists; suite passed. |
| AC-3 | PASS | automated-test | shifts.service.spec.ts "rejects missing opening_cash with 400" (line 728); suite passed. |
| AC-4 | PASS | automated-test | shifts.service.spec.ts "closes shift: expected and difference snapshot" (line 770); suite passed. |
| AC-5 | PASS | automated-test | shifts.service.spec.ts "rejects invalid closing_cash %p with 400" (line 737); suite passed. |
| AC-6 | PASS | automated-test | shifts.service.properties.spec.ts "Property: expected cash on close" (line 549, fast-check, mixes cash/qris/pending/cancelled); transactions.service.spec.ts "direct payment sets paid_shift_id..." (line 382); suite passed. |
| AC-7 | PASS | automated-test | transactions.service.spec.ts line 397 asserts paid_shift_id = shift-B and shift_id not changed; suite passed. Expected-cash sum by paid_shift_id is covered by the AC-6 property test. |
| AC-8 | PASS | automated-test | transactions.service.spec.ts line 408 (qris pay leaves paid_shift_id null) plus the AC-6 property test that excludes non-cash from the sum. The tie to "expected cash unchanged" is indirect (two tests together, not one). |
| AC-9 | PASS | automated-test | transactions.service.spec.ts lines 421, 429, 437, 445 (no shift_id, shift not open, non-participant, DTO requires shift_id for cash); suite passed. |
| AC-10 | PASS | automated-test | shifts.service.spec.ts line 770 parametrized (below/equal/above expected), shift stays closed; suite passed. |
| AC-11 | PASS | automated-test | shifts.service.spec.ts "does not change cash when closing an already closed shift" (line 793); suite passed. |
| AC-12 | UNVERIFIED | manual | Manual check on the old shift detail and history pages. Nothing I ran shows the "-" display. |
| AC-13 | UNVERIFIED | manual | Manual UI check, including the API-down case. Not run. |
| AC-14 | UNVERIFIED | manual | Manual UI check of the close form and the cash summary. Not run. |
| AC-15 | UNVERIFIED | manual | Manual UI check of paying a pay-later order in cash. Not run. |
| AC-16 | PASS | command | `pnpm --filter umkm-pos-api run lint:ci` exit 0 (spec APPROVED, accepted form). The spec writes it without `run`; same script. |
| AC-17 | PASS | command | `pnpm --filter umkm-pos-api test` exit 0, 24 suites, 282 tests. |
| AC-18 | PASS | command | `pnpm --filter @umkm-pos/merchant build` exit 0 (only the chunk-size warning). |

### Verification Gate
| Command | Result |
|---------|--------|
| `pnpm --filter umkm-pos-api run lint:ci` | 0 |
| `pnpm --filter umkm-pos-api run test` | 0 |
| `pnpm --filter umkm-pos-api run build` | 0 |
| `pnpm --filter @umkm-pos/merchant run build` | 0 |

### Verification Gate Gaps
- apps/api: no typecheck script (build is the type gate).
- apps/merchant: no lint:ci or lint script, no typecheck script, no test script.

### Notes
- The migration `apps/api/prisma/migrations/add_shift_cash_columns.sql` was not run against a database by the implementer, and I did not run it either. Run it locally before deploy (verify-report.md T-1 gap).
- The tests mock `@prisma/client`, so the cash math uses Number rounded to cents rather than Prisma.Decimal. The Decimal JSON shape (string or number) is unconfirmed.
- The `currentShift.id` can be '' in the UI, so a cash payment then fails with 400 and the UI does not guard it (from verify-report.md; I did not check the code).
- Proposed Spec Changes: none.
