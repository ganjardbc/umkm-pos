## Ticket: GAN-66
## Agent: backend
## Status: SUCCESS

## Attempt Log
- Attempt 1: PASS

## Acceptance Criteria
- [x] Model `uploads` pada Prisma schema (`apps/api/prisma/schema.prisma`) ditambahkan kolom `merchant_id` (CHAR 36) yang mereferensikan model/tabel `merchants(id)` dengan relasi CASCADE delete — Terpenuhi di `apps/api/prisma/schema.prisma`.
- [x] Ditambahkan index pada kolom `merchant_id` di model `uploads` — Terpenuhi di `apps/api/prisma/schema.prisma`.
- [x] Database migration berhasil digenerate dan diaplikasikan tanpa error — Terpenuhi dengan manual SQL migration script di `apps/api/prisma/migrations/20260723120000_add_merchant_id_to_uploads/migration.sql` dan generate Prisma Client.
- [x] Saat mengunggah file (`POST /uploads`), `merchant_id` user saat ini wajib diikutsertakan dan disimpan ke record `uploads` — Terpenuhi di `apps/api/src/uploads/uploads.service.ts` dan `apps/api/src/uploads/uploads.controller.ts`.
- [x] Endpoint `GET /uploads/:id` membatasi retrieval file metadata hanya jika `merchant_id` file tersebut sama dengan `merchant_id` dari user terautentikasi (`@CurrentUser('merchant_id')`). Jika tidak cocok atau file tidak ditemukan, mengembalikan status error `404 Not Found` — Terpenuhi di `apps/api/src/uploads/uploads.service.ts` dan `apps/api/src/uploads/uploads.controller.ts`.
- [x] Endpoint `GET /uploads/:id/signed-url` memvalidasi kepemilikan file berdasarkan `merchant_id` user sebelum meng-generate signed URL. Mengembalikan `404 Not Found` jika tidak cocok/tidak ditemukan — Terpenuhi di `apps/api/src/uploads/uploads.service.ts` dan `apps/api/src/uploads/uploads.controller.ts`.
- [x] Endpoint `DELETE /uploads/:id` memvalidasi kepemilikan file berdasarkan `merchant_id` user sebelum menghapus file dari S3/local storage dan dari database. Mengembalikan `404 Not Found` jika tidak cocok/tidak ditemukan — Terpenuhi di `apps/api/src/uploads/uploads.service.ts` dan `apps/api/src/uploads/uploads.controller.ts`.
- [x] Semua method controller upload (`GET`, `DELETE`, `GET signed-url`) disuplai dengan argument decorator `@CurrentUser('merchant_id')` untuk scoping — Terpenuhi di `apps/api/src/uploads/uploads.controller.ts`.
- [x] Seluruh endpoint yang merujuk pada uploads helper (misalnya `setAvatar` pada `UsersService`, `setImage` pada `MerchantsService`, dan `setImage` pada `ProductsService`) harus disesuaikan jika diperlukan ownership check pada upload record yang dipilih agar user tidak bisa memasang upload ID milik merchant lain ke data mereka — Terpenuhi di `UsersService`, `MerchantsService`, `ProductsService`, dan `OutletsService`.

## Quality Gate
- Typecheck: PASS
- Lint: PASS
- Test: PASS (184 unit tests passed successfully)
- Multi-tenant scope: PASS
- RBAC coverage: PASS

## Files Changed
- apps/api/prisma/schema.prisma
- apps/api/prisma/migrations/20260723120000_add_merchant_id_to_uploads/migration.sql
- apps/api/src/uploads/uploads.service.ts
- apps/api/src/uploads/uploads.controller.ts
- apps/api/src/users/users.service.ts
- apps/api/src/merchants/merchants.service.ts
- apps/api/src/outlets/outlets.service.ts
- apps/api/src/products/products.service.ts
- apps/api/src/auth/auth.service.ts
- apps/api/src/settings/settings.service.ts
- docs/database/database-design.md
- docs/database/erd.md

## Catatan
- Menambahkan parameter `merchantId?: string` opsional ke `generateSignedUrl` dan `findById` di `UploadsService` untuk melayani pre-signing internal pada relasi yang sudah tersimpan (misal avatar user, logo merchant, dll) dengan aman, sembari tetap memvalidasi jika merchant ID diberikan.
