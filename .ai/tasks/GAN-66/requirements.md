## Ticket: GAN-66
## Status: SUCCESS

## Deskripsi
Fitur Uploads pada API saat ini tidak memiliki ownership scoping berdasarkan `merchant_id`. Akibatnya, merchant yang satu dapat mengakses detail metadata, meng-generate signed URL, atau menghapus file milik merchant lain melalui brute force UUID upload. Solusinya adalah dengan menambahkan field `merchant_id` ke tabel `uploads` di database schema (Prisma), dan membatasi query (read, delete, generate signed-url) hanya untuk upload yang memiliki `merchant_id` yang sesuai dengan `merchant_id` user yang sedang aktif (diambil dari JWT payload token).

## Acceptance Criteria
- [ ] Model `uploads` pada Prisma schema (`apps/api/prisma/schema.prisma`) ditambahkan kolom `merchant_id` (CHAR 36) yang mereferensikan model/tabel `merchants(id)` dengan relasi CASCADE delete.
- [ ] Ditambahkan index pada kolom `merchant_id` di model `uploads`.
- [ ] Database migration berhasil digenerate dan diaplikasikan tanpa error.
- [ ] Saat mengunggah file (`POST /uploads`), `merchant_id` user saat ini wajib diikutsertakan dan disimpan ke record `uploads`.
- [ ] Endpoint `GET /uploads/:id` membatasi retrieval file metadata hanya jika `merchant_id` file tersebut sama dengan `merchant_id` dari user terautentikasi (`@CurrentUser('merchant_id')`). Jika tidak cocok atau file tidak ditemukan, mengembalikan status error `404 Not Found`.
- [ ] Endpoint `GET /uploads/:id/signed-url` memvalidasi kepemilikan file berdasarkan `merchant_id` user sebelum meng-generate signed URL. Mengembalikan `404 Not Found` jika tidak cocok/tidak ditemukan.
- [ ] Endpoint `DELETE /uploads/:id` memvalidasi kepemilikan file berdasarkan `merchant_id` user sebelum menghapus file dari S3/local storage dan dari database. Mengembalikan `404 Not Found` jika tidak cocok/tidak ditemukan.
- [ ] Semua method controller upload (`GET`, `DELETE`, `GET signed-url`) disuplai dengan argument decorator `@CurrentUser('merchant_id')` untuk scoping.
- [ ] Seluruh endpoint yang merujuk pada uploads helper (misalnya `setAvatar` pada `UsersService`, `setImage` pada `MerchantsService`, dan `setImage` pada `ProductsService`) harus disesuaikan jika diperlukan ownership check pada upload record yang dipilih agar user tidak bisa memasang upload ID milik merchant lain ke data mereka.

## Constraints
- Multi-tenant: `merchant_id` HARUS diambil secara eksklusif dari JWT token via `@CurrentUser('merchant_id')`, tidak boleh dipercayakan dari input body/query client.
- Database: Column `merchant_id` pada table `uploads` bersifat nullable (`String?` di Prisma) demi backward-compatibility terhadap data existing / file-file global jika ada, namun untuk semua upload baru wajib terisi.

## Out of Scope
- Perubahan pada frontend UI / upload store karena backend contract tidak berubah secara interface eksternal (path URL, parameter `:id`, dan response schema DTO tetap sama).

## Dependensi
- Skema database (Prisma migrations) harus berhasil dieksekusi terlebih dahulu sebelum menjalankan backend service updates.
