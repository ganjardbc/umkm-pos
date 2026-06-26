# Progress — WisataPOS

## Overall Progress

```txt
MVP Core:        ████████████░░░░  75% complete
Reporting:       ████████░░░░░░░░  50% complete
Self-Order:      ████████░░░░░░░░  50% complete
Production:      ███░░░░░░░░░░░░░  20% complete
```

---

## Current Tasks (In Progress)

```txt
- Daily report date range filter (RPT-002)
- Customer order submit flow (CSO-001)
- Notification UI (NOTIF-001)
```

---

## Completed Tasks

### Phase 0-1 (Foundation + Auth)

```txt
[DONE] Monorepo setup (turborepo + pnpm workspace)
[DONE] NestJS bootstrap + Prisma + MySQL
[DONE] Vue 3 + Vite + PrimeVue + Tailwind v4
[DONE] Shared packages (shared-types, shared-utils)
[DONE] Docker setup
[DONE] Auth: register, login, JWT
[DONE] Global JWT guard + permission guard
[DONE] @CurrentUser, @RequirePermission, @Public decorators
[DONE] Role & permission CRUD
[DONE] User role assignment per outlet
```

### Phase 2-3 (Merchant + Product)

```txt
[DONE] Merchant CRUD + profile
[DONE] Outlet CRUD + activation
[DONE] Multi-tenant scope enforcement
[DONE] Product CRUD
[DONE] Product category CRUD
[DONE] Product image upload (MinIO/S3)
[DONE] Outlet product inventory
```

### Phase 4 (POS Transaction)

```txt
[DONE] POS terminal UI
[DONE] Cart management
[DONE] Transaction commit (atomic: tx + items + stock + log)
[DONE] Price snapshot + name snapshot
[DONE] Payment method support
[DONE] Transaction list + detail + cancel
[DONE] Offline transaction flag
```

### Phase 5-6 (Shift + Stock)

```txt
[DONE] Shift open/close
[DONE] Multi-cashier shift participants
[DONE] Shift audit logs
[DONE] Shift status check before POS
[DONE] Stock log (audit trail)
[DONE] Manual stock adjustment
[DONE] Inventory movements log
```

### Phase 7 (Reports & Dashboard)

```txt
[DONE] Dashboard summary stats (RPT-001)
```

### Phase 8 (Customer Self-Order - partial)

```txt
[DONE] Store tables management
[DONE] Customer sessions (QR-based)
[DONE] Public menu endpoint
[DONE] Customer catalog UI (basic)
```

### Phase 11 (File Upload)

```txt
[DONE] Upload endpoint (MinIO/S3)
[DONE] Product image
[DONE] Merchant logo
[DONE] Outlet logo
[DONE] User avatar
```

### Phase 12 (Production Readiness)

```txt
[DONE] Deployment script for apps/api (deploy.sh)
[DONE] GitHub Actions workflow integration for auto-deploy to VPS (ci.yml)
```

---

## Decision Log

### DEC-001 — DB-First Approach

```txt
Decision: Gunakan DB-first (schema dari MySQL ke Prisma), bukan Prisma-first.
Reason: Database MySQL sudah ada sebelum Prisma setup.
Impact: Model dan field names menggunakan snake_case (mengikuti MySQL).
```

### DEC-002 — Price Snapshot Invariant

```txt
Decision: transaction_items menyimpan price_snapshot dan product_name_snapshot.
Reason: Harga produk bisa berubah tapi laporan historis harus tetap akurat.
Impact: Jangan pernah pakai live price untuk menghitung subtotal historis.
```

### DEC-003 — Multi-Cashier Shift

```txt
Decision: Shift bisa punya multiple participants (bukan satu kasir satu shift).
Reason: Kebutuhan operasional UMKM wisata dengan multiple kasir dalam satu shift.
Impact: Ada tabel shift_participants terpisah.
```

### DEC-004 — Outlet-Scoped RBAC

```txt
Decision: User role di-assign per outlet (bukan global).
Reason: User bisa punya peran berbeda di outlet yang berbeda.
Impact: user_roles table punya composite PK (user_id, role_id, outlet_id).
```

### DEC-005 — Stock Per Outlet

```txt
Decision: Stok di-track per outlet via outlet_product_inventory, bukan global.
Reason: Merchant dengan multiple outlet butuh stok terpisah per outlet.
Impact: Ada tabel outlet_product_inventory dan inventory_movements.
```
