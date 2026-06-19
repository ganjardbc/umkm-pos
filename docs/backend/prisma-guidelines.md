# Prisma Guidelines — WisataPOS

## DB-First Approach

Project ini menggunakan DB-first.

Schema Prisma di-generate dari MySQL, bukan sebaliknya.

Artinya:
- Model names: snake_case plural (e.g., `products`, `transactions`)
- Field names: snake_case (e.g., `merchant_id`, `created_at`)
- Ini berbeda dari Prisma default (PascalCase model, camelCase field)

---

## PrismaService

Selalu gunakan `PrismaService`, bukan `PrismaClient` baru:

```ts
// BENAR
constructor(private readonly prisma: PrismaService) {}

// SALAH — jangan buat PrismaClient baru
const prisma = new PrismaClient();
```

`PrismaService` berada di `src/database/`.

---

## Basic CRUD Pattern

```ts
// Create
const product = await this.prisma.products.create({
  data: { merchant_id: merchantId, name: dto.name, price: dto.price },
});

// Read (tenant-scoped — WAJIB)
const products = await this.prisma.products.findMany({
  where: { merchant_id: merchantId },
});

// Find one (tenant-scoped — WAJIB)
const product = await this.prisma.products.findFirst({
  where: { id, merchant_id: merchantId },
});
if (!product) throw new NotFoundException('Product not found');

// Update (tenant-scoped — WAJIB)
await this.prisma.products.update({
  where: { id },
  data: { name: dto.name },
});

// Delete
await this.prisma.products.delete({ where: { id } });
```

---

## Pagination Pattern

```ts
const skip = (page - 1) * limit;

const [items, total] = await this.prisma.$transaction([
  this.prisma.products.findMany({
    where,
    skip,
    take: limit,
    orderBy: { created_at: 'desc' },
  }),
  this.prisma.products.count({ where }),
]);

return {
  data: items,
  meta: {
    page,
    limit,
    total,
    total_pages: Math.ceil(total / limit),
  },
};
```

---

## Atomic Transaction

Gunakan `$transaction` untuk operasi yang harus atomik:

```ts
// Sequential operations (callback style — bisa pakai await inside)
await this.prisma.$transaction(async (tx) => {
  const trx = await tx.transactions.create({ data: {...} });
  await tx.transaction_items.createMany({ data: items });
  await tx.products.update({ where: {...}, data: { stock_qty: { decrement: qty } } });
  await tx.stock_logs.create({ data: {...} });
  return trx;
});

// Parallel operations (array style)
const [count, data] = await this.prisma.$transaction([
  this.prisma.products.count({ where }),
  this.prisma.products.findMany({ where, skip, take: limit }),
]);
```

---

## Include vs Select

Gunakan `select` jika hanya butuh beberapa field:

```ts
const product = await this.prisma.products.findFirst({
  where: { id, merchant_id: merchantId },
  select: { id: true, name: true, price: true },
});
```

Gunakan `include` untuk relasi:

```ts
const transaction = await this.prisma.transactions.findFirst({
  where: { id },
  include: {
    transaction_items: true,
    outlets: { select: { name: true } },
  },
});
```

---

## Stock Log Pattern

Setiap perubahan stock wajib menulis stock_log:

```ts
await tx.stock_logs.create({
  data: {
    product_id: productId,
    change_qty: -qty,       // negatif untuk pengurangan
    reason: 'sale',         // 'sale' | 'adjustment' | 'import' | 'return'
    ref_id: transactionId,  // referensi ke dokumen yang menyebabkan perubahan
    created_by: userId,
  },
});
```

---

## Migration

```bash
# Development: create migration
npx prisma migrate dev --name add-product-category

# Sync schema from existing DB
npx prisma db pull

# Apply migrations without creating new ones
npx prisma migrate deploy

# View DB in browser
npx prisma studio
```

---

## Schema Location

```txt
apps/api/prisma/schema.prisma
```

---

## Decimal Handling

Prisma mengembalikan `Decimal` object untuk field `@db.Decimal`.

Convert ke number jika perlu:

```ts
const price = Number(product.price);
```

Atau gunakan `parseFloat(product.price.toString())`.

---

## Error Handling

Tangkap Prisma errors yang umum:

```ts
import { Prisma } from '@prisma/client';

try {
  await this.prisma.products.create({ data });
} catch (e) {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === 'P2002') {
      throw new ConflictException('Product with this name already exists');
    }
  }
  throw e;
}
```

Common error codes:
- `P2002` — Unique constraint violation
- `P2003` — Foreign key constraint violation
- `P2025` — Record not found
