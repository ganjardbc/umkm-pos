# AGENTS.md

## Project

UMKM POS (WisataPOS)

## Product Summary

WisataPOS adalah platform **Point of Sale + Manajemen Bisnis untuk UMKM Wisata**.

Produk ini memungkinkan merchant untuk:

* Mengelola transaksi POS secara real-time.
* Melacak stok produk secara otomatis.
* Mengelola shift kasir (multi-cashier).
* Mendukung multi-outlet dalam satu merchant.
* Mengelola user dengan RBAC per outlet.
* Menghasilkan laporan penjualan harian.
* Mendukung customer self-ordering via QR table.
* Mendukung transaksi offline dengan sinkronisasi.

---

# Mandatory Context

Sebelum mengerjakan task, baca dokumen berikut sesuai kebutuhan.

## Product

```txt
docs/product/requirements.md
```

## Architecture

```txt
docs/architecture/tech-stack.md
docs/architecture/design.md
docs/architecture/module-breakdown.md
```

## Database

```txt
docs/database/erd.md
docs/database/database-design.md
```

## API

```txt
docs/api/api-contract.md
```

## Frontend

```txt
docs/frontend/frontend-routes.md
docs/frontend/ui-pages.md
docs/frontend/design-system.md
docs/frontend/layouts.md
```

## Backend

```txt
docs/backend/nestjs-guidelines.md
docs/backend/prisma-guidelines.md
```

## Development

```txt
docs/development/conventions.md
docs/development/roadmap.md
docs/development/backlog.md
docs/development/milestones.md
```

---

# Architecture Rules

Project menggunakan:

```txt
Monorepo (Turborepo + PNPM Workspace)
Vue 3 + Vite
Pinia
PrimeVue
Tailwind CSS v4
NestJS
Prisma
MySQL
```

Root structure:

```txt
apps/
  web/        — Vue 3 frontend (dashboard + POS)
  api/        — NestJS backend
  landing/    — Vue 3 landing page (marketing)

packages/
  shared-types/
  shared-utils/
  eslint-config/

docs/
```

---

# Implementation Principles

## Build One Task At A Time

Jangan membangun seluruh fitur sekaligus.

Ikuti urutan:

```txt
docs/development/backlog.md
```

Selesaikan satu task kecil, lalu lanjut ke task berikutnya.

---

## Follow Roadmap

Gunakan:

```txt
docs/development/roadmap.md
```

sebagai urutan phase.

Jangan mengerjakan fitur di luar phase tanpa instruksi eksplisit.

---

## Respect MVP Scope

Fitur berikut **tidak masuk MVP**:

```txt
Loyalty Program
CRM
Supplier & Purchasing
Multi-Warehouse Inventory
Tax Engine
Accounting System
WhatsApp Integration
```

Jangan implementasikan fitur tersebut kecuali diminta eksplisit.

---

# Backend Rules

Backend berada di:

```txt
apps/api
```

Framework:

```txt
NestJS
Prisma
MySQL
JWT
RBAC
```

Ikuti:

```txt
docs/backend/nestjs-guidelines.md
docs/backend/prisma-guidelines.md
apps/api/AGENTS.md
```

---

## Backend Module Structure

Setiap module harus mengikuti struktur:

```txt
module-name/
  dto/
  module-name.module.ts
  module-name.controller.ts
  module-name.service.ts
```

Contoh:

```txt
products/
  dto/
    create-product.dto.ts
    update-product.dto.ts

  products.module.ts
  products.controller.ts
  products.service.ts
```

---

## Controller Rules

Controller hanya boleh:

* Menerima request.
* Menggunakan DTO.
* Menggunakan decorator.
* Memanggil service.
* Mengembalikan response.

Controller **tidak boleh** berisi business logic, DB query, atau Prisma call.

---

## Service Rules

Service berisi:

* Business logic.
* Multi-tenant scope (merchant_id dari auth user, bukan dari client).
* Database query via Prisma.
* Atomic transaction untuk POS commit.
* Error handling.

---

## Auth Rules

Gunakan global JWT guard.

Semua route protected secara default.

