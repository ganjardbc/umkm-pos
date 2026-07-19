## Ticket: GAN-62
## Agent: qa
## Status: PASS

## Quality Gate Results
- Typecheck: PASS
- Lint: PASS
- Test: PASS
  ```
  Test Suites: 1 passed, 1 total
  Tests:       7 passed, 7 total
  Snapshots:   0 total
  Time:        0.997 s, estimated 1 s
  Ran all test suites matching apps/api/src/rbac/rbac.service.spec.ts.
  ```

## Security Check Results (backend)
- Multi-tenant scope: PASS
  - Terpenuhi di `apps/api/src/rbac/rbac.service.ts:219-224` (`assignRoleToUser`): mencari user berdasarkan `dto.user_id` DAN `merchant_id` dari JWT.
  - Terpenuhi di `apps/api/src/rbac/rbac.service.ts:258-263` (`revokeRoleFromUser`): mencari user berdasarkan `dto.user_id` DAN `merchant_id` dari JWT.
- RBAC coverage: PASS
  - Endpoint `POST /api/rbac/user-roles` dilindungi dengan `@RequirePermission('role.assign')` di `apps/api/src/rbac/rbac.controller.ts:172`.
  - Endpoint `DELETE /api/rbac/user-roles` dilindungi dengan `@RequirePermission('role.assign')` di `apps/api/src/rbac/rbac.controller.ts:192`.
  - Kedua endpoint juga menggunakan `@ScopeByOutlet('body.outlet_id')` + `@UseGuards(ScopeByOutletGuard)` untuk mencegah cross-tenant outlet access.
- Raw SQL: PASS (tidak ditemukan penggunaan query mentah).
- Secret exposure: PASS (tidak ada log password/token).

## Acceptance Criteria Verification
- [x] API `POST /api/rbac/user-roles` (`assignRoleToUser`) memvalidasi `dto.user_id` milik merchant yang sama dengan caller (`merchant_id` dari JWT) — PASS: `apps/api/src/rbac/rbac.controller.ts:183-188` dan `apps/api/src/rbac/rbac.service.ts:214-224`
- [x] API `DELETE /api/rbac/user-roles` (`revokeRoleFromUser`) memvalidasi `dto.user_id` milik merchant yang sama dengan caller (`merchant_id` dari JWT) — PASS: `apps/api/src/rbac/rbac.controller.ts:202-207` dan `apps/api/src/rbac/rbac.service.ts:257-263`
- [x] Jika `user_id` tidak ditemukan atau tidak berada di bawah merchant yang sama dengan caller, API melempar `NotFoundException` dengan pesan yang sesuai (`User not found or does not belong to your merchant`) — PASS: `apps/api/src/rbac/rbac.service.ts:225-229` dan `apps/api/src/rbac/rbac.service.ts:264-268`
- [x] Service unit tests di `apps/api/src/rbac/rbac.service.spec.ts` diperbarui untuk mencakup skenario validasi `user_id` milik merchant (baik skenario sukses maupun gagal) — PASS: `apps/api/src/rbac/rbac.service.spec.ts:57-76` (`assignRoleToUser` failure), `apps/api/src/rbac/rbac.service.spec.ts:122-160` (`assignRoleToUser` success), `apps/api/src/rbac/rbac.service.spec.ts:164-179` (`revokeRoleFromUser` failure), `apps/api/src/rbac/rbac.service.spec.ts:195-226` (`revokeRoleFromUser` success).

## Edge Cases Tested
| Skenario | Expected | Actual | Status |
|---|---|---|---|
| user_id valid dan milik merchant caller | Berhasil assign/revoke role | Berhasil assign/revoke | ✅ |
| user_id valid tapi milik merchant lain | NotFoundException ("User not found or does not belong to your merchant") | NotFoundException | ✅ |
| user_id tidak ditemukan di database | NotFoundException ("User not found or does not belong to your merchant") | NotFoundException | ✅ |
| outlet_id milik merchant lain (Cross-tenant) | ForbiddenException ("Outlet does not belong to your merchant") | ForbiddenException | ✅ |
| outlet_id tidak ditemukan | NotFoundException ("Outlet not found") | NotFoundException | ✅ |

## Issues Found

### CRITICAL (harus diperbaiki sebelum PR)
Nihil.

### NON-CRITICAL (bisa di task terpisah)
Nihil.

## Verdict

PASS — semua acceptance criteria terpenuhi secara presisi dan aman dari celah keamanan cross-tenant, serta seluruh pengujian unit test dan typecheck berhasil dijalankan dengan baik.
