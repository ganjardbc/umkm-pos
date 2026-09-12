# CAF-LOCAL-notif-scoping-fix

**Title:** Fix notification tenant/outlet scoping before realtime push is built

**Source:** Local ticket, no tracker. Written by the developer from
`docs/architecture/realtime-notifications-plan.md` §2 and §11 (that doc is added in this
same branch — read it for the wider context, but implement ONLY what this ticket states).

**Phase:** P0 of the realtime-notifications plan. Explicitly a prerequisite: no WebSocket
gateway, no event bus, no `apps/realtime`, no `packages/shared-events` in this ticket.

---

## Problem

The notifications feature has three scoping defects. All three are pre-existing and all
three would be amplified by the realtime push planned in later phases (faster delivery of
rows the recipient should not see), so they are fixed first.

### Bug 1 — outlet scoping is dead code

`apps/api/src/notifications/notifications.controller.ts` reads the active outlet via
`@CurrentUser('outlet_id')` in all four handlers (`findAll`, `findOne`, `markAsRead`,
`markAllAsRead`).

`JwtStrategy.validate()` in `apps/api/src/auth/strategies/jwt.strategy.ts` returns only:

```
{ id, email, name, merchant_id, merchant, is_active }
```

There is no `outlet_id` on that object, so the parameter is always `undefined` and every
`...(outletId ? { outlet_id: outletId } : {})` branch in `NotificationsService` is a no-op.
Effect: a user assigned to several outlets sees notifications from ALL of them regardless of
the outlet they have selected. The active outlet currently lives only in the browser
(`APP_ACTIVE_OUTLET` in localStorage) and is never transmitted to the API.

### Bug 2 — no merchant boundary on the notifications table

