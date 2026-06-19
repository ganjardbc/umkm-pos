# .ai/skills/api-contract.md

## Purpose

Gunakan skill ini ketika membuat endpoint API di `apps/api`.

---

# Source Of Truth

Selalu baca:

```txt
docs/api/api-contract.md
apps/api/API_CONVENTIONS.md
```

---

# Base Pattern

Jangan mengubah route shape, request shape, atau response shape tanpa instruksi eksplisit.

---

# Auth Header

Protected routes membutuhkan:

```txt
Authorization: Bearer <token>
```

Public routes wajib menggunakan `@Public()` decorator.

---

# Response Shape

Success:

```json
{
  "success": true,
  "data": {}
}
```

List dengan pagination:

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "total_pages": 10
  }
}
```

Error:

```json
{
  "success": false,
  "message": "Validation Error",
  "code": "VALIDATION_ERROR"
}
```

`TransformInterceptor` sudah terpasang global — response otomatis dibungkus.

---

# Pagination Query Params

Gunakan:

```txt
page    (default: 1)
limit   (default: 10)
search  (optional)
sort    (optional)
order   (asc | desc)
```

---

# Validation

Gunakan DTO dengan class-validator.

Whitelist mode aktif — unknown fields auto-rejected.

---

# Multi-Tenant Enforcement

Semua endpoint yang mengembalikan data tenant harus scope dengan `merchant_id` dari JWT token, bukan dari query/body.

---

# Permission Check

Semua non-public endpoint harus ada `@RequirePermission(...)`.

---

# Swagger

Semua DTO harus didokumentasikan dengan `@ApiProperty`.

Controller harus punya `@ApiTags`.

---

# Output Checklist

Pastikan:

```txt
Route sesuai konvensi resource-oriented
DTO sesuai request shape
Response sesuai contract
Permission decorator ada
merchant_id dari auth, bukan dari client
Swagger documented
```
