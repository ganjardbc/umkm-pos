# 🚀 UMKM-POS API
Backend API for **UMKM-POS** — a SaaS Point of Sale (POS) system for UMKM tourism businesses such as cafés, souvenir shops, agro-tourism outlets, and small multi-booth merchants.

This backend is designed to be **production-ready, modular, and AI-assisted friendly**, built with NestJS + Prisma + MySQL, supporting multi-tenant, multi-outlet, RBAC, and offline POS sync.

---

# 🧭 Project Goals

UMKM-POS API provides:

- Reliable POS transaction processing
- Multi-merchant (multi-tenant) isolation
- Multi-outlet operations
- Role & Permission based access control
- Stock tracking with audit logs
- Shift tracking
- Offline transaction sync
- Owner dashboard data
- Clean API for frontend consumption (Nuxt / Web / Mobile)

This project follows **MVP discipline + production architecture**.

---

# 🧱 Tech Stack

- **Framework:** NestJS
- **Language:** TypeScript
- **Database:** MySQL 8
- **ORM:** Prisma
- **Auth:** JWT
- **Validation:** class-validator
- **Docs:** Swagger
- **Architecture:** Modular Monolith
- **Pattern:** Service-layer business logic

---

# 📦 Core Features (MVP Scope)

## POS Core
- Create transactions (atomic)
- Transaction items with price snapshot
- Automatic stock deduction
- Stock audit logs

## Business Operations
- Product management
- Stock adjustment
- Shift tracking
- Outlet management

## SaaS Structure
- Multi-merchant
- Multi-outlet
- Multi-user
- RBAC per outlet

## Reliability
- Atomic DB transactions
- Offline sync endpoint
- Idempotent transaction sync
- Audit fields on all tables

---

# 🏗 Architecture Overview
```
src/
├── auth/
├── users/
├── merchants/
├── outlets/
├── products/
├── transactions/
├── shifts/
├── stock/
├── reports/
├── rbac/
├── sync/
├── database/
└── common/
```

## Layer Rules

**Controller**
- Accept DTO
- Validate
- Call service
- Return response
- No DB queries

**Service**
- Business logic
- Prisma access
- Transactions
- Domain rules

**Prisma**
- Only used inside services

---

# 🧠 Domain Model (Simplified)

```

Merchant
└── Outlets
├── Users
├── Shifts
└── Transactions
└── TransactionItems

Products
StockLogs

RBAC:
Users → Roles → Permissions
(user_roles scoped per outlet)

```

---

# 🔐 RBAC Model

Permission-based access control.

Tables:
- roles
- permissions
- role_permissions
- user_roles (scoped by outlet)

Rules:
- Guards check permissions — not role names
- User can have different roles per outlet
- Permission enforced via guard + decorator

Example permission codes:

```

transaction.create
transaction.void
product.edit
stock.adjust
report.view
user.manage

```

---

# 🧾 POS Transaction Rules (Critical)

Transaction commit must be **atomic**:

Inside one DB transaction:

1. create transaction
2. create transaction_items
3. reduce product stock
4. write stock_logs

Transaction items must store:
- product_name_snapshot
- price_snapshot

Never read product price for history.

---

# 📦 Stock Rules

- `products.stock_qty` = current stock
- `stock_logs` = audit trail
- Every stock change must write log
- No direct stock update without log

---

# ⏱ Shift Rules

- Shift belongs to outlet
- Has start_time
- end_time nullable until closed
- Transactions may reference shift
- shift_id optional but recommended

---

# 🏢 Multi-Tenant Rules

- Every user belongs to a merchant
- All queries must be merchant-scoped
- merchant_id derived from auth — never from client
- Slug uniqueness scoped per merchant

---

# 🔄 Offline Sync Support

System supports offline POS clients.

Endpoint:

```

POST /sync/transactions

````

Requirements:

- Idempotent
- device_id aware
- duplicate safe
- server authoritative
- safe to retry

---

# 📐 API Conventions

## Request
- DTO required
- class-validator enforced
- Unknown fields rejected

## Response Success

```json
{
  "success": true,
  "data": {}
}
````

## Response Error

```json
{
  "success": false,
  "message": "Error message",
  "code": "ERROR_CODE"
}
```

---

# 🔧 Local Development Setup

## 1️⃣ Install

```bash
npm install
```

---

## 2️⃣ Environment

Create `.env`

```env
DATABASE_URL="mysql://root:@localhost:3306/UMKM-POS"
JWT_SECRET="dev_secret_change_me"
PORT=3000
```

> Local MySQL without password supported for dev only.

---

## 3️⃣ Prisma

If DB schema already exists:

```bash
npx prisma db pull
npx prisma generate
```

If using migrations:

```bash
npx prisma migrate dev
```

---

## 4️⃣ Run Server

```bash
npm run start:dev
```

---

# 🚀 Deployment

We provide an automated deployment script for the API module (`apps/api/deploy.sh`). The script supports both Docker Compose and bare-metal Node.js / PM2 process environments.

### Usage

Run the deployment script from `apps/api`:

```bash
# Run interactively (will ask for mode)
./deploy.sh

# Run directly in Docker Compose mode
./deploy.sh --mode docker

# Run directly in PM2 / Local mode
./deploy.sh --mode pm2
```

### Options

- `-m, --mode <docker|pm2>`: Specify the deployment mode.
- `--skip-tests`: Skip running tests before deploying.
- `--skip-build`: Skip recompiling the API or workspace packages.
- `--skip-migrations`: Skip applying Prisma migrations (`prisma migrate deploy`).
- `--env <path>`: Specify a custom environment variable file.

---


# 📘 API Documentation

Swagger enabled:

```
http://localhost:3000/docs
```

Includes:

* DTO schemas
* Auth bearer config
* Endpoint testing

---

# 🧪 Testing Philosophy

* Service logic testable
* Controllers thin
* DTO validated
* DB access isolated
* Transaction paths tested

---

# 🚫 Out of Scope (MVP)

Not included yet:

* Accounting
* Tax system
* CRM
* Loyalty program
* Supplier purchasing
* Multi-warehouse inventory
* Advanced analytics

---

# 🔒 Production Hardening Checklist

Before production deploy:

* Create dedicated DB user
* Set strong DB password
* Change JWT secret
* Enable HTTPS
* Enable logging
* Enable rate limiting
* Setup backups
* Enable monitoring

---

# 🤖 AI Context Files Included

This repo includes AI context documents:

* PROJECT_CONTEXT.md
* ARCHITECTURE.md
* DOMAIN_RULES.md
* API_CONVENTIONS.md
* DB_NOTES.md

These help AI coding agents understand system rules.

Keep them updated when architecture changes.

---

# 🧭 Recommended Build Order

1. Auth
2. Users
3. Merchants
4. Outlets
5. RBAC
6. Products
7. Transactions (core POS)
8. Stock logs
9. Shifts
10. Reports
11. Sync

---

# 🤝 Contribution Rules

* No DB query in controllers
* No business logic outside services
* No schema change without migration
* No tenant scope bypass
* Prefer simple solutions
* Follow module boundaries

---

# 🚀 UMKM-POS API

Production-minded
MVP-disciplined
AI-context aware
Ready to scale