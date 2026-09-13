# Requirements — CAF-LOCAL-notif-scoping-fix

## Status: PLAN

## Source
Local ticket (no tracker). Full ticket text: `.caf/tasks/CAF-LOCAL-notif-scoping-fix/ticket.md`.
Background context (not requirements): `docs/architecture/realtime-notifications-plan.md` §2 and
§11. This work is phase **P0 only** of that plan. Phases P1–P4 (event bus, `apps/realtime`,
`packages/shared-events`, webhooks, notification UI, preferences, retention job) are explicitly
out of scope and MUST NOT be planned or touched here.

No `.caf/discovery/CAF-LOCAL-notif-scoping-fix/prd.md` exists, so the discovery fallback does not
apply. `ticket.md` is treated as the requirement source directly. There is no "Open Questions"
section in `ticket.md` — the "Decisions already made (do not re-open)" section closes off the
three design choices that would otherwise be open questions (header-based outlet context,
permission-code audience targeting, additive/backfilled migration). Nothing here is unanswered.

## Problem summary
Three pre-existing scoping defects in the notifications feature, all of which would leak worse
once realtime push (a later phase) is built:

1. **Outlet scoping is dead code.** `NotificationsController` reads `@CurrentUser('outlet_id')`
   in `findAll`, `findOne`, `markAsRead`, `markAllAsRead`, but `JwtStrategy.validate()`
   (`apps/api/src/auth/strategies/jwt.strategy.ts`) never puts `outlet_id` on the JWT user object
   (`{ id, email, name, merchant_id, merchant, is_active }`), so it is always `undefined` and
   every `...(outletId ? { outlet_id: outletId } : {})` branch in `NotificationsService`
   (`apps/api/src/notifications/notifications.service.ts`) is a no-op.
2. **No merchant boundary on `notifications`.** The `notifications` model
   (`apps/api/prisma/schema.prisma:87`) has no `merchant_id`. `findOne` authorizes on `user_id`
   alone, violating the root `CLAUDE.md` tenancy rule.
3. **`notifyOutletUsers` over-delivers.** `NotificationsService.notifyOutletUsers(outletId, payload)`
   (called only from `apps/api/src/customer-catalog/customer-catalog.service.ts:236`) never
   checks that `outletId` belongs to the caller's merchant, and fans out to every user with any
   role at the outlet regardless of the permission the notification concerns.

## Decisions already made (do not re-open — copied verbatim from ticket.md)
1. Active outlet reaches the API via an `X-Outlet-Id` request header, never the JWT. The header
   is untrusted client input and MUST be validated on every request: outlet must exist, belong to
   the JWT's `merchant_id`, and the authenticated user must hold a `user_roles` row for it.
   Absent header → no outlet filter (current behaviour preserved). Invalid header → rejected
   (403), never silently ignored.
2. Audience targeting for `notifyOutletUsers` uses **permission codes** (consistent with
   `PermissionGuard` / `@RequirePermission()`), not role names/ids.
3. The `notifications` schema change is additive: existing rows survive, `merchant_id` is
   backfilled from `users.merchant_id` in the migration, before the NOT NULL constraint is
   applied.

## In scope

### apps/api
- New outlet-context mechanism (guard/decorator, following the existing `apps/api/src/common/`
  conventions such as `ScopeByOutletGuard`/`@ScopeByOutlet` and `PermissionGuard`/
  `@RequirePermission`) that reads `X-Outlet-Id`, validates it per Decision 1, and makes it
  available via `@CurrentUser('outlet_id')` so the existing (currently dead) controller
  parameters become live. Must be opt-in/optional per the "absent header = no filter" rule and
  must not change behaviour for any other module in this ticket (transactions/stock/shifts keep
  using their own `getAllowedOutletIds`).
- `notifications` Prisma model: add `merchant_id` (`Char(36)`, NOT NULL, FK to `merchants`), plus
  a migration in `apps/api/prisma/migrations/` that backfills from `users.merchant_id` for
  existing rows before adding the NOT NULL constraint. Add composite index
  `(merchant_id, user_id, is_read)`. Match existing migration/model naming style.
