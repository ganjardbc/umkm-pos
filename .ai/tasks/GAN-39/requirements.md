## Ticket: GAN-39
## Status: PLAN

## Deskripsi
Tambah fitur export laporan transaksi ke CSV pada halaman reports. User dapat filter berdasarkan tanggal, lalu mengunduh file CSV yang berisi daftar transaksi dalam rentang tersebut dan ter-scope ke merchant terkait.

## Acceptance Criteria
- [ ] Endpoint baru `GET /reports/transactions/export` menerima query parameters `date_from` dan `date_to` (format YYYY-MM-DD)
- [ ] Response endpoint berupa stream/data CSV dengan `Content-Type: text/csv`
- [ ] Download file CSV otomatis di-trigger dari frontend dengan nama file `Transaction_Report_<YYYY-MM-DD>.csv`
- [ ] Data transaksi disaring berdasarkan `merchant_id` yang didapat dari JWT token (multi-tenant safety)
- [ ] Endpoint backend memiliki `@RequirePermission('report.read')` untuk otorisasi
- [ ] Tombol "Export CSV" baru di web UI bagian Laporan (Halaman reports)

## Constraints
- Multi-tenant: `merchant_id` wajib diambil dari `CurrentUser` decorator, tidak dari payload frontend client
- RBAC: butuh `@RequirePermission('report.read')`
- Menggunakan database transactions table yang terhubung ke outlets untuk memvalidasi scope merchant

## Out of Scope
- Modifikasi format export Excel yang sudah ada
- Fitur auto-email CSV ke user

## Dependensi
- reports module, transactions table
