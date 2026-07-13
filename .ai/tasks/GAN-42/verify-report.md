## Ticket: GAN-42
## Agent: backend
## Status: SUCCESS

## Attempt Log
- Attempt 1: FAIL — `rbac.service.spec.ts` tested old 3-arg/2-arg signatures with `ForbiddenException` expectation; validation moved to guard
- Attempt 2: PASS — updated spec to match new service signatures; all 173 tests pass

## Acceptance Criteria
- [x] Decorator `@ScopeByOutlet(fieldPath: string)` tersedia di `apps/api/src/common/decorators/scope-by-outlet.decorator.ts`
- [x] Decorator menyimpan metadata `fieldPath` via `SetMetadata(SCOPE_BY_OUTLET_KEY, fieldPath)`
- [x] Guard `ScopeByOutletGuard` tersedia di `apps/api/src/common/guards/scope-by-outlet.guard.ts`, mengimplementasikan `CanActivate`
- [x] Guard membaca `fieldPath` dari metadata, mengekstrak nilai dari request[source][fieldName], query `outlets` tabel, validasi `merchant_id === user.merchant_id`
- [x] Guard throw `NotFoundException` jika outlet tidak ditemukan, `ForbiddenException` jika merchant_id tidak cocok
- [x] Guard return `true` (skip) jika metadata tidak ada
- [x] `POST /rbac/user-roles` menggunakan `@ScopeByOutlet('body.outlet_id')` + `@UseGuards(ScopeByOutletGuard)` di controller
- [x] `DELETE /rbac/user-roles` menggunakan `@ScopeByOutlet('body.outlet_id')` + `@UseGuards(ScopeByOutletGuard)` di controller
- [x] `private assertOutletBelongsToMerchant` di `RbacService` — tidak ada (logika sudah ada di guard; service sudah bersih)
- [x] `assignRoleToUser(dto, assignedBy)` — tidak ada `callerMerchantId` parameter
- [x] `revokeRoleFromUser(dto)` — tidak ada `callerMerchantId` parameter
- [x] `ScopeByOutletGuard` didaftarkan ke `RbacModule` providers
- [x] Tidak ada endpoint lain yang berubah perilakunya
- [x] Unit test BE-6: 5 test case semua PASS (TC1: no metadata, TC2: valid+match, TC3: not found, TC4: merchant mismatch, TC5: missing outlet_id)
- [x] CLAUDE.md updated dengan `@ScopeByOutlet` dan `ScopeByOutletGuard` entries di Common Module table

## Quality Gate
- Typecheck: PASS — zero errors di GAN-42 files (pre-existing TS2564 di DTOs lain tidak relevan dengan ticket ini)
- Lint: PASS — `pnpm --filter umkm-pos-api lint` no errors
- Test: PASS — 173 passed, 0 failed (14 suites; termasuk 5 TC di scope-by-outlet.guard.spec.ts)
- Multi-tenant scope: PASS — `merchant_id` hanya dari `request.user.merchant_id` (JWT), bukan body/params
- RBAC coverage: PASS — semua handler di rbac.controller.ts punya `@RequirePermission` atau commented (pre-existing)
- Raw SQL: PASS — tidak ada `$queryRaw`/`$executeRaw` di GAN-42 files

## Files Changed
- `apps/api/src/common/decorators/scope-by-outlet.decorator.ts` (BE-1)
- `apps/api/src/common/guards/scope-by-outlet.guard.ts` (BE-2)
- `apps/api/src/common/guards/scope-by-outlet.guard.spec.ts` (BE-6)
- `apps/api/src/rbac/rbac.module.ts` (BE-3 — ScopeByOutletGuard di providers)
- `apps/api/src/rbac/rbac.controller.ts` (BE-4 — @ScopeByOutlet + @UseGuards per handler)
- `apps/api/src/rbac/rbac.service.ts` (BE-5 — clean signatures, no assertOutletBelongsToMerchant)
- `apps/api/src/rbac/rbac.service.spec.ts` (fixed — removed stale cross-tenant tests now owned by guard, updated to new 2-arg/1-arg service signatures)

## Catatan
- Semua implementasi (decorator, guard, spec, controller retrofit, service retrofit, module registration) sudah ada saat agent mulai.
- Satu perubahan: `rbac.service.spec.ts` menguji signature lama dan mengharapkan `ForbiddenException` dari service. Setelah retrofit, validasi outlet ada di guard, bukan service. Spec diupdate: pakai signature baru, hapus stale cross-tenant cases (sudah covered di guard spec), tambah `NotFoundException` (role not found) dan `ConflictException` test, verifikasi `outlets.findUnique` tidak dipanggil dari service.
- `merchant_id` HANYA dari `request.user.merchant_id` (JWT) di guard line 53 — tidak pernah dari body/dto.
- `ScopeByOutletGuard` non-global, dipakai via `@UseGuards(ScopeByOutletGuard)` per handler — sesuai constraints.
