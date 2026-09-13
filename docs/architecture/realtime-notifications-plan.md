# Realtime Notifications — Design Plan

Status: proposal (not implemented)
Scope: new workspace app + event contracts package + API emitters + `apps/web` client
Audience: engineers working on `umkm-pos`

---

## 1. Naming: `apps/webhook` is the wrong name for this

What you described — "realtime notifications for `apps/web`" — is **server → browser push**. That is a WebSocket/SSE gateway, not a webhook. A webhook is the opposite direction: *we* POST to a *third party's* URL (Moka, accounting SaaS, WhatsApp gateway, merchant's own system).

Both are worth building, but they are different services with different failure modes (push = live, ephemeral, fan-out; webhook = durable, retried, signed). Proposal:

| App | Role | Phase |
|---|---|---|
| `apps/realtime` | Socket gateway. Auth via JWT, room fan-out to browsers. | P1 (now) |
| `apps/webhook` | Outbound HTTP delivery to merchant-configured endpoints, with HMAC + retry. | P3 (later) |

Both consume the **same event stream**, so build the event stream once. If you prefer a single deployable to start, name it `apps/realtime` and add outbound delivery as a module inside it; splitting later is cheap because the contract is the bus, not the process.

Rest of this doc calls the new service `apps/realtime`.

---

## 2. Current state (what exists today)

- `apps/api/src/notifications/` — CRUD over the `notifications` table. Read/mark-read only. No realtime.
- `notifications` table (`schema.prisma:87`) — one row **per recipient user**: `user_id`, `merchant_id` (added in P0, see below), nullable `outlet_id`, `title`, `message`, `type`, `is_read`. Still no structured payload, no ref to the source entity — those remain P1+/P3 work (§6).
- Only **one** producer in the whole codebase: `NotificationsService.notifyOutletUsers()`, called from `customer-catalog.service.ts:236` (customer places an order). Every other domain event (payment, cancel, shift close, low stock, role change) emits nothing.
- `apps/web/src/components/UiSidebarNotification.vue` — polls `GET /api/v1/notification` every **30s** just to read `meta.unreadCount`. The popover renders a hardcoded empty state; the list is never shown.
- `apps/web/src/modules/notification/` — module scaffold exists (store, api, page) but is thin.

### Three bugs — fixed in P0 (`CAF-LOCAL-notif-scoping-fix`)

> **Status: fixed.** The three bugs described below were live at the time this doc was written.
> They were fixed by ticket `CAF-LOCAL-notif-scoping-fix` (see §10, P0, and §11 decision 3):
> `OutletHeaderGuard` now validates an optional `X-Outlet-Id` header before it populates
> `@CurrentUser('outlet_id')`, `notifications.merchant_id` was added (backfilled, NOT NULL, FK to
> `merchants`), and `notifyOutletUsers` now asserts the outlet belongs to the caller's merchant and
> filters recipients by permission code. Kept here as historical context for why P1+ is designed
> the way it is.

1. ~~**Outlet scoping is dead code.**~~ `NotificationsController` reads `@CurrentUser('outlet_id')`, but `JwtStrategy.validate()` (`apps/api/src/auth/strategies/jwt.strategy.ts`) returns only `id, email, name, merchant_id, merchant, is_active`. `outlet_id` is always `undefined`, so every outlet filter in `NotificationsService` is a no-op — a user sees their notifications from **all** outlets regardless of `APP_ACTIVE_OUTLET`. The active outlet lives only in the browser's localStorage and is never sent as a header or query param.
2. ~~**No merchant boundary.**~~ `notifications.findOne` checks `user_id` only. There is no `merchant_id` column, so the tenant rule in the root `CLAUDE.md` ("every query scoped by `merchant_id` from the JWT") is not enforceable on this table.
3. ~~**`notifyOutletUsers` fans out to every user with any role at the outlet**~~, with no permission filter and no merchant check on `outletId`. A cashier gets "kas selisih" notifications meant for an owner.

These were fixed before layering realtime on top — otherwise realtime would just have delivered the wrong rows faster.

---

## 3. Target architecture