- `NotificationsService`: scope `findAll`, `findOne`, `markAsRead`, `markAllAsRead` by
  `merchant_id` from the JWT. `findOne` (and by extension `markAsRead`, which calls it) rejects
  cross-merchant access with the existing 403 `ForbiddenException` shape. `markAllAsRead` likewise
  merchant-scoped.
- `notifyOutletUsers`: accept `merchantId`, assert target outlet belongs to that merchant (reuse
  the pattern of `TransactionsService.assertOutletBelongsToMerchant`,
  `apps/api/src/transactions/transactions.service.ts:837`), accept an optional required-permission
  code, deliver only to users at that outlet whose roles grant it (when omitted, keep today's
  "all users at outlet" behaviour so the existing call site's meaning does not silently change),
  and stamp `merchant_id` on created rows.
- Update the one call site, `apps/api/src/customer-catalog/customer-catalog.service.ts:236`, to
  pass the merchant id already in scope (`session.merchant_id`) and the `transaction.read`
  permission code.
- `apps/api/src/main.ts` CORS config: ensure `X-Outlet-Id` is allowed if the current config would
  otherwise block a custom header (e.g. `allowedHeaders`).

### apps/web
- `apps/web/src/plugins/axios.ts` request interceptor: attach `X-Outlet-Id: <APP_ACTIVE_OUTLET id>`
  when an active outlet is set, using the existing `getOutlet()` helper in
  `apps/web/src/helpers/auth.ts`. No UI change. No change to `UiSidebarNotification.vue` or the
  outlet switcher.

## Explicitly out of scope
- Any WebSocket/Socket.IO/SSE work, `apps/realtime`, `packages/shared-events`, `event_outbox`,
  outbound webhooks.
- Removing/changing the 30s polling loop in `UiSidebarNotification.vue`.
- Rendering the notification list in the sidebar popover (stays a hardcoded empty state).
- New notification columns (`severity`, `payload`, `ref_type`/`ref_id`, `event_key`), preferences,
  retention/purge job.
- Applying `X-Outlet-Id` filtering to any module besides `NotificationsService`. The context must
  be available API-wide (as middleware/guard), but only notifications consumes it here.

## Acceptance criteria (verbatim from ticket.md)
1. `GET /api/v1/notification` with `X-Outlet-Id: A` (user has roles at outlets A and B, one
   merchant) returns only outlet-A notifications and `meta.unreadCount` counts only those; no
   header returns notifications from both.
2. `X-Outlet-Id` naming a different merchant's outlet, an outlet the user has no `user_roles` row
   for, or a non-existent id → 403 (never silently ignored, never 500).
3. `GET /api/v1/notification/:id` and `PATCH /api/v1/notification/:id/read` for a notification
   belonging to another merchant → 403, even with a correctly guessed id.
4. `notifications.merchant_id` exists, NOT NULL, all pre-existing rows backfilled from the
   merchant of their `user_id`. Migration runs cleanly against a DB that already has rows.
5. A customer order via the customer catalog creates notification rows only for users at that
   outlet whose roles grant `transaction.read`, each row carrying the correct `merchant_id`.
   Passing an `outletId` from another merchant throws, writes nothing.
6. `apps/web` sends `X-Outlet-Id` when `APP_ACTIVE_OUTLET` is set, omits it cleanly otherwise. No
   CORS preflight failure from the new header.
7. `pnpm --filter umkm-pos-api run test` passes (incl. `transactions.service.spec.ts`); lint and
   build pass for both `apps/api` and `apps/web`.
8. New unit tests cover outlet-context validation (valid / wrong-merchant / no-role / absent) and
   merchant scoping of `findOne`.

## Open Questions
None. `ticket.md` closes the three design decisions that would otherwise be open (see "Decisions
already made" above). No unanswered questions block planning.
