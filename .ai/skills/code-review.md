# .ai/skills/code-review.md

## Purpose

Gunakan skill ini ketika mereview kode AI Coding Agent atau PR di project ini.

---

# Review Checklist

## Architecture

Periksa:

```txt
Folder structure sesuai module convention
Tidak ada logic yang salah layer
```

---

## Backend

Periksa:

```txt
Controller tipis (tidak ada DB query, tidak ada business logic)
Service berisi business logic
DTO digunakan untuk semua input
@RequirePermission ada di endpoint yang perlu
merchant_id dari currentUser, bukan dari body/params
PrismaService digunakan (bukan PrismaClient baru)
```

---

## POS Transaction

Periksa:

```txt
Operasi create transaction menggunakan prisma.$transaction()
stock_logs ditulis saat stock berubah
price_snapshot dan product_name_snapshot digunakan (bukan live price)
```

---

## Database

Periksa:

```txt
snake_case model dan field (DB-first pattern)
Index ada untuk FK dan filter fields
Relation dua arah
UUID primary key dengan dbgenerated
```

---

## Frontend

Periksa:

```txt
Page bersih (tidak ada API call langsung di page)
Service terpisah di services/
Store menggunakan split-file pattern (state/getters/actions/index)
Route meta lengkap (title, layout, permission, breadcrumbs)
constants.ts dan rbac.ts ada
```

---

## Security

Periksa:

```txt
Tidak expose data merchant lain
Tidak bypass permission guard
merchant_id tidak diambil dari client input
Password tidak di-log
```

---

## TypeScript

Periksa:

```txt
No any kecuali benar-benar diperlukan
Tidak ada duplicate type yang sudah ada di shared-types
DTO fields typed
Store state typed
```

---

## Multi-Tenant

Periksa:

```txt
Setiap query ke DB yang mengembalikan tenant data: ada where merchant_id
Outlet-scoped query: ada where outlet_id
```

---

# Final Verdict

Berikan hasil:

```txt
PASS
PASS WITH IMPROVEMENT
FAIL
```

beserta alasan spesifik per item.
