## Review Notes — shift-kas-b2-shift-opsional
Ticket: shift-kas-b2-shift-opsional
Agent: caf-reviewer
Verdict: APPROVE

### Security Audit
None blocking.
- `GET /shifts/outlet/:outlet_id/setting` (`shifts.controller.ts`) uses `@RequirePermission('shift.read')` and passes `merchant_id` from `@CurrentUser`. `isShiftRequired` queries `outlets.findFirst({ id, merchant_id })`, so another merchant's outlet returns 404 (ADR-001 OK).
- `createPosTransaction` and `payTransaction` call `isShiftRequired(outlet_id, merchantId)` with `merchantId` from the JWT. With the setting on, a missing `shift_id` returns 400 (AC-6). With it off, the client `shift_id` is dropped.
- Customer-catalog `createOrder` reads `shift_required` from the outlet row that `resolveOutlet` returns. That row is already filtered by `is_active`.
- `PATCH /outlets/:id` keeps its existing `outlet.update` permission. `shift_required` is an optional `@IsBoolean` in the DTO.
- Accepted risk (design D-4): the turn-off check is not atomic against a shift opening at the same moment. The `$transaction` rolls back the update when an open shift exists.

### Qualitative Review
- Scope deviation (minor, documented in verify-report): `PayTransactionDto.shift_id` changed from required-for-cash to `@IsOptional`. This changes the `PATCH /transactions/:id/pay` contract, which `design.md` does not mention. It is needed for AC-7, and the service still returns 400 for cash without `shift_id` when the setting is on. Tasks: Transactions.
- Scope deviation (minor): `apps/merchant/src/modules/transaction/pages/index.vue` and `pages/detail.vue` now send `shift_id: currentShift.id || undefined`. No task lists these files, but they are needed for AC-7.
- Scope deviation (minor): `createOrder` now calls `resolveOutlet` first, so an inactive outlet returns 404 even when shifts are on. This is the order the AC-9 test expects.
- Task variance: `Product.vue` was not edited. POS passes `is-user-in-shift = !shiftRequired || ...`, so its check is skipped. This matches the task's intent.
- Wording: the edit-page label is "Wajibkan buka/tutup kasir". AC-15 says the option is "Buka/tutup kasir". Confirm that is acceptable.
- The migration `add_outlets_shift_required.sql` matches the `schema.prisma` change. The main thread says it was applied (3 outlets, all `shift_required=1`). I did not check the database.
- Docs: `docs/api/api-contract.md` and `docs/database/erd.md` are modified, as the docs task asked.
- Spec changed after approval: could not check. `.caf/tasks/shift-kas-b2-shift-opsional/` is untracked, so `requirements.md` has no git history. I do not assume it is unchanged. It still reads `Status: APPROVED`.
- ADR violation: none found against ADR-001 to ADR-004 (checked only the multi-tenant scoping rule in detail).
- Checklist: the diff stays in `apps/api`, `apps/merchant`, `docs`. `packages/ui` is untouched. The verify commands exist in the workspaces' `package.json` (per CLAUDE.md table).

### Verdict Rationale
No blocking finding. Backend ACs 1-10, 16, 17 and 19 have automated-test or command evidence, and `validate-report.md` is PASS for them. AC-18 has command evidence (build exit 0). The manual ACs below cannot be counted as passed. They are an open human check, not a code defect.

### For Developer
ACs that need a human check (evidence manual or build-only):
- AC-11: POS without a shift while the setting is off.
- AC-12: header badge and dashboard card hidden; Shift menu still opens.
- AC-13: cashier without `outlet.read` picks up the new setting after a reload. This relies on `shift.read` being held by cashier roles. That was not verified.
- AC-14: the backend part is tested. The full flow (turn on again, open a shift, old transaction not attached) is manual.
- AC-15: edit-page checkbox and the error path.
- AC-20: "Buka Shift" hidden in the Shift menu and in POS.
- AC-8 and AC-10 frontend getter: build-only.
- AC-1: the test only checks pass-through. The default comes from the SQL `DEFAULT 1`.

Proposed Spec Changes: none in verify-report or validate-report. Items for a human to confirm: the `PayTransactionDto` contract change, and the checkbox label wording.
