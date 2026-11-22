# Verify Report: shift-kas-b2-shift-opsional (Backend Tasks only)
Status: SUCCESS

Scope: Backend Tasks only (apps/api). Frontend, Documentation and manual tasks not done (main thread / other agents).

## Evidence per AC
- AC-1: automated-test — apps/api/src/outlets/outlets.service.spec.ts::OutletsService shift_required returns shift_required true for an untouched outlet (AC-1) (default comes from the column DEFAULT 1; the test only checks the value is passed through findOne)
- AC-2: automated-test — apps/api/src/outlets/outlets.service.spec.ts::OutletsService shift_required stores the new value and findOne reads it back (AC-2)
- AC-3: automated-test — apps/api/src/outlets/outlets.controller.spec.ts::OutletsController rejects PATCH /outlets/:id with 403 without outlet.update (AC-3) (exercises the real PermissionGuard against `OutletsController.prototype.update`)
- AC-4: automated-test — apps/api/src/outlets/outlets.service.spec.ts::OutletsService shift_required rejects turning off while an open shift exists (AC-4)
- AC-5: automated-test — apps/api/src/transactions/transactions.service.spec.ts::shift off: POS sale without shift_id is saved with null shift and stock decremented; ::shift off: a client-sent shift_id is ignored and stored null
- AC-6: automated-test — apps/api/src/transactions/transactions.service.spec.ts::shift on: POS sale without shift_id is rejected with 400, no transaction, no stock change
- AC-7: automated-test — apps/api/src/transactions/transactions.service.spec.ts::shift off: pay-later cash payment without shift is accepted with empty paid_shift_id
- AC-8: automated-test — apps/api/src/customer-catalog/customer-catalog.service.spec.ts::shift off + active outlet: order is created without a shift
- AC-9: automated-test — apps/api/src/customer-catalog/customer-catalog.service.spec.ts::shift off + inactive outlet: order is rejected
- AC-10: automated-test — apps/api/src/customer-catalog/customer-catalog.service.spec.ts::shift on + no open shift: order is rejected as before
- AC-11: manual — frontend task; backend part is GET /shifts/outlet/:outlet_id/setting (no dedicated controller test). Steps in requirements.md.
- AC-12: manual — frontend task, not done here.
- AC-13: manual — frontend task; backend endpoint exists with `shift.read`. Steps in requirements.md.
- AC-14: automated-test (backend part only) — transactions.service.spec.ts::shift off: a client-sent shift_id is ignored and stored null. Full AC is manual per requirements.md.
- AC-15: manual — frontend task, not done here.
- AC-16: command — pnpm --filter umkm-pos-api run lint:ci | exit 0, no warnings
- AC-17: command — pnpm --filter umkm-pos-api run test | exit 0, 25 suites, 299 tests passed
- AC-18: none — frontend build not run (out of scope for this run)
- AC-19: automated-test — apps/api/src/shifts/shifts.service.spec.ts::shift_required setting openShift rejects with 400 when setting is off and creates nothing (AC-19); also ::isShiftRequired returns the outlet value scoped by merchant, ::isShiftRequired rejects an outlet of another merchant
- AC-20: manual — frontend task, not done here (backend rejection is covered by AC-19).

Also ran: `pnpm --filter umkm-pos-api run build` (type gate) exit 0; `npx prisma generate` ran (client only, no DB touched).

## Files changed
- apps/api/prisma/migrations/add_outlets_shift_required.sql (new; NOT applied, main thread must run it)
- apps/api/prisma/schema.prisma
- apps/api/src/outlets/{dto/create-outlet.dto.ts, outlets.service.ts, outlets.service.spec.ts, outlets.controller.spec.ts}
- apps/api/src/shifts/{shifts.service.ts, shifts.controller.ts, shifts.service.spec.ts}
- apps/api/src/transactions/{transactions.service.ts, transactions.service.spec.ts, dto/pay-transaction.dto.ts}
- apps/api/src/customer-catalog/{customer-catalog.service.ts, customer-catalog.service.spec.ts (new)}

## Notes and deviations
- `PayTransactionDto.shift_id` previously was required by the DTO validator for cash. That made AC-7 impossible (the request would be rejected before the service). It is now optional with a UUID check; the service still returns 400 for cash without `shift_id` when the setting is on. The old DTO test was changed accordingly. This is a change to the PATCH /transactions/:id/pay contract not spelled out in design.md; please confirm.
- `createOrder` in customer-catalog now always calls `resolveOutlet` (inactive outlet returns 404 even when shifts are on); previously the shift check came first.
- Existing inventory tests in transactions.service.spec.ts now mock `isShiftRequired` false so they stay about inventory.
- Race in D-4 is accepted per design; the AC-4 test covers the sequential case only.
- The `open` (legacy) method in ShiftsService is unchanged, per D-13.

---
# Frontend Section (apps/merchant)
Status: SUCCESS (build passes; manual ACs NOT VERIFIED)

## Evidence per AC (frontend)
- AC-8 / AC-10: build-only — `pnpm --filter @umkm-pos/merchant build` passed; getter `isShiftOpen` now true when `shift_required === false`; the "shift belum dibuka" message and disabled buttons in layouts/customer.vue, pages/cart.vue, pages/browse.vue all key off that getter. No frontend test.
- AC-11: NOT VERIFIED (manual) — POS now shows products/cart without OpenShift when setting off; steps in requirements.md.
- AC-12: NOT VERIFIED (manual) — header badge (status tag + badge dot), dashboard "Shift Aktif" card hidden when off; Shift menu untouched.
- AC-13: NOT VERIFIED (manual) — setting loaded via GET /shifts/outlet/:id/setting (layout + POS); POS waits for setting and shift before rendering.
- AC-14: NOT VERIFIED (manual) — frontend sends no shift_id when off (undefined); server also nulls it.
- AC-15: NOT VERIFIED (manual) — checkbox "Wajibkan buka/tutup kasir" with explanation on outlet edit; payload includes shift_required; errors still toast in `catch`.
- AC-18: command — `pnpm --filter @umkm-pos/merchant build` | built OK (vue-tsc -b passed, vite "built in 1.59s"); exit code not captured separately because of piping to tail
- AC-20: NOT VERIFIED (manual) — "Buka Shift" button in shift/components/ShiftStatus.vue hidden when off; POS OpenShift screen not shown when off.

## Files changed (frontend)
apps/merchant/src: layouts/default.vue; modules/shift/{services/api.ts, composables/useShift.ts, components/ShiftStatus.vue}; modules/pos/pages/index.vue; modules/transaction/components/{Cart.vue, ShiftStatus.vue}; modules/transaction/pages/{index.vue, detail.vue}; modules/dashboard/{components/SummaryStats.vue, pages/index.vue}; modules/customer-catalog/stores/{state.ts, getters.ts}; modules/outlet/{services/types.ts, pages/edit.vue}

## Notes
- Product.vue unchanged: POS passes `is-user-in-shift = !shiftRequired || isShiftUserCanManage`, which skips its check. Same prop feeds Cart footer visibility.
- Beyond tasks.md: transaction/pages/index.vue and detail.vue (pay-later payment) now send `shift_id: currentShift.id || undefined`; an empty string would fail the backend's UUID check and break AC-7 when no shift exists.
- Edit page: `FormEdit.shift_required` is required in the type; initial value `shift_required !== false`.
- Layout setting fetch is called on every fetchOutletShift (mount + outlet watch).
