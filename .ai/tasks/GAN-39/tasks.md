## Ticket: GAN-39

## Backend Tasks
- [x] BE-1: Buat helper utility `CsvExportService` di `apps/api/src/common/services/csv-export.service.ts` untuk memformat array of object ke format raw CSV string dan menyetel response headers (`Content-Type: text/csv` dan `Content-Disposition`)
- [x] BE-2: Daftarkan `CsvExportService` ke providers dan exports di `apps/api/src/reports/reports.module.ts`
- [x] BE-3: Tambah logic method `exportTransactionsToCsv(merchantId: string, dto: QueryReportDto, res: Response)` di `apps/api/src/reports/reports.service.ts` untuk query data transaksi dari Prisma (filtered by `merchant_id` via outlet, `date_from`, `date_to`) dan format menjadi CSV menggunakan `CsvExportService`
- [x] BE-4: Daftarkan endpoint baru `GET /reports/transactions/export` di `apps/api/src/reports/reports.controller.ts` dengan guard `@RequirePermission('report.read')`

## Frontend Tasks
- [x] FE-1: Buat fungsi `exportTransactionsCsv(params: any)` di `apps/web/src/modules/reports/services/api.ts` yang memanggil API `/api/v1/reports/export/transactions` (atau path sejenis `/api/reports/transactions/export`) dengan query params dan `responseType: 'blob'`
- [x] FE-2: Tambahkan UI Card baru (atau tombol) untuk Laporan Transaksi (Transaction Report) di halaman `apps/web/src/modules/reports/pages/index.vue`
- [x] FE-3: Implementasikan fungsi download handler `downloadTransactionsCsv` di `apps/web/src/modules/reports/pages/index.vue` menggunakan helper `downloadFile` dari `@/helpers/download.ts`

## Shared Types Tasks
- Tidak ada perubahan type shared.

## Docs Tasks
- [x] DOC-1: Perbarui file `docs/api/api-contract.md` bagian Reports Endpoints untuk mendokumentasikan `GET /reports/transactions/export`
