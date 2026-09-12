# Design — CAF-LOCAL-notif-scoping-fix

Phase P0 only. No event bus / outbox / `apps/realtime` / WebSockets — none of that is designed
here, and nothing below should require rework when P1 lands (the outlet-context mechanism and
`notifyOutletUsers` signature are deliberately shaped so P1's event emitters can reuse them
unchanged).

---

## 1. `X-Outlet-Id` outlet-context mechanism

### Decision: new sibling guard, do NOT extend `ScopeByOutletGuard`

Read `scope-by-outlet.guard.ts` + `scope-by-outlet.decorator.ts` first (done). That pair solves a
different problem: `@ScopeByOutlet('body.outlet_id')` validates an outlet id that is already a
required field of a write DTO, checking only "does this outlet belong to the caller's merchant",
and it is a no-op (`return true`) whenever the decorator metadata is absent. It does **not** check
`user_roles` membership, and it does not write anything back onto `request.user`.

What this ticket needs is different: an *optional*, header-sourced, three-check validation
(exists / merchant match / `user_roles` membership) that — when it passes — populates
`request.user.outlet_id` so `@CurrentUser('outlet_id')` becomes live. Bolting that onto
`ScopeByOutletGuard` would silently change its behaviour for every other consumer of
`@ScopeByOutlet`. New sibling guard, same folder conventions:

- `apps/api/src/common/guards/outlet-header.guard.ts` — `OutletHeaderGuard`
- No new decorator/metadata is needed. Unlike `@ScopeByOutlet(fieldPath)`, this guard always reads
  the same fixed header, so there is nothing per-endpoint to parameterize. It is opted in purely by
  listing it in `@UseGuards(...)`.

### Header name and casing

Literal header name: **`X-Outlet-Id`** (this is the contract both apps must match). Express/Nest
lowercases incoming header keys, so guard code must read `request.headers['x-outlet-id']`, never
`request.headers['X-Outlet-Id']`. Frontend sends it with the literal casing `X-Outlet-Id` in the
`config.headers[...]` assignment for readability; HTTP header names are case-insensitive on the
wire so this is cosmetic, but keep it consistent so it's grep-able in both codebases.

### Guard vs interceptor vs middleware

**Guard.** It must run after the global `JwtAuthGuard` (so `request.user.{id,merchant_id}` already
exist) and it must be able to short-circuit the request with a 403 before the handler runs — both
are guard responsibilities, not interceptor (interceptors wrap the handler call, less natural for
a reject-before-invoke check) or middleware (runs before route-level DI context is fully set up
and, more importantly, "middleware vs guard" in Nest is exactly the auth-tier distinction — guards
are the established pattern for this in the repo already: `JwtAuthGuard`, `PermissionGuard`,
`ScopeByOutletGuard`).

### Registration — per-controller only, NOT global

```ts
@Controller('notification')
@UseGuards(PermissionGuard, OutletHeaderGuard)
export class NotificationsController { ... }
```

Registered **only** on `NotificationsController`. Do not add it to `AppModule`'s `APP_GUARD`
providers and do not add it to any other controller in this ticket — transactions/stock/shifts
keep using their own `getAllowedOutletIds` logic unchanged, exactly as the ticket requires. This is
the one thing to double-check in review: a `providers: [{ provide: APP_GUARD, useClass:
OutletHeaderGuard }]` anywhere would violate the ticket.

### How the validated id reaches `@CurrentUser('outlet_id')`

No change needed to `current-user.decorator.ts` or `jwt.strategy.ts`. `CurrentUser` already does
`request.user?.[data]`, evaluated at param-binding time, which happens after guards run. The guard
simply does `request.user.outlet_id = outletId` as its last step on success. `JwtStrategy.validate()`
stays exactly as it is today (`{ id, email, name, merchant_id, merchant, is_active }`) — outlet
context intentionally never touches the JWT, per Decision 1 in the ticket.

### Guard logic (exact)

```ts
@Injectable()
export class OutletHeaderGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const outletId = request.headers['x-outlet-id'] as string | undefined;

    // Absent header = no outlet filter. Never treat this branch as a rejection.
    if (!outletId) {
      return true;
    }

    try {
      const outlet = await this.prisma.outlets.findUnique({ where: { id: outletId } });

      if (!outlet || outlet.merchant_id !== request.user.merchant_id) {
        throw new ForbiddenException('Invalid outlet context');
      }

      const membership = await this.prisma.user_roles.findFirst({
        where: { user_id: request.user.id, outlet_id: outletId },
        select: { id: true },
      });

      if (!membership) {
        throw new ForbiddenException('Invalid outlet context');
      }
    } catch (err) {
      if (err instanceof ForbiddenException) throw err;
      // Malformed id (bad UUID shape, DB-level error, etc.) must never surface as a 500.
      throw new ForbiddenException('Invalid outlet context');
    }

    request.user.outlet_id = outletId;
    return true;
  }
}
```

