## Ticket: GAN-113
## Agent: qa
## Status: PASS

## Quality Gate Results
- Typecheck: N/A — `apps/api` has no dedicated `typecheck` script; used `pnpm --filter umkm-pos-api build` (`nest build`, tsc under the hood) as the equivalent gate.
  ```
  > umkm-pos-api@0.0.1 build
  > nest build
  (no errors)
  ```
- Lint: PASS
  ```
  > umkm-pos-api@0.0.1 lint
  > eslint "{src,apps,libs,test}/**/*.ts" --fix
  (no findings)
  ```
- Test: PASS
  ```
  > umkm-pos-api@0.0.1 test
  > jest
  Test Suites: 14 passed, 14 total
  Tests:       184 passed, 184 total
  ```
  Ran full suite (not just stock) to catch regressions. `stock` suite alone: 9/9 passed.

## Security Check Results (backend)
- Multi-tenant scope: PASS — every Prisma call in `adjust()` filters/writes `merchant_id: merchantId` (JWT-derived param): product lookup (`stock.service.ts:161`), outlet lookup (`:171`), inventory lookup (`:179`), `updateMany` WHERE (`:211`), count==0 re-read `findFirst` (`:228`), create (`:249`), movement create (`:263`). No `dto`-sourced `merchant_id` anywhere.
  - Minor note: `tx.outlet_product_inventory.findUniqueOrThrow` at `:238-245` (re-read after successful atomic update) keys only on the `outlet_id_product_id` composite unique — no explicit `merchant_id` filter at that specific call. Not a real scoping gap: the preceding `updateMany` already enforced `merchant_id: merchantId` and only proceeds (count===1) if a row matching that merchant was updated, so the composite key at that point can only resolve to the merchant-owned row. No exploit path found.
- RBAC coverage: PASS — `POST /stock/adjust` has `@RequirePermission('stock.adjust')` (`stock.controller.ts:73`), `GET /stock/logs` and `GET /stock/inventory` both have `@RequirePermission('stock.read')`. No `@Public()` anywhere in the module. `@UseGuards(PermissionGuard)` applied at controller level.
- Raw SQL: PASS — none found in `apps/api/src/stock/`.
- Secret exposure: PASS — none found in `apps/api/src/stock/`.

