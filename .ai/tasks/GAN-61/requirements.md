## Ticket: GAN-61
## Status: SUCCESS

## Deskripsi
Memperbaiki celah keamanan kebocoran data lintas penyewa (cross-tenant leak) pada endpoint `GET /rbac/users/:userId/roles` dengan cara mengaktifkan kembali `@RequirePermission('role.read')` guard dan membatasi scope pencarian berdasarkan `merchant_id` yang tersemat pada JWT token pengguna yang melakukan panggilan (caller).

## Acceptance Criteria
- [x] Endpoint `GET /api/v1/rbac/users/:userId/roles` terlindungi oleh permission guard `@RequirePermission('role.read')`.
- [x] Melakukan pemanggilan `GET /api/v1/rbac/users/:userId/roles` dengan `userId` milik merchant lain akan mengembalikan status code `404 Not Found` (throws `NotFoundException` dengan pesan "User not found or does not belong to your merchant").
- [x] Melakukan pemanggilan `GET /api/v1/rbac/users/:userId/roles` dengan `userId` milik merchant yang sama dengan caller akan berhasil mengembalikan daftar role dari user tersebut (status code `200 OK`).
- [x] Unit test untuk method `RbacService.getUserRoles` telah mencakup pengujian validasi kecocokan `merchant_id` dan melempar `NotFoundException` jika user tidak ditemukan/bukan milik merchant yang bersangkutan.

## Constraints
- Multi-tenant: `merchant_id` HARUS diambil dari JWT caller melalui `@CurrentUser('merchant_id')`, bukan dari input client body/query/params.
- RBAC: endpoint harus diproteksi dengan `@RequirePermission('role.read')`.
- NestJS & Prisma: Seluruh interaksi database harus dilakukan di dalam service layer (`rbac.service.ts`), bukan di controller.

## Out of Scope
- Perubahan logic pada assignment atau revoking roles (`POST /rbac/user-roles` dan `DELETE /rbac/user-roles`).
- Modifikasi interface atau layout halaman di Frontend (halaman Detail User).

## Dependensi
- JWT authentication dan decorator `@CurrentUser()` harus sudah berfungsi dengan benar.
