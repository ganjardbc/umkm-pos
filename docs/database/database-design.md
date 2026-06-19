# Database Design — WisataPOS

## Database Engine

MySQL (via Prisma ORM, DB-first approach)

---

## Naming Convention

```txt
Table name     → snake_case plural (e.g., products, transactions)
Column name    → snake_case (e.g., merchant_id, created_at)
Prisma model   → snake_case plural (mirrors table)
Prisma field   → snake_case (mirrors column)
```

Project ini DB-first — schema.prisma di-generate dari MySQL, bukan sebaliknya.

---

## Primary Key

Semua tabel menggunakan UUID:

```sql
id CHAR(36) PRIMARY KEY DEFAULT (uuid())
```

Di Prisma:

```prisma
id String @id @default(dbgenerated("(uuid())")) @db.Char(36)
```

---

## Timestamp Columns

Semua tabel punya:

```sql
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
created_by CHAR(36) NULL    -- user_id yang membuat
updated_by CHAR(36) NULL    -- user_id yang terakhir update
```

---

## Multi-Tenant Scoping

Semua tenant-scoped entity punya:

```sql
merchant_id CHAR(36) NOT NULL
INDEX idx_<table>_merchant (merchant_id)
FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE
```

Outlet-scoped entity juga punya:

```sql
outlet_id CHAR(36) NOT NULL
INDEX idx_<table>_outlet (outlet_id)
FOREIGN KEY (outlet_id) REFERENCES outlets(id) ON DELETE CASCADE
```

---

## Index Strategy

Tambahkan index untuk:

1. Setiap foreign key column
2. Column yang sering dipakai di WHERE clause (status, is_active, etc.)
3. Column yang dipakai untuk sorting (created_at, report_date)
4. Composite index untuk query patterns yang umum

Contoh:

```sql
-- Single column
CREATE INDEX idx_products_merchant ON products(merchant_id);
CREATE INDEX idx_products_category ON products(category_id);

-- Composite
CREATE INDEX idx_shifts_outlet_owner_status ON shifts(outlet_id, shift_owner_id, status);
```

---

## Price Snapshot Invariant

`transaction_items` menyimpan snapshot harga saat transaksi:

```sql
product_name_snapshot VARCHAR(150) NOT NULL
price_snapshot DECIMAL(14, 2) NOT NULL
```

Nilai ini tidak boleh berubah setelah transaksi dibuat. Jangan pakai live price untuk laporan historis.

---

## Stock Invariant

```sql
-- Current stock
products.stock_qty  -- selalu up-to-date

-- Audit trail
stock_logs          -- append-only, setiap perubahan dicatat
```

Setiap operasi yang mengubah stock WAJIB menulis ke stock_logs dengan reason yang tepat:

```txt
reason: 'sale' | 'adjustment' | 'import' | 'return' | 'initial'
```

---

## Shift Design

```sql
shifts.end_time  NULL   -- open shift
shifts.end_time  NOT NULL -- closed shift
shifts.status    'open' | 'closed'
```

Shift bisa multi-cashier via `shift_participants`.

---

## Transaction Order Status

```txt
order_source: 'pos' | 'customer'
order_status: 'pending' | 'accepted' | 'processing' | 'served' | 'selesai' | 'cancelled'
```

Status timestamps:

```sql
ordered_at, accepted_at, processed_at, served_at, completed_at
```

---

## Unique Constraints

```sql
merchants.slug                   -- globally unique
outlets: (merchant_id, slug)     -- unique per merchant
users: (merchant_id, email)      -- unique per merchant
users: (merchant_id, username)   -- unique per merchant
store_tables: (outlet_id, code)  -- unique per outlet
daily_reports: (merchant_id, outlet_id, report_date)
customer_sessions.session_token  -- globally unique
shift_participants: (shift_id, user_id)
```

---

## Soft Delete

Belum diimplementasikan secara global. Gunakan `is_cancelled` untuk transaksi:

```sql
transactions.is_cancelled BOOLEAN DEFAULT FALSE
```

Jika perlu soft delete entity lain, tambahkan:

```sql
deleted_at TIMESTAMP NULL
```

---

## Decimal Precision

Semua field currency/monetary:

```sql
DECIMAL(14, 2)
```

---

## Migration

Gunakan Prisma migrate:

```bash
npx prisma migrate dev --name describe-change
```

Jangan edit migration files yang sudah di-apply di production.

Untuk sync dari existing MySQL:

```bash
npx prisma db pull
```
