# Verify report: shift-kas-b3-kas-masuk-keluar (backend T-1..T-7)
Status: SUCCESS

Scope: apps/api only. Frontend (T-8..T-12), docs (T-13), manual (T-14, T-15) not done. The SQL migration is written but NOT applied to any database.

Commands run: `pnpm --filter umkm-pos-api exec prisma generate` (ok), `lint:ci` (exit 0), `test` (25 suites, 319 tests passed), `build` (ok).

## Evidence per AC
- AC-1: automated-test — apps/api/src/shifts/shifts.service.spec.ts::cash entries (kas masuk/keluar) AC-1 records in/out entry for active participant
- AC-2: automated-test — shifts.service.spec.ts::AC-2 rejects invalid amount/reason via DTO (9 cases), AC-2 accepts valid body and trims reason
- AC-3: automated-test — shifts.service.spec.ts::AC-3 rejects closed shift
- AC-4: automated-test — shifts.service.spec.ts::AC-4 rejects non-participant (403, no create). Missing `shift.update` permission is enforced by `@RequirePermission` on the controller route; not unit-tested.
- AC-5: automated-test — shifts.service.properties.spec.ts::Property: expected cash with cash in/out
- AC-6: automated-test — shifts.service.spec.ts::AC-6 closeShift without entries equals B-1 expected/difference
- AC-7: automated-test — shifts.service.spec.ts::AC-7 rejects when shift_required is false
- AC-8: automated-test — shifts.service.spec.ts::AC-8 404 for shift of other merchant
- AC-9: automated-test — shifts.service.spec.ts::AC-9 entry and audit log created in one $transaction; no entry when audit write fails (mock cannot roll back; asserts both writes run inside one $transaction callback and the failure propagates)
- AC-10: automated-test — shifts.service.spec.ts::AC-10 getShift returns cash_entries and totals; AC-10 getShift returns 0 and [] when no entries
- AC-11: none — frontend, out of this run's scope (T-8..T-10, T-14)
- AC-12: none — frontend, out of this run's scope (T-11, T-15)
- AC-13: command — pnpm --filter umkm-pos-api run lint:ci | exit 0
- AC-14: command — pnpm --filter umkm-pos-api run test | exit 0 (319 passed)
- AC-15: none — frontend build not run (T-12, out of scope)

## Files changed
apps/api/prisma/schema.prisma; apps/api/prisma/migrations/add_shift_cash_entries.sql (new); apps/api/src/shifts/dto/add-cash-entry.dto.ts (new); apps/api/src/shifts/shifts.service.ts; apps/api/src/shifts/shifts.controller.ts; apps/api/src/shifts/shifts.service.spec.ts; apps/api/src/shifts/shifts.service.properties.spec.ts

## Notes
- Main thread must run add_shift_cash_entries.sql before deploying the API.
- Race noted in design.md (entry vs close) not mitigated; status is read outside the entry $transaction.

---

# Frontend section (apps/merchant, T-8..T-12)
Status: SUCCESS (build gate only; manual ACs NOT VERIFIED)

Command run: `pnpm --filter @umkm-pos/merchant build` | exit code 0 (vue-tsc -b then vite build; only the existing chunk-size warning).
No lint/typecheck/test script exists for apps/merchant: not verifiable.

## Evidence per AC (frontend)
- AC-11: NOT VERIFIED (manual) — implemented (T-8..T-10) but not run in a browser. Steps: open shift, catat masuk dan keluar, stop API and retry (error shown, inputs kept), close shift and turn off outlet setting, check "Catat Kas" button is hidden.
- AC-12: NOT VERIFIED (manual) — implemented (T-11) but not run. Steps: record entries, close shift, compare summary with AC-5 formula; expected cash must stay "-" before closing cash is sent.
- AC-15: command — pnpm --filter @umkm-pos/merchant build | exit 0

## Files changed
apps/merchant/src/modules/shift/services/api.ts (addCashEntry); components/CashEntryDialog.vue (new); components/CashEntryList.vue (new); pages/detail.vue; components/CashDialog.vue; components/Information.vue.

## Notes
- Button shows only when status === 'open', isHasPermission('shift.update'), and outlet setting shift_required !== false (setting load failure keeps it shown; API is the final guard, same as useShift.ts).
- The list is visible to all with shift.read; button is not gated on active-participant (API returns 403 otherwise, shown in dialog).
- Information.vue now shows 6 cash items in a 4-col grid (wraps).
