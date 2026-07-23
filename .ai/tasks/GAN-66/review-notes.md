## Ticket: GAN-66
## Agent: reviewer
## Verdict: APPROVE

## Security Audit

### Multi-tenant scope: PASS
- `merchant_id` diekstraksi secara aman dari `@CurrentUser('merchant_id')` (JWT payload) di level controller.
- Query database membatasi retrieval, penghapusan, dan pembuatan URL bertanda tangan (signed-url) hanya untuk file yang memiliki `merchant_id` milik user bersangkutan atau bernilai `null` (legacy).
- Proteksi cross-tenant / tenant bypass diimplementasikan ketika mengaitkan upload record ke entitas lain (`UsersService`, `MerchantsService`, `ProductsService`, dan `OutletsService`) dengan validasi:
  `if (!upload || (upload.merchant_id && upload.merchant_id !== merchantId))`

### RBAC coverage: PASS
- Seluruh endpoint pada `UploadsController` terlindungi menggunakan `@UseGuards(PermissionGuard)` dan membutuhkan permission yang tepat (`upload.create`, `upload.read`, `upload.delete`).

### DTO validation: PASS
- Validasi payload file dilakukan di level multer config dan service validator. Validasi ID parameter diikat dengan tipe data string di controller parameter.

### Public route exposure: PASS
- Tidak ada route `@Public()` yang terekspos secara tidak sengaja di modul uploads.

### Raw SQL: PASS
- Tidak ditemukan penggunaan query raw SQL (`$queryRaw` atau `$executeRaw`).

## Kualitatif Review

### Blocker (harus diperbaiki sebelum PR)
- Tidak ada.

### Non-blocker (bisa dibuka issue terpisah)
- Tidak ada.

### Positif (untuk referensi)
- **Backward Compatibility:** Query fallback `OR: [{ merchant_id: merchantId }, { merchant_id: null }]` menangani data existing yang bernilai `null` dengan aman tanpa merusak fungsionalitas sistem yang sedang berjalan.
- **Relasi Database yang Kuat:** Model Prisma diperbarui dengan relasi formal `"merchant_uploads"` menggunakan referential integrity `onDelete: Cascade` agar data uploads terhapus otomatis jika merchant dihapus.

## Verdict Rationale

Implementasi telah memenuhi seluruh Acceptance Criteria dengan kualitas penulisan kode yang baik. Mekanisme tenant isolation pada modul uploads berhasil diterapkan tanpa memutus kompatibilitas data lama, dan cross-tenant data association dicegah pada entitas lain seperti users, merchants, outlets, dan products.

## Untuk Developer

- PR siap digabungkan. Tidak ada aksi lanjutan yang diperlukan untuk ticket ini.
