## Ticket: GAN-39
## Agent: backend
## Status: SUCCESS

## Attempt Log
- Attempt 1: PASS

## Acceptance Criteria
- [x] Endpoint baru `GET /reports/export/transactions` menerima query parameters `date_from` dan `date_to` (format YYYY-MM-DD) — Diimplementasikan di `apps/api/src/reports/reports.controller.ts` baris 208
- [x] Response endpoint berupa stream/data CSV dengan `Content-Type: text/csv` — Diimplementasikan di `apps/api/src/common/services/csv-export.service.ts` baris 35
- [x] Download file CSV otomatis di-trigger dari frontend dengan nama file `Transaction_Report_<YYYY-MM-DD>.csv` — Diimplementasikan di `apps/web/src/modules/reports/pages/index.vue` baris 273
- [x] Data transaksi disaring berdasarkan `merchant_id` yang didapat dari JWT token (multi-tenant safety) — Diimplementasikan di `apps/api/src/reports/reports.service.ts` baris 234
- [x] Endpoint backend memiliki `@RequirePermission('report.read')` untuk otorisasi — Diimplementasikan di `apps/api/src/reports/reports.controller.ts` baris 202
- [x] Tombol "Export CSV" baru di web UI bagian Laporan (Halaman reports) — Diimplementasikan di `apps/web/src/modules/reports/pages/index.vue` baris 67

## Quality Gate
- Typecheck: PASS
- Lint: PASS
- Test: PASS (13/13 test suites passed)
- Multi-tenant scope: PASS (via `resolveOutletIds` validating merchant ownership)
- RBAC coverage: PASS (controller class guarded by `PermissionGuard` and endpoint requires `report.read` permission)

## Files Changed
- apps/api/src/common/services/csv-export.service.ts
- apps/api/src/reports/reports.module.ts
- apps/api/src/reports/reports.service.ts
- apps/api/src/reports/reports.controller.ts
- apps/web/src/modules/reports/services/api.ts
- apps/web/src/modules/reports/pages/index.vue
- docs/api/api-contract.md

## Catatan
- Implementasi sudah lengkap dan terintegrasi penuh antara backend, frontend, serta dokumentasi API.
- TypeScript type checking dan eslint linting berjalan sukses tanpa error di seluruh monorepo.
