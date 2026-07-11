## Ticket: GAN-49
## Agent: backend
## Status: SUCCESS

## Attempt Log
- Attempt 1: PASS

## Acceptance Criteria
- [x] Backend memvalidasi field `cash_received` dan menghitung ulang `change_amount` untuk semua pembayaran cash (`payment_method === 'cash'`) — Terpenuhi di `apps/api/src/transactions/transactions.service.ts` baris 632-668
- [x] Di method `create` (POS / customer order) dan `updateStatus` (saat order status diselesaikan), backend harus menghitung `expectedChange = cash_received - total_amount` — Terpenuhi di `apps/api/src/transactions/transactions.service.ts` baris 654
- [x] Jika klien mengirim `change_amount` yang tidak sesuai dengan hasil perhitungan server-side (selisih di luar pembulatan desimal standard / `.toFixed(2)`), sistem harus mengembalikan `BadRequestException` dengan pesan validasi yang jelas — Terpenuhi di `apps/api/src/transactions/transactions.service.ts` baris 662-664
- [x] Jika klien tidak mengirimkan `change_amount` (kosong / null / undefined), backend secara otomatis mengisi nilai tersebut berdasarkan perhitungan server-side — Terpenuhi di `apps/api/src/transactions/transactions.service.ts` baris 659
- [x] Data struk cetak (modal atau print) di frontend harus merefleksikan nilai valid dari server-side database — Terpenuhi karena API response mengembalikan nilai dari database yang sudah divalidasi dan disimpan di server.

## Quality Gate
- Typecheck: PASS
- Lint: PASS
- Test: PASS
- Multi-tenant scope: PASS
- RBAC coverage: PASS

## Files Changed
- apps/api/src/transactions/transactions.service.ts
- apps/api/src/transactions/transactions.service.spec.ts