Public route wajib memakai:

```ts
@Public()
```

---

## RBAC Rules

Gunakan permission decorator:

```ts
@RequirePermission('products.read')
```

Permission format: `<resource>.<action>`

Contoh:

```txt
products.read
products.write
transactions.read
transactions.write
shifts.read
shifts.write
reports.read
users.read
users.write
roles.read
roles.write
outlets.read
outlets.write
```

---

## Multi-Tenant Rules

Setiap query harus di-scope dengan `merchant_id` dari auth user.

Jangan pernah mengambil `merchant_id` dari client request body.

Benar:

```ts
const merchantId = currentUser.merchantId;
return this.prisma.products.findMany({
  where: { merchant_id: merchantId },
});
```

Salah:

```ts
return this.prisma.products.findMany({
  where: { merchant_id: body.merchantId }, // FORBIDDEN
});
```

---

## Transaction Rules (POS Commit)

Transaksi POS wajib atomik menggunakan Prisma transaction:

```ts
await this.prisma.$transaction([
  createTransaction,
  createTransactionItems,
  updateProductStock,
  writeStockLog,
]);
```

---

## Prisma Rules

Jangan membuat PrismaClient baru di service.

Gunakan:

```ts
constructor(private readonly prisma: PrismaService) {}
```

Prisma berada di:

```txt
apps/api/prisma/schema.prisma
```

---

# Frontend Rules

Frontend berada di:

```txt
apps/web
```

Framework:

```txt
Vue 3
Composition API
Pinia
Vue Router
PrimeVue
Tailwind CSS v4
```

Ikuti:

```txt
apps/web/AGENTS.md
```

---

## Frontend Module Structure

Setiap frontend module harus mengikuti:

```txt
modules/module-name/
  pages/
  components/
  stores/
    state.ts
    getters.ts
    actions.ts
    index.ts
  services/
    module.service.ts
    constants.ts
    rbac.ts
  router/
    index.ts
```

---

## Routing Rules

Setiap module memiliki route sendiri:

```txt
modules/*/router/index.ts
```

Global router auto-load route module menggunakan pattern:

```ts
import.meta.glob('../modules/**/router/index.ts', { eager: true });
```

Route meta wajib menggunakan:

```ts
meta: {
  title: 'Page Title',
  layout: 'default',
  permission: ['products.read'],
  breadcrumbs: [...],
}
```

Layout tersedia:

```txt
default    — dashboard layout (sidebar + header)
auth       — auth layout (centered)
public     — public layout (no auth)
```

---

## Store Rules

Gunakan Pinia.

Store pattern split file:

```txt
stores/
  state.ts     — state definition
  getters.ts   — computed getters
  actions.ts   — async actions + mutations
  index.ts     — compose & export
```

Store hanya untuk: Auth state, UI state (loading, pagination, filters), cached module data.

Business logic utama tetap di backend.

---

## Service Rules

API call frontend harus berada di:

```txt
modules/module-name/services/module.service.ts
```

Gunakan shared HTTP client dari:

```txt
src/plugins/axios.ts
```

---

# Shared Package Rules

## shared-types

Path: `packages/shared-types` — scope `@umkm-pos/shared-types`

Isi type yang menjadi kontrak antara frontend dan backend:

```txt
ApiResponse<T>
PaginationMeta
AuthUser
ProductSummary
TransactionSummary
```

## shared-utils

Path: `packages/shared-utils` — Pure function, tidak bergantung ke Vue atau NestJS.

---

# Database Rules

Ikuti:

```txt
docs/database/database-design.md
```

Wajib gunakan:

```txt
UUID primary key (CHAR 36)
snake_case database column dan Prisma model (DB-first)
index untuk foreign key dan field yang sering diquery
```

Prisma naming mengikuti DB column karena project ini DB-first (schema.prisma di-generate dari MySQL).

---

# API Rules

Base path: `/api`

Response format success:

```json
{
  "success": true,
  "data": {}
}
```

Response format list:

```json
{
  "success": true,
  "data": [],
  "meta": { "page": 1, "limit": 10, "total": 100, "total_pages": 10 }
}
```

