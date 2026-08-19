## Ticket: GAN-68
## Status: PLAN

## Deskripsi
`GET /users` (`UsersController.findAll`) tidak memiliki decorator `@RequirePermission('user.read')`, berbeda dari handler sibling lain di controller yang sama (`findOne`, `update`, `remove`, `setAvatar`, `removeAvatar`). Karena `PermissionGuard.canActivate` men-treat metadata permission yang hilang sebagai "allow", endpoint ini efektif bisa diakses oleh user terautentikasi manapun tanpa cek RBAC — termasuk role yang seharusnya tidak punya akses `user.read` (mis. cashier).

## Acceptance Criteria
- [ ] `UsersController.findAll` (route `GET /users`) memiliki decorator `@RequirePermission('user.read')`, ditempatkan konsisten dengan pola decorator pada handler lain di file yang sama (di atas/bawah `@ApiOperation`, mengikuti urutan existing seperti pada `findOne`).
- [ ] User dengan role yang tidak memiliki permission `user.read` menerima `403 Forbidden` (`ForbiddenException` dari `PermissionGuard`, pesan `Permission denied. Required: user.read`) saat memanggil `GET /users`.
- [ ] User dengan role yang memiliki permission `user.read` tetap menerima `200 OK` dengan payload list users ter-paginasi seperti sebelumnya (tidak ada regresi pada response shape/behavior `findAll`).
- [ ] Tidak ada perubahan pada signature method `findAll`, query params, atau `usersService.findAll` — perubahan murni menambah satu decorator di controller.

## Constraints
- Multi-tenant: `merchant_id` tetap harus berasal dari JWT (`@CurrentUser('merchant_id')`) — tidak berubah oleh task ini.
- RBAC: gunakan permission code `user.read` yang sudah ada (dipakai di `findOne`) — JANGAN membuat permission code baru atau menambah seed data permission/role_permission baru.
- Perubahan dibatasi pada `apps/api/src/users/users.controller.ts` — tidak menyentuh service, DTO, module registration, atau schema.
- Tidak mengubah struktur guard (`PermissionGuard`) atau perilaku default "allow when no metadata" — perbaikan dilakukan dengan menambah metadata yang hilang, bukan mengubah logic guard.

## Out of Scope
- Mengubah default behavior `PermissionGuard` (mis. mengubah "allow" jadi "deny" saat metadata permission hilang) — di luar scope ticket ini, berpotensi berdampak luas ke controller lain.
- Audit/fix endpoint lain di luar `apps/api/src/users/users.controller.ts:50-61` yang mungkin punya masalah serupa (silent-missing `@RequirePermission`) — kalau ditemukan, dicatat sebagai temuan terpisah, bukan dikerjakan di ticket ini.
- Perubahan pada frontend (`apps/web`) — tidak ada UI/store yang perlu diubah karena ini murni RBAC gate di backend.

## Dependensi
- Permission code `user.read` sudah tersedia di database (dibuktikan dengan pemakaiannya di `findOne` pada file yang sama) — tidak ada dependensi migrasi/seed baru.
