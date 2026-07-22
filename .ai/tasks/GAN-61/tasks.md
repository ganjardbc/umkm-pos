## Ticket: GAN-61

## Backend Tasks
- [x] BE-1: Ubah signature method `RbacService.getUserRoles(userId)` menjadi `getUserRoles(userId: string, merchantId: string)` di `apps/api/src/rbac/rbac.service.ts`.
- [x] BE-2: Implementasikan pengecekan tenancy di `RbacService.getUserRoles` dengan memvalidasi keberadaan target user berdasarkan `userId` dan `merchantId` menggunakan `this.prisma.users.findFirst`. Jika user tidak ditemukan atau tidak cocok dengan `merchantId`, lemparkan `NotFoundException`.
- [x] BE-3: Aktifkan decorator `@RequirePermission('role.read')` pada handler `getUserRoles` di `apps/api/src/rbac/rbac.controller.ts`.
- [x] BE-4: Ambil `merchant_id` dari token pemanggil menggunakan decorator `@CurrentUser('merchant_id') merchantId: string` di handler `getUserRoles`, lalu teruskan parameter tersebut ke service call.
- [x] BE-5: Tambahkan unit test baru di `apps/api/src/rbac/rbac.service.spec.ts` untuk memverifikasi fungsionalitas `getUserRoles` (sukses mengembalikan daftar user-roles jika tenant cocok, dan melempar `NotFoundException` jika tenant tidak cocok/user tidak ditemukan).

## Frontend Tasks
(none)

## Shared Types Tasks
(none)

## Docs Tasks
(none)

## Skip Agents
- frontend: Perubahan hanya terjadi pada sistem keamanan di Backend, sedangkan API contract (path, method, dan return payload) di Frontend tetap sama dan parameter token JWT dikirim otomatis oleh interceptor yang sudah ada.
- documentation: Tidak ada perubahan endpoint baru atau schema database baru yang perlu didokumentasikan di API contract atau ERD.
