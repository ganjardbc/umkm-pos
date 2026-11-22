## Validate Report — shift-kas-b3-kas-masuk-keluar
Ticket: shift-kas-b3-kas-masuk-keluar
Agent: caf-validator
Status: PASS
Unverified: 3 — AC-4, AC-11, AC-12

### Acceptance Criteria
| AC | Status | Evidence kind | Evidence |
|----|--------|---------------|----------|
| AC-1 | PASS | automated-test | `shifts.service.spec.ts:896` "AC-1 records in/out entry for active participant" exists; api `test` passed (25 suites, 319 tests). |
| AC-2 | PASS | automated-test | `shifts.service.spec.ts:928,933` DTO validation cases via ValidationPipe and AddCashEntryDto; passed. |
| AC-3 | PASS | automated-test | `shifts.service.spec.ts:938` closed shift rejected; passed. |
| AC-4 | UNVERIFIED | automated-test | `shifts.service.spec.ts:946` covers the non-participant 403 and passed. The "no `shift.update` permission" half is enforced only by `@RequirePermission` on the controller, with no test (verify-report says so too). |
| AC-5 | PASS | automated-test | `shifts.service.properties.spec.ts:623` property test for the expected cash formula with cash in/out; passed. |
| AC-6 | PASS | automated-test | `shifts.service.spec.ts:1032`; passed. |
| AC-7 | PASS | automated-test | `shifts.service.spec.ts:954`; passed. |
| AC-8 | PASS | automated-test | `shifts.service.spec.ts:962` 404 for another merchant; passed. Only the record path was seen; the read path was not checked separately. |
| AC-9 | PASS | automated-test | `shifts.service.spec.ts:974`; passed. The mock cannot roll back, so the test asserts both writes sit in one `$transaction` callback and the failure propagates. |
| AC-10 | PASS | automated-test | `shifts.service.spec.ts:1007,1024`; passed. |
| AC-11 | UNVERIFIED | manual | Manual check only; nothing I ran shows the behavior. Merchant build passes (build-only). |
| AC-12 | UNVERIFIED | manual | Manual check only; not run. |
| AC-13 | PASS | command | `pnpm --filter umkm-pos-api run lint:ci` exit 0. See Notes on the spec status. |
| AC-14 | PASS | command | `pnpm --filter umkm-pos-api run test` passed (319 tests); the exit code shown by the pipe was empty, and the output ends "Test Suites: 25 passed". |
| AC-15 | PASS | command | `pnpm --filter @umkm-pos/merchant run build` exit 0. |

### Verification Gate
| Command | Result |
|---------|--------|
| `pnpm --filter umkm-pos-api run lint:ci` | exit 0 |
| `pnpm --filter umkm-pos-api run test` | 25 suites, 319 tests passed (exit code not captured through the pipe) |
| `pnpm --filter umkm-pos-api run build` | exit 0 |
| `pnpm --filter @umkm-pos/merchant run build` | exit 0 |

### Verification Gate Gaps
- apps/merchant: no `lint:ci`/`lint` script, no `typecheck` script (build runs `vue-tsc -b`), no `test` script.
- apps/api: no `typecheck` script (`build` is the type gate).

### Notes
- `requirements.md` is `Status: DRAFT`, so I did not run its `Verify: command:` lines as written. AC-13, AC-14 and AC-15 are judged from the same commands, which are also on the Verify Checklist and which I ran.
- Not checked: the migration against the local DB (applied by the main thread) and docs T-13. Only the diff status shows `docs/*` modified.
- Race between entry and close is not mitigated (verify-report notes, design.md).
- Proposed Spec Changes: `requirements.md` is still DRAFT even though the answers to Q-1..Q-5 were approved. A human should set it to APPROVED.
