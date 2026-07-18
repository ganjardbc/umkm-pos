## Ticket: GAN-65
## Status: SUCCESS

## Deskripsi
Memperbaiki celah keamanan kebocoran data lintas-tenant (cross-tenant data leak) pada endpoint legacy `GET /shifts/outlet/:outlet_id`. Controller dan Service perlu diperbarui agar membatasi pencarian data shift hanya untuk outlet yang dimiliki oleh merchant dari user yang sedang login (diperoleh dari JWT token).

## Acceptance Criteria
- [ ] Parameter `merchant_id` dari JWT token diekstrak di `ShiftsController.findByOutlet` menggunakan decorator `@CurrentUser('merchant_id')`.
- [ ] Method `ShiftsService.findByOutlet` menerima parameter tambahan `merchantId` (e.g. `findByOutlet(outletId: string, merchantId: string)`).
- [ ] Di dalam `ShiftsService.findByOutlet`, ditambahkan validasi untuk memastikan outlet dengan `outletId` dimiliki oleh merchant dengan `merchantId` melalui pemanggilan `this.prisma.outlets.findFirst({ where: { id: outletId, merchant_id: merchantId } })`.
- [ ] Jika data outlet tidak ditemukan atau tidak cocok dengan `merchantId`, method `ShiftsService.findByOutlet` melempar `NotFoundException` (mengikuti pola legacy/tidak membocorkan informasi keberadaan outlet lintas tenant).
- [ ] Unit test di `apps/api/src/shifts/shifts.service.spec.ts` disesuaikan atau ditambahkan untuk memverifikasi fungsionalitas validasi `merchantId` pada `findByOutlet`.

## Constraints
- Multi-tenant: `merchant_id` HARUS diambil dari JWT payload via `@CurrentUser('merchant_id')` server-side, dilarang mengambil atau mempercayai `merchant_id` dari client request body/query/headers.
- Penggunaan Prisma client harus ter-inject melalui `PrismaService` di `ShiftsService` constructor (mengikuti backend conventions).

## Out of Scope
- Modifikasi pada schema database (Prisma schema) atau migrasi baru.
- Perubahan pada API flow/controller client web frontend.
- Perubahan behavior pada endpoint legacy `/shifts/user/:user_id` kecuali jika terbukti diperlukan (saat ini difokuskan pada `/shifts/outlet/:outlet_id` sesuai temuan auditor).

## Dependensi
- JWT Authentication (`JwtAuthGuard` & `@CurrentUser` decorator)
- Database schema `outlets` dan `shifts` (sudah tersedia)
