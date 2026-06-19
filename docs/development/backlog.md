# Backlog — WisataPOS

## Format

```txt
ID: [PHASE]-[NUMBER]
Status: TODO | IN_PROGRESS | DONE | BLOCKED
Priority: HIGH | MEDIUM | LOW
```

---

## Phase 7 — Reports & Dashboard

### RPT-001 — Dashboard Summary Stats

```txt
Status: TODO
Priority: HIGH
Description:
  Halaman dashboard menampilkan:
  - Total penjualan hari ini (semua outlet)
  - Total transaksi hari ini
  - Produk dengan stok rendah
  - Shift aktif per outlet
API: GET /reports/summary
Frontend: modules/dashboard/pages/index.vue
```

### RPT-002 — Daily Report Date Range Filter

```txt
Status: TODO
Priority: MEDIUM
Description:
  Filter laporan harian berdasarkan date range + outlet.
  Tampilkan breakdown per hari dalam tabel.
API: GET /reports/daily?date_from=&date_to=&outlet_id=
Frontend: modules/reports/pages/index.vue
```

---

## Phase 8 — Customer Self-Order

### CSO-001 — Customer Order Submit Flow

```txt
Status: TODO
Priority: HIGH
Description:
  Customer yang sudah punya session bisa submit order.
  Order masuk ke sistem sebagai order_source: 'customer'.
  Kasir bisa lihat dan proses order dari POS.
API:
  POST /public/orders
  GET /public/orders/:sessionToken
Backend: customer-catalog module
Frontend: modules/customer-catalog/
```

### CSO-002 — QR Code Generation untuk Meja

```txt
Status: TODO
Priority: MEDIUM
Description:
  Generate QR code per meja yang berisi URL customer catalog.
  Format URL: /catalog/:outletSlug?table=:tableCode
  QR bisa di-download sebagai PNG/PDF.
Frontend: modules/settings/ (store-tables section)
```

### CSO-003 — Order Status Tracking (Customer View)

```txt
Status: TODO
Priority: MEDIUM
Description:
  Customer bisa lihat status order mereka:
  pending → accepted → processing → served
API: GET /public/orders/:sessionToken
Frontend: modules/customer-catalog/pages/order-status.vue
```

---

## Phase 9 — Notifications

### NOTIF-001 — Notification UI Component

```txt
Status: TODO
Priority: MEDIUM
Description:
  Bell icon di header dengan badge count.
  Dropdown list notifikasi terbaru.
  Mark as read per notif atau all.
API:
  GET /notifications
  PATCH /notifications/:id/read
  PATCH /notifications/read-all
Frontend: modules/notification/
```

---

## Phase 10 — Settings & Refinement

### SET-001 — User Profile Edit

```txt
Status: TODO
Priority: MEDIUM
Description:
  User bisa edit nama, avatar, dan ganti password.
API:
  PATCH /users/me
  POST /uploads (untuk avatar)
Frontend: modules/profile/
```

### SET-002 — Merchant Profile Edit

```txt
Status: TODO
Priority: MEDIUM
Description:
  Merchant owner bisa edit nama merchant, logo, alamat, telepon.
API: PATCH /merchants/me
Frontend: modules/merchants/
```

---

## Phase 12 — Production Readiness

### PROD-001 — Health Check Endpoint

```txt
Status: TODO
Priority: HIGH
Description:
  GET /health mengembalikan status DB, memory, uptime.
  Diperlukan untuk load balancer dan monitoring.
Backend: app.controller.ts atau health module
```

### PROD-002 — Rate Limiting

```txt
Status: TODO
Priority: HIGH
Description:
  Throttle endpoint publik (/auth/login, /public/*).
  Gunakan @nestjs/throttler.
Backend: app.module.ts
```

### PROD-003 — API Documentation Cleanup

```txt
Status: TODO
Priority: MEDIUM
Description:
  Pastikan semua endpoint terdokumentasi di Swagger.
  Semua DTO punya @ApiProperty.
  Semua controller punya @ApiTags.
Backend: all modules
```

---

## Completed

### Completed Tasks

```txt
[DONE] Foundation monorepo setup
[DONE] Auth module (login, register, JWT)
[DONE] RBAC module (roles, permissions, user-roles)
[DONE] Merchant & outlet CRUD
[DONE] Product & category CRUD
[DONE] POS transaction commit (atomic)
[DONE] Transaction list & detail
[DONE] Shift open/close
[DONE] Multi-cashier shift participants
[DONE] Stock logs & adjustment
[DONE] Outlet product inventory
[DONE] File upload (MinIO/S3)
[DONE] Customer catalog (basic)
[DONE] Store tables management
[DONE] Customer sessions
[DONE] Daily reports
[DONE] Notification model
```