Response format error:

```json
{
  "success": false,
  "message": "Error message",
  "code": "ERROR_CODE"
}
```

---

# Security Rules

Jangan pernah:

```txt
Menyimpan password plain text
Log JWT token atau password
Query resource tanpa merchant_id scope
Trust merchant_id dari client input
Expose data merchant lain
Bypass RBAC permission check
```

---

# AI Tooling

## RTK (Rust Token Killer)

RTK is a token-optimized CLI proxy. Always prefix shell commands with `rtk` to reduce token consumption by 60–90%.

```bash
rtk git status
rtk pnpm test
rtk ls src/
rtk grep "pattern" src/
rtk find "*.ts" .
rtk gh pr list
rtk npx prisma studio
```

Meta commands:

```bash
rtk gain              # Show token savings
rtk gain --history    # Command history with savings
rtk discover          # Find missed RTK opportunities
rtk proxy <cmd>       # Run raw without filtering (for debugging)
```

---

# AI Agent Working Rules

Saat mengerjakan task:

1. Baca dokumen terkait dari `docs/`.
2. Pahami task dari `docs/development/backlog.md`.
3. Jangan mengubah scope tanpa alasan kuat.
4. Jangan membuat fitur di luar MVP.
5. Jangan refactor besar tanpa instruksi.
6. Jangan menghapus file tanpa alasan jelas.
7. Jangan membuat duplicate type jika sudah ada di `shared-types`.
8. Setelah selesai, update dokumentasi yang relevan.
9. Pastikan typecheck dan build berjalan.

---

# Prompting Recommendation

```txt
Read AGENTS.md.

Task:
Implement [FEATURE-ID] from docs/development/backlog.md.

Relevant docs:
- docs/backend/nestjs-guidelines.md
- docs/backend/prisma-guidelines.md
- docs/api/api-contract.md

Rules:
- Follow existing monorepo structure.
- Do not implement features outside this task.
- Keep controller thin.
- Put business logic in service.
- Add DTO validation.
- Scope all queries by merchant_id from auth user.
```

---

# Definition of Done

```txt
Code implemented
No obvious TypeScript error
No duplicate logic
No broken existing flow
Follows folder convention
Follows API contract
Multi-tenant scope applied
Permission check applied
```

---

# Mandatory Workflow

Before marking any task as DONE, read:

```txt
.ai/workflows/task-completion.md
```

---

# Custom Commands

Four slash commands in `.claude/commands/`, split read-only vs write:

```txt
/audit-scan [scope]        — READ-ONLY. Auditor Agent scan, writes findings to
                              .ai/audits/{scope-slug}-{date}.md. Never creates tickets.
/audit-to-ticket [path]    — Reads an audit-report.md, walks findings one-by-one,
                              creates a Linear issue ONLY per explicit per-item approval.
/plan-ticket TICKET-ID     — READ-MOSTLY. Preview Planner Agent output for one ticket,
                              writes to .ai/tasks/{TICKET-ID}/ only. Doesn't touch app code,
                              doesn't trigger the full caf-orchestrator pipeline.
/qa-check [area]           — READ-ONLY on app code (may run lint/typecheck/test via Bash).
                              Reports, never auto-fixes.
```

## Read-Only Scanner + Approval-Gate Principle

`/audit-scan` (the Auditor Agent) is deliberately read-only and cannot create
tickets or touch external systems — creating a ticket is a human decision,
kept in the separate `/audit-to-ticket` command which requires explicit
per-item approval (never batch-approves). When adding a new proactive agent
that inspects code, follow this same split: give the scanning agent
read-only tools, and put any external write (Linear/GitHub/etc.) behind a
separate command with a human approval gate — don't grant write access to an
agent that runs proactively/unattended.

---

# Forbidden Actions

```txt
Generate all modules at once
Trust merchant_id dari client body
Bypass permission guard
Bypass JWT guard tanpa @Public()
Membuat PrismaClient baru di service
Menyimpan logic bisnis di controller
Menyimpan DB query di controller
Duplicate type yang sudah ada di shared-types
```

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
