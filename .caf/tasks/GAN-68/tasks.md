## Ticket: GAN-68

## Backend Tasks
- [ ] BE-1: Di `apps/api/src/users/users.controller.ts`, tambahkan `@RequirePermission('user.read')` pada handler `findAll()` (baris ~50-61, method `GET /users`). Tempatkan decorator tepat setelah `@Get()` dan sebelum `@ApiOperation(...)`, mengikuti urutan yang dipakai pada `findOne()` (`@Get(':id')` → `@RequirePermission('user.read')` → `@ApiOperation(...)`).
- [ ] BE-2: Tambahkan/perbarui test (unit atau e2e, sesuaikan dengan pola test existing di `apps/api/src/users/` atau `apps/api/test/`) yang memverifikasi: (a) request `GET /users` dari user tanpa permission `user.read` menghasilkan `403 Forbidden`; (b) request `GET /users` dari user dengan permission `user.read` tetap menghasilkan `200 OK` dengan payload paginated seperti sebelumnya.

## Frontend Tasks
(none — perubahan murni backend RBAC guard, tidak ada perubahan store/service/page yang diperlukan)

## Shared Types Tasks
(none — tidak ada perubahan type/contract endpoint)

## Docs Tasks
- [ ] DOC-1: Kalau `docs/api/api-contract.md` mendokumentasikan endpoint `GET /users` beserta required permission-nya, update entry tersebut agar mencantumkan `user.read` sebagai required permission (cek dulu apakah entry existing sudah benar/salah sebelum mengubah).

## Skip Agents
- frontend: Tidak ada perubahan scope di `apps/web` — fix ini murni menambah satu decorator RBAC di controller backend (`apps/api/src/users/users.controller.ts`), tidak ada store/service/page/route yang terdampak.
