## Ticket: GAN-65

## Backend Tasks
- [x] BE-1: (none)
- [x] BE-2: (none)
- [x] BE-3: Perbarui signature dan logika method `findByOutlet` di `apps/api/src/shifts/shifts.service.ts`:
  - Signature: `async findByOutlet(outletId: string, merchantId: string)`
  - Tambahkan validasi: Cek kepemilikan outlet menggunakan `this.prisma.outlets.findFirst({ where: { id: outletId, merchant_id: merchantId } })`
  - Jika tidak ditemukan, throw `NotFoundException`
- [x] BE-4: Perbarui method `findByOutlet` di `apps/api/src/shifts/shifts.controller.ts`:
  - Tangkap `merchantId` menggunakan `@CurrentUser('merchant_id') merchantId: string`
  - Teruskan `merchantId` ke pemanggilan `this.shiftsService.findByOutlet(outletId, merchantId)`
- [x] BE-5: Tambahkan unit test untuk `findByOutlet` di `apps/api/src/shifts/shifts.service.spec.ts`:
  - Test case 1: Sukses mengembalikan data shift jika outlet valid milik merchant caller
  - Test case 2: Throw `NotFoundException` jika outlet tidak terdaftar pada merchant caller

## Frontend Tasks
- (none)

## Shared Types Tasks
- (none)

## Docs Tasks
- [x] DOC-1: Tambahkan deskripsi endpoint legacy `GET /shifts/outlet/:outlet_id` di `docs/api/api-contract.md` di bawah section `## Shift Endpoints` jika dirasa perlu untuk kejelasan contract
- [x] DOC-2: (none)

## Skip Agents
- frontend: Perubahan ini murni perbaikan logic backend untuk pengamanan data lintas tenant. Kontrak request/response tidak berubah, sehingga tidak memerlukan perubahan di frontend.