SECURITY-CRITICAL, restated for the implementer:
- The header is **untrusted client input**, full stop.
- Absent header → `no outlet filter` (pass-through, not a rejection).
- Present header → must pass **all three** checks (exists, `merchant_id` match, `user_roles`
  membership) or it is rejected. There is no path where sending the header can *widen* access
  relative to no header at all — it can only narrow (successful case) or reject.
- All three failure branches, plus the malformed/DB-error catch-all, throw the **same**
  `ForbiddenException('Invalid outlet context')` — identical exception type and identical message.
  This is deliberate: it prevents an attacker from using differing error text/status to enumerate
  which outlets exist, which merchant they belong to, or who has roles where. A single generic 403
  shape everywhere.
- Nothing in this guard can produce a 500: the `try/catch` wraps every DB call and any thrown
  non-`ForbiddenException` (bad UUID format causing a driver error, etc.) is converted to the same
  403.

---

## 2. Migration — `notifications.merchant_id`

### Schema change (`apps/api/prisma/schema.prisma`)

```prisma
model notifications {
  id          String    @id @default(dbgenerated("(uuid())")) @db.Char(36)
  user_id     String    @db.Char(36)
  merchant_id String    @db.Char(36)
  outlet_id   String?   @db.Char(36)
  title       String    @db.VarChar(255)
  message     String    @db.Text
  type        String    @default("general") @db.VarChar(50)
  is_read     Boolean   @default(false)
  created_at  DateTime  @default(now()) @db.Timestamp(0)
  updated_at  DateTime  @default(now()) @db.Timestamp(0)
  users       users     @relation(fields: [user_id], references: [id], onDelete: Cascade, onUpdate: NoAction, map: "notifications_ibfk_1")
  outlets     outlets?  @relation(fields: [outlet_id], references: [id], onDelete: SetNull, onUpdate: NoAction, map: "notifications_ibfk_2")
  merchants   merchants @relation(fields: [merchant_id], references: [id], onDelete: Cascade, onUpdate: NoAction, map: "notifications_ibfk_3")

  @@index([user_id], map: "idx_notifications_user")
  @@index([outlet_id], map: "idx_notifications_outlet")
  @@index([is_read], map: "idx_notifications_is_read")
  @@index([created_at], map: "idx_notifications_created")
  @@index([merchant_id, user_id, is_read], map: "idx_notifications_merchant_user_read")
}
```

FK name `notifications_ibfk_3` continues the existing sequential `notifications_ibfk_1/_2` naming
already on this model (MySQL's own auto-numbering convention, which every other model in this
schema follows for its own FKs — see `outlets_ibfk_1`, `products_ibfk_1`/`_category`/`_image_upload`).
Also add the inverse relation field `notifications notifications[]` to the `merchants` model
(required by Prisma for the new relation; follow whatever list position the model already sorts
its `*[]` relation fields in).

**`onDelete: Cascade`, `onUpdate: NoAction`** — matches every other `merchant_id` FK on a
child-of-merchant table in this schema (`outlets_ibfk_1`, `products_ibfk_1`,
`product_categories_ibfk_1`). If a merchant is deleted, its notifications should not become
orphaned rows scoped to a nonexistent tenant; cascade is the existing convention, not a new one.

### Migration steps (ordered), new folder in `apps/api/prisma/migrations/`

Name it `<timestamp>_add_merchant_id_to_notifications` (standard Prisma `migrate dev` naming;
`migration_lock.toml` confirms provider `mysql`, so plain SQL, no down-migration file — matches
how Prisma always generates migrations here).

```sql
-- 1. Add nullable column first (existing rows must survive).
ALTER TABLE `notifications` ADD COLUMN `merchant_id` CHAR(36) NULL AFTER `user_id`;

-- 2. Backfill every existing row from the owning user's merchant.
UPDATE `notifications` n
INNER JOIN `users` u ON u.`id` = n.`user_id`
SET n.`merchant_id` = u.`merchant_id`
WHERE n.`merchant_id` IS NULL;

-- 3. Enforce NOT NULL. This step is also the safety check for orphans (see below) —
--    if any row still has merchant_id = NULL, this statement fails and the migration
--    stops here rather than silently succeeding with bad data.
ALTER TABLE `notifications` MODIFY COLUMN `merchant_id` CHAR(36) NOT NULL;

-- 4. FK to merchants, cascade delete, matching the neighbouring merchant_id FKs.
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_3`
  FOREIGN KEY (`merchant_id`) REFERENCES `merchants`(`id`)
  ON DELETE CASCADE ON UPDATE NO ACTION;

