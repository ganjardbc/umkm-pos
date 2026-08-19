## Ticket: GAN-114
## Agent: reviewer
## Verdict: APPROVE

## Security Audit

### Multi-tenant scope: PASS
`applyInventorySale`'s `updateMany` WHERE clause includes `merchant_id: merchantId`
(`transactions.service.ts:735`), alongside `outlet_id`/`product_id`/`is_active`. The
`merchantId` value is threaded from `TransactionsController` via `@CurrentUser('merchant_id')`
(`transactions.controller.ts:54`) through every call site — never read from `dto`/body.
`outlet_id` on the incoming DTO is itself merchant-verified upstream via
`assertOutletBelongsToMerchant(dto.outlet_id, merchantId)` before any inventory row is
touched (`:539`), and `finalizeCustomerOrder` derives `outlet_id` from the already-fetched
transaction row rather than from request input (`:471`, `:487`).

Non-critical note (already raised by QA, agree with the reasoning): the post-decrement
re-read `tx.outlet_product_inventory.findUnique({ where: { outlet_id_product_id: {...} } })`
(`:756-763`) can't filter on `merchant_id` because Prisma's compound unique key on this
table is only `[outlet_id, product_id]` (`schema.prisma:184`). This is safe today because
the read only executes after the immediately-preceding `updateMany` returned `count === 1`
for that exact `merchant_id`-scoped row — but it's an implicit coupling via code ordering,
not an explicit guard. Worth a defensive comment if this method is ever refactored; not a
blocker.

### RBAC coverage: PASS
All 5 routes in `transactions.controller.ts` have `@RequirePermission(...)`: `POST /`
(`transaction.create`, :34), `GET /` (`transaction.read`, :61), `GET /:id`
(`transaction.read`, :87), `POST /:id/cancel` (`transaction.cancel`, :105),
`PATCH /:id/status` (`transaction.update_status`, :123). No `@Public()` routes in this
module. No routes were touched by this ticket's diff.

### DTO validation: PASS
No `@Body()` usage changed by this diff; all controller bodies still use DTO classes.

### Public route exposure: PASS (none)
No `@Public()` decorators present or added in the transactions module.

### Raw SQL: PASS (none)
`grep '\$queryRaw\|\$executeRaw'` on `apps/api/src/transactions/` returns no matches.

### Transaction atomicity / rollback correctness: PASS
The check-and-decrement is now a single atomic `updateMany` with `stock_qty: { gte: item.qty }`
in the WHERE clause, executed via `tx` inside the same `$transaction` as the
`transactions.create`/`transaction_items.createMany` calls at both call sites
(`createPosTransaction:417-424`, `finalizeCustomerOrder:483-490`). `result.count === 0`
throws `BadRequestException` (`:746-750`) with no surrounding try/catch at either call
site, so Prisma's interactive-transaction callback rejection triggers a full rollback —
confirmed by reading both call sites end-to-end; the only try/catch in the file
(`resolveCashierForPos:689-693`) is unrelated and runs before `$transaction` opens, so it
cannot swallow this exception.

`updateMany` (not `update` on the unique key) is the correct Prisma call here — `update`
cannot express a conditional WHERE beyond the unique key, so `updateMany` with the extra
`stock_qty: { gte }` predicate is required to make check-and-decrement atomic at the DB
level. Table uses MySQL/InnoDB (`schema.prisma` provider) with a `@@unique([outlet_id,
product_id])` constraint, so the row-level lock taken by the matching `UPDATE ... WHERE`
under Prisma's default transaction correctly serializes concurrent writers — this matches
the requirements doc's explicit pre-approval of this approach over raw-query/advisory-lock
alternatives.

`stock_after` on `inventory_movements` is populated from a post-decrement `findUnique`
re-read inside the same `tx` (`:756-771`), replacing the stale `item.stock_after` computed
in `prepareTransactionPayload` before the transaction opened — correctly addresses the
audit-trail accuracy requirement.

### Regression test: PASS
`transactions.service.spec.ts:220-337` — two concurrent `service.create()` calls for
stock=1 via `Promise.allSettled`, with a shared in-memory `inventoryStore` and a mocked
`updateMany` that faithfully reproduces the real atomic-conditional-update semantics
(`if (inventoryStore.stock_qty >= where.stock_qty.gte) { decrement; return count:1 } else
{ return count:0 }`). Asserts exactly one fulfilled / one rejected with
`BadRequestException`, final `stock_qty === 0` and never negative, and
`inventory_movements.create` called with the correct post-decrement `stock_after: 0`. This
is a unit-level simulation (mocked Prisma client, not a real DB/integration test), which is
an acknowledged limitation given this module's existing test conventions (no DB-integration
harness present in this module) — the test does exercise the real
`TransactionsService`/`applyInventorySale` code path, only the Prisma client is mocked, so
it is a legitimate regression guard for the logic even though it can't catch a
misunderstanding of actual MySQL/InnoDB locking semantics. Acceptable given ticket scope
and existing test conventions.

