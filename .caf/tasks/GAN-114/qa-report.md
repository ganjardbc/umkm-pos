## Ticket: GAN-114
## Agent: qa
## Status: PASS

## Quality Gate Results
- Typecheck: PASS (no dedicated `typecheck` script for `umkm-pos-api`; used `pnpm --filter umkm-pos-api build` — `nest build` runs `tsc` under the hood, exit 0, no errors)
- Lint: PASS (`pnpm --filter umkm-pos-api lint` — `eslint "{src,apps,libs,test}/**/*.ts" --fix`, no errors reported)
- Test: PASS
  - `pnpm --filter umkm-pos-api test -- transactions`: Test Suites: 1 passed, 1 total; Tests: 11 passed, 11 total
  - `pnpm --filter umkm-pos-api test` (full suite): Test Suites: 14 passed, 14 total; Tests: 185 passed, 185 total

## Security Check Results (backend)
- Multi-tenant scope: PASS — `applyInventorySale`'s `updateMany` WHERE includes `merchant_id: merchantId`, `outlet_id`, `product_id`, `is_active: true` (`transactions.service.ts:730-738`); `inventory_movements.create` also carries `merchant_id` (`:766`). `merchantId` is threaded from the controller/JWT through every call site, never from `dto`/body. `outlet_id` on the incoming DTO is itself merchant-verified upstream via `assertOutletBelongsToMerchant(dto.outlet_id, merchantId)` in `prepareTransactionPayload` (`:539`) before any inventory row is touched, and `finalizeCustomerOrder` derives `outlet_id` from the already-fetched, merchant-scoped `transaction` row rather than from request input.
  - Note (non-critical): the post-decrement re-read `tx.outlet_product_inventory.findUnique({ where: { outlet_id_product_id: { outlet_id, product_id } } })` (`:756-762`) does not itself filter on `merchant_id` — Prisma's compound unique key here is only `[outlet_id, product_id]` so it can't. This is not a tenant leak: the read only happens after the immediately-preceding `updateMany` (which *did* filter on `merchant_id`) returned `count === 1` for that exact `outlet_id`+`product_id`, so the row is already proven to belong to the caller's merchant.
- RBAC coverage: PASS — all 5 routes in `transactions.controller.ts` have `@RequirePermission(...)`: `POST /` → `transaction.create` (:34), `GET /` → `transaction.read` (:61), `GET /:id` → `transaction.read` (:87), `POST /:id/cancel` → `transaction.cancel` (:105), `PATCH /:id/status` → `transaction.update_status` (:123). No `@Public()` routes in this module.
- Raw SQL: none found (`$queryRaw`/`$executeRaw` not used in `apps/api/src/transactions/`).
- Secret exposure: none found (no `console.log`/logger calls referencing password/token in `apps/api/src/transactions/`).

