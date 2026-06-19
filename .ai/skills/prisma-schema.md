# .ai/skills/prisma-schema.md

## Purpose

Gunakan skill ini ketika membuat atau mengubah Prisma schema di `apps/api/prisma/schema.prisma`.

---

# Important: DB-First Approach

Project ini menggunakan **DB-first** (MySQL schema di-generate ke Prisma).

Naming convention mengikuti MySQL:

```txt
Model name  → snake_case plural (e.g. products, transactions)
Field name  → snake_case (e.g. merchant_id, created_at)
```

Ini berbeda dari Prisma default (PascalCase model, camelCase field).

---

# ID Rules

Semua primary key:

```prisma
id String @id @default(dbgenerated("(uuid())")) @db.Char(36)
```

---

# Timestamp Rules

Gunakan:

```prisma
created_at DateTime @default(now()) @db.Timestamp(0)
updated_at DateTime @default(now()) @db.Timestamp(0)
created_by String?  @db.Char(36)
updated_by String?  @db.Char(36)
```

---

# Multi-Tenant Scoping

Semua entity yang tenant-scoped wajib punya:

```prisma
merchant_id String @db.Char(36)
merchants   merchants @relation(fields: [merchant_id], references: [id], onDelete: Cascade)
```

---

# Index Rules

Tambahkan index untuk:

```txt
merchant_id (semua entity yang tenant-scoped)
outlet_id
foreign key fields
status fields
fields yang sering di-filter/sort
```

Contoh:

```prisma
@@index([merchant_id], map: "idx_products_merchant")
@@index([outlet_id], map: "idx_products_outlet")
@@index([status], map: "idx_products_status")
```

---

# Relation Rules

Selalu definisikan relation dua arah.

Gunakan `map:` untuk nama constraint yang eksplisit:

```prisma
merchants merchants @relation(fields: [merchant_id], references: [id], onDelete: Cascade, map: "products_ibfk_1")
```

---

# Soft Delete

Project ini belum menggunakan soft delete di semua model.

Jika diperlukan, tambahkan:

```prisma
deleted_at DateTime? @db.Timestamp(0)
```

Dan tambahkan index:

```prisma
@@index([deleted_at], map: "idx_model_deleted_at")
```

---

# Stock Log Pattern

Setiap perubahan stock wajib menulis ke `stock_logs`:

```prisma
model stock_logs {
  id         String   @id @default(dbgenerated("(uuid())")) @db.Char(36)
  product_id String   @db.Char(36)
  change_qty Int
  reason     String   @db.VarChar(50)
  ref_id     String?  @db.Char(36)
  created_at DateTime @default(now()) @db.Timestamp(0)
}
```

Reason values: `sale`, `adjustment`, `import`, `return`

---

# Transaction Pattern (Atomic)

Operasi POS wajib menggunakan `prisma.$transaction()`:

```ts
await prisma.$transaction([
  prisma.transactions.create({ data: txData }),
  prisma.transaction_items.createMany({ data: items }),
  prisma.products.update({ where: { id: pid }, data: { stock_qty: { decrement: qty } } }),
  prisma.stock_logs.create({ data: { product_id: pid, change_qty: -qty, reason: 'sale' } }),
]);
```

---

# Migration Rules

Gunakan:

```bash
npx prisma migrate dev --name describe-what-changed
```

Jangan edit migration files yang sudah di-apply.

Untuk existing DB: gunakan `npx prisma db pull` lalu edit schema.

---

# Output Checklist

Pastikan:

```txt
Model dan field menggunakan snake_case
UUID primary key dengan dbgenerated
Timestamp fields ada
merchant_id ada di tenant-scoped entity
Index ada untuk FK dan filter fields
Relation dua arah
Migration aman (tidak drop data)
```
