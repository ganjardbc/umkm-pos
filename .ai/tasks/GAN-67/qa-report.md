## Ticket: GAN-67
## Agent: qa
## Status: PASS

## Quality Gate Results
- Typecheck: PASS
- Lint: PASS
- Test: PASS

## Security Check Results (backend)
- Multi-tenant scope: PASS — Checks the `uploaded_by_id` user's `merchant_id` against the tenant `merchant_id` derived from JWT context. Verified across Products, Merchants, Outlets, and Users services.
- RBAC coverage: PASS — Checked that all Patch endpoints (`:id/image`, `:id/avatar`) require appropriate update permissions (`product.update`, `merchants.update`, `outlet.update`, `user.update`).
- Raw SQL: PASS / none found
- Secret exposure: PASS / none found

## Acceptance Criteria Verification
- [x] Menambahkan method validasi `validateUploadOwnership(uploadId, merchantId)` di `UploadsService` — PASS: `apps/api/src/uploads/uploads.service.ts:73`
- [x] Method `ProductsService.setImage` memanggil `validateUploadOwnership` sebelum memperbarui data gambar produk — PASS: `apps/api/src/products/products.service.ts:334`
- [x] Method `MerchantsService.setImage` memanggil `validateUploadOwnership` sebelum memperbarui logo merchant — PASS: `apps/api/src/merchants/merchants.service.ts:189`
- [x] Method `OutletsService.setImage` memanggil `validateUploadOwnership` sebelum memperbarui logo outlet — PASS: `apps/api/src/outlets/outlets.service.ts:157`
- [x] Method `UsersService.setAvatar` memanggil `validateUploadOwnership` sebelum memperbarui avatar user — PASS: `apps/api/src/users/users.service.ts:209`
- [x] Flow `setImage`/`setAvatar` melempar `NotFoundException` jika upload tidak ditemukan, dan `ForbiddenException` jika upload dimiliki oleh merchant lain — PASS: `apps/api/src/uploads/uploads.service.ts:81` & `apps/api/src/uploads/uploads.service.ts:89`

## Edge Cases Tested
| Skenario | Expected | Actual | Status |
|---|---|---|---|
| Upload `upload_id` tidak ditemukan | 404 (NotFoundException) | 404 | ✅ |
| Upload dimiliki oleh merchant lain | 403 (ForbiddenException) | 403 | ✅ |
| User pengunggah file upload tidak ditemukan di DB | 403 (ForbiddenException) | 403 | ✅ |
| Target entitas (Product/Merchant/Outlet/User) milik merchant lain / tidak ditemukan | 404 (NotFoundException) | 404 | ✅ |
| Request body `upload_id` kosong | 400 (Bad Request) | 400 | ✅ |
| Request body `upload_id` format UUID tidak valid | 400 (Bad Request) | 400 | ✅ |

## Issues Found

### CRITICAL (harus diperbaiki sebelum PR)
*Tidak ada.*

### NON-CRITICAL (bisa di task terpisah)
*Tidak ada.*

## Verdict

PASS — Semua kriteria penerimaan terpenuhi, semua pengujian berhasil, dan tidak ditemukan isu keamanan atau bug kritis.
