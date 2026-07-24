## Ticket: GAN-67
## Agent: backend
## Status: SUCCESS

## Attempt Log
- Attempt 1: PASS

## Acceptance Criteria
- [x] Menambahkan method validasi `validateUploadOwnership(uploadId, merchantId)` di `UploadsService` — Terpenuhi di `apps/api/src/uploads/uploads.service.ts` baris 68
- [x] Method `ProductsService.setImage` memanggil `validateUploadOwnership` sebelum memperbarui data gambar produk — Terpenuhi di `apps/api/src/products/products.service.ts` baris 330
- [x] Method `MerchantsService.setImage` memanggil `validateUploadOwnership` sebelum memperbarui logo merchant — Terpenuhi di `apps/api/src/merchants/merchants.service.ts` baris 186
- [x] Method `OutletsService.setImage` memanggil `validateUploadOwnership` sebelum memperbarui logo outlet — Terpenuhi di `apps/api/src/outlets/outlets.service.ts` baris 154
- [x] Method `UsersService.setAvatar` memanggil `validateUploadOwnership` sebelum memperbarui avatar user — Terpenuhi di `apps/api/src/users/users.service.ts` baris 206
- [x] Flow `setImage`/`setAvatar` melempar `NotFoundException` jika upload tidak ditemukan, dan `ForbiddenException` jika upload dimiliki oleh merchant lain — Terpenuhi di `apps/api/src/uploads/uploads.service.ts` baris 76 dan 84

## Quality Gate
- Typecheck: PASS
- Lint: PASS
- Test: PASS (190 unit tests passed)
- Multi-tenant scope: PASS
- RBAC coverage: PASS

## Files Changed
- `apps/api/src/uploads/uploads.service.ts`
- `apps/api/src/products/products.service.ts`
- `apps/api/src/merchants/merchants.service.ts`
- `apps/api/src/outlets/outlets.service.ts`
- `apps/api/src/users/users.service.ts`
- `apps/api/src/uploads/uploads.service.spec.ts`
- `apps/api/src/products/products.service.spec.ts`

## Catatan
- Menghapus import `BadRequestException` yang tidak digunakan lagi dari file service `merchants.service.ts`, `outlets.service.ts`, dan `users.service.ts` untuk memastikan tidak ada lint errors.
- Menambahkan mock `validateUploadOwnership` dan unit test komprehensif pada `uploads.service.spec.ts` serta `products.service.spec.ts`.

## Skipped Agents
- frontend: SKIPPED — Kerentanan ini diselesaikan sepenuhnya di sisi backend dengan menambahkan pengecekan kepemilikan upload sebelum dipasangkan ke entitas. Tidak ada perubahan UI atau API call yang dibutuhkan di frontend.
