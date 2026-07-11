## Ticket: GAN-49
## Agent: qa
## Status: PASS

## Quality Gate Results
- Typecheck: PASS
- Lint: PASS
- Test: PASS
  ```
  Test Suites: 13 passed, 13 total
  Tests:       173 passed, 173 total
  Snapshots:   0 total
  Time:        1.09 s
  ```

## Security Check Results (backend)
- Multi-tenant scope: PASS
  - `merchantId` verified via controller `CurrentUser` decorators.
  - Assertions check outlet ownership context (`assertOutletBelongsToMerchant`, `getMerchantOutletIds`).
- RBAC coverage: PASS
  - Controller endpoint `PATCH :id/status` protected by `@RequirePermission('transaction.update_status')`.
  - POS checkout endpoint `POST /` protected by `@RequirePermission('transaction.create')`.
- Raw SQL: PASS (none found)
- Secret exposure: PASS (none found)

## Acceptance Criteria Verification
- [x] Backend memvalidasi field `cash_received` dan menghitung ulang `change_amount` untuk semua pembayaran cash (`payment_method === 'cash'`) — PASS: `apps/api/src/transactions/transactions.service.ts:630-675`
- [x] Di method `create` (POS / customer order) dan `updateStatus` (saat order status diselesaikan), backend harus menghitung `expectedChange = cash_received - total_amount` (server-side total) — PASS: `apps/api/src/transactions/transactions.service.ts:654`
- [x] Jika klien mengirim `change_amount` yang tidak sesuai dengan hasil perhitungan server-side (selisih di luar pembulatan desimal standard / `.toFixed(2)`), sistem harus mengembalikan `BadRequestException` dengan pesan validasi yang jelas — PASS: `apps/api/src/transactions/transactions.service.ts:667-671`
- [x] Jika klien tidak mengirimkan `change_amount`, backend secara otomatis mengisi nilai tersebut berdasarkan perhitungan server-side — PASS: `apps/api/src/transactions/transactions.service.ts:661-662`
- [x] Data struk cetak (modal atau print) di frontend harus merefleksikan nilai valid dari server-side database — PASS: Frontend (Cart.vue, index.vue) uses database values calculated & saved server-side.

## Edge Cases Tested
| Skenario | Expected | Actual | Status |
|---|---|---|---|
| `cash_received` missing (cash) | 400 Validation Error | 400 Validation Error | ✅ |
| `cash_received` less than `total_amount` | 400 Validation Error | 400 Validation Error | ✅ |
| `change_amount` not matching (float drift) | 400 Validation Error | 400 Validation Error | ✅ |
| `change_amount` missing / null | Auto computed based on total | Computed & saved successfully | ✅ |
| Non-cash payment (`payment_method !== 'cash'`) | `cash_received` and `change_amount` set to null | Saved successfully as null | ✅ |

## Issues Found
None.

## Verdict
PASS — all acceptance criteria met and verified successfully.
