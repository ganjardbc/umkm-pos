## Ticket: GAN-67
## Status: PLAN

## Deskripsi
Validasi kepemilikan file upload di endpoint setImage/setAvatar untuk mencegah cross-tenant upload attachment exploit. Validasi ini memastikan file upload yang diasosiasikan ke produk, merchant, outlet, atau user profile dimiliki oleh merchant yang sama dengan pemanggil.

## Acceptance Criteria
- [x] `UploadsService` memiliki method baru `validateUploadOwnership(uploadId: string, merchantId: string): Promise<void>`.
- [x] `validateUploadOwnership` memvalidasi keberadaan upload (melempar `BadRequestException('Upload not found')` jika tidak ada).
- [x] `validateUploadOwnership` mencocokkan `merchant_id` milik user pengunggah (`uploaded_by_id`) dengan `merchantId` caller (melempar `ForbiddenException` jika tidak cocok).
- [x] `ProductsService.setImage` menggunakan method `validateUploadOwnership` sebelum menyimpan image_upload_id.
- [x] `MerchantsService.setImage` menggunakan method `validateUploadOwnership` sebelum menyimpan logo_upload_id.
- [x] `OutletsService.setImage` menggunakan method `validateUploadOwnership` sebelum menyimpan logo_upload_id.
- [x] `UsersService.setAvatar` menggunakan method `validateUploadOwnership` sebelum menyimpan avatar_upload_id.
- [x] Semua mock `UploadsService` di file spec unit test backend diperbarui untuk menyertakan `validateUploadOwnership`.

## Constraints
- Multi-tenant: `merchant_id` HARUS didapatkan dari JWT payload (auth user context), bukan dari body request client.
- Exception: Melempar `BadRequestException('Upload not found')` jika ID upload tidak valid dan `ForbiddenException` jika terjadi cross-tenant upload access.
- DB Queries: Akses DB wajib melalui service prisma yang di-inject.

## Out of Scope
- Perubahan schema database (seperti menambahkan kolom `merchant_id` secara langsung ke table `uploads`, yang dicover di GAN-66).
- Perubahan UI/Store Frontend (karena API response dan parameter request body/path tidak berubah).

## Dependensi
- None
