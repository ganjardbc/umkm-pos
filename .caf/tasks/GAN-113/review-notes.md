## Ticket: GAN-113
## Agent: reviewer
## Verdict: APPROVE

## Security Audit

### Multi-tenant scope: PASS
Every Prisma call in `adjust()` (`apps/api/src/stock/stock.service.ts`) filters/writes
`merchant_id: merchantId`, sourced from the JWT-derived parameter, never from `dto`:
product lookup (:161), outlet lookup (:171), inventory pre-read (:179), the critical
conditional `updateMany` WHERE (:211), the count==0 re-read `findFirst` (:228), `create`
(:249), and `inventory_movements.create` (:263).

One non-blocking observation (already flagged by QA, confirmed here): the re-read
`tx.outlet_product_inventory.findUniqueOrThrow` at :238-245 keys only on the
`outlet_id_product_id` composite unique, with no explicit `merchant_id` filter at that
specific call. Not exploitable — it only runs after `updateMany` already succeeded with
`merchant_id` in its WHERE (`count === 1`), so the composite key at that point can only
resolve to the merchant-owned row (the unique index is a 1:1 mapping regardless). Still,
for defense-in-depth and consistency with the rest of the method's pattern (every other
call explicitly repeats `merchant_id`), adding `merchant_id` to this `where` would cost
nothing and remove the need to reason about it. 🔵 non-blocker.

### RBAC coverage: PASS
`stock.controller.ts`: `GET /stock/logs` → `@RequirePermission('stock.read')`,
`GET /stock/inventory` → `@RequirePermission('stock.read')`, `POST /stock/adjust` →
`@RequirePermission('stock.adjust')`. No `@Public()` anywhere in the module. All three
HTTP-method decorators have a matching guard decorator.

### DTO validation: PASS
`adjust()`'s only `@Body()` consumer is `CreateStockAdjustmentDto` (unchanged by this
ticket, per requirements.md constraint — confirmed not touched in the diff).

### Public route exposure: PASS (none present)
No `@Public()` decorator in `apps/api/src/stock/`.

### Raw SQL: PASS
No `$queryRaw`/`$executeRaw` in `apps/api/src/stock/`.

### Transaction atomicity: PASS
The former array-style `$transaction([...])` (read-then-write split across a JS-computed
`newStock` and a separate array item) is replaced by a single interactive
`this.prisma.$transaction(async (tx) => { ... })`. For the existing-row path, the
"stock must not go negative" check and the `stock_qty` write are fused into one
conditional `updateMany` (`where: { ..., stock_qty: { gte: -dto.change_qty } }`,
`data: { stock_qty: { increment: dto.change_qty } } }`) — this is exactly the
`WHERE stock_qty + change_qty >= 0` atomic-update pattern the ticket asked for, and it
eliminates the check-then-act window that caused the original lost-update bug. `count`
is checked afterward and drives a `BadRequestException` (no silent no-op). The
create-row and movement-write paths are inside the same `tx`. `stock_after` is sourced
from `findUniqueOrThrow`/`create` results (DB-committed value), never from an
app-computed variable — satisfies the AC on `inventory_movements.stock_after` accuracy.

### Secret/credential exposure: PASS
No `console.log`/`logger.*` calls referencing password/token/secret/jwt in
`apps/api/src/stock/`. No hardcoded credentials or URLs introduced.

### Prisma injection pattern: PASS
No `new PrismaClient()` in `apps/api/src/stock/` — constructor-injected `PrismaService`
used throughout, consistent with the rest of the codebase.

## Kualitatif Review

### Blocker (harus diperbaiki sebelum PR)
None — no 🔴/🟡 finding.

### Non-blocker (bisa dibuka issue terpisah)
1. 🔵 `stock.service.ts:238-245` — `findUniqueOrThrow` re-read after a successful
   conditional update doesn't repeat `merchant_id` in its `where`, unlike every other
   Prisma call in this method. Not exploitable today (see Security Audit above), but
   worth adding for consistency/defense-in-depth so a future refactor can't
   accidentally introduce a real gap here.