## Acceptance Criteria Verification (requirements.md)
- [x] No more application-computed `newStock` written as absolute value for existing rows — `stock_qty: { increment: dto.change_qty }` (`stock.service.ts:217`).
- [x] Validation ("stock not negative") + write for existing rows happen in one atomic op — conditional `updateMany` with `stock_qty: { gte: -dto.change_qty }` WHERE clause, equivalent to `stock_qty + change_qty >= 0` (`stock.service.ts:207-221`). No read-then-write window: the interactive `$transaction` performs the conditional update directly; the only external read (`inventory = findFirst`, `:177-183`) is pre-transaction and used only to branch create-vs-update, not as the value written.
- [x] `count === 0` → `BadRequestException` (`stock.service.ts:223-236`). Message avoids stale "Current: X" — it re-reads `tx.outlet_product_inventory.findFirst` inside the tx purely to decide the wording (row still exists → "Insufficient stock..." vs row gone → "not found...") without ever surfacing a numeric stock figure that could already be stale. Satisfies AC.
- [x] `inventory_movements.stock_after` sourced from re-read/create result, not app-computed `newStock` — update path: `tx.outlet_product_inventory.findUniqueOrThrow(...)` result used as `inventoryRow.stock_qty` (`:238-245`, used at `:267`); create path: `tx.outlet_product_inventory.create(...)` result used directly (`:247-258`, used at `:267`). Verified in test: `stock_after: 8` comes from `findUniqueOrThrow` mock return, not from `change_qty` math (`stock.service.spec.ts:165-209`).
- [x] Row-missing + `change_qty > 0` create path preserved (`stock_qty: dto.change_qty` directly, `:252`), now inside the same interactive `$transaction` as the movement write (`:198-287`). Covered by test `stock.service.spec.ts:92-142`.
- [x] Row-missing + `change_qty < 0` still throws `NotFoundException`, before entering the transaction (`stock.service.ts:186-190`; test asserts `$transaction` not called, `stock.service.spec.ts:64-90`).
- [~] Concurrent-request test: no live-DB `Promise.all` integration test exists (BE-10, explicitly marked optional in tasks.md given this repo's Prisma-mocked unit-test infra). What IS covered: a unit test proving that when the conditional `updateMany` matches 0 rows (the exact DB-level outcome a losing concurrent request would observe), `adjust()` throws `BadRequestException` and does NOT proceed to write `inventory_movements` or re-read inventory (`stock.service.spec.ts:212-258`, explicit assertions that `findUniqueOrThrow` and `inventory_movements.create` were not called). Correctness of the atomicity itself rests on MySQL evaluating `UPDATE ... WHERE stock_qty >= -change_qty` under row-level locking, which is standard RDBMS behavior for a single conditional `UPDATE` statement — this is architecturally sound and is what actually eliminates the lost-update race (the original bug was a check-then-act split across two statements; that split no longer exists). I did not find a logic flaw in the WHERE-clause construction (see Edge Cases below). Given tasks.md explicitly scoped BE-10 as optional and infra-infeasible, I am not treating its absence as a blocking gap, but it does mean the "DB stays consistent under real concurrent load" claim is verified by static/logical reasoning about the SQL Prisma will generate, not by an executed test against a real database in this run.
- [x] Response shape unchanged — `{ outlet_inventory: { outlet_id, product_id, stock_qty }, movement }` (`stock.service.ts:289-296`), matches both branches' tests.

## Edge Cases Tested / Reviewed
| Skenario | Expected | Actual | Status |
|---|---|---|---|
| Existing row, update succeeds (count:1) | stock_qty = increment result, stock_after from re-read | matches (test `:144-210`) | PASS |
| Existing row, conditional update matches 0 rows (insufficient/race) | `BadRequestException`, no movement written | matches (test `:212-258`) | PASS |
| Row missing + change_qty > 0 | create new row, stock_qty = change_qty, still inside same tx as movement | matches (test `:92-142`) | PASS |
| Row missing + change_qty < 0 | `NotFoundException`, tx never started | matches (test `:64-90`) | PASS |
| change_qty === 0 | `BadRequestException` before any lookup | code path present (`:145-147`); not covered by an explicit test but is a pure input-validation guard unrelated to this ticket's diff (pre-existing behavior, unchanged) | PASS (by inspection) |
| Invalid reason for sign of change_qty | `BadRequestException` | covered (test `:260-288`) | PASS |
| Positive change_qty WHERE clause (`gte -change_qty` with `change_qty` positive → threshold negative) | condition always true for any non-negative stock_qty, i.e. effectively unconditional increment | test asserts exact WHERE shape `stock_qty: { gte: -3 }` for `change_qty: 3` (`:189-201`) — matches intended semantics, no separate positive/negative branching in the query itself as required by BE-2 | PASS |
| Outer `inventory` read is stale by the time the tx's `updateMany` runs, for the *update* branch (row deleted concurrently — no delete endpoint exists in this module today, but stress-testing the logic anyway) | should not silently corrupt data | `updateMany` count becomes 0 (WHERE outlet_id/product_id/merchant_id no longer matches) → falls into count===0 branch → `tx.outlet_product_inventory.findFirst` returns null → `BadRequestException` with "not found" wording, movement not written | Acceptable — no data corruption, request rejected safely, though a `NotFoundException` might be semantically more precise than `BadRequestException` for this sub-case. Non-critical, see Issues below. |
| Outer `inventory` read is stale for the *create* branch (row created concurrently by another request between the outer `findFirst` and this tx's `create`) | should not crash with an unhandled/unsanitized error | `tx.outlet_product_inventory.create(...)` would throw Prisma `P2002` (unique constraint) inside the interactive transaction; not caught anywhere in `adjust()`. This bubbles up as a raw (non-`HttpException`) error. `HttpExceptionFilter` only `@Catch(HttpException)`, so it falls through to Nest's default handler, which in production returns a generic 500 with no leaked internals (Nest's built-in filter does not serialize non-`HttpException` details to the client by default) | Not a security leak, but is a raw 500 instead of a clean 4xx. Requirements.md explicitly lists this exact scenario under "Out of Scope" for this ticket, so not treated as a gap here. |
| `change_qty` as float | `@IsInt()` on DTO rejects non-integer at validation-pipe layer before reaching the service | unchanged, pre-existing, verified in `dto/create-stock-adjustment.dto.ts:46` | PASS |
| Multi-tenant: `merchant_id` sourced from JWT only | no `dto.merchant_id` field exists, `merchantId` param is `@CurrentUser('merchant_id')` in controller | confirmed unchanged in `stock.controller.ts:83-89` | PASS |

## Issues Found

### CRITICAL (harus diperbaiki sebelum PR)
None.

### NON-CRITICAL (bisa di task terpisah / informational)
1. `apps/api/src/stock/stock.service.ts:231-235` — when the conditional `updateMany` matches 0 rows because the row was deleted between the outer existence check and the transaction (not currently reachable via any existing endpoint, since this module has no delete-inventory-row operation, but noting for completeness), the thrown exception is `BadRequestException` with a "not found" message rather than `NotFoundException`. Cosmetic/semantic only — does not affect correctness of the concurrency fix or expose any data; the far more common real-world case (insufficient stock due to a losing race) correctly gets `BadRequestException` per the ticket's explicit requirement.
2. `apps/api/src/rbac/rbac.service.spec.ts` has an uncommitted 1-line diff (trailing blank-line/EOF whitespace change) still present in the working tree, despite the backend agent's verify-report.md stating it ran `git checkout -- apps/api/src/rbac/rbac.service.spec.ts` to revert an unrelated `eslint --fix` touch. The revert did not fully take (or the file was re-touched afterward). It is a no-op whitespace change with zero functional impact and the file is untouched by any stock-module logic, but it is an unreported diff outside this ticket's stated scope (`git diff apps/api/src/rbac/rbac.service.spec.ts` still shows a change). Recommend cleaning this up before PR so the diff stays scoped to `apps/api/src/stock/`.
3. Requirements.md's concurrent-test acceptance criterion (two parallel `adjust()` calls racing to over-draw stock, asserting final DB state is consistent) is not exercised against a real database in this repo's current test setup (Prisma is mocked in all `*.service.spec.ts`). tasks.md explicitly marks the live-concurrency test (BE-10) as optional/infra-dependent, and the implemented unit test for the `count === 0` path is the closest feasible proxy given the mocked infra. Flagging for visibility, not blocking — the atomicity guarantee itself comes from a single conditional SQL `UPDATE` statement (verified by reading the generated `updateMany` call), which is a well-established pattern for eliminating lost-update races without app-level locking.

## Verdict

PASS — all mandatory acceptance criteria are met by the code and covered by passing tests (build, lint, full test suite 184/184 green). The core fix — replacing check-then-act with a single atomic conditional `updateMany` (`stock_qty: { gte: -change_qty }` + `increment`), re-reading the DB-committed value for `stock_after`, and keeping the whole existing-row and new-row paths inside one interactive `$transaction` — correctly eliminates the lost-update race described in requirements.md. Multi-tenant scoping and RBAC are intact and unchanged. No critical issues found. The 3 non-critical items above (semantic exception-type nit, an unrelated leftover whitespace diff in `rbac.service.spec.ts`, and the intentionally-deferred live-concurrency integration test) do not block this ticket but are worth a follow-up glance before/at PR time.