```
┌──────────────┐  1. write domain row + event_outbox row (same $transaction)
│  apps/api    │───────────────────────────────► ┌──────────────────┐
│  (NestJS)    │                                 │  event_outbox    │
└──────┬───────┘                                 │   (MySQL)        │
       │                                         └────────┬─────────┘
       │ 2a. fire-and-forget POST                         │ 2b. retry sweep
       │     /internal/events (shared secret)             │     (poller, 2s)
       ▼                                                  ▼
┌──────────────────────┐   3. fan-out to rooms
│   apps/realtime      │─────────────────────────► apps/web (Socket.IO client)
│  Socket.IO gateway   │
│  + ACL resolver      │─────────────────────────► apps/webhook (P4)
└──────────────────────┘

   (optional, only at 2+ gateway containers: swap 2a/2b for Redis or Valkey pub/sub
    + @socket.io/redis-adapter — same envelope, no app-code change)
```

### Why each piece

**Transactional outbox (`event_outbox` table).** A POS sale must not silently fail to notify because Redis blinked. Write the event row inside the same `prisma.$transaction` as the sale, then a poller (every 1s, `FOR UPDATE SKIP LOCKED`-style claim) publishes and marks it sent. This is the single most important reliability decision here; without it, "in-app order came in" is best-effort and the kitchen misses orders.

**Transport between api and gateway: plain HTTP, not a broker.** `apps/api` POSTs the envelope to `http://umkm-pos-realtime:3001/internal/events` over the internal `devbox_devnet` network, authenticated by a shared secret header. Zero new containers, zero new dependencies, and the outbox already provides the durability a broker would have given you — if the POST fails, the row stays `pending` and the retry sweep re-delivers it. The gateway dedupes on `DomainEvent.id`.

A broker only earns its place when there are **two or more `apps/realtime` containers**, because then a socket connected to container A must receive events delivered to container B. Today's `docker-compose.yml` runs one container per service on one host, so that day is far off. When it comes, add Redis or Valkey plus `@socket.io/redis-adapter` and change the subscriber module only — the envelope and every emit site stay identical.

See §9 for the licensing/cost detail on that future broker.

**Socket.IO over raw WS or SSE.** Rooms are the whole point: `socket.join('outlet:xxx')` gives you the outlet/merchant/role routing for free, plus reconnect-with-backoff and a long-polling fallback for the flaky mobile networks a POS runs on. SSE would need you to hand-roll fan-out and can't easily do per-connection outlet switching.

---

## 4. Event routing: getting events "in the right place"

This is the core of your ask. Every event declares **where it belongs** and **who may see it**, and the gateway — never the client — decides delivery.

### Envelope (lives in a new `packages/shared-events`)

```ts
export interface DomainEvent<T = unknown> {
  id: string;                    // uuid, idempotency key
  key: EventKey;                 // 'transaction.paid'
  occurred_at: string;           // ISO
  merchant_id: string;           // ALWAYS present — tenant boundary
  outlet_id: string | null;      // null = merchant-wide
  actor_user_id: string | null;  // who caused it (for self-suppression)
  scope: 'merchant' | 'outlet' | 'role' | 'user';
  audience: {
    permissions?: string[];      // e.g. ['transaction.read']
    role_ids?: string[];
    user_ids?: string[];
  };
  persist: boolean;              // true → also write notifications row
  ref: { type: string; id: string };   // 'transaction' / uuid — for deep-link
  payload: T;                    // typed per event key
}
```

### Room taxonomy

| Room | Joined when | Carries |
|---|---|---|
| `merchant:{merchant_id}` | always, from JWT | merchant-wide: product catalog, settings, new outlet |
| `outlet:{outlet_id}` | for every outlet in the user's `user_roles` | orders, stock, tables, shifts |
| `outlet:{outlet_id}:role:{role_id}` | per assignment row | role-targeted (owner-only cash variance) |
| `user:{user_id}` | always | personal: role assigned, mention, your shift approved |

**Rule: rooms are derived server-side.** On connect, `apps/realtime` verifies the JWT with the shared `JWT_SECRET`, then queries `user_roles` (+ `role_permissions`) for that user and joins the rooms itself. The client never names a room. A client asking to "switch active outlet" only changes a *filter flag* on its socket; it cannot join an outlet it has no role in.

**Permission filter at emit time.** After resolving the room, the gateway drops the frame for sockets whose cached permission set doesn't include `audience.permissions`. Cache the permission set on the socket at connect; bust it on a `user.permissions_changed` event (which is itself an event — dogfood it).

**Actor suppression.** Don't toast the cashier who just rang the sale. Client-side check `actor_user_id === me` is fine for UX; the frame still ships so other tabs update.

---

## 5. Event catalog

Derived from the models in `schema.prisma` and the services that write them. `P` = persisted to the notification center; live-only events are ephemeral UI signals (badge, list refresh) and must not bloat the table.

