# Tasks — CAF-LOCAL-notif-scoping-fix

## Architect Agent required: YES

This ticket needs the Architect Agent before implementation. Reasons:
- It changes the Prisma schema (`notifications.merchant_id`) and requires a **data-backfill
  migration** on a table that already has rows in production-like environments — migration
  ordering (add nullable column → backfill → add NOT NULL + FK + index) needs an explicit design
  decision, not just an implementation detail.
- It introduces a **new cross-cutting mechanism** (outlet-context guard/decorator reading
  `X-Outlet-Id`) that other modules will be able to see via `@CurrentUser('outlet_id')`, even
  though only `NotificationsService` is allowed to consume it in this ticket. The guard's shape
  and where it's registered (global vs. per-controller) affects future modules and should be
  architected, not improvised per-agent.
- The work spans two apps (`apps/api`, `apps/web`) with an implicit contract between them (the
  header name/format) that both implementation agents must agree on identically.

Recommendation: run the Architect Agent to produce a short design note (guard/decorator shape,
migration steps and ordering, exact header validation error responses) before `caf-backend`
starts, so both `caf-backend` and `caf-frontend` implement against the same contract.

## Backend Tasks (apps/api)

- [ ] (apps/api) Add `merchant_id` (`Char(36)`, NOT NULL, FK to `merchants`) to the
      `notifications` model in `apps/api/prisma/schema.prisma`, plus composite index
      `(merchant_id, user_id, is_read)`. Match existing model style (see `outlets`, `transactions`
      for FK/index naming conventions).
- [ ] (apps/api) Write a new migration in `apps/api/prisma/migrations/` that: adds `merchant_id`
      as nullable first, backfills every existing row from `users.merchant_id` (join on
      `notifications.user_id = users.id`), then alters the column to NOT NULL and adds the FK +
      composite index. Must run cleanly against a database that already has notification rows.
      Match the SQL style of neighboring migrations in that folder.
- [ ] (apps/api) Add an outlet-context guard + `@ScopeByHeaderOutlet`-style decorator (or reuse/
      extend the existing `apps/api/src/common/guards/scope-by-outlet.guard.ts` +
      `apps/api/src/common/decorators/` pair — follow whatever shape the Architect Agent's design
      note specifies) that: reads `X-Outlet-Id` from the request, and when present validates (a)
      the outlet exists, (b) it belongs to `request.user.merchant_id`, (c) the user holds a
      `user_roles` row for it — rejecting with 403 on any failure. When the header is absent, set
      no outlet filter (do not reject). Attach the validated value to `request.user.outlet_id` (or
      equivalent) so the existing `@CurrentUser('outlet_id')` reads in
      `apps/api/src/notifications/notifications.controller.ts` become live without controller
      changes. Do not apply this guard to any controller other than `NotificationsController` in
      this ticket.
- [ ] (apps/api) In `apps/api/src/notifications/notifications.service.ts`: thread `merchantId`
      (from the JWT, via the controller) through `findAll`, `findOne`, `markAsRead`,
      `markAllAsRead`, scoping every Prisma query by `merchant_id`. `findOne` must throw the
      existing `ForbiddenException` shape when the row's `merchant_id` does not match, even if
      `user_id` matches. `markAllAsRead` must scope its `updateMany` by `merchant_id` too.
- [ ] (apps/api) Update `NotificationsController` (`apps/api/src/notifications/notifications.controller.ts`)
      to pass `@CurrentUser('merchant_id')` into each service call alongside the existing `userId`/
      `outletId` params.
- [ ] (apps/api) Rewrite `NotificationsService.notifyOutletUsers` to: accept `merchantId` as a
      parameter, assert the target outlet belongs to that merchant (reuse the pattern of
      `TransactionsService.assertOutletBelongsToMerchant`,
      `apps/api/src/transactions/transactions.service.ts:837` — copy the query shape, do not
      import across module boundaries if that violates existing layering; duplicate the small
      query if needed), accept an optional `requiredPermission` (permission code) parameter that
      filters recipients to users whose role at that outlet grants it via `role_permissions` (join
      shape can mirror `PermissionGuard` in `apps/api/src/common/guards/permission.guard.ts`), fall
      back to today's "all users with any role at the outlet" behaviour when no permission code is
      given, and stamp `merchant_id` on every created row.
- [ ] (apps/api) Update the call site in
      `apps/api/src/customer-catalog/customer-catalog.service.ts:236` to pass `session.merchant_id`
      as `merchantId` and `'transaction.read'` as the required permission code.
- [ ] (apps/api) In `apps/api/src/main.ts`, confirm/extend the `app.enableCors()` config so
      `X-Outlet-Id` is in the allowed request headers (add an explicit `allowedHeaders` list
      including `Content-Type`, `Authorization`, `X-Outlet-Id` if one does not already exist, since
      the current config only sets `origin`/`credentials`).
- [ ] (apps/api) Add unit tests: outlet-context guard (valid header / wrong-merchant outlet / user
      has no `user_roles` row for the outlet / header absent), `NotificationsService.findOne`
      merchant scoping (same-merchant success, cross-merchant 403), and
      `notifyOutletUsers` (wrong-merchant outlet throws, permission filter narrows recipients,
      omitted permission preserves old behaviour).
- [ ] (apps/api) Run `pnpm --filter umkm-pos-api run test`, `pnpm --filter umkm-pos-api run lint`,
      and confirm `transactions.service.spec.ts` still passes unmodified (this ticket must not
      change transactions/stock/shifts behaviour).

## Frontend Tasks (apps/web)

- [ ] (apps/web) In `apps/web/src/plugins/axios.ts`, extend the request interceptor to read the
      active outlet via the existing `getOutlet()` helper from `apps/web/src/helpers/auth.ts` and
      set `config.headers['X-Outlet-Id'] = outlet.id` when an active outlet with an `id` is
      present; omit the header entirely (do not send it empty/null) when no active outlet is set.
- [ ] (apps/web) Confirm no other change is needed to `UiSidebarNotification.vue` or the outlet
      switcher — this ticket does not touch UI or rendering, only the outbound header.
- [ ] (apps/web) Run `pnpm --filter umkm-pos-app run build` (or the project's typecheck+build
      script) and `pnpm --filter umkm-pos-app run lint` to confirm nothing else broke.

## Ordering note
Backend tasks must land first (schema/migration, guard, service changes, updated call site) since
the frontend change only adds a header the backend must already know how to validate; do the
`apps/web` header task last.
