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

---

## Transaction Endpoints

```txt
GET    /transactions         — List transactions (outlet-scoped, with filters)
POST   /transactions         — Commit POS transaction (atomic)
GET    /transactions/:id     — Get transaction detail
PATCH  /transactions/:id/cancel — Cancel transaction
```

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

### POST /stock/adjust

**Permission:** `stock.adjust`

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| product_id | string (UUID) | yes | Product to adjust |
| outlet_id | string (UUID) | yes | Outlet inventory to update |
| change_qty | integer | yes | Quantity change (positive to increase, negative to decrease); **must not be 0** |
| reason | string | yes | Reason for adjustment (e.g., `restock`, `correction`, `damage`) |

**Success Response (201):**

```json
{
  "success": true,
  "data": {
    "outlet_inventory": {
      "id": "uuid",
      "outlet_id": "uuid",
      "product_id": "uuid",
      "stock_qty": 50,
      "updated_at": "2026-01-15T10:30:00Z"
    },
    "inventory_movement": {
      "id": "uuid",
      "product_id": "uuid",
      "outlet_id": "uuid",
      "movement_type": "adjustment",
      "quantity_change": 10,
      "reason": "restock",
      "created_at": "2026-01-15T10:30:00Z"
    }
  }
}
```

**Error Responses (400):**

| Case | Message | Description |
|---|---|---|
| `change_qty === 0` | `"change_qty must not be 0"` | Adjustment must increase or decrease stock, not remain unchanged |
| `change_qty` results in `stock_qty < 0` | `"Insufficient stock. Current: X, Change: Y. Stock cannot go below 0."` | Cannot reduce stock below zero (e.g., current 5, trying to decrease by 10) |
| Reason mismatch | `"Adjustment reason does not match direction"` | e.g., reason `"damage"` with positive `change_qty` |

All error responses return HTTP 400 with `{ "success": false, "message": "...", "code": "..." }`

---

## Reports Endpoints

```txt
GET    /reports/daily        — Daily report (outlet + date range)
GET    /reports/summary      — Summary stats (merchant-wide)
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
