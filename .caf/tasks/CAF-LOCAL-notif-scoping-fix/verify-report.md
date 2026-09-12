# Verify Report — CAF-LOCAL-notif-scoping-fix (backend / apps/api)

## Status: SUCCESS

## Scope implemented (apps/api only, per tasks.md `(apps/api)` tags)

1. **Prisma schema** (`apps/api/prisma/schema.prisma`)
   - Added `notifications.merchant_id` (`Char(36)`, NOT NULL), FK `notifications_ibfk_3` →
     `merchants` (`onDelete: Cascade`, `onUpdate: NoAction`), matching the neighbouring
     `merchant_id` FKs on other child-of-merchant tables.
   - Added composite index `idx_notifications_merchant_user_read` on
     `(merchant_id, user_id, is_read)`.
   - Added the inverse `notifications notifications[]` relation field to `merchants`.

2. **Migration** — new folder
   `apps/api/prisma/migrations/20260912000000_add_merchant_id_to_notifications/migration.sql`,
   ordered exactly per the design doc: add nullable column → backfill from
   `users.merchant_id` via `INNER JOIN` → `MODIFY COLUMN ... NOT NULL` (fails atomically if any
   row is still orphaned, per the design's "stop, don't guess" decision) → add FK → add
   composite index. Matches the plain-SQL style of neighbouring migration folders (no
   down-migration file, consistent with `migration_lock.toml`'s `mysql` provider).
   - **Not applied to any database.** No `prisma migrate deploy`/`migrate dev` was run against a
     live DB, per instructions. `npx prisma generate` (local `node_modules/.bin/prisma`, v7.8.0)
     was run to regenerate the Prisma Client types so the code changes below type-check and
     build — this does not touch a database, it only regenerates client code from
     `schema.prisma`.

3. **`OutletHeaderGuard`** (`apps/api/src/common/guards/outlet-header.guard.ts`, new sibling to
   `ScopeByOutletGuard`, not an extension of it) — implements the design's exact guard logic:
   absent `x-outlet-id` header → pass-through (no filter); present header → validates outlet
   existence, `merchant_id` match against `request.user.merchant_id`, and a `user_roles`
   membership row, all three failures (plus any DB/malformed-id error) collapsed into the same
   `ForbiddenException('Invalid outlet context')` (403, never 500). On success, sets
   `request.user.outlet_id`. One deviation from the design's illustrative snippet: the
   `user_roles` model has a composite primary key (`@@id([user_id, role_id, outlet_id])`, no
   `id` column), so the membership `select` uses `{ user_id: true }` instead of `{ id: true }`
   — same existence check, no behavioural difference.
   - Registered **only** on `NotificationsController` (`@UseGuards(PermissionGuard,
     OutletHeaderGuard)`), not globally, not on any other controller.

4. **`NotificationsService`** (`apps/api/src/notifications/notifications.service.ts`) —
   `findAll`, `findOne`, `markAsRead`, `markAllAsRead` now take `merchantId` as the second
   positional parameter and scope every Prisma `where` by it. `findOne` throws the existing
   `ForbiddenException('You are not allowed to access this notification')` when
   `merchant_id` mismatches, even if `user_id` matches. `markAllAsRead`'s `updateMany` is scoped
   by `merchant_id` too.

5. **`notifyOutletUsers`** rewritten to the design's signature
   `(outletId, merchantId, payload, requiredPermission?)`: asserts the outlet belongs to
   `merchantId` via a duplicated private `assertOutletBelongsToMerchant` (same query shape and
   `UnauthorizedException` as `TransactionsService`'s method — no cross-module import), filters
   recipients by `role_permissions.some({ permissions: { code } })` when a permission code is
   given, falls back to today's "all users at outlet" query when omitted, and stamps
   `merchant_id` on every created row.

6. **Controller** (`apps/api/src/notifications/notifications.controller.ts`) — all four
   handlers now pass `@CurrentUser('merchant_id') merchantId` into the service alongside the
   existing `userId`/`outletId` params.

7. **Call site** (`apps/api/src/customer-catalog/customer-catalog.service.ts:236`) updated to
   pass `session.merchant_id` and `'transaction.read'` to the new `notifyOutletUsers` signature.

8. **CORS** (`apps/api/src/main.ts`) — added explicit `allowedHeaders: ['Content-Type',
   'Authorization', 'X-Outlet-Id']` to `app.enableCors()` (previously only `origin`/
   `credentials` were set).

9. **Seed data fix** (`apps/api/prisma/seed.ts`) — the `notifications` seed rows needed a
   `merchant_id` value now that the column is NOT NULL; added the correct merchant reference
   (`adminMerchant.id` / `merchant.id`) per each seeded row's outlet, to keep `pnpm build`
   type-checking `seed.ts` clean. No functional change beyond satisfying the new required
   column.

10. **New unit tests**
    - `apps/api/src/common/guards/outlet-header.guard.spec.ts`: absent header, valid header,
      wrong-merchant outlet, no `user_roles` row, non-existent outlet, and malformed-id/DB-error
      → all converted to the same `ForbiddenException`, never a 500.
    - `apps/api/src/notifications/notifications.service.spec.ts`: `findOne` same-merchant
      success and cross-merchant `ForbiddenException`; `notifyOutletUsers` wrong-merchant outlet
      throws and writes nothing, permission-filtered recipient query shape, and the
      no-permission-code path preserving the original "all users at outlet" query.

## Not touched (explicitly out of scope for this agent)
- `apps/web/**` — left entirely for `caf-frontend`.
- No guard/behaviour change to any controller other than `NotificationsController`.
  `AppModule` was not touched; `OutletHeaderGuard` is not registered as `APP_GUARD`.
- `transactions.service.spec.ts` was not modified and still passes.

## Verify Checklist (apps/api)

- [x] `pnpm --filter umkm-pos-api run lint` — clean, no errors/warnings.
- [x] No typecheck script exists for `apps/api`; `pnpm --filter umkm-pos-api run build` (`nest
      build`, which runs the full TypeScript compiler) is the type-error signal for this
      package and passes clean. This required running `npx prisma generate` first (via the
      local `node_modules/.bin/prisma`, v7.8.0 — the globally-resolved `prisma`/`npx prisma`
      picked up an unrelated v5.3.0 binary that failed with a config error unrelated to this
      change) so the generated Prisma Client types include the new `notifications.merchant_id`
      field. This only regenerates client type code from `schema.prisma`; it does not connect
      to or modify any database.
- [x] `pnpm --filter umkm-pos-api run test` — 21 suites / 234 tests passed, including
      `transactions.service.spec.ts` unmodified, plus the two new spec files above.
- [x] `pnpm --filter umkm-pos-api run build` — passes.

## Migration caveat (explicit, per instructions)

The migration SQL was written and reviewed for syntactic soundness against the style of
neighbouring migrations, but **it was not run against any database** — no reachable MySQL
instance was used or assumed. `prisma migrate deploy`/`migrate dev` were deliberately not
invoked. Applying this migration against a real database (staging/prod) is a follow-up action
outside this agent's execution.

---

# Verify Report — CAF-LOCAL-notif-scoping-fix (frontend / apps/web)

## Status: SUCCESS

## Scope implemented (apps/web only, per tasks.md `(apps/web)` tags)

1. **`apps/web/src/plugins/axios.ts`** — extended the existing request interceptor:
   - Imported `getOutlet` alongside the already-imported `getToken`/`removeAuth`/`isLogin` from
     `apps/web/src/helpers/auth.ts`.
   - Added, right after the existing `Authorization` header assignment:
     ```ts
     const outlet = getOutlet();

     if (outlet?.id) {
       config.headers['X-Outlet-Id'] = outlet.id;
     }
     ```
   - Follows the exact same shape/placement as the existing `Authorization` header logic (read
     value → guard → assign onto `config.headers`), per the design doc's cross-app contract
     (§4): header name `X-Outlet-Id`, value is `getOutlet().id`, header omitted entirely (not
     sent empty/null/"undefined") when no active outlet is set (`outlet?.id` is falsy when
     `getOutlet()` returns `{}`, which is what it returns when `APP_ACTIVE_OUTLET` is unset, per
     `getOutlet()`'s own fallback in `auth.ts`).
   - No other lines in the interceptor were touched; the 401 response interceptor and the
     `get`/`post`/`put`/`del` wrappers are unchanged.

2. **Confirmation task** — read `apps/web/src/components/UiSidebarNotification.vue` in full.
   Confirmed no code change is needed there: it calls `getListNotification` (from
   `apps/web/src/modules/notification/services/api.ts`), which goes through the shared `axios`
   instance and therefore automatically picks up the new `X-Outlet-Id` header from the
   interceptor change above. The 30s polling loop (`NOTIFICATION_POLL_INTERVAL_MS = 30000`) and
   the hardcoded `UiEmptyState` popover content are untouched, exactly as required. The outlet
   switcher and `apps/web/src/modules/notification/**` were not opened for editing and were not
   modified.

## Not touched (explicitly out of scope for this agent)
- `apps/web/src/components/UiSidebarNotification.vue` — read-only confirmation, no edit.
- Outlet switcher / `APP_ACTIVE_OUTLET` write path — untouched.
- Any WebSocket/Socket.IO code — none added.
- `apps/web/src/modules/notification/**` — untouched.
- `apps/api/**` — already implemented by `caf-backend` (see report section above); not
  re-verified beyond reading its report and `design.md` for the contract.

## Verify Checklist (apps/web)

- [x] No lint script exists in `apps/web/package.json` (`dev`, `build`, `preview`,
      `new-module` only) — verified manually by reading `package.json`; nothing to run.
- [x] No standalone typecheck script exists; `apps/web`'s `build` script is
      `vue-tsc -b && vite build`, so `vue-tsc -b` is the type-error signal and it is exercised by
      the build command below.
- [x] No test script exists in `apps/web/package.json` — verified manually; nothing to run.
- [x] `pnpm --filter umkm-pos-app run build` — passes clean (`vue-tsc -b` type-check plus `vite
      build`; only a pre-existing chunk-size warning unrelated to this change, no errors).
      (Ran via `pnpm --filter`, not `npm run --workspace`, since this is a pnpm+Turbo monorepo
      per the root `CLAUDE.md`; `npm run build --workspace umkm-pos-app` was tried first and
      correctly failed with "No workspaces found" since npm workspaces are not in use here.)

---

# Verify Report — CAF-LOCAL-notif-scoping-fix (fix round / reviewer BLOCKING finding, apps/api)

## Status: SUCCESS

## Finding addressed (BLOCKING)

Reviewer found that `apps/api/src/main.ts`'s new explicit `allowedHeaders` CORS list
(`['Content-Type', 'Authorization', 'X-Outlet-Id']`) silently replaced the previous
implicit "reflect whatever the browser asked for" behaviour of `app.enableCors()` with no
`allowedHeaders`. The list omitted `x-customer-session-token`, sent on every request by
`apps/web/src/plugins/customer-api.ts` (the customer-catalog/guest-ordering axios instance),
which would fail CORS preflight and break guest checkout on any deployment where web and api
are on different origins (the normal `CORS_ORIGIN` setup).

### Fix

1. **Re-derived the allow-list from code, not memory.** Grepped `apps/web/src` and
   `apps/landing/src` for every place a request sets custom headers
   (`grep -rniE "headers\[|headers:|headers\.set|setRequestHeader"`):
   - `apps/web/src/plugins/axios.ts` — `Authorization`, `X-Outlet-Id`.
   - `apps/web/src/plugins/customer-api.ts` — `x-customer-session-token` (the missing one).
   - `apps/web/src/services/uploads.ts` — only overrides `Content-Type` (to `undefined`, so
     the browser sets the multipart boundary itself); no new custom header.
   - `apps/landing/src/components/CustomerRegisterSection.vue` — only sets `Content-Type`.
   No other custom headers exist beyond the four already known. Added the missing one:
   `apps/api/src/main.ts`'s `allowedHeaders` is now `['Content-Type', 'Authorization',
   'X-Outlet-Id', 'X-Customer-Session-Token']`.
2. **Added a comment** directly above the `allowedHeaders` array explaining it is an explicit
   allow-list and that any new custom frontend request header must be added there too, so this
   footgun isn't re-armed for the next change.
3. **Casing convention:** settled on `Train-Case` (`X-Outlet-Id`, `X-Customer-Session-Token`)
   for every entry in the list, matching the existing `X-Outlet-Id` entry's style, even though
   the frontend sends the header as lowercase `x-customer-session-token` — CORS header matching
   is case-insensitive per spec and the `cors` package lowercases both sides before comparing,
   confirmed by the passing build/tests below, so this is a style choice only, not a behavioural
   one.

## Non-blocking finding addressed (test coverage)

Added `findAll` and `markAllAsRead` unit tests to
`apps/api/src/notifications/notifications.service.spec.ts`:
- `findAll`: asserts the list `findMany` query and the separate `unreadCount` `count` query are
  both scoped by `merchant_id`; and asserts the outlet filter (`outlet_id`) is present on both
  queries when an `outletId` is passed, and absent from both when it is not.
- `markAllAsRead`: asserts `updateMany`'s `where` is scoped by `merchant_id`, with and without an
  `outletId` present.

No other files were touched. The guard, service business logic, migration, schema, and seed
were left exactly as previously implemented, per instructions.

## Verify Checklist (apps/api) — re-run

- [x] `pnpm --filter umkm-pos-api run lint` — clean, no errors/warnings.
- [x] No typecheck script for `apps/api`; `pnpm --filter umkm-pos-api run build` (`nest build`,
      full `tsc` compile) is the type-error signal and passes clean.
- [x] `pnpm --filter umkm-pos-api run test` — 21 suites / 238 tests passed (9 in
      `notifications.service.spec.ts`, up from 5, covering the two new `describe` blocks).
- [x] `pnpm --filter umkm-pos-api run build` — passes.

## Files changed this round
- `apps/api/src/main.ts` — `allowedHeaders` fix + explanatory comment.
- `apps/api/src/notifications/notifications.service.spec.ts` — added `findAll` and
  `markAllAsRead` test coverage.
