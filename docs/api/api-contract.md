# API Contract — WisataPOS

## Base

```txt
Base URL: /api (atau sesuai config server)
Format: JSON only
Auth: Bearer JWT
```

---

## Response Format

### Success (single object)

```json
{
  "success": true,
  "data": { ... }
}
```

### Success (list + pagination)

```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "total_pages": 10
  }
}
```

### Error

```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

---

## Auth Endpoints

```txt
POST   /auth/register        — Register merchant + user pertama
POST   /auth/login           — Login, return access_token
GET    /auth/me              — Get current user profile
POST   /auth/logout          — Logout (clear token)
```

---

## Merchant Endpoints

```txt
GET    /merchants/me         — Get current merchant profile
PATCH  /merchants/me         — Update merchant profile
```

---

## Outlet Endpoints

```txt
GET    /outlets              — List outlets (merchant-scoped)
POST   /outlets              — Create outlet
GET    /outlets/:id          — Get outlet detail
PATCH  /outlets/:id          — Update outlet
DELETE /outlets/:id          — Delete outlet
```

---

## User Endpoints

```txt
GET    /users                — List users (merchant-scoped)
POST   /users                — Create user
GET    /users/:id            — Get user detail
PATCH  /users/:id            — Update user
DELETE /users/:id            — Deactivate user
```

---

## RBAC Endpoints

```txt
GET    /rbac/roles           — List roles
POST   /rbac/roles           — Create role
GET    /rbac/roles/:id       — Get role detail
PATCH  /rbac/roles/:id       — Update role
DELETE /rbac/roles/:id       — Delete role

GET    /rbac/permissions     — List all permissions
POST   /rbac/roles/:id/permissions  — Assign permissions to role

GET    /rbac/user-roles      — List user roles
POST   /rbac/user-roles      — Assign role to user at outlet
DELETE /rbac/user-roles/:userId/:roleId/:outletId — Remove user role
```

---

## Product Endpoints

```txt
GET    /products             — List products (merchant-scoped)
POST   /products             — Create product
GET    /products/:id         — Get product detail
PATCH  /products/:id         — Update product
DELETE /products/:id         — Delete product

GET    /product-categories   — List categories
POST   /product-categories   — Create category
PATCH  /product-categories/:id — Update category
DELETE /product-categories/:id — Delete category
```

Query params untuk `GET /product-categories`:

```txt
search       — search categories by name or description (case-insensitive)
page, limit
```

Query params untuk `GET /products`:

```txt
outlet_id    — include outlet-level inventory in product list
category_id  — filter by category
search       — search products by name (case-insensitive)
page, limit
```

---

## Transaction Endpoints

```txt
GET    /transactions         — List transactions (outlet-scoped, with filters)
POST   /transactions         — Commit POS transaction (atomic)
GET    /transactions/:id     — Get transaction detail
POST   /transactions/:id/cancel — Cancel transaction (atomic)
PATCH  /transactions/:id/status — Update transaction status (customer orders)
```

### POST /transactions Payload Format
```json
{
  "outlet_id": "uuid",
  "shift_id": "uuid",
  "payment_method": "cash",
  "is_offline": false,
  "device_id": "optional-device-id",
  "table_id": "optional-table-uuid",
  "cash_received": 50000,
  "change_amount": 10000,
  "items": [
    {
      "product_id": "uuid",
      "qty": 2,
      "discount_type": "percentage", // "percentage" | "fixed" | null
      "discount_value": 10,          // 10 for 10% or nominal Rp for fixed
      "customer_note": "Tanpa gula"
    }
  ]
}
```

### Aturan Otorisasi Outlet (Outlet Access Control)
Untuk memastikan keamanan multi-tenant dan isolasi data, seluruh endpoint transaksi memberlakukan aturan otorisasi berbasis outlet:
- **Role Owner**: Pengguna dengan role `owner` pada merchant memiliki akses penuh ke seluruh outlet di bawah merchant tersebut.
- **Role Non-Owner**: Pengguna lain (seperti kasir) dibatasi hanya pada outlet yang terdaftar untuk mereka di `user_roles`.
- **GET /transactions**: Jika query parameter `outlet_id` disertakan, sistem memvalidasi kepemilikan merchant dan otorisasi akses user ke outlet tersebut (mengembalikan 403 Forbidden jika tidak berhak). Jika tidak disertakan, sistem otomatis memfilter dan mengembalikan transaksi hanya dari outlet-outlet yang diperbolehkan bagi user.
- **POST /transactions**: Menolak request dengan status 403 Forbidden jika user tidak memiliki akses/role pada `outlet_id` yang dikirim di body payload.
- **GET /transactions/:id**, **POST /transactions/:id/cancel**, dan **PATCH /transactions/:id/status**: Memastikan transaksi yang dicari berada di outlet yang diperbolehkan bagi user. Jika transaksi berada di outlet lain yang tidak dapat diakses user, mengembalikan status 404 Not Found.

Query params untuk list:

```txt
outlet_id    — filter by outlet
shift_id     — filter by shift
date_from    — filter date range start
date_to      — filter date range end
payment_method — filter by payment method
order_source — 'pos' | 'customer'
order_status — filter by status
page, limit, search
```

---

## Shift Endpoints

```txt
GET    /shifts               — List shifts (outlet-scoped)
POST   /shifts               — Open shift
GET    /shifts/:id           — Get shift detail
POST   /shifts/:id/close     — Close shift
POST   /shifts/:id/participants — Add participant to shift
DELETE /shifts/:id/participants/:userId — Remove participant
```

---

## Stock Endpoints

```txt
GET    /stock/logs           — List stock logs (product-scoped)
POST   /stock/adjust         — Manual stock adjustment
GET    /stock/inventory      — Current stock per outlet
```

---

## Reports Endpoints

```txt
GET    /reports/daily        — Daily report (outlet + date range)
GET    /reports/summary      — Summary stats (merchant-wide)
GET    /reports/export/transactions — Export transaction history to CSV
```

Query params untuk `GET /reports/export/transactions`:

```txt
date_from    — filter date range start (YYYY-MM-DD)
date_to      — filter date range end (YYYY-MM-DD)
```

---

## Notification Endpoints

```txt
GET    /notifications        — List notifications (user-scoped)
PATCH  /notifications/:id/read — Mark as read
PATCH  /notifications/read-all — Mark all as read
```

---

## Upload Endpoints

```txt
POST   /uploads              — Upload file, return { upload_id, url }
```

---

## Store Table Endpoints

```txt
GET    /store-tables         — List tables (outlet-scoped)
POST   /store-tables         — Create table
PATCH  /store-tables/:id     — Update table
DELETE /store-tables/:id     — Delete table
```

---

## Customer Self-Order (Public Endpoints)

```txt
GET    /public/outlets/:slug/menu     — Get outlet menu (public, no auth)
POST   /public/sessions               — Create customer session
GET    /public/sessions/:token        — Get session info
POST   /public/orders                 — Submit customer order
GET    /public/orders/:sessionToken   — Get order status
```

---

## Pagination Standard

Request:

```txt
?page=1&limit=10&search=keyword&sort=created_at&order=desc
```

Response meta:

```json
{
  "page": 1,
  "limit": 10,
  "total": 100,
  "total_pages": 10
}
```
