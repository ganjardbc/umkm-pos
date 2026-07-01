# ADR-002: DB-First Schema Convention (snake_case, UUID CHAR(36), Mandatory Indexes)

**Status:** Accepted  
**Date:** 2026-07-01  
**Deciders:** Engineering team  

---

## Context

WisataPOS uses **Prisma + MySQL**. Two schema management approaches were considered:

| Approach | Definition |
|---|---|
| **Code-first** | Prisma schema is authoritative; DB is generated from it. Prisma model names follow TypeScript conventions (PascalCase, camelCase fields). |
| **DB-first** | MySQL schema is authoritative; `prisma db pull` syncs the Prisma schema from the DB. Prisma model names mirror MySQL table/column names exactly. |

The team chose DB-first for three reasons:

1. **Existing MySQL schema** — the database predates the Prisma integration. Migrating all names to camelCase would require a destructive rename migration with no functional benefit.
2. **SQL readability** — raw SQL, `$queryRaw`, and DB monitoring tools all see the DB names. snake_case keeps everything consistent without mental translation.
3. **Operational tooling** — MySQL workbench, Adminer, and dump files all use the DB column names. Having them match the Prisma model fields reduces confusion during incident response.

---

## Decision

**DB-first schema management with the following conventions:**

### Naming

| Layer | Convention | Example |
|---|---|---|
| Table name | `snake_case` plural | `products`, `transaction_items` |
| Column name | `snake_case` | `merchant_id`, `created_at` |
| Prisma model | `snake_case` plural (mirrors table) | `model products {}` |
| Prisma field | `snake_case` (mirrors column) | `merchant_id`, `stock_qty` |
| TypeScript DTO/entity | `camelCase` (mapped at boundary) | `merchantId`, `stockQty` |

### Primary Key

All tables use UUID, not auto-increment integers:

```sql
id CHAR(36) PRIMARY KEY DEFAULT (uuid())
```

```prisma
id String @id @default(dbgenerated("(uuid())")) @db.Char(36)
```

**Why UUID over auto-increment:**
- Auto-increment integers are enumerable — a client can guess `id=1`, `id=2`. UUIDs are not.
- Multi-tenant UUIDs are safe to expose in URLs and API responses without leaking sequence information.
- Enables offline-generated IDs for future sync support without collision risk.

### Indexes

Every foreign key column and every field used in `WHERE` clauses on large tables must have an explicit index:

```prisma
@@index([merchant_id])          // tenant scope — on every tenant-scoped table
@@index([outlet_id])            // outlet scope — where applicable
@@index([created_at])           // for time-range queries
@@index([merchant_id, status])  // compound — common filter pattern
```

**Why explicit indexes are mandatory:**
- MySQL does not auto-index foreign keys (unlike PostgreSQL). Without explicit `@@index`, every tenant-scoped `WHERE merchant_id = ?` is a full table scan.
- As transaction volume grows, a missing index on `merchant_id` becomes a performance regression that is hard to detect until production load.

### Timestamp Columns

All tables carry audit timestamps:

```sql
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
created_by CHAR(36) NULL
updated_by CHAR(36) NULL
```

---

## Consequences

### Positive

- Prisma schema is always in sync with MySQL — no code-first vs DB divergence.
- SQL-level debugging requires zero mental translation between column names and code.
- UUID PKs prevent enumeration attacks and support future offline-sync.
- Mandatory indexes prevent silent full-table-scan regressions as data grows.

### Negative

- New developers familiar with code-first Prisma must learn the DB-first pull workflow.
- Prisma migrations via `prisma migrate dev` require care — always run `prisma db pull` first when the DB may have drifted.
- `camelCase` ↔ `snake_case` translation happens at the DTO/response boundary. Shared types in `@umkm-pos/shared-types` use camelCase (TypeScript side); Prisma queries use snake_case.

### If Violated

- Missing `@@index([merchant_id])` on a new table: the next tenant-scoped query on that table is a full table scan. Severity: 🟡 (silent, degrades under load).
- `BIGINT` or `INT` primary key instead of `CHAR(36)` UUID: exposes enumerable IDs. Severity: 🔴.
- camelCase Prisma field names: Prisma diff will conflict with the next `prisma db pull`. Severity: 🟡.

---

## Related Rules

- `AGENTS.md` → "Database Rules"
- `docs/database/database-design.md` → "Naming Convention", "Primary Key", "Multi-Tenant Scoping"
- `apps/api/CLAUDE.md` → "Database Conventions"
- ADR-001 — Multi-tenant scoping that relies on `merchant_id` indexes defined here
