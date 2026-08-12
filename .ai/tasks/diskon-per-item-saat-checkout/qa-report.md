## Ticket: diskon-per-item-saat-checkout
## Agent: qa
## Status: PASS

## Quality Gate Results
- Typecheck: PASS (NestJS build & vue-tsc -b completed with 0 errors)
- Lint: PASS (`pnpm --filter umkm-pos-api lint` passed cleanly)
- Test: PASS (`pnpm --filter umkm-pos-api test` — 14 suites, 186 unit/integration tests passed)
- Frontend Build: PASS (`pnpm --filter umkm-pos-app build` generated production assets)

## Security Check Results (backend)
- Multi-tenant scope: PASS (`merchant_id` verified from authenticated JWT context, outlet ownership validated)
- RBAC coverage: PASS (`@RequirePermission('transaction.create')` active on POST `/transactions`)
- Raw SQL: PASS (no unescaped raw SQL introduced)
- Secret exposure: PASS (no sensitive data logged)

## Acceptance Criteria Verification
- [x] Modal & popover diskon per item di cart — PASS: `Cart.vue:290-394`
- [x] 2 mode diskon (% dan Rp) — PASS: `Cart.vue:305-348`, `state.ts:1-15`, `transactions.service.ts:618-644`
- [x] Preview kalkulasi diskon & subtotal baru — PASS: `Cart.vue:437-456`
- [x] Badge diskon, coretan harga & subtotal — PASS: `Cart.vue:74-138`
- [x] Rekapitulasi `cartTotal` reaktif — PASS: `getters.ts:25-37`
- [x] Reset / hapus diskon — PASS: `actions.ts:70-76`, `Cart.vue:108-120`
- [x] Kuantitas item berubah memperbarui diskon otomatis — PASS: `getters.ts:2-24`
- [x] Payload transaksi menyertakan field diskon — PASS: `create-transaction.dto.ts:28-44`
- [x] Snapshot diskon tersimpan di database — PASS: `schema.prisma:320-323`, `transactions.service.ts:409-413`
- [x] Validasi server-side % & nominal tidak boleh melebihi gross subtotal — PASS: `transactions.service.ts:619-640`
- [x] Cetak struk printer thermal & receipt generator — PASS: `bluetoothPrinter.ts:373-377`, `receiptGenerator.ts:153-166`, `ReceiptPreview.vue:50-56`
- [x] Halaman detail transaksi POS — PASS: `detail.vue:145-156`

## Edge Cases Tested
| Skenario | Expected | Actual | Status |
|---|---|---|---|
| Diskon persen > 100% | 400 Bad Request | 400 Bad Request | ✅ |
| Diskon nominal > gross subtotal | 400 Bad Request | 400 Bad Request | ✅ |
| Diskon 0 / null / reset | Subtotal normal (price * qty) | Subtotal normal | ✅ |
| Perubahan qty setelah diskon persen | Diskon proportional naik/turun | Sesuai formula | ✅ |
| Multi item transaksi dengan diskon berbeda | Total kalkulasi akurat tanpa selisih | Subtotal & total pas | ✅ |

## Issues Found
None.

## Verdict
PASS — Semua acceptance criteria terverifikasi, build & test backend dan frontend 100% green.