## Kualitatif Review

### Blocker (harus diperbaiki sebelum PR)
None.

### Non-blocker (bisa dibuka issue terpisah)
1. `applyInventorySale`'s post-decrement `findUnique` re-read (`:756-763`) relies on
   ordering (always called immediately after a merchant-scoped `updateMany` success) rather
   than an explicit `merchant_id` filter, since the compound unique key is
   `[outlet_id, product_id]` only. Not exploitable today, but if this method is ever split
   or the re-read moved earlier, that implicit safety assumption could silently break.
   Suggest adding a one-line comment at the `findUnique` call noting it depends on running
   only after the `updateMany` success on the same row — DEFER (already flagged in
   qa-report.md, non-critical, no fix required for this PR).
2. `applyInventorySale`'s atomic-path error message ("Insufficient stock for product \"X\"
   in this outlet.") is shorter than the fail-fast path's message in
   `prepareTransactionPayload` ("...Available: X, Requested: Y"). Acceptable per
   requirements ("pesan setara", not identical), and out of scope for this backend-only
   ticket to reconcile with FE message parsing — DEFER, no action needed unless FE is
   confirmed to parse the detailed variant specifically.
3. `apps/api/src/rbac/rbac.service.spec.ts` shows a 1-line whitespace-only diff
   (trailing newline) unrelated to this ticket's scope, picked up in the working tree.
   Harmless, but worth excluding from the commit/PR diff for cleanliness since it's
   unrelated to GAN-114 — DEFER, cosmetic only.

### Positif (untuk referensi)
- The atomic conditional `updateMany` + `count === 0` → throw → propagate-to-rollback
  pattern is a clean, idiomatic way to get check-and-decrement atomicity out of Prisma's
  interactive transactions without resorting to raw SQL or manual locking — good reference
  pattern for similar races elsewhere in the codebase (e.g. `stock/` adjustment module,
  correctly flagged as out-of-scope rather than opportunistically "fixed" here).
  The `stock/` module was NOT touched, in compliance with the ticket's explicit "Out of
  Scope" note.
- The fail-fast check in `prepareTransactionPayload` was kept and clearly commented as
  non-authoritative/best-effort rather than removed — preserves early UX feedback while
  making the authoritative source of truth unambiguous for future readers.
- Both call sites (`createPosTransaction`, `finalizeCustomerOrder`) were updated
  consistently through the shared `applyInventorySale` helper — no divergent decrement
  path was introduced; `cancel()`'s stock-restore path is a separate increment-only flow,
  correctly left untouched (not subject to the same race in the direction that matters —
  restoring stock).
- No schema/migration changes, consistent with the ticket's constraint.

## Verdict Rationale

Implementation matches requirements.md, tasks.md (BE-1 through BE-5), and both
verify-report.md and qa-report.md claims exactly — verified directly against the diff, not
just the reports. Multi-tenant scoping is correct at every touched query (merchant_id
always from JWT via controller, never from body). The atomic check-and-decrement correctly
uses `updateMany` (not `update`) with `stock_qty: { gte }` in the WHERE clause inside the
existing `$transaction`, throws on `count === 0` without being swallowed, and rolls back
correctly. `stock_after` audit trail is now accurate post-decrement. Both call sites are
consistent. A concurrency regression test exists and correctly proves no oversell/negative
stock, even though it's a mocked unit test rather than a real-DB integration test — an
acceptable trade-off given this module's existing test conventions and out of the ticket's
explicit scope to introduce new test infrastructure. QA already passed with no CRITICAL
issues, and the two NON-CRITICAL QA notes are correctly reasoned and non-blocking. No new
🔴 or 🟡 findings from this review. Approved for PR.

## Untuk Developer

No changes required before PR. Optional follow-ups (not blocking, can be separate
issues/comments if desired):
- Add a one-line comment at `transactions.service.ts:756` noting the `findUnique` re-read's
  merchant-scoping safety depends on always running immediately after the
  `updateMany` success on the same row.
- Consider excluding the unrelated whitespace-only change in
  `apps/api/src/rbac/rbac.service.spec.ts` from this PR's diff.
