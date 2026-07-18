## Ticket: GAN-65
## Agent: backend
## Status: SUCCESS

## Attempt Log
- Attempt 1: PASS

## Acceptance Criteria
- [x] Parameter `merchant_id` dari JWT token diekstrak di `ShiftsController.findByOutlet` menggunakan decorator `@CurrentUser('merchant_id')`.
- [x] Method `ShiftsService.findByOutlet` menerima parameter tambahan `merchantId` (`findByOutlet(outletId: string, merchantId: string)`).
- [x] Di dalam `ShiftsService.findByOutlet`, ditambahkan validasi untuk memastikan outlet dengan `outletId` dimiliki oleh merchant dengan `merchantId` melalui pemanggilan `this.prisma.outlets.findFirst({ where: { id: outletId, merchant_id: merchantId } })`.
- [x] Jika data outlet tidak ditemukan atau tidak cocok dengan `merchantId`, method `ShiftsService.findByOutlet` melempar `NotFoundException` (mengikuti pola legacy/tidak membocorkan informasi keberadaan outlet lintas tenant).
- [x] Unit test di `apps/api/src/shifts/shifts.service.spec.ts` disesuaikan atau ditambahkan untuk memverifikasi fungsionalitas validasi `merchantId` pada `findByOutlet`.

## Quality Gate
- Typecheck: PASS
- Lint: PASS
- Test: PASS
- Multi-tenant scope: PASS
- RBAC coverage: PASS

## Files Changed
- `apps/api/src/shifts/shifts.controller.ts`
- `apps/api/src/shifts/shifts.service.ts`
- `apps/api/src/shifts/shifts.service.spec.ts`
- `docs/api/api-contract.md`

## Catatan
- Perubahan ini murni pada backend logic untuk mengamankan data lintas tenant shift outlet dan melengkapi dokumentasi API contract yang relevan.

## Skipped Agents
- frontend: SKIPPED — Perubahan ini murni perbaikan logic backend untuk pengamanan data lintas tenant. Kontrak request/response tidak berubah, sehingga tidak memerlukan perubahan di frontend.
