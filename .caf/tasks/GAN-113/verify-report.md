## Ticket: GAN-113
## Agent: caf-backend
## Status: SUCCESS

## Attempt Log
- Attempt 1: PASS — build, lint, and test all green on first implementation.

## Acceptance Criteria
- [x] `adjust()` no longer computes `newStock` in application code and writes it as an
      absolute value for existing rows — write is now `stock_qty: { increment: dto.change_qty }`
      executed atomically by the database. See `apps/api/src/stock/stock.service.ts:213`.
- [x] For existing `outlet_product_inventory` rows, the "stock must not go negative" check and
      the `stock_qty` write happen in a single atomic DB operation: a conditional `updateMany`
      with `where: { ..., stock_qty: { gte: -dto.change_qty } }` (equivalent to
      `stock_qty + change_qty >= 0`), checked via `result.count`. No read-then-write window
      remains. See `apps/api/src/stock/stock.service.ts:203-217`.
- [x] When `updateMany` matches 0 rows, `adjust()` throws `BadRequestException` with an
      insufficient-stock message that does not reference a stale `currentStock` figure (message
      reworded to avoid promising a stale "Current: X"). See
      `apps/api/src/stock/stock.service.ts:219-232`.
- [x] `inventory_movements.stock_after` is now sourced from a re-read of the row after the
      atomic write (`tx.outlet_product_inventory.findUniqueOrThrow` for the update path,
      `tx.outlet_product_inventory.create(...)` result for the create path) — never from an
      application-computed `newStock` variable. See
      `apps/api/src/stock/stock.service.ts:234-263`.
- [x] "Row missing + `change_qty > 0`" create path preserved (`stock_qty: dto.change_qty`
      directly), now executed inside the same interactive `$transaction` as the movement write.
      See `apps/api/src/stock/stock.service.ts:242-255`.
- [x] "Row missing + `change_qty < 0`" still throws `NotFoundException` before entering the
      transaction — unchanged (`apps/api/src/stock/stock.service.ts:186-190`).
- [x] Concurrency behavior: covered by unit test asserting `BadRequestException` when the
      conditional `updateMany` returns `count: 0` (simulating a race where a concurrent request
      already consumed the available stock). A live-DB Promise.all concurrency test (BE-10) was
      marked optional in tasks.md and was not added — this project's test infra mocks
      `PrismaService` rather than running against a real MySQL instance, so the conditional
      `updateMany` WHERE-clause approach is the mechanism relied upon for actual concurrency
      safety (verified by MySQL's row-level locking semantics on `UPDATE ... WHERE`, not by an
      integration test in this run).
- [x] Response shape unchanged: `{ outlet_inventory: { outlet_id, product_id, stock_qty },
      movement }` — same fields as before. See
      `apps/api/src/stock/stock.service.ts:285-291`.

## Quality Gate
- Build (typecheck): PASS — `pnpm --filter umkm-pos-api build`
- Lint: PASS — `pnpm --filter umkm-pos-api lint` (no findings; auto-fix touched only
  whitespace in an unrelated file, `rbac.service.spec.ts`, which was reverted to keep this
  change scoped to the stock module)
- Test: PASS — `pnpm --filter umkm-pos-api test` — 184/184 tests passed across 14 suites,
  including 9 stock tests (updated `stock.service.spec.ts` covers: successful update via
  conditional `updateMany`, `BadRequestException` on `count: 0`, create-new-row path,
  `NotFoundException` on missing row + negative `change_qty`, invalid-reason rejections)
- Multi-tenant scope: PASS — every Prisma call in `adjust()` (product/outlet lookup,
  `updateMany`, `findUniqueOrThrow`, `create`, `inventory_movements.create`) filters/writes
  `merchant_id` from the `merchantId` parameter (JWT-derived), never from `dto`/body
- RBAC coverage: PASS — `POST /stock/adjust` has `@RequirePermission('stock.adjust')`, no
  `@Public()` in the module
- Raw SQL: PASS — no `$queryRaw`/`$executeRaw` in `apps/api/src/stock/`

## Files Changed
- apps/api/src/stock/stock.service.ts
- apps/api/src/stock/stock.service.spec.ts

## Catatan
- BE-10 (optional live-MySQL concurrency test) was not implemented since this repo's test
  setup mocks `PrismaService` rather than exercising a real database connection in unit
  tests; the correctness of the fix relies on MySQL evaluating the `UPDATE ... WHERE
  stock_qty >= -change_qty` condition atomically under row-level locking, which is standard
  RDBMS behavior for conditional `UPDATE` statements (Prisma's `updateMany` compiles to a
  single `UPDATE ... WHERE ...` statement) — not something a mocked unit test can prove
  directly, so this was left as noted in tasks.md (opsional).
- No schema/migration changes were needed or made, per requirements.md constraints.
- `git checkout -- apps/api/src/rbac/rbac.service.spec.ts` was run to discard an unrelated
  whitespace-only auto-fix from `eslint --fix` that fell outside this ticket's scope.