## Acceptance Criteria Verification
- [x] Check-and-decrement is one atomic operation per row — `tx.outlet_product_inventory.updateMany` with `stock_qty: { gte: item.qty }` in WHERE, executed via `tx` inside the same `$transaction` as `transactions.create`/`transaction_items.createMany`. `apps/api/src/transactions/transactions.service.ts:730-738`
- [x] `result.count === 0` throws `BadRequestException` naming the product ("Insufficient stock for product ... in this outlet."), which propagates out of the `$transaction` callback (no swallowing try/catch around it — confirmed only try/catch in the file is in unrelated `resolveCashierForPos`, `:689-693`) and triggers Prisma interactive-transaction rollback. `transactions.service.ts:740-744`
- [x] `prepareTransactionPayload`'s fail-fast check (`:601-611`) is retained, with an explicit comment marking it best-effort/non-atomic and pointing to `applyInventorySale`'s atomic `updateMany` as the sole source of truth.
- [x] `inventory_movements.stock_after` is populated from a post-decrement `tx.outlet_product_inventory.findUnique` re-read inside the same transaction (`:756-771`), replacing the stale `item.stock_after` computed pre-transaction. Verified by unit test asserting `stock_after: 9` after a mocked post-decrement value, and by the concurrency test asserting `stock_after: 0` matching the actual final in-memory stock.
- [x] Both call sites (`createPosTransaction` `:417-424`, `finalizeCustomerOrder` `:483-490`) call the same revised `applyInventorySale`; no other decrement path exists in this file. (`cancel()`'s stock *restore*, `:313-325`, is a separate increment-only path, out of scope per ticket.)
- [x] Regression test added: `transactions.service.spec.ts:220-337`, `concurrency / applyInventorySale` describe block — two concurrent `service.create()` calls for stock=1 via `Promise.allSettled`; asserts exactly one fulfilled / one rejected with `BadRequestException`, final `stock_qty === 0` and `not.toBeLessThan(0)`, and `inventory_movements.create` called with `stock_after: 0`.
- [x] `stock_qty` never negative — proven by the above test's explicit assertions, not just manual review.

## Edge Cases Tested / Reviewed
| Skenario | Expected | Actual | Status |
|---|---|---|---|
| Two concurrent sales race for last unit of stock | 1 succeeds, 1 rejects with `BadRequestException`, stock ends at 0 | Matches (unit test, `transactions.service.spec.ts:224-336`) | PASS |
| `updateMany` returns `count === 0` (stock insufficient or row inactive/missing) | `BadRequestException`, whole `$transaction` rolls back | Confirmed by code path + existing "reject sale when outlet inventory is insufficient" test (`:80-118`) | PASS |
| `inventory_movements.stock_after` reflects true post-decrement value, not stale pre-tx value | matches actual DB state | Confirmed via re-read + test assertion `stock_after: 9`/`stock_after: 0` | PASS |
| Exception from `applyInventorySale` not swallowed before reaching controller/global filter | propagates as 400 with `{success:false,message,code}` | Confirmed: no try/catch wraps `$transaction` calls at either call site; `HttpExceptionFilter` (`common/filters/http-exception.filter.ts`) maps any `HttpException` (incl. `BadRequestException`) to `{success:false, message, code, errors}` | PASS |
| `finalizeCustomerOrder` uses merchant-verified `outlet_id` (not client-suppled) when decrementing | outlet_id sourced from stored transaction row | Confirmed: `transaction.outlet_id` from a `findFirst` already scoped upstream via original transaction's outlet | PASS |
| Multi-tenant scope on new atomic decrement/read | `merchant_id` present in decrement WHERE | Confirmed present on `updateMany`; `findUnique` re-read relies on the immediately-prior merchant-scoped success rather than its own filter (see security note above) | PASS (with documented non-critical note) |
| DTO `items: []` (empty array) | rejected before opening `$transaction` | `prepareTransactionPayload` throws `BadRequestException('Transaction must have at least one item')` at `:550-552` (pre-existing, unaffected by this change) | PASS |

## Issues Found

### CRITICAL
None found.

### NON-CRITICAL
1. `apps/api/src/transactions/transactions.service.ts:756-762` — the post-decrement `findUnique` re-read for `inventory_movements.stock_after` filters only on `outlet_id`+`product_id` (Prisma compound unique key shape), not `merchant_id`. It is safe today because it only runs after a merchant-scoped `updateMany` success on the same row, but if this method is ever refactored to call the re-read independently of the `updateMany` result, that implicit safety assumption could be lost silently. Consider a code comment noting this coupling explicitly (currently only implied by ordering), or filter on `merchant_id` in application code (not possible directly in `findUnique`'s `where` given the current `@@unique([outlet_id, product_id])` shape, but could be an `if (updatedInventory)` assertion combined with a defensive comment).
2. `CreateTransactionDto.items` (`apps/api/src/transactions/dto/create-transaction.dto.ts:143-146`) has `@IsArray()` but no `@ArrayMinSize(1)` — the empty-array case is still caught by a service-level `BadRequestException` (`prepareTransactionPayload:550-552`), so there's no functional gap, but this is a pre-existing gap unrelated to this ticket's scope (not introduced by this change) — flagging only for awareness, not blocking.
3. Per `verify-report.md`'s own note: the atomic-path error message in `applyInventorySale` ("Insufficient stock for product \"X\" in this outlet.") is shorter than the fail-fast path's message in `prepareTransactionPayload` (which includes "Available: X, Requested: Y"). Both are `BadRequestException` with the same general wording per requirements ("pesan setara"), so this satisfies the acceptance criteria, but if any FE code parses the message string for "Available:"/"Requested:" substrings specifically (rather than just the `code`/generic message), it would only see the detailed variant on the fail-fast path and the shorter variant on the rare race-condition path. Out of scope for this backend-only ticket per its own scope notes; flagging for awareness only, no FE search was performed as it's explicitly out of scope.

## Verdict

PASS — all acceptance criteria are met and verified against the actual code (not just verify-report.md claims). Full build, lint, and test suite (185/185 tests, including the new concurrency regression test) pass. No critical security issues (multi-tenant scoping, RBAC, raw SQL, secret exposure all clean). Two non-critical, pre-existing/informational notes recorded above for awareness — none block this PR.
