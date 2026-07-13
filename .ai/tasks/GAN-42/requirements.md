## Ticket: GAN-42
## Status: PLAN

## Deskripsi
Buat decorator `@ScopeByOutlet(fieldPath)` yang bisa dipasang secara declarative di endpoint controller mana pun. Decorator ini membuat `PermissionGuard` (atau guard terpisah) otomatis memvalidasi bahwa `outlet_id` yang dikirim client (dari body/param/query) benar-benar milik merchant yang sama dengan JWT caller — tanpa perlu validasi inline di service. Setelah decorator siap, retrofit dua endpoint yang sudah ada (`POST /rbac/user-roles` dan `DELETE /rbac/user-roles`) dari validasi inline ke deklaratif.

## Acceptance Criteria
- [ ] Decorator `@ScopeByOutlet(fieldPath: string)` tersedia di `apps/api/src/common/decorators/scope-by-outlet.decorator.ts`
- [ ] Decorator menyimpan metadata `fieldPath` (contoh: `'body.outlet_id'`, `'params.outlet_id'`) via `SetMetadata`
- [ ] Guard `ScopeByOutletGuard` tersedia di `apps/api/src/common/guards/scope-by-outlet.guard.ts`, mengimplementasikan `CanActivate`
- [ ] Guard membaca `fieldPath` dari metadata, mengekstrak nilai `outlet_id` dari request sesuai lokasi (body/params/query), lalu query `outlets` tabel untuk memverifikasi `merchant_id === user.merchant_id` dari JWT
- [ ] Guard melempar `NotFoundException` jika outlet tidak ditemukan, `ForbiddenException` jika `merchant_id` tidak cocok
- [ ] Guard tidak berjalan (return `true`) jika metadata `@ScopeByOutlet` tidak ada di handler
- [ ] `POST /rbac/user-roles` menggunakan `@ScopeByOutlet('body.outlet_id')` di controller — validasi scope outlet dihapus dari `RbacService.assignRoleToUser`
- [ ] `DELETE /rbac/user-roles` menggunakan `@ScopeByOutlet('body.outlet_id')` di controller — validasi scope outlet dihapus dari `RbacService.revokeRoleFromUser`
- [ ] `private assertOutletBelongsToMerchant` di `RbacService` dihapus setelah retrofit selesai (logika pindah ke guard)
- [ ] Signature service `assignRoleToUser(dto, assignedBy, callerMerchantId)` dan `revokeRoleFromUser(dto, callerMerchantId)` tidak lagi membutuhkan parameter `callerMerchantId` — dihapus
- [ ] `ScopeByOutletGuard` didaftarkan ke `AppModule` atau `RbacModule` sebagai provider, bisa dipakai via `@UseGuards(ScopeByOutletGuard)` di level controller/handler
- [ ] Tidak ada endpoint lain (selain dua yang di-retrofit) yang perilakunya berubah
- [ ] Unit test untuk `ScopeByOutletGuard` mencakup: outlet ditemukan + merchant cocok (pass), outlet tidak ditemukan (NotFoundException), merchant tidak cocok (ForbiddenException), tidak ada metadata (pass)

## Constraints
- Multi-tenant: `merchant_id` hanya dari `request.user.merchant_id` (JWT) — guard tidak boleh membaca `merchant_id` dari body/param manapun
- Guard baru (`ScopeByOutletGuard`) terpisah dari `PermissionGuard` yang existing — tidak menggabungkan logika ke dalam `PermissionGuard` karena blast radius terlalu besar
- `fieldPath` syntax: format dot-notation `'body.outlet_id'` atau `'params.outlet_id'` atau `'query.outlet_id'` — guard harus support ketiga lokasi ini
- Decorator dipasang di controller handler, bukan di service
- `ScopeByOutletGuard` harus dipakai bersama `@UseGuards(ScopeByOutletGuard)` — tidak menjadi global guard karena tidak semua endpoint membutuhkan scope check
- Stack: NestJS + Prisma + MySQL — tidak ada dependency baru

## Out of Scope
- Perubahan pada `PermissionGuard` existing
- Retrofit endpoint di luar `rbac` module pada task ini
- Support multi-outlet validation (lebih dari satu `outlet_id` sekaligus)
- Frontend changes — task ini backend-only
- Schema/migration — tidak ada perubahan database
- Fix audit temuan #1 (getUserRoles cross-tenant) dan #2 (guard di-comment) — itu ticket terpisah

## Dependensi
- `assertOutletBelongsToMerchant` di `RbacService` sudah ada dan menjadi referensi logika yang akan dipindahkan ke guard
- `PrismaService` tersedia via DI di guard (pola sama dengan `PermissionGuard`)
- `Reflector` dari `@nestjs/core` tersedia untuk membaca metadata decorator
- Tidak ada task lain yang harus selesai lebih dulu
