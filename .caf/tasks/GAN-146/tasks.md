# Tasks GAN-146

Tidak ada design.md: perubahan hanya di satu app, tanpa skema/migrasi, dan tanpa perubahan kontrak antar layer (controller selalu mengirim `limit` eksplisit).

## Frontend Tasks
Tidak ada

## Backend Tasks
- [ ] (apps/api) Tambah test baru di `apps/api/src/audit-logs/audit-logs.service.spec.ts`, di dalam `describe('getAuditLogs')`: panggil `getAuditLogs('shift-1', 'merchant-1')` tanpa `limit`, assert `result.limit` = 20, `result.offset` = 0, dan `findMany` dipanggil dengan `take: 20` dan `skip: 0`. Jangan ubah test lama. (AC-1, AC-2, AC-3)
- [ ] (apps/api) Ubah default `limit` dari 10 menjadi 20 pada `getAuditLogs` di `apps/api/src/audit-logs/audit-logs.service.ts`; `offset` tetap 0. (AC-1, AC-2, AC-3)
- [ ] (apps/api) Jalankan `pnpm --filter umkm-pos-api run test -- src/audit-logs/audit-logs.service.spec.ts`, `pnpm --filter umkm-pos-api run lint:ci`, dan `pnpm --filter umkm-pos-api run build`; pastikan hanya dua file di scope yang berubah. (AC-3, AC-4, AC-5)
- [ ] (apps/api) Catat hasil grep `getAuditLogs` di `apps/` di laporan untuk tinjauan reviewer; tidak ada perubahan file. (AC-6)

## Coverage
- AC-1: task 1, 2
- AC-2: task 1, 2
- AC-3: task 1, 2, 3
- AC-4: task 3
- AC-5: task 3
- AC-6: task 4
