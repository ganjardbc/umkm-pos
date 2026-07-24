## Ticket: GAN-67
## Agent: qa
## Status: PASS

## Quality Gate Results
- Typecheck: PASS
- Lint: PASS
- Test: PASS

## Security Check Results (backend)
- Multi-tenant scope: PASS — Upload ownership is validated against the uploader's merchant context (from JWT) using `validateUploadOwnership`. No cross-tenant uploads or associations are possible.
- RBAC coverage: PASS — The update image/avatar endpoints (`/products/:id/image`, `/merchants/:id/image`, `/outlets/:id/image`, `/users/:id/avatar`) are protected with appropriate `@RequirePermission` decorators.
- Raw SQL: PASS / none found
- Secret exposure: PASS / none found

## Acceptance Criteria Verification
- [x] `UploadsService` memiliki method baru `validateUploadOwnership(uploadId: string, merchantId: string): Promise<void>`. — PASS: `apps/api/src/uploads/uploads.service.ts:73`
- [x] `validateUploadOwnership` memvalidasi keberadaan upload (melempar `BadRequestException('Upload not found')` jika tidak ada). — PASS: `apps/api/src/uploads/uploads.service.ts:81`
- [x] `validateUploadOwnership` mencocokkan `merchant_id` milik user pengunggah (`uploaded_by_id`) dengan `merchantId` caller (melempar `ForbiddenException` jika tidak cocok). — PASS: `apps/api/src/uploads/uploads.service.ts:89`
- [x] `ProductsService.setImage` menggunakan method `validateUploadOwnership` sebelum menyimpan image_upload_id. — PASS: `apps/api/src/products/products.service.ts:334`
- [x] `MerchantsService.setImage` menggunakan method `validateUploadOwnership` sebelum menyimpan logo_upload_id. — PASS: `apps/api/src/merchants/merchants.service.ts:189`
- [x] `OutletsService.setImage` menggunakan method `validateUploadOwnership` sebelum menyimpan logo_upload_id. — PASS: `apps/api/src/outlets/outlets.service.ts:157`
- [x] `UsersService.setAvatar` menggunakan method `validateUploadOwnership` sebelum menyimpan avatar_upload_id. — PASS: `apps/api/src/users/users.service.ts:209`
- [x] Semua mock `UploadsService` di file spec unit test backend diperbarui untuk menyertakan `validateUploadOwnership`. — PASS: `apps/api/src/products/products.service.spec.ts:42`

## Edge Cases Tested
| Skenario | Expected | Actual | Status |
|---|---|---|---|
| uploadId tidak ditemukan | 400 BadRequestException('Upload not found') | 400 BadRequestException('Upload not found') | ✅ |
| uploadId valid, tetapi uploader berasal dari merchant berbeda | 403 ForbiddenException | 403 ForbiddenException | ✅ |
| uploader user di-delete / tidak ada di database | 403 ForbiddenException | 403 ForbiddenException | ✅ |
| payload upload_id kosong/bukan UUID | 400 Bad Request (class-validator) | 400 Bad Request | ✅ |
| target entity (product/outlet/user) tidak ada/milik merchant lain | 404/403 (existing logic) | 404/403 | ✅ |

## Issues Found

### CRITICAL (harus diperbaiki sebelum PR)
None.

### NON-CRITICAL (bisa di task terpisah)
None.

## Verdict

PASS — semua acceptance criteria terpenuhi, tidak ada critical issues.