2. 🔵 `stock.service.ts:223-236` — when `updateMany` matches 0 rows because the row was
   deleted between the outer existence check and the transaction (currently
   unreachable — this module has no delete-inventory-row endpoint), the thrown
   exception is `BadRequestException` with a "not found" message rather than
   `NotFoundException`. Cosmetic only; already flagged by QA as non-critical.
3. 🔵 BE-10 (live-DB `Promise.all` concurrency integration test) was not implemented,
   consistent with tasks.md marking it explicitly optional given this repo's
   Prisma-mocked unit-test infra. The mechanism itself (single conditional SQL
   `UPDATE ... WHERE`) is architecturally the correct fix for the lost-update race —
   verified by reading the generated `updateMany` call and reasoning about MySQL's
   row-level locking on a single conditional UPDATE statement — but this claim rests
   on that reasoning rather than an executed test against a real database. Flagging
   for future visibility only, not blocking this ticket.
4. ❓ **Scope hygiene — action required before commit, not a code defect**:
   `git diff apps/api/src/rbac/rbac.service.spec.ts` still shows an uncommitted 1-line
   whitespace/EOF diff (trailing blank line at end of file), despite verify-report.md
   claiming `git checkout -- apps/api/src/rbac/rbac.service.spec.ts` was run to revert
   an unrelated `eslint --fix` touch. Confirmed still present in the working tree at
   review time. This file is entirely outside GAN-113's scope (no stock-module logic
   touches it) and has zero functional impact, but it must not be included when the
   commit/PR is created — it would falsely widen the diff's blast radius and could
   confuse reviewers into thinking `rbac.service.spec.ts` was intentionally touched.
   **This is not a reason to re-run the backend agent** (it's not a code logic issue,
   just a leftover working-tree change) — it just needs to be excluded/reverted at
   commit time.

### Positif (untuk referensi)
- The atomic-update pattern (`updateMany` with a `stock_qty: { gte: -change_qty }`
  WHERE clause + `{ increment: change_qty }` data, count-checked, re-read for the
  authoritative post-write value) is a clean, minimal, idiomatic Prisma solution to a
  lost-update race — no schema change, no app-level locking, no retry loop needed. This
  is a good reference pattern for other services in this codebase that have a similar
  "validate a numeric bound, then write" shape (e.g. any future stock/balance mutation).
- Read-only, non-race-sensitive lookups (change_qty validation, reason validation,
  product/outlet existence) were correctly left outside the transaction per BE-8,
  keeping the transaction's critical section as small as possible — good for reducing
  lock contention under real concurrent load.
- Test suite (`stock.service.spec.ts`) explicitly asserts the WHERE-clause shape
  (`stock_qty: { gte: -3 }`) and verifies `stock_after` comes from the mocked re-read
  result rather than input arithmetic — these are exactly the properties that matter
  for this bug class, not just "does it return 200."
- Response shape (`{ outlet_inventory: { outlet_id, product_id, stock_qty }, movement }`)
  is unchanged, correctly avoiding an API-contract break for a pure internal-logic fix.

## Verdict Rationale

Core fix correctly eliminates the check-then-act race described in requirements.md by
fusing the negative-stock validation and the `stock_qty` write into a single atomic
conditional `updateMany`, inside one interactive `$transaction` alongside the movement
write. Multi-tenant scoping and RBAC are intact and unchanged from the pre-fix baseline.
No 🔴/🟡 findings. QA already ran full build/lint/test (184/184 green) and reported 0
CRITICAL issues. The only outstanding item is a working-tree hygiene issue (leftover
`rbac.service.spec.ts` diff) that is unrelated to code correctness and does not require
sending this back to the backend agent — it just needs to be excluded before the commit
is made.

## Untuk Developer

No code changes required. Before creating the commit/PR:
1. Revert or unstage `apps/api/src/rbac/rbac.service.spec.ts` — it is outside GAN-113's
   scope and should not appear in this ticket's diff (`git checkout -- apps/api/src/rbac/rbac.service.spec.ts`
   or simply exclude it from `git add`).
2. Optional, non-blocking cleanup for a future pass (not required for this PR): add
   `merchant_id: merchantId` to the `findUniqueOrThrow` `where` at
   `stock.service.ts:238-245` for consistency with the rest of the method.
