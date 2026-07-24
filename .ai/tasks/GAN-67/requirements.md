## Ticket: GAN-67
## Status: SUCCESS

## Deskripsi
Mencegah kerentanan cross-tenant exploit di mana merchant dapat menempelkan (attach) file upload milik merchant lain ke entitas Product, Merchant, Outlet, atau User mereka sendiri. Solusi diimplementasikan dengan menambahkan langkah validasi kepemilikan file upload berdasarkan ID pengunggah (`uploaded_by_id`) di setiap flow `setImage`/`setAvatar`.

## Acceptance Criteria
- [x] Menambahkan method validasi `validateUploadOwnership(uploadId, merchantId)` di `UploadsService` untuk memeriksa apakah upload ada dan diunggah oleh user yang memiliki `merchant_id` yang sama dengan caller.
- [x] Method `ProductsService.setImage` memanggil `validateUploadOwnership` sebelum memperbarui data gambar produk.
- [x] Method `MerchantsService.setImage` memanggil `validateUploadOwnership` sebelum memperbarui data logo merchant.
- [x] Method `OutletsService.setImage` memanggil `validateUploadOwnership` sebelum memperbarui data logo outlet.
- [x] Method `UsersService.setAvatar` memanggil `validateUploadOwnership` sebelum memperbarui data avatar user.
- [x] Flow `setImage`/`setAvatar` melempar `NotFoundException` jika upload tidak ditemukan, dan `ForbiddenException` jika upload dimiliki oleh merchant lain.

## Constraints
- Multi-tenant: `merchant_id` harus divalidasi silang antara entitas pengunggah upload dengan context tenant/merchant pemanggil.
- Tidak diperbolehkan memodifikasi skema database (`schema.prisma`) untuk task ini.
- Validasi kepemilikan upload harus dilakukan secara backend-side menggunakan resource ID dan tenant ID yang bersangkutan.

## Out of Scope
- Pembatasan akses API detail `/uploads/:id` secara global (ditangani terpisah di GAN-66).
- Implementasi relasi baru di level Prisma/database schema.

## Dependensi
- Tidak ada dependensi ke task lain.
