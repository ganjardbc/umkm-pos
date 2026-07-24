## Ticket: GAN-67
## Agent: backend
## Status: SUCCESS

## Attempt Log
- Attempt 1: SUCCESS (All requirements implemented, typechecked, linted, and unit tests passed)

## Acceptance Criteria
- [x] `UploadsService` memiliki method baru `validateUploadOwnership(uploadId: string, merchantId: string): Promise<void>`. — Terpenuhi di `apps/api/src/uploads/uploads.service.ts` baris 73-94
- [x] `validateUploadOwnership` memvalidasi keberadaan upload (melempar `BadRequestException('Upload not found')` jika tidak ada). — Terpenuhi di `apps/api/src/uploads/uploads.service.ts` baris 81-83
- [x] `validateUploadOwnership` mencocokkan `merchant_id` milik user pengunggah (`uploaded_by_id`) dengan `merchantId` caller (melempar `ForbiddenException` jika tidak cocok). — Terpenuhi di `apps/api/src/uploads/uploads.service.ts` baris 85-93
- [x] `ProductsService.setImage` menggunakan method `validateUploadOwnership` sebelum menyimpan image_upload_id. — Terpenuhi di `apps/api/src/products/products.service.ts` baris 330
- [x] `MerchantsService.setImage` menggunakan method `validateUploadOwnership` sebelum menyimpan logo_upload_id. — Terpenuhi di `apps/api/src/merchants/merchants.service.ts` baris 190
- [x] `OutletsService.setImage` menggunakan method `validateUploadOwnership` sebelum menyimpan logo_upload_id. — Terpenuhi di `apps/api/src/outlets/outlets.service.ts` baris 159
- [x] `UsersService.setAvatar` menggunakan method `validateUploadOwnership` sebelum menyimpan avatar_upload_id. — Terpenuhi di `apps/api/src/users/users.service.ts` baris 210
- [x] Semua mock `UploadsService` di file spec unit test backend diperbarui untuk menyertakan `validateUploadOwnership`. — Terpenuhi di `apps/api/src/products/products.service.spec.ts` baris 41

## Quality Gate
- Typecheck: PASS
- Lint: PASS
- Test: PASS
- Multi-tenant scope: PASS
- RBAC coverage: PASS

## Files Changed
- `apps/api/src/uploads/uploads.service.ts`
- `apps/api/src/products/products.service.ts`
- `apps/api/src/products/products.service.spec.ts`
- `apps/api/src/merchants/merchants.service.ts`
- `apps/api/src/outlets/outlets.service.ts`
- `apps/api/src/users/users.service.ts`

## Catatan
- Memperbaiki import-import yang tidak terpakai (seperti `BadRequestException` yang tidak digunakan lagi) di file-file service yang diubah agar lulus `pnpm lint`.

## Skipped Agents
- documentation: SKIPPED — Endpoint path, response format, dan schema database tidak mengalami perubahan struktural sehingga update ke api-contract.md atau database-design.md tidak diperlukan.
