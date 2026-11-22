# Verify report: shift-kas-b1-kas-shift (Backend T-1..T-6, T-12)
Status: SUCCESS

Scope run: backend only (apps/api). Frontend (T-7..T-10), docs (T-11) and T-13 not done by this agent.

## Commands run
- `pnpm --filter umkm-pos-api run lint:ci` | exit 0, no warnings
- `pnpm --filter umkm-pos-api run test` | 24 suites, 282 tests passed
- `pnpm --filter umkm-pos-api run build` | passed (type gate)
- `npx prisma generate` | ran OK

## Evidence per AC
- AC-1: automated-test — apps/api/src/shifts/shifts.service.spec.ts::stores opening_cash when opening a shift
- AC-2: automated-test — shifts.service.spec.ts::rejects invalid opening_cash %p with 400
- AC-3: automated-test — shifts.service.spec.ts::rejects missing opening_cash with 400
- AC-4: automated-test — shifts.service.spec.ts::closes shift: expected and difference snapshot
- AC-5: automated-test — shifts.service.spec.ts::rejects invalid closing_cash %p with 400
- AC-6: automated-test — shifts.service.properties.spec.ts::Property: expected cash on close sums only cash, non-cancelled transactions paid in the shift; transactions.service.spec.ts::direct payment sets paid_shift_id to the creating shift
- AC-7: automated-test — transactions.service.spec.ts::pay-later created in shift A paid cash in shift B goes to paid_shift_id B only
- AC-8: automated-test — transactions.service.spec.ts::non-cash payment without shift_id is allowed and sets no paid shift (the sum filters payment_method = cash, asserted in the AC-4 and AC-6 tests)
- AC-9: automated-test — transactions.service.spec.ts::rejects cash payment without shift_id / when shift is not open / by a non-participant / DTO requires shift_id for cash
- AC-10: automated-test — shifts.service.spec.ts::closes shift: expected and difference snapshot (closing below, equal to and above expected; shift still closed)
- AC-11: automated-test — shifts.service.spec.ts::does not change cash when closing an already closed shift
- AC-12: manual — backend returns null for the four cash fields on old shifts (getShift, queryShifts, findByOutlet via `?? null` and raw row). Frontend "-" display is not done here (T-9). A human must open an old shift in detail and history.
- AC-13: none — frontend, not in this agent's scope
- AC-14: none — frontend part not in scope. The backend close response (full shift detail with cash fields) is covered by the AC-4 test.
- AC-15: none — frontend (T-10) not in scope. Backend `shift_id` on pay is covered by the AC-7 test.
- AC-16: command — pnpm --filter umkm-pos-api run lint:ci | exit 0
- AC-17: command — pnpm --filter umkm-pos-api run test | exit 0, 282 passed
- AC-18: none — frontend build (T-13), not run by this agent

## Files changed
- apps/api/prisma/migrations/add_shift_cash_columns.sql (new)
- apps/api/prisma/schema.prisma
- apps/api/src/shifts/{shifts.service.ts, shifts.controller.ts, dto/create-shift.dto.ts, dto/close-shift.dto.ts}
- apps/api/src/shifts/{shifts.service.spec.ts, shifts.service.properties.spec.ts}
- apps/api/src/transactions/{transactions.service.ts, dto/pay-transaction.dto.ts, transactions.service.spec.ts}

## Notes and open items
- T-1 gap: the migration SQL was NOT run against a local MySQL (no DB prepared). Not verifiable here. Run it locally before deploy, because deploy runs it automatically.
- The test setup mocks `@prisma/client` globally (apps/api/jest.setup.ts), so `Prisma.Decimal` is unavailable in tests. Cash math therefore uses Number rounded to cents (exact for DECIMAL(14,2)).
- `closeShift` and `openShift` signatures gained a trailing cash argument. The legacy `ShiftsService.open()` (unused by the controller) does not store opening_cash.
- `findByOutlet` returns the raw row, so the four cash columns appear automatically. The Decimal JSON shape (string vs number) is still unconfirmed, as noted in design.md.
- For `payTransaction`, `shift_id` is validated and stored in `paid_shift_id` whenever it is sent (also for non-cash). It is required only for cash.
- Existing `resolveCashierForPos` does not check that the shift belongs to the transaction's outlet or merchant. It only requires an active participant, so I kept that rule as design.md says.

---

# Frontend section (apps/merchant, T-7..T-10, T-13 build)
Status: SUCCESS for the build (T-13 build part). AC-12..AC-15 are NOT verified (manual, not run by this agent).

## Commands run
- `pnpm --filter @umkm-pos/merchant build` | exit 0 (vue-tsc -b + vite build; only the existing chunk-size warning). First run failed on unused/undefined `currentShift`, fixed, rerun passed.
- Not run (no script): lint, typecheck, test for apps/merchant.

## Evidence per AC (frontend; backend lines above still apply)
- AC-12: manual — NOT VERIFIED. Open detail and history of a shift created before the change; the four cash fields should show "-" (`formatCash` in shift/services/cash.ts returns "-" for null/undefined/empty/NaN). Code paths: Information.vue, HistoryShift.vue.
- AC-13: manual — NOT VERIFIED. POS without active shift: open the dialog, enter opening cash, submit; repeat with the API off (error shown inline in CashDialog, form stays open). Both open-shift places (OpenShift.vue, ShiftStatus.vue) use CashDialog.
- AC-14: manual — NOT VERIFIED. Close a shift with cash above, equal to and below expected; the form does not show expected cash, and after submit CashDialog shows opening cash, cash sales, expected, closing, difference from the close response (no extra request).
- AC-15: manual — NOT VERIFIED. Create a pay-later order, pay in cash from the list page and from the detail page, then check the shift cash summary. Both callers now send `shift_id: currentShift.id`.
- AC-18: command — pnpm --filter @umkm-pos/merchant build | exit 0

## Files changed (apps/merchant/src/modules)
- shift/composables/useShift.ts (4 optional cash fields), shift/services/api.ts (openShift typed with opening_cash; closeShift(id, { closing_cash }))
- shift/services/cash.ts (new, formatCash), shift/components/CashDialog.vue (new)
- shift/components/ShiftStatus.vue, transaction/components/OpenShift.vue (use CashDialog)
- shift/components/Information.vue (detail), shift/pages/HistoryShift.vue (history)
- transaction/pages/index.vue, transaction/pages/detail.vue (shift_id on pay)

## Notes and open items
- Old `closeShift(id, options)` passed `options` as the request body; the new signature fixes this. Any other caller of closeShift: none found beyond ShiftStatus.vue (build passes).
- "Penjualan Tunai" in the summary is derived as expected_cash - opening_cash; the close response has no separate field.
- The old confirm dialog on "Tutup Shift" was replaced by the cash dialog (it acts as the confirmation).
- Decimal JSON shape still unconfirmed; everything goes through Number(...).
- `currentShift.id` is '' when no shift is loaded; the API will then reject cash payment (400). Not guarded in the UI.
