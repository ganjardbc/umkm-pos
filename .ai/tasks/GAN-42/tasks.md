## Ticket: GAN-42

## Backend Tasks

### Decorator Baru
- [ ] BE-1: Buat file `apps/api/src/common/decorators/scope-by-outlet.decorator.ts`
  - Export constant `SCOPE_BY_OUTLET_KEY = 'scopeByOutlet'`
  - Export decorator `ScopeByOutlet(fieldPath: string)` menggunakan `SetMetadata(SCOPE_BY_OUTLET_KEY, fieldPath)`
  - `fieldPath` bertipe `string` dengan format dot-notation: `'body.outlet_id'` | `'params.outlet_id'` | `'query.outlet_id'`

### Guard Baru
- [ ] BE-2: Buat file `apps/api/src/common/guards/scope-by-outlet.guard.ts`
  - Class `ScopeByOutletGuard implements CanActivate`, dekorasi `@Injectable()`
  - Constructor inject: `Reflector`, `PrismaService`
  - Method `canActivate(context: ExecutionContext): Promise<boolean>`:
    1. Baca metadata dengan `reflector.getAllAndOverride<string>(SCOPE_BY_OUTLET_KEY, [handler, class])`
    2. Jika metadata tidak ada → return `true` (guard skip)
    3. Parse `fieldPath` → split by `.` → index 0 = sumber (`body`/`params`/`query`), index 1 = nama field
    4. Ekstrak nilai dari `request[source][fieldName]`
    5. Jika nilai tidak ada → throw `BadRequestException('outlet_id is required for this endpoint')`
    6. Query: `prisma.outlets.findUnique({ where: { id: outletId } })`
    7. Jika outlet null → throw `NotFoundException('Outlet not found')`
    8. Jika `outlet.merchant_id !== request.user.merchant_id` → throw `ForbiddenException('Outlet does not belong to your merchant')`
    9. Return `true`

### Module Registration
- [ ] BE-3: Daftarkan `ScopeByOutletGuard` ke provider di `apps/api/src/common/common.module.ts` (atau modul mana pun yang menjadi home existing guards — cek dulu apakah `PermissionGuard` didaftarkan di sana atau langsung di `RbacModule`)
  - Jika tidak ada `common.module.ts`: tambahkan ke `RbacModule` providers sebagai langkah pertama, dengan catatan perlu dipindah ke common module jika guard akan dipakai lintas modul lain

### Retrofit RbacController
- [ ] BE-4: Update `apps/api/src/rbac/rbac.controller.ts`
  - Import `ScopeByOutlet` dari `common/decorators/scope-by-outlet.decorator`
  - Import `ScopeByOutletGuard` dari `common/guards/scope-by-outlet.guard`
  - Di handler `assignRoleToUser (POST /rbac/user-roles)`:
    - Tambah `@ScopeByOutlet('body.outlet_id')`
    - Tambah `@UseGuards(ScopeByOutletGuard)` (atau di level controller jika diputuskan class-level — tapi hati-hati, itu apply ke semua handler; lebih aman handler-level)
    - Hapus parameter `@CurrentUser('merchant_id') callerMerchantId` dari signature handler
    - Ubah service call ke `this.rbacService.assignRoleToUser(dto, userId)` (tanpa `callerMerchantId`)
  - Di handler `revokeRoleFromUser (DELETE /rbac/user-roles)`:
    - Tambah `@ScopeByOutlet('body.outlet_id')`
    - Tambah `@UseGuards(ScopeByOutletGuard)`
    - Hapus parameter `@CurrentUser('merchant_id') callerMerchantId`
    - Ubah service call ke `this.rbacService.revokeRoleFromUser(dto)` (tanpa `callerMerchantId`)

### Retrofit RbacService
- [ ] BE-5: Update `apps/api/src/rbac/rbac.service.ts`
  - Hapus method `private assertOutletBelongsToMerchant(outletId, callerMerchantId)` seluruhnya
  - Update signature `assignRoleToUser(dto: AssignRoleDto, assignedBy: string)` — hapus parameter `callerMerchantId: string`
  - Hapus baris `await this.assertOutletBelongsToMerchant(dto.outlet_id, callerMerchantId)` dari body `assignRoleToUser`
  - Update signature `revokeRoleFromUser(dto: AssignRoleDto)` — hapus parameter `callerMerchantId: string`
  - Hapus baris `await this.assertOutletBelongsToMerchant(dto.outlet_id, callerMerchantId)` dari body `revokeRoleFromUser`
  - Hapus import `ForbiddenException` jika tidak dipakai di tempat lain setelah perubahan ini

### Test
- [ ] BE-6: Buat file `apps/api/src/common/guards/scope-by-outlet.guard.spec.ts`
  - Test case 1: metadata tidak ada → guard return `true` tanpa query DB
  - Test case 2: `outlet_id` valid, `merchant_id` cocok → return `true`
  - Test case 3: outlet tidak ditemukan di DB → throw `NotFoundException`
  - Test case 4: outlet ditemukan tapi `merchant_id` berbeda → throw `ForbiddenException`
  - Test case 5: `outlet_id` tidak ada di request (field kosong) → throw `BadRequestException`
  - Mock `PrismaService` dan `Reflector` menggunakan Jest mock/jest.fn()

## Frontend Tasks
_(tidak ada — task ini backend-only)_

## Shared Types Tasks
_(tidak ada — tidak ada type baru yang dikontrakkan antara FE dan BE)_

## Docs Tasks
- [ ] DOC-1: Tidak ada perubahan `api-contract.md` — endpoint path, method, request body, dan response format tidak berubah
- [ ] DOC-2: Tidak ada perubahan `database-design.md` — tidak ada schema change
- [ ] DOC-3: Update `apps/api/CLAUDE.md` bagian "Common Module" table — tambahkan baris:
  ```
  | `@ScopeByOutlet(fieldPath)` | Validate outlet ownership via guard, scoped to caller's merchant |
  | `ScopeByOutletGuard`        | Guard untuk enforce @ScopeByOutlet metadata |
  ```
