## Ticket: diskon-per-item-saat-checkout
## Agent: reviewer
## Verdict: APPROVE

## Security Audit

### Multi-tenant scope: PASS
- `merchantId` diambil secara eksklusif dari JWT token context pada `CurrentUser`.
- Akses dan relasi outlet, produk, dan inventory diverifikasi dalam scope merchant.

### RBAC coverage: PASS
- Endpoint transaksi POS tetap dijaga oleh decorator `@RequirePermission('transaction.create')`.

### DTO validation: PASS
- `TransactionItemInputDto` menerapkan class-validator `@IsOptional()`, `@IsIn(['percentage', 'fixed'])`, `@IsNumber()`, `@Min(0)`, `@IsInt()`, `@Min(1)`.
- Validasi server-side di service memastikan batasan diskon (0-100% dan nominal <= gross subtotal).

### Public route exposure: PASS
- Tidak ada route public baru yang terekspos.

### Raw SQL: PASS
- Menggunakan Prisma ORM client dan method transaksi standar tanpa query injection vulnerability.

## Kualitatif Review

### Blocker (harus diperbaiki sebelum PR)
None.

### Non-blocker (bisa dibuka issue terpisah)
1. Ke depannya dapat dipertimbangkan penambahan setting outlet untuk persentase maksimum diskon per role kasir (supervisor override PIN).

### Positif (untuk referensi)
- Pemisahan kalkulasi reactive getter store frontend dan validasi server-side terdesain rapi dan aman terhadap manipulasi client.
- Konsistensi snapshot diskon (`discount_type`, `discount_value`, `discount_amount`, `subtotal`) pada layer database `transaction_items` menjamin audit trail histori laporan penjualan yang akurat.
- Dukungan printer bluetooth ESC/POS thermal dan preview receipt struk sudah lengkap.

## Verdict Rationale
Implementasi lengkap dan memenuhi seluruh kriteria penerimaan tanpa celah keamanan atau pelanggaran konvensi monorepo. Build dan test suite backend & frontend berjalan 100% sukses.

## Untuk Developer
Siap untuk direview manusia dan pembuatan PR manual.
