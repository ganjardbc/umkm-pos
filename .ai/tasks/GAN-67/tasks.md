## Ticket: GAN-67

## Backend Tasks
- [x] BE-1: Tambahkan method `validateUploadOwnership(uploadId: string, merchantId: string): Promise<void>` di `UploadsService` (`apps/api/src/uploads/uploads.service.ts`). Method ini harus mencari upload berdasarkan `uploadId` (lempar `NotFoundException` jika tidak ada), mencari user pengunggah lewat `uploaded_by_id`, lalu mencocokkan `user.merchant_id` dengan `merchantId` (lempar `ForbiddenException` jika tidak cocok).
- [x] BE-2: Integrasikan validasi di `ProductsService.setImage` (`apps/api/src/products/products.service.ts`) dengan memanggil `await this.uploadsService.validateUploadOwnership(uploadId, merchantId)`. Hapus validasi manual `prisma.uploads.findUnique` yang lama.
- [x] BE-3: Integrasikan validasi di `MerchantsService.setImage` (`apps/api/src/merchants/merchants.service.ts`) dengan memanggil `await this.uploadsService.validateUploadOwnership(uploadId, merchantId)`. Hapus validasi manual `prisma.uploads.findUnique` yang lama.
- [x] BE-4: Integrasikan validasi di `OutletsService.setImage` (`apps/api/src/outlets/outlets.service.ts`) dengan memanggil `await this.uploadsService.validateUploadOwnership(uploadId, merchantId)`. Hapus validasi manual `prisma.uploads.findUnique` yang lama.
- [x] BE-5: Integrasikan validasi di `UsersService.setAvatar` (`apps/api/src/users/users.service.ts`) dengan memanggil `await this.uploadsService.validateUploadOwnership(uploadId, merchantId)`. Hapus validasi manual `prisma.uploads.findUnique` yang lama.

## Frontend Tasks
- (none)

## Shared Types Tasks
- (none)

## Docs Tasks
- (none)

## Skip Agents
- frontend: Kerentanan ini diselesaikan sepenuhnya di sisi backend dengan menambahkan pengecekan kepemilikan upload sebelum dipasangkan ke entitas. Tidak ada perubahan UI atau API call yang dibutuhkan di frontend.