### Transactions / orders — `apps/api/src/transactions/`, `customer-catalog/`
| Key | Scope | Audience | P | Source |
|---|---|---|---|---|
| `order.created` | outlet | `transaction.read` | ✓ | `createCatalogOrder()` (replaces today's `notifyOutletUsers`) |
| `order.status_changed` | outlet | `transaction.read` | — | `updateStatus()` — accepted/processing/served/completed |
| `order.items_added` | outlet | `transaction.read` | — | `addItemsToCatalogOrder()` |
| `transaction.created` | outlet | `transaction.read` | — | `createPosTransaction()` |
| `transaction.paid` | outlet | `transaction.read` | — | `payTransaction()` |
| `transaction.cancelled` | outlet | `transaction.read` | ✓ | `cancel()` — money reversal, owner should see it |

`order.status_changed` is what turns the kitchen/waiter screens live; it is the highest-value event in the set.

### Inventory — `stock/`, `products/`
| Key | Scope | Audience | P | Source |
|---|---|---|---|---|
| `stock.low` | outlet | `stock.read` | ✓ | after `applyInventorySale()` when `stock_after <= reorder threshold` |
| `stock.out` | outlet | `stock.read` | ✓ | `stock_after <= 0` |
| `stock.adjusted` | outlet | `stock.read` | — | manual adjustment / opname writing `inventory_movements` |
| `product.created` / `product.updated` / `product.deactivated` | merchant | `product.read` | — | catalog is merchant-wide, so POS screens at every outlet must refresh |

Threshold field doesn't exist yet — add `min_stock_qty` to `outlet_product_inventory`, defaulting to 0 (= only `stock.out` fires) so this ships without a product decision.

### Shifts — `shifts/`
| Key | Scope | Audience | P |
|---|---|---|---|
| `shift.opened` | outlet | `shift.read` | — |
| `shift.closed` | outlet | `shift.read` | ✓ |
| `shift.cash_variance` | role (owner/manager) | `shift.read` | ✓ |

`shift.cash_variance` is the canonical role-scoped event — use it to prove the role room works.

### Tables / customer sessions — `store-tables/`, `customer_sessions`
| Key | Scope | Audience | P |
|---|---|---|---|
| `table.status_changed` | outlet | `store-table.read` | — |
| `customer_session.started` | outlet | `transaction.read` | — |
| `customer_session.expired` | outlet | `transaction.read` | — |

### People & tenancy — `users/`, `rbac/`, `outlets/`, `merchants/`, `settings/`
| Key | Scope | Audience | P |
|---|---|---|---|
| `user.role_assigned` | user + outlet | target user; `user.read` at outlet | ✓ |
| `user.role_revoked` | user + outlet | target user; `user.read` | ✓ |
| `user.permissions_changed` | user | target user | — (forces socket ACL refresh + frontend re-read) |
| `user.deactivated` | user + merchant | target user; `user.read` | ✓ |
| `outlet.created` / `outlet.updated` | merchant | `outlet.read` | ✓ / — |
| `merchant.settings_changed` | merchant | `settings.read` | — |

### Reports
| Key | Scope | Audience | P |
|---|---|---|---|
| `report.daily_ready` | outlet | `report.read` | ✓ | `daily_reports` row finalized |

---

## 6. Data model changes

```prisma
model event_outbox {
  id           String    @id @default(dbgenerated("(uuid())")) @db.Char(36)
  event_key    String    @db.VarChar(80)
  merchant_id  String    @db.Char(36)
  outlet_id    String?   @db.Char(36)
  payload      Json
  status       String    @default("pending") @db.VarChar(20)  // pending|sent|failed
  attempts     Int       @default(0)
  published_at DateTime? @db.Timestamp(0)
  created_at   DateTime  @default(now()) @db.Timestamp(0)

  @@index([status, created_at], map: "idx_outbox_dispatch")
}
```

Extend `notifications` (additive, backward compatible):

```prisma
merchant_id  String   @db.Char(36)     // backfill from users.merchant_id
event_key    String?  @db.VarChar(80)
ref_type     String?  @db.VarChar(40)
ref_id       String?  @db.Char(36)
payload      Json?
severity     String   @default("info") @db.VarChar(20)  // info|warning|critical
@@index([merchant_id, user_id, is_read])
```

Optional P2: `notification_preferences (user_id, event_key, in_app, push)` so an owner can mute `order.created`.

**Fan-out cost.** Current design writes one row per recipient. At UMKM scale (tens of users per merchant, a few hundred persisted events/day) that is fine and much simpler to query — keep it. Revisit only if a merchant crosses ~200 users per outlet.

---

## 7. `apps/realtime` service shape

NestJS (reuse the API's conventions, ESLint config, and Dockerfile pattern), Fastify or Express + `@nestjs/websockets` + `socket.io`.

```
apps/realtime/
├── src/
│   ├── main.ts
│   ├── gateway/          # NotificationsGateway — connection, rooms, emit
│   ├── auth/             # JWT verify (same JWT_SECRET), socket auth guard
│   ├── acl/              # user_roles + role_permissions resolver + cache
│   ├── ingest/           # POST /internal/events (shared-secret guard, dedupe by event id)
│   └── health/
├── Dockerfile
└── package.json          # deps: @umkm-pos/shared-events, socket.io, @prisma/client (read-only)
```

- Port `3001`; nginx proxies `/socket.io` with `Upgrade`/`Connection` headers (see `infra/nginx/spa.conf`).
- Read-only Prisma client — this service must never write domain tables. Persisted notifications are written by `apps/api` inside the source transaction, not by the gateway.
- Health: `/healthz` plus a `connections` gauge; the existing `metrics/` module pattern is a fair template.
- New env: `JWT_SECRET` (shared with the API), `DATABASE_URL`, `CORS_ORIGIN`, `INTERNAL_EVENT_SECRET`, `REALTIME_ADAPTER=memory`.

**Multi-instance note:** with one gateway container, in-process room state is correct and no adapter is needed. The moment a second container exists, sockets split across processes and you must add `@socket.io/redis-adapter` (or the Valkey equivalent) — otherwise events silently reach only half the users. Keep the adapter behind a `REALTIME_ADAPTER=memory|redis` env switch so the swap is config, not a rewrite.

---

## 8. `apps/web` integration

New `src/plugins/realtime.ts` + `src/composables/useRealtime.ts`:

```ts
const socket = io(import.meta.env.VITE_REALTIME_URL, {
  auth: { token: getToken() },
  transports: ['websocket', 'polling'],
  reconnectionDelayMax: 10_000,
});
```

- **Single connection per tab**, owned by a Pinia store; modules subscribe with `on(eventKey, handler)` rather than opening their own sockets.
- `UiSidebarNotification.vue`: drop the 30s `setInterval`; increment the badge from `notification.created` frames, and keep **one** poll on mount plus one on reconnect to resync missed state. Also make the popover actually render the list — it's a hardcoded empty state today.
- **Active-outlet filter:** `APP_ACTIVE_OUTLET` decides what the UI *shows*; the socket still receives every outlet the user has a role in, so the outlet switcher can show a per-outlet unread count without a refetch.
- **Live list invalidation:** POS/transaction/kitchen pages listen for `order.*` and patch their store directly (`order.status_changed` → update the row in place), falling back to a refetch when the event's `ref_id` isn't in the current page.
- **Degradation:** if the socket is down >30s, resume the old polling loop; restore push on reconnect. The cashier must never be blocked by a gateway outage.
- **401 / logout:** disconnect the socket in `removeAuth()`, reconnect after login with the fresh token. Token rotation on the socket needs a `reauth` message or a reconnect — reconnect is simpler.

---

## 9. Cost & licensing — everything here is free

No paid service, no vendor account, no usage tier. The whole design runs on the VPS you already pay for.

| Component | License | Cost | Notes |
|---|---|---|---|
| `socket.io` + `socket.io-client` | MIT | free | the only genuinely new runtime dependency |
| NestJS, `@nestjs/websockets` | MIT | free | already in `apps/api` |
| Prisma client (read-only in the gateway) | Apache-2.0 | free | already used |
| MySQL 8 (`event_outbox`) | GPLv2 | free | container already in `docker-compose.yml` |
| nginx WebSocket proxy | BSD-2 | free | `infra/nginx/` already exists |
| **Redis / Valkey** | *see below* | free to self-host | **not needed** in P2 |

### The Redis licence question, since you asked

Self-hosting Redis costs nothing in money at any version. The licence is where the nuance is:

- **Redis ≤ 7.2** — BSD-3-Clause. Plain open source.
- **Redis 7.4 – 7.8** — dual RSALv2 / SSPLv1. *Source-available*, not OSI open source. Still free to run inside your own product; the restriction targets companies reselling managed Redis. That is not you.
- **Redis ≥ 8.0** (May 2025) — added AGPLv3 as a third option, so it is OSI open source again. AGPL's network clause applies to modified Redis itself, not to your app talking to it over a socket.
- **Valkey** — the Linux Foundation fork of Redis 7.2, BSD-3-Clause, drop-in wire-compatible. Zero licence ambiguity.

**If you ever need a broker, use Valkey.** Same protocol, same `@socket.io/redis-adapter`, BSD licence, no version-by-version licence archaeology. Swap the image line in `docker-compose.yml`:

```yaml
  umkm-pos-cache:
    image: valkey/valkey:8-alpine
    command: valkey-server --save "" --appendonly no    # pure pub/sub, no persistence
    networks: [devbox_devnet]
    restart: always
```

RAM footprint as a pure pub/sub bus is ~10–15MB — it holds no dataset.

### What you actually pay: RAM on the box

The realtime gateway is the real cost, and it's small. A Node process holding idle WebSockets uses roughly 10–40KB per connection, so ~150MB resident at 2,000 concurrent sockets. For UMKM scale — tens of cashiers per merchant — a 512MB container is generous. Keep `NODE_OPTIONS=--max-old-space-size=384` on it so a leak can't starve MySQL on a shared host.

### Free alternatives considered and rejected

| Option | Why not |
|---|---|
| Pusher / Ably / Firebase free tier | Free *tier*, not free — connection and message caps, and it puts merchant transaction data on a third party. Hard to walk back once the client depends on their SDK. |
| Supabase Realtime | Requires Postgres; you're on MySQL. |
| Postgres `LISTEN`/`NOTIFY` | Same reason — no Postgres here. |
| MQTT (Mosquitto) | Free and tiny, but browser MQTT means MQTT-over-WS plus a second auth model. Socket.IO rooms map to the outlet/merchant/role taxonomy directly; MQTT topics would need the same ACL layer rebuilt. |
| NATS | Excellent and Apache-2.0, but it is still a broker you don't need at one gateway container. If you outgrow Valkey, revisit. |
| Poll faster than 30s | Free in licence, expensive in practice: every cashier tab hitting MySQL every few seconds, and still 3–5s of latency on a kitchen order. |

---

## 10. Phasing

| Phase | Deliverable | Why this order |
|---|---|---|
| **P0** | Fix the 3 scoping bugs (§2). Add `merchant_id` to `notifications`, backfill. Add `outlet_id` to the JWT/`CurrentUser` or send an `X-Outlet-Id` header validated against `user_roles`. | Realtime on a broken ACL just leaks faster. |
| **P1** | `packages/shared-events` (envelope + event key union + payload types) + `event_outbox` + `EventBusService` in `apps/api`. Emit `order.created`, `order.status_changed`, `transaction.paid` only. | Proves the contract with the highest-value events, no new service yet. |
| **P2** | `apps/realtime` (HTTP ingest, in-memory rooms) + `useRealtime()` in `apps/web`. Kill the poll. | First visible win: live kitchen/order board. No new infra. |
| **P3** | Remaining event catalog (§5), notification center UI, `severity`, preferences. | Breadth, once the pipe is proven. |
| **P4** | `apps/webhook`: `merchant_webhooks` table, HMAC-SHA256 `X-Signature`, exponential retry, delivery log, replay endpoint. | External integrations — different reliability contract, ship separately. |

P1+P2 is roughly the minimum interesting slice.

---

## 11. Open decisions for you

1. ~~Redis now, or HTTP ingest first?~~ **Decided: HTTP ingest.** No broker until there is a second gateway container. See §3 and §9.
2. **`apps/realtime` in NestJS or a thin Node service?** NestJS reuses the existing Dockerfile/ESLint/Prisma setup and the team's muscle memory; a thin service starts faster. Recommendation: NestJS, for consistency.
3. ~~**Where does `outlet_id` come from server-side?**~~ **Decided and implemented (P0,
   `CAF-LOCAL-notif-scoping-fix`): `X-Outlet-Id` request header**, validated per request by
   `OutletHeaderGuard` (exists, belongs to caller's `merchant_id`, caller has a `user_roles` row
   for it) before it populates `request.user.outlet_id`. Not baked into the JWT, so no re-login on
   outlet switch. Currently registered only on `NotificationsController`; P1's event emitters can
   reuse the same mechanism unchanged when they need outlet context from a request.
4. **Role targeting by `role_id` or by permission code?** The rest of the system is permission-code based (`RequirePermission`). Recommendation: permission codes only; drop `audience.role_ids` from the envelope unless a real case appears.
5. **Notification retention.** Persisted rows grow forever today. Suggest a 90-day purge job in `infra/` scripts.
