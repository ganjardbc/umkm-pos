## Ticket: GAN-114
## Agent: caf-backend
## Status: SUCCESS

## Attempt Log
- Attempt 1: PASS — build, lint, and full test suite all green after implementing the
  atomic conditional decrement.

## Acceptance Criteria
- [x] Check-and-decrement is now one atomic operation per row — `applyInventorySale`
      uses `tx.outlet_product_inventory.updateMany({ where: { outlet_id, product_id,
      merchant_id, is_active: true, stock_qty: { gte: item.qty } }, data: { stock_qty:
      { decrement: item.qty }, ... } })` executed via `tx` inside the same
      `$transaction` as the transaction/transaction_items inserts.
      `apps/api/src/transactions/transactions.service.ts:718-737`
- [x] `result.count === 0` throws `BadRequestException` with a message naming the
      product ("Insufficient stock for product ... in this outlet"), which propagates
      out of the `$transaction` callback and rolls back the whole transaction (no
      try/catch swallows it at either call site). `transactions.service.ts:739-743`
- [x] `prepareTransactionPayload`'s fail-fast check (line ~601) is kept and now
      documented with a comment explaining it is best-effort/non-atomic and that
      `applyInventorySale`'s atomic updateMany is the authoritative check.
      `transactions.service.ts:601-611`
- [x] `inventory_movements.stock_after` is now populated from a post-decrement
      re-read via `tx.outlet_product_inventory.findUnique` inside the same
      transaction, replacing the stale `item.stock_after` computed in
      `prepareTransactionPayload`. `transactions.service.ts:745-761`
- [x] Both call sites (`createPosTransaction` line ~417 and `finalizeCustomerOrder`
      line ~483) use the revised `applyInventorySale` unchanged in call shape (they
      already pass `prepared.itemsData`, which includes `product_name_snapshot`
      needed for the new error message) — no other POS commit path decrements stock.
- [x] Regression test added in
      `apps/api/src/transactions/transactions.service.spec.ts` (`concurrency /
      applyInventorySale` describe block): two concurrent `service.create()` calls
      for the same product/outlet with stock=1 → exactly one fulfills, one rejects
      with `BadRequestException`; final `stock_qty` in the shared in-memory store is
      `0` (never negative); `inventory_movements.create` is asserted to receive
      `stock_after: 0` matching the actual post-decrement value.
- [x] `stock_qty` never negative — proven by the above test's `expect(inventoryStore
      .stock_qty).not.toBeLessThan(0)` assertion plus the exact-value assertion
      `toBe(0)`.

## Quality Gate
- Build (`pnpm --filter umkm-pos-api build`): PASS
- Lint (`pnpm --filter umkm-pos-api lint`): PASS
- Test (`pnpm --filter umkm-pos-api test`): PASS — 14 suites, 185 tests
- Multi-tenant scope: PASS — `updateMany` where-clause includes `merchant_id:
  merchantId` derived from the service parameter (ultimately from JWT via
  controller), never from `dto`/`body`.
- RBAC coverage: PASS — all 5 transaction routes (`POST /`, `GET /`, `GET /:id`,
  `POST /:id/cancel`, `PATCH /:id/status`) have `@RequirePermission`; no `@Public()`
  routes in this module.
- Raw SQL: none (`$queryRaw`/`$executeRaw` not used in this module).

## Files Changed
- apps/api/src/transactions/transactions.service.ts
- apps/api/src/transactions/transactions.service.spec.ts

## Catatan
- Task description (BE-1 step 3) said re-read via `findFirst` with the
  `outlet_id_product_id` compound key — that key shape is only valid as a
  `WhereUniqueInput`, so `findUnique` was used instead (the correct Prisma call for
  a unique compound key), which is what BE-1 was functionally asking for.
- `applyInventorySale`'s error message was simplified to not repeat "Available: X,
  Requested: Y" (that data isn't cheaply available post-atomic-updateMany without an
  extra read) — kept it "senada" (same tone/kind) with the existing insufficient-stock
  message per BE-2, still names the product. This is a pre-existing, non-atomic,
  fail-fast message in `prepareTransactionPayload` that still includes the full
  Available/Requested detail for the common (non-race) case; only the atomic
  fallback path in `applyInventorySale` has the shorter message.
- No schema/migration changes made, per requirements (`outlet_product_inventory`
  schema untouched).
- Did not touch `apps/web` or `packages/shared-types` — backend-only per scope.