The `notifications` model (`apps/api/prisma/schema.prisma:87`) has `user_id` and a nullable
`outlet_id`, but no `merchant_id`. `NotificationsService.findOne()` authorises on `user_id`
alone. The tenancy rule in the root `CLAUDE.md` ("every database query in the API must scope
by `merchant_id`, extracted from the JWT — never from client input") therefore cannot be
enforced on this table at all.

### Bug 3 — `notifyOutletUsers` over-delivers

`NotificationsService.notifyOutletUsers(outletId, payload)`:

- does not verify that `outletId` belongs to the caller's merchant — it takes the id straight
  from the caller (`customer-catalog.service.ts:236` passes `dto.outlet_id`);
- fans out to every user holding any role at that outlet, with no filter on the permission
  the notification is actually about. A cashier receives notifications intended for an owner.

---

## Decisions already made (do not re-open)

1. **Active outlet reaches the API via an `X-Outlet-Id` request header**, not via the JWT.
   Reason: `apps/web` switches outlet purely in localStorage with no auth round-trip; putting
   `outlet_id` in the token would force a re-login on every outlet switch.
   The header value is **untrusted client input** and MUST be validated server-side on every
   request before use: the outlet must exist, belong to the JWT's `merchant_id`, AND the
   authenticated user must hold a `user_roles` row for it. A header that fails any of these is
   rejected — never silently ignored and never trusted as-is.
2. **Audience targeting uses permission codes**, consistent with `PermissionGuard` /
   `@RequirePermission()` elsewhere in the API. Do not introduce role-name or role-id
   targeting.
3. Extending `notifications` is **additive**. Existing rows must survive; `merchant_id` is
   backfilled from the owning user's `users.merchant_id`.

---

## Scope

### In scope — `apps/api`

- Outlet context: a mechanism that reads `X-Outlet-Id`, validates it as described in decision
  1, and makes it available to `@CurrentUser('outlet_id')` so the existing controller code
  becomes functional. Follow the existing `apps/api/src/common/` guard/decorator conventions.
  The header is optional: absent header = no outlet filter (current behaviour for endpoints
  that legitimately span outlets), invalid header = rejected.
- `notifications` table: add `merchant_id` (`Char(36)`, NOT NULL, FK to `merchants`), plus a
  migration in `apps/api/prisma/migrations/` that backfills existing rows from
  `users.merchant_id` before applying the constraint. Add the composite index
  `(merchant_id, user_id, is_read)`. Match the naming/style of the surrounding models and of
  the existing migrations.
- `NotificationsService`: every read and write scoped by `merchant_id` taken from the JWT.
  `findOne` must reject a notification belonging to another merchant with the same 403 shape it
  already uses. `markAllAsRead` likewise.
- `notifyOutletUsers`: accept `merchantId` from the caller, assert the target outlet belongs to
  that merchant (reuse the pattern of
  `TransactionsService.assertOutletBelongsToMerchant`, `transactions.service.ts:837`), accept
  an optional required-permission code and deliver only to users at that outlet whose roles
  grant it, and stamp `merchant_id` on the rows it creates. When no permission code is given,
  behaviour stays as today (all users at the outlet) so the existing call site does not change
  meaning unintentionally.
- Update the single existing call site, `apps/api/src/customer-catalog/customer-catalog.service.ts:236`,
  to pass the merchant id it already has in scope, and the permission code appropriate for a
  new customer order (`transaction.read`).

### In scope — `apps/web`

- The axios request interceptor (`apps/web/src/plugins/axios.ts`) attaches
  `X-Outlet-Id: <APP_ACTIVE_OUTLET id>` to API requests when an active outlet is set, using the
  existing helper in `apps/web/src/helpers/auth.ts`. No UI change, no change to the outlet
  switcher, no change to `UiSidebarNotification.vue` in this ticket.
- `CORS_ORIGIN` handling in `apps/api/src/main.ts` must allow the new request header if the
  current CORS config would otherwise block it.

### Explicitly OUT of scope

- Any WebSocket / Socket.IO / SSE work, `apps/realtime`, `packages/shared-events`,
  `event_outbox`, outbound webhooks.
- Removing or changing the 30s polling loop in `UiSidebarNotification.vue`.
- Rendering the notification list in the sidebar popover (it is a hardcoded empty state today —
  leave it).
- New notification types, `severity`, `payload`, `ref_type`/`ref_id` columns, preferences,
  retention/purge job. Those belong to later phases.
- Applying `X-Outlet-Id` filtering to modules other than notifications. The context must be
  *available* API-wide, but only `NotificationsService` consumes it in this ticket —
  transactions/stock/shifts already resolve outlets through their own
  `getAllowedOutletIds` logic and must not change behaviour here.

---

## Acceptance criteria

1. With two outlets A and B under one merchant and a user holding a role at both, a
   `GET /api/v1/notification` sent with `X-Outlet-Id: A` returns only notifications whose
   `outlet_id` is A, and `meta.unreadCount` counts only those. The same request with no header
   returns notifications from both.
2. `X-Outlet-Id` naming an outlet of a different merchant, an outlet the user has no
   `user_roles` row for, or a non-existent id, is rejected with 403 (not silently ignored, and
   not 500).
3. `GET /api/v1/notification/:id` and `PATCH /api/v1/notification/:id/read` for a notification
   belonging to another merchant return 403, even when the id is guessed correctly.
4. `notifications.merchant_id` exists, is NOT NULL, and every pre-existing row has been
   backfilled with the merchant of its `user_id`. The migration runs cleanly on a database that
   already contains notification rows.
5. A customer order placed through the customer catalog creates notification rows only for
   users at that outlet whose roles grant `transaction.read`, each row carrying the correct
   `merchant_id`. Passing an `outletId` from another merchant throws rather than writing rows.
6. `apps/web` sends `X-Outlet-Id` on API requests when `APP_ACTIVE_OUTLET` is set, and omits
   the header cleanly when it is not. No request fails CORS preflight because of the new header.
7. Existing behaviour preserved: `pnpm --filter umkm-pos-api run test` passes, including
   `transactions.service.spec.ts`; lint and build pass for both apps.
8. New unit tests cover the outlet-context validation (valid / wrong-merchant / no-role /
   absent) and the merchant scoping of `findOne`.
