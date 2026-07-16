## Ticket: GAN-46

## Backend Tasks
- [x] BE-1: Daftarkan permission code baru `transaction.print` di `apps/api/prisma/seed.ts` dalam array `permissionsData` beserta deskripsinya (`Print transaction receipts`).
- [x] BE-2: Petakan permission `transaction.print` ke role `owner` (dalam `ownerPermIds`), `manager` (dalam `managerPermIds`), dan `cashier` (dalam `cashierPermIds`) pada file `apps/api/prisma/seed.ts`.
- [x] BE-3: Jalankan script database seeding (`npx prisma db seed` atau command pnpm terkait) untuk memperbarui database development dengan permission baru.

## Frontend Tasks
- [x] FE-1: Ubah nilai konstanta `PRINT` di file `apps/web/src/modules/transaction/services/rbac.ts` menjadi `'transaction.print'`.
- [x] FE-2: Pastikan file `apps/web/src/modules/transaction/pages/index.vue` menggunakan konstanta `PRINT` yang sudah diperbarui untuk mengontrol computed property `isCanPrint`.
- [x] FE-3: Pastikan file `apps/web/src/modules/transaction/pages/detail.vue` menggunakan konstanta `PRINT` yang sudah diperbarui untuk mengontrol computed property `isCanPrint`.

## Shared Types Tasks
- (none)

## Docs Tasks
- (none)
