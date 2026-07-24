## Ticket: GAN-67

## Backend Tasks
- [x] BE-1: Buat method `validateUploadOwnership(uploadId: string, merchantId: string): Promise<void>` di `apps/api/src/uploads/uploads.service.ts` yang mengambil data upload, mengambil user pengunggah (`users`), lalu membandingkan `uploader.merchant_id` dengan `merchantId`.
- [x] BE-2: Import `ForbiddenException` dari `@nestjs/common` di `apps/api/src/uploads/uploads.service.ts`.
- [x] BE-3: Ubah `setImage` di `apps/api/src/products/products.service.ts` untuk memanggil `this.uploadsService.validateUploadOwnership` dan menghapus logic check upload internal.
- [x] BE-4: Ubah `setImage` di `apps/api/src/merchants/merchants.service.ts` untuk memanggil `this.uploadsService.validateUploadOwnership` dan menghapus logic check upload internal.
- [x] BE-5: Ubah `setImage` di `apps/api/src/outlets/outlets.service.ts` untuk memanggil `this.uploadsService.validateUploadOwnership` dan menghapus logic check upload internal.
- [x] BE-6: Ubah `setAvatar` di `apps/api/src/users/users.service.ts` untuk memanggil `this.uploadsService.validateUploadOwnership` dan menghapus logic check upload internal.
- [x] BE-7: Perbarui mock `UploadsService` di unit test backend (`apps/api/src/products/products.service.spec.ts` dan spec file lainnya) untuk meng-include mock `validateUploadOwnership`.

## Frontend Tasks
(none)

## Shared Types Tasks
(none)

## Docs Tasks
(none)

## Skip Agents
- frontend: Perubahan ini murni pada tingkat validasi data di backend server. Flow request dan tipe data payload dari frontend tetap sama, sehingga frontend agent tidak perlu dijalankan.
- documentation: Endpoint path, response format, dan schema database tidak mengalami perubahan struktural sehingga update ke api-contract.md atau database-design.md tidak diperlukan.
