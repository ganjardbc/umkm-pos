# Shared Types Guidelines (`@umkm-pos/shared-types`)

Package ini adalah sumber tunggal kontrak type antara frontend (`apps/web`) dan backend (`apps/api`).

## What goes into shared-types

Masukkan type ke package ini jika type tersebut:

- merepresentasikan kontrak request/response API publik,
- dipakai lintas workspace (`apps/web` dan `apps/api`),
- murni type-level (interface/type alias), tanpa logic runtime.

Contoh:

- `ApiResponse<T>`
- `PaginationMeta`
- `AuthUser`
- `ProductSummary`

## What should NOT go into shared-types

Jangan masukkan hal berikut:

- business logic, helper functions, service classes,
- type yang sangat spesifik ke implementasi internal satu app,
- dependency framework-specific (`@nestjs/*`, `vue`, dll).

## Contribution rules

1. **Contract-first**: field yang dipakai publik API harus dimodelkan di `shared-types` dulu.
2. **Backward compatibility**: hindari breaking change tanpa migrasi.
3. **Breaking change notes wajib**: jika rename/remove field kontrak, tambahkan catatan migrasi singkat di PR.
4. **Domain-based structure**: tempatkan type sesuai domain (`auth`, `users`, `products`, `common`).

## Package layout

```txt
packages/shared-types/
└─ src/
   ├─ common/
   ├─ auth/
   ├─ users/
   └─ products/
```

