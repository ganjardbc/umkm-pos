# Roadmap — WisataPOS

## Phase Overview

```txt
Phase 0 — Foundation & Setup          ✅ DONE
Phase 1 — Auth & RBAC                 ✅ DONE
Phase 2 — Merchant & Outlet           ✅ DONE
Phase 3 — Product & Category          ✅ DONE
Phase 4 — POS Transaction             ✅ DONE
Phase 5 — Shift Management            ✅ DONE
Phase 6 — Stock Management            ✅ DONE
Phase 7 — Reports & Dashboard         🔄 IN PROGRESS
Phase 8 — Customer Self-Order         🔄 IN PROGRESS
Phase 9 — Notifications               🔄 IN PROGRESS
Phase 10 — Settings & Refinement      📋 TODO
Phase 11 — File Upload                ✅ DONE
Phase 12 — Production Readiness       📋 TODO
```

---

## Phase 0 — Foundation & Setup

```txt
[x] Monorepo setup (pnpm + turborepo)
[x] NestJS app bootstrap
[x] Prisma + MySQL setup
[x] Vue 3 + Vite + PrimeVue setup
[x] Shared packages (shared-types, shared-utils)
[x] ESLint + Prettier config
[x] Docker setup
```

---

## Phase 1 — Auth & RBAC

```txt
[x] JWT auth (register, login, me)
[x] Global JWT guard
[x] Permission guard
[x] Role & permission CRUD
[x] User role assignment per outlet
[x] @CurrentUser decorator
[x] @RequirePermission decorator
[x] @Public decorator
```

---

## Phase 2 — Merchant & Outlet

```txt
[x] Merchant CRUD
[x] Outlet CRUD
[x] Multi-tenant scope enforcement
[x] Outlet activation/deactivation
```

---

## Phase 3 — Product & Category

```txt
[x] Product CRUD
[x] Product category CRUD
[x] Product image upload
[x] Outlet product inventory
[x] Stock qty tracking
```

---

## Phase 4 — POS Transaction

```txt
[x] POS terminal UI
[x] Cart management
[x] Transaction commit (atomic)
  [x] Create transaction
  [x] Create transaction items (with price/name snapshot)
  [x] Decrement product stock
  [x] Write stock logs
[x] Payment method support
[x] Transaction list + detail
[x] Cancel transaction
[x] Offline transaction flag
```

---

## Phase 5 — Shift Management

```txt
[x] Open/close shift
[x] Multi-cashier shift participants
[x] Shift owner
[x] Shift audit logs
[x] Shift status check before POS order
[x] Shift detail + transaction summary
```

---

## Phase 6 — Stock Management

```txt
[x] Stock log (audit trail)
[x] Manual stock adjustment
[x] Outlet product inventory
[x] Inventory movements log
[x] Stock view per outlet
```

---

## Phase 7 — Reports & Dashboard

```txt
[x] Daily reports aggregation
[ ] Dashboard summary stats
[ ] Date range filter
[ ] Export (CSV/PDF) — not MVP
```

---

## Phase 8 — Customer Self-Order

```txt
[x] Store tables management
[x] Customer session (QR-based)
[x] Public menu endpoint
[x] Customer catalog UI (apps/web)
[ ] Customer order flow (submit → kasir notified)
[ ] Order status tracking
[ ] QR code generation untuk meja
```

---

## Phase 9 — Notifications

```txt
[x] Notification model
[x] Notification CRUD
[ ] Real-time notification (WebSocket/SSE) — post-MVP
[ ] Notification UI component
```

---

## Phase 10 — Settings & Refinement

```txt
[ ] Merchant profile settings
[ ] Outlet settings
[ ] System settings (business hours, etc.)
[ ] User profile edit
[ ] Password change
```

---

## Phase 11 — File Upload

```txt
[x] Upload endpoint (MinIO/S3)
[x] Product image
[x] Merchant logo
[x] Outlet logo
[x] User avatar
```

---

## Phase 12 — Production Readiness

```txt
[ ] Error monitoring (Sentry)
[ ] Rate limiting
[ ] API throttling
[ ] Health check endpoint
[ ] Performance testing
[ ] Security audit
[ ] CI/CD pipeline
[ ] Staging environment
```

---

## Post-MVP (Future)

```txt
Loyalty Program
CRM
Supplier & Purchasing
Multi-Warehouse Inventory
WhatsApp Integration
Mobile App (React Native / Flutter)
Advanced Analytics
Multi-language support
```
