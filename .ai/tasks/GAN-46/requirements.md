## Ticket: GAN-46
## Status: PLAN

## Deskripsi
Memisahkan permission code untuk aksi cetak struk (`PRINT`) dari aksi baca transaksi (`READ`) di modul transaction. Sebelumnya, `PRINT` didefinisikan sama dengan `READ` (`transaction.read`), sehingga pengguna dengan akses baca otomatis memiliki akses cetak. Perubahan ini akan memperkenalkan permission code baru `transaction.print` khusus untuk mencetak struk transaksi.

## Acceptance Criteria
- [ ] Dibuat permission code baru `transaction.print` di database (melalui script seeding backend).
- [ ] Permission code `transaction.print` diasosiasikan dengan role `owner`, `manager`, dan `cashier` pada script seeding backend.
- [ ] Di frontend (`apps/web`), konstanta `PRINT` pada file `apps/web/src/modules/transaction/services/rbac.ts` diubah nilainya menjadi `'transaction.print'`.
- [ ] Di frontend (`apps/web`), tombol print struk di halaman list transaksi (`apps/web/src/modules/transaction/pages/index.vue`) dan halaman detail transaksi (`apps/web/src/modules/transaction/pages/detail.vue`) mendisable/menyembunyikan tombol berdasarkan permission `transaction.print` (melalui konstanta `PRINT`).
- [ ] Verifikasi bahwa pengguna tanpa permission `transaction.print` tidak dapat melihat/mengklik tombol cetak struk, sedangkan pengguna dengan permission tersebut (seperti owner, manager, cashier) tetap bisa mencetak struk.

## Constraints
- RBAC: Setiap endpoint backend dilindungi oleh `PermissionGuard` / `@RequirePermission()`. Karena pencetakan struk dilakukan di client-side menggunakan data transaksi yang dibaca melalui `GET /transactions/:id`, endpoint detail transaksi tersebut tetap diamankan dengan `@RequirePermission('transaction.read')`. Client-side UI akan mengamankan tombol cetak menggunakan `transaction.print`.
- Seed data: Perubahan permission harus dimasukkan ke seed script `apps/api/prisma/seed.ts` agar database development dan production dapat disinkronkan secara konsisten menggunakan command seed.

## Out of Scope
- Penambahan endpoint backend baru khusus untuk cetak struk (pencetakan dilakukan secara client-side menggunakan web Bluetooth printer).
- Perubahan alur printing atau library bluetooth printer yang digunakan.

## Dependensi
- Data seeding backend harus dijalankan terlebih dahulu untuk memastikan permission `transaction.print` ada di database sebelum diuji di frontend.
