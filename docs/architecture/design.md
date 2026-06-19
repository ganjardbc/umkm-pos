# System Design — WisataPOS

## Architecture Style

**NestJS Modular Monolith** — bukan microservices.

Setiap domain bisnis memiliki module sendiri. Tidak ada premature separation ke service terpisah.

---

## Layer Architecture

```txt
HTTP Request
     ↓
Controller  ← DTO validation, decorator, route handler
     ↓
Service     ← Business logic, multi-tenant scope, Prisma queries
     ↓
PrismaService ← MySQL via Prisma ORM
     ↓
MySQL Database
```

---

## Multi-Tenant Design

Semua data di-scope per `merchant_id`.

```txt
merchants
  └── outlets
       ├── shifts
       ├── transactions
       ├── user_roles
       └── store_tables

  └── users (scoped by merchant_id)

  └── products (scoped by merchant_id, inventory per outlet)

  └── product_categories (scoped by merchant_id)
```

`merchant_id` selalu dari JWT token payload, tidak pernah dari client request body.

---

## Auth Flow

```txt
POST /auth/login
  → validate credentials
  → return JWT access_token

Request dengan JWT:
  → JwtAuthGuard validates token
  → CurrentUser injected ke controller
  → merchant_id dari user payload dipakai di service
```

---

## RBAC Design

```txt
User → UserRoles (outlet-scoped) → Role → RolePermissions → Permission
```

Permission format: `<resource>.<action>` (e.g., `products.read`, `transactions.write`)

Guards mengecek permission code, bukan role name.

---

## POS Transaction Flow (Atomic)

```txt
POST /transactions
  → validate DTO
  → check shift open
  → prisma.$transaction():
      1. create transactions record
      2. createMany transaction_items (dengan price_snapshot + name_snapshot)
      3. update products.stock_qty (decrement)
      4. create stock_logs entries
  → return transaction
```

---

## Customer Self-Order Flow

```txt
Customer scan QR meja
  → GET /public/outlets/:outletSlug/menu (public, no auth)
  → POST /customer/sessions (create session with name, table)
  → POST /customer/orders (buat order)
  → Kasir menerima notifikasi
  → Kasir approve/process order
  → Order selesai
```

---

## File Upload Design

```txt
POST /uploads
  → validate file type & size
  → upload ke MinIO/S3
  → simpan URL di DB (uploads table)
  → return upload_id

Entity yang butuh file menyimpan upload_id sebagai FK.
```

---

## Offline Support

Transaksi bisa dibuat secara offline (is_offline = true, device_id disimpan).

Saat online: POST /sync/transactions untuk push pending transactions.

---

## Response Format

Global `TransformInterceptor` memastikan semua response dibungkus:

```json
{ "success": true, "data": ... }
```

Global `HttpExceptionFilter` memastikan error response:

```json
{ "success": false, "message": "...", "code": "..." }
```