-- 5. Composite index for the new scoped read pattern.
CREATE INDEX `idx_notifications_merchant_user_read`
  ON `notifications` (`merchant_id`, `user_id`, `is_read`);
```

### Orphan rows — decide explicitly

Can a `notifications` row exist whose `user_id` no longer resolves to a `users` row? **No, not
under normal operation.** The existing FK `notifications_ibfk_1` is `onDelete: Cascade` on
`user_id` — deleting a user deletes their notifications in the same statement, so a live
notification row's `user_id` always resolves. The backfill `UPDATE ... INNER JOIN users` therefore
matches every existing row.

The only way step 2 leaves a `NULL` behind is if referential integrity was ever bypassed (e.g. a
prior bulk import with FK checks disabled, or manual `DELETE FROM users` outside the app). Rather
than inventing a merchant id for such a row (which would violate the tenancy rule this ticket
exists to enforce) or silently deleting it (destructive, undocumented, surprising), the design
choice is: **let step 3's `NOT NULL` conversion fail the whole migration.** MySQL rejects the
`MODIFY COLUMN ... NOT NULL` if any row is still `NULL`, so the migration aborts atomically before
the FK/index steps run, and the operator is forced to resolve the orphan manually (either restore
the user or delete the orphaned notification) before re-running. This is a deliberate "stop, don't
guess" choice consistent with the tenancy rule being enforced here.

---

## 3. `notifyOutletUsers` signature and permission filter

### New signature

```ts
async notifyOutletUsers(
  outletId: string,
  merchantId: string,
  payload: { title: string; message: string; type?: string },
  requiredPermission?: string,
): Promise<void>
```

Order: `outletId, merchantId` first (mirrors `assertOutletBelongsToMerchant(outletId, merchantId)`
in `transactions.service.ts:837` so the two call sites read the same way), then `payload` (the
core, always-required content), then `requiredPermission` last as the new optional parameter — so
the one existing call site's positional args for `outletId`/`payload` don't have to jump around,
only append two args.

### Reuse vs duplicate `assertOutletBelongsToMerchant`

**Duplicate a small private method inside `NotificationsService`, do not import
`TransactionsService`.** `apps/api/CLAUDE.md`'s layer rules keep services scoped to their own
module's Prisma access and business logic; `assertOutletBelongsToMerchant` is a `private` method on
`TransactionsService`, not an exported service capability, and importing `TransactionsModule` into
`NotificationsModule` for one 5-line query would create a module dependency edge that only exists
to reach a private helper — and a real risk of a cycle, since `CustomerCatalogService` already
depends on both `TransactionsService` and `NotificationsService`. Copy the query shape and the
exception type verbatim so behaviour matches exactly:

```ts
private async assertOutletBelongsToMerchant(outletId: string, merchantId: string) {
  const outlet = await this.prisma.outlets.findFirst({
    where: { id: outletId, merchant_id: merchantId },
  });
  if (!outlet) {
    throw new UnauthorizedException(
      `Outlet with ID ${outletId} does not belong to your merchant`,
    );
  }
  return outlet;
}
```

Yes, `UnauthorizedException` (→ 401), not `ForbiddenException` — this looks inconsistent with the
guard's 403s in §1, but the ticket explicitly says "reuse the pattern of
`assertOutletBelongsToMerchant`," and that existing, already-shipped method throws
`UnauthorizedException`. Matching it exactly (same exception type, same message template) is the
correct read of "reuse the pattern" here; this call is a service-layer domain assertion invoked
from `CustomerCatalogService`, not an HTTP-layer guard, so it isn't required to match the guard's
403 shape from §1.

### Permission filter — recipient resolution

Push the permission filter into the `user_roles` query itself (one query, not fetch-all-then-filter
in JS) using the same relation chain `PermissionGuard` walks
(`user_roles → roles → role_permissions → permissions.code`):

```ts
const userRoles = await this.prisma.user_roles.findMany({
  where: {
    outlet_id: outletId,
    ...(requiredPermission
      ? {
          roles: {
            role_permissions: {
              some: { permissions: { code: requiredPermission } },
            },
          },
        }
      : {}),
  },
  select: { user_id: true },
  distinct: ['user_id'],
});

