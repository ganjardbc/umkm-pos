# .ai/skills/nestjs-module.md

## Purpose

Gunakan skill ini ketika membuat atau mengubah module NestJS di `apps/api`.

---

# Architecture

Project menggunakan:

```txt
NestJS
Prisma
MySQL
JWT (global guard)
RBAC (permission-based)
```

Module pattern:

```txt
module-name/
├── dto/
│   ├── create-module.dto.ts
│   └── update-module.dto.ts
├── module-name.module.ts
├── module-name.controller.ts
└── module-name.service.ts
```

---

# Controller Rules

Controller harus tipis.

Controller hanya boleh:

```txt
Receive Request
Use DTO
Use Decorator (@CurrentUser, @RequirePermission, @Public)
Call Service
Return Response
```

Jangan menaruh di controller:

```txt
Business Logic
Database Query
Prisma Call
Complex Validation
```

---

# Service Rules

Service bertanggung jawab untuk:

```txt
Business Logic
Multi-tenant scope (merchant_id dari currentUser, bukan dari body)
Prisma Query
Prisma Transaction (untuk POS commit)
Error Handling
Data Transformation
```

---

# DTO Rules

Semua request body wajib menggunakan DTO.

Gunakan:

```txt
class-validator
class-transformer
```

Whitelist mode aktif — reject unknown fields.

---

# Multi-Tenant Enforcement

Selalu scope query dengan `merchant_id` dari auth user:

```ts
@Get()
findAll(@CurrentUser() user: AuthUser) {
  return this.service.findAll(user.merchantId);
}
```

Di service:

```ts
async findAll(merchantId: string) {
  return this.prisma.products.findMany({
    where: { merchant_id: merchantId },
  });
}
```

---

# RBAC Rules

Gunakan:

```ts
@RequirePermission('products.read')
```

Permission format: `<resource>.<action>`

---

# POS Transaction Pattern

Untuk operasi yang harus atomik:

```ts
await this.prisma.$transaction(async (tx) => {
  const trx = await tx.transactions.create({ data: {...} });
  await tx.transaction_items.createMany({ data: items });
  await tx.products.update({ where: { id: productId }, data: { stock_qty: { decrement: qty } } });
  await tx.stock_logs.create({ data: { product_id: productId, change_qty: -qty, reason: 'sale' } });
  return trx;
});
```

---

# Prisma Rules

Gunakan:

```ts
constructor(private readonly prisma: PrismaService) {}
```

Jangan membuat PrismaClient baru.

Prisma model names menggunakan snake_case (DB-first schema).

---

# Response Rules

Gunakan `TransformInterceptor` — sudah global, response otomatis dibungkus:

```json
{ "success": true, "data": ... }
```

Untuk error: gunakan NestJS `HttpException` atau built-in exceptions.

---

# Output Checklist

Pastikan:

```txt
DTO dibuat
Controller tipis
Service berisi business logic
Module didaftarkan di AppModule
merchant_id scope dari auth user
Permission check ada
Tidak ada PrismaClient baru
```
