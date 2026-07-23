## Ticket: GAN-66

## Backend Tasks
- [x] BE-1: Update Prisma schema di `apps/api/prisma/schema.prisma` untuk menambahkan `merchant_id` ke model `uploads`:
  - Tambahkan `merchant_id String? @db.Char(36)` (nullable agar backward-compatible)
  - Tambahkan relation `merchants merchants? @relation(fields: [merchant_id], references: [id], onDelete: Cascade, onUpdate: NoAction, map: "uploads_ibfk_merchant")`
  - Tambahkan index `@@index([merchant_id], map: "idx_uploads_merchant")`
  - Pastikan relasi juga terdaftar di model `merchants` (misal: `uploads uploads[]`)
- [x] BE-2: Jalankan migration untuk MySQL database menggunakan `pnpm --filter umkm-pos-api exec prisma migrate dev --name add_merchant_id_to_uploads`
- [x] BE-3: Modifikasi `apps/api/src/uploads/uploads.service.ts`:
  - Perbarui method `upload(file: Express.Multer.File, userId: string, merchantId: string)` untuk menyimpan `merchant_id` saat `prisma.uploads.create()`
  - Perbarui method `findById(id: string, merchantId: string)` untuk memfilter data berdasarkan `merchant_id: merchantId`. Lempar `NotFoundException` jika tidak ditemukan
  - Perbarui method `generateSignedUrl(id: string, merchantId: string)` untuk memanggil `findById(id, merchantId)`
  - Perbarui method `delete(id: string, merchantId: string)` untuk memanggil `findById(id, merchantId)`
- [x] BE-4: Modifikasi `apps/api/src/uploads/uploads.controller.ts`:
  - Perbarui parameter decorator di method `upload`: gunakan `@CurrentUser('merchant_id') merchantId: string` di samping `userId` dan passing ke `uploadsService.upload`
  - Perbarui parameter decorator di method `findOne`: tambahkan `@CurrentUser('merchant_id') merchantId: string` dan passing ke `uploadsService.findById`
  - Perbarui parameter decorator di method `getSignedUrl`: tambahkan `@CurrentUser('merchant_id') merchantId: string` dan passing ke `uploadsService.generateSignedUrl`
  - Perbarui parameter decorator di method `remove`: tambahkan `@CurrentUser('merchant_id') merchantId: string` dan passing ke `uploadsService.delete`
- [x] BE-5: Tambahkan validasi ownership upload di service yang memanfaatkannya:
  - Di `apps/api/src/users/users.service.ts` method `setAvatar()`: pastikan `uploads.findUnique` juga mencakup kondisi `merchant_id: merchantId` atau throw `BadRequestException('Upload not found')`
  - Di `apps/api/src/merchants/merchants.service.ts` method `setImage()`: pastikan `uploads.findUnique` juga mencakup kondisi `merchant_id: merchantId` atau throw `BadRequestException('Upload not found')`
  - Di `apps/api/src/products/products.service.ts` method `setImage()`: pastikan `uploads.findUnique` juga mencakup kondisi `merchant_id: merchantId` atau throw `BadRequestException('Upload not found')`

## Frontend Tasks
(none)

## Shared Types Tasks
(none)

## Docs Tasks
- [x] DOC-1: Perbarui `docs/database/database-design.md` pada bagian tabel/model `uploads` untuk mencantumkan kolom baru `merchant_id` beserta index-nya.