if (userRoles.length === 0) return;

await this.prisma.notifications.createMany({
  data: userRoles.map((r) => ({
    user_id: r.user_id,
    outlet_id: outletId,
    merchant_id: merchantId,
    title: payload.title,
    message: payload.message,
    type: payload.type ?? 'general',
  })),
});
```

### No-permission-code path preserves today's behaviour exactly

When `requiredPermission` is omitted, the `where` clause is identical to what runs today
(`{ outlet_id: outletId }`, distinct `user_id`) — "all users with any role at the outlet" is
unchanged. The only behavioural addition on this path is `merchant_id` now being stamped on the
created rows, which is unavoidable (the column is NOT NULL after §2) and does not change *who*
receives a notification, only that the row now carries its tenant.

### Call flow, full method

1. `await this.assertOutletBelongsToMerchant(outletId, merchantId)` — throws before any query if
   the outlet belongs to a different merchant. AC5 requires this to throw and write nothing; since
   it's the first statement, nothing is written on failure.
2. Resolve recipients per the query above.
3. If empty, return (unchanged from today).
4. `createMany` stamping `merchant_id` on every row.

### Call site update

`apps/api/src/customer-catalog/customer-catalog.service.ts:236`:

```ts
await this.notificationsService.notifyOutletUsers(
  dto.outlet_id,
  session.merchant_id,
  {
    title: 'Tambahan Pesanan',
    message: `Ada tambahan pesanan dari ${session.customer_name} (Meja ${updatedOrder?.store_tables?.code ?? '-'})`,
    type: 'order_item_added',
  },
  'transaction.read',
);
```

### `NotificationsService` read/write methods — merchant scoping

Add `merchantId` as the second positional parameter everywhere (right after `userId`, since both
are the tenant/user identity pair; `outletId` stays last as the optional filter):

- `findAll(userId, merchantId, outletId, query)` — add `merchant_id: merchantId` into both `where`
  clauses (the `findMany`/`count` pair and the unread `count`).
- `findOne(id, userId, merchantId, outletId)` — check `notification.merchant_id !== merchantId` in
  the same `if` that already checks `user_id`/`outlet_id`, throwing the existing
  `ForbiddenException('You are not allowed to access this notification')` — same shape, no new
  exception type, per ticket requirement.
- `markAsRead(id, userId, merchantId, outletId)` — unchanged aside from forwarding `merchantId`
  into its `findOne(...)` call.
- `markAllAsRead(userId, merchantId, outletId)` — add `merchant_id: merchantId` to the `updateMany`
  `where`.

`NotificationsController` passes `@CurrentUser('merchant_id') merchantId: string` into each of the
four handler calls, alongside the existing `@CurrentUser('id') userId` and
`@CurrentUser('outlet_id') outletId` (the latter now live thanks to §1).

---

## 4. Cross-app contract (for `apps/frontend` to implement against, without reading backend code)

**Frontend sends:**
- Header name: `X-Outlet-Id` (case-insensitive on the wire).
- Value: the active outlet's `id`, read via the existing `getOutlet()` helper in
  `apps/web/src/helpers/auth.ts`.
- When `getOutlet()` has no `id` (no active outlet set), **omit the header entirely** — do not send
  it empty or as the literal string `"null"`/`"undefined"`. Set it in the axios request
  interceptor in `apps/web/src/plugins/axios.ts`, alongside the existing `Authorization` header
  assignment.

**API guarantees:**
- The header is entirely optional on every endpoint. Omitting it never rejects a request; it means
  "no outlet filter," which is today's behaviour for `NotificationsController`.
- If sent, it is validated server-side (exists, belongs to the caller's merchant, caller has a
  `user_roles` row for it) before being used to filter anything. Any of the three checks failing
  returns `403` with a generic body — the frontend does not need to distinguish the three failure
  reasons, and should not build UI that tries to.
- A malformed or non-existent outlet id in the header never produces a `500`; it is a `403` like
  any other validation failure.
- Only `GET /api/v1/notification`, `GET /api/v1/notification/:id`,
  `PATCH /api/v1/notification/:id/read`, and `PATCH /api/v1/notification/read-all` consume this
  header in this ticket. Sending it to any other endpoint is harmless (ignored) but has no effect,
  since the guard is registered only on `NotificationsController`.
- CORS: `X-Outlet-Id` will be an accepted preflight header on the API's CORS config; the frontend
  does not need to do anything beyond setting the header for it to pass preflight.
