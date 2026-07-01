---
name: db-migrate
description: Create and apply a Prisma migration for schema changes. Handles naming convention, runs migrate dev, and reminds about downstream impacts.
---

# Skill: DB Migrate

## Trigger

Use when schema changes need a migration:
- "create migration for adding X column"
- "run prisma migration"
- "/db-migrate <description>"

## Migration Name Convention

Format: `snake_case` describing the change

Examples:
- `add_outlet_id_to_notifications`
- `make_notifications_user_id_nullable`
- `create_customer_orders_table`
- `add_index_on_transactions_created_at`

Keep it short and descriptive — this name appears in the migrations folder.

## Steps

### 1. Edit schema first

Make changes to `apps/api/prisma/schema.prisma` before running migration.

DB-first conventions:
- Column names: `snake_case`
- Primary keys: `String @id @default(uuid()) @db.Char(36)`
- Foreign keys: add `@index` for FK fields
- Timestamps: `created_at DateTime @default(now())`, `updated_at DateTime @updatedAt`

### 2. Run migration

```bash
cd apps/api && npx prisma migrate dev --name <migration_name>
```

This will:
- Generate SQL migration file in `apps/api/prisma/migrations/`
- Apply it to the dev database
- Regenerate the Prisma client

### 3. Check generated SQL

Review the generated migration file at:
`apps/api/prisma/migrations/<timestamp>_<name>/migration.sql`

Verify:
- No accidental `DROP TABLE` or `DROP COLUMN` unless intended
- Data types match expectations
- Indexes created where needed

### 4. Downstream impacts

After schema change, check and update:

| Impact | Action |
|---|---|
| New model/field used in service | Update service queries |
| Changed field name | Find and update all `prisma.<model>.findMany` etc. |
| New model | May need new module or add to existing service |
| Nullable field changed to required | Check existing data + seed |

### 5. Regenerate client (if not auto-done)

```bash
cd apps/api && npx prisma generate
```

### 6. Verify typecheck

```bash
pnpm typecheck
```

Prisma generates types from schema — TS errors will surface mismatches.

## Common Patterns

### Add nullable field to existing table
```prisma
model notifications {
  user_id  String? @db.Char(36)  // nullable FK
}
```

### Add new model with FK
```prisma
model customer_orders {
  id          String   @id @default(uuid()) @db.Char(36)
  outlet_id   String   @db.Char(36)
  merchant_id String   @db.Char(36)
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt

  outlet   outlets   @relation(fields: [outlet_id], references: [id])
  merchant merchants @relation(fields: [merchant_id], references: [id])

  @@index([outlet_id])
  @@index([merchant_id])
}
```

## Never do

- Never edit generated migration SQL directly unless you know exactly what you're doing
- Never run `prisma migrate dev` in production
- Never skip the typecheck after migration
