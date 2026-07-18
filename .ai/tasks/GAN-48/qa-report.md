## Ticket: GAN-48
## Agent: qa
## Status: PASS

## Quality Gate Results
- Typecheck: PASS
  ```
  npx pnpm build succeeded across all workspaces without type checking or build issues.
  ```
- Lint: PASS
  ```
  npx pnpm lint succeeded across all workspaces.
  ```
- Test: PASS
  ```
  182 test cases passed successfully in NestJS test suite.
  ```

## Security Check Results (backend)
- Multi-tenant scope: PASS
  - All queries are filtered using `getAllowedOutletIds(userId, merchantId)`, ensuring only the outlets belonging to the user's merchant are queried.
  - Transactions cannot be fetched, created, updated, or cancelled if they do not belong to the allowed outlets of the current user.
- RBAC coverage: PASS
  - All endpoints in `TransactionsController` are guarded by `@UseGuards(PermissionGuard)` and have clear `@RequirePermission` permissions defined (`transaction.create`, `transaction.read`, `transaction.cancel`, `transaction.update_status`).
- Raw SQL: PASS — none found
- Secret exposure: PASS — none found

## Acceptance Criteria Verification
- [x] Modifikasi API `GET /transactions` untuk membatasi list transaksi hanya pada outlet-outlet yang diperbolehkan bagi user. Jika user menyertakan `outlet_id` di query parameter, periksa kepemilikan merchant dan otorisasi user ke outlet tersebut. Jika tidak disertakan, kembalikan hanya transaksi dari outlet yang di-assign ke user.
  - **PASS**: `apps/api/src/transactions/transactions.service.ts:38-86`. Verified that if `outletId` is queried, it asserts ownership via `assertOutletBelongsToMerchant` and authorization via `allowedOutletIds.includes(outletId)`. Otherwise, it uses `outlet_id: { in: allowedOutletIds }`.
- [x] Modifikasi API `POST /transactions` untuk menolak request dengan status 403 Forbidden jika user tidak memiliki akses/role pada `outlet_id` yang dikirim di body payload.
  - **PASS**: `apps/api/src/transactions/transactions.service.ts:542-549`. In `prepareTransactionPayload`, if `userId` is present, it validates `allowedOutletIds.includes(dto.outlet_id)` and throws a `ForbiddenException` (403) if unauthorized.
- [x] Modifikasi API `GET /transactions/:id`, `POST /transactions/:id/cancel`, dan `PATCH /transactions/:id/status` untuk memastikan transaksi yang dicari berada di outlet yang diperbolehkan bagi user. Jika transaksi berada di outlet lain yang tidak dapat diakses user, kembalikan status 404 Not Found atau 403 Forbidden.
  - **PASS**: `apps/api/src/transactions/transactions.service.ts:88-111` (`findOne`), `224` (`updateStatus` via `findOne`), and `275-290` (`cancel`). Verified that `findFirst` is queried using `outlet_id: { in: allowedOutletIds }` and throws a `NotFoundException` (404) if no transaction matches the filter.
- [x] Otorisasi outlet-level dilewati/diberikan secara penuh untuk user dengan role `owner` pada merchant tersebut.
  - **PASS**: `apps/api/src/transactions/transactions.service.ts:796-820` (`getAllowedOutletIds`). If `userRoles` contains any role named `'owner'`, it bypasses the restriction and returns all outlets belonging to the merchant.

## Edge Cases Tested
| Skenario | Expected | Actual | Status |
|---|---|---|---|
| Non-owner queries non-assigned outlet on GET /transactions | 403 Forbidden | 403 Forbidden | ✅ |
| Non-owner queries assigned outlet on GET /transactions | 200 OK | 200 OK | ✅ |
| Non-owner requests status update on transaction in unassigned outlet | 404 Not Found | 404 Not Found | ✅ |
| Non-owner creates POS transaction for unassigned outlet | 403 Forbidden | 403 Forbidden | ✅ |
| Non-owner cancels transaction in unassigned outlet | 404 Not Found | 404 Not Found | ✅ |
| Owner queries transactions of any merchant outlet | 200 OK | 200 OK | ✅ |
| Invalid pagination inputs (e.g. `page=0`, `limit=-1`) | 400 Bad Request | 400 Bad Request | ✅ |

## Issues Found

### CRITICAL (harus diperbaiki sebelum PR)
- None found.

### NON-CRITICAL (bisa di task terpisah)
1. **Security Exception Code**: `assertOutletBelongsToMerchant` throws `UnauthorizedException` (401) instead of `ForbiddenException` (403) or `NotFoundException` (404) when the queried outlet does not belong to the user's merchant. Although secure (it rejects the request), a 403 or 404 is cleaner and more conventional to prevent tenant leaking.
2. **Stock check race condition**: The stock availability check in `prepareTransactionPayload` is executed outside the prisma database transaction (before `this.prisma.$transaction`). This introduces a tiny race condition window where concurrent requests might both pass the check and decrement the stock to a negative value. (Note: Pre-existing architecture behavior, not introduced by GAN-48).

## Verdict

PASS — Semua kriteria penerimaan (acceptance criteria) terpenuhi dengan baik dan aman secara keamanan (multi-tenant & RBAC). Tidak ditemukan isu kritis (critical issues).
