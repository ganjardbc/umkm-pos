# Feature Catalog

Katalog fitur = irisan antara module controller backend (`apps/api/src/**/*.controller.ts`)
dan route frontend yang memanggilnya. Dihasilkan oleh `/feature-catalog-sync`.

Status: `TODO` = hasil generate belum diverifikasi manusia · `OK` = sudah diverifikasi ·
`⚠️ stale` = tidak ditemukan lagi di kode.

Semua endpoint memakai prefix global `/api/v1`. Route frontend tanpa keterangan app
berasal dari `apps/web`.

| Fitur | Module | Endpoint | Route frontend | Status |
| --- | --- | --- | --- | --- |
| Autentikasi | `auth` | `POST /auth/login`, `POST /auth/register`, `GET /auth/profile` | `/` (login), `/register`, `/profile`; `apps/landing` — `CustomerRegisterSection.vue` memanggil `POST /auth/register` (app tanpa router) | TODO |
| Dashboard | `reports` | `GET /reports/summary`, `GET /reports/daily`, `GET /reports/top-products`, `GET /reports/outlet-comparison`, `GET /reports/dashboard` | `/dashboard` | TODO |
| Laporan & export | `reports` | `GET /reports/export/summary`, `GET /reports/export/daily`, `GET /reports/export/top-products`, `GET /reports/export/outlet-comparison`, `GET /reports/export/transactions` | `/reports` | TODO |
| Produk | `products` | `POST /products`, `GET /products`, `GET /products/:id`, `PATCH /products/:id`, `DELETE /products/:id`, `PATCH /products/:id/image`, `DELETE /products/:id/image` | `/product`, `/product/product-lists`, `/product/product-lists/create`, `/product/product-lists/edit/:id`, `/product/product-lists/detail/:id` | TODO |
| Kategori produk | `products/categories` | `POST /products/categories`, `GET /products/categories`, `GET /products/categories/active/list`, `GET /products/categories/:id`, `PATCH /products/categories/:id`, `DELETE /products/categories/:id` | `/product/product-categories`, `/product/product-categories/create`, `/product/product-categories/edit/:id`, `/product/product-categories/detail/:id` | TODO |
| Stok & inventori | `stock` | `GET /stock/logs`, `GET /stock/inventory`, `POST /stock/adjust` | `/stock`, dipakai juga dari `/product/product-lists` | TODO |
| Transaksi | `transactions` | `POST /transactions`, `GET /transactions`, `GET /transactions/:id`, `POST /transactions/:id/cancel`, `PATCH /transactions/:id/status` | `/transaction`, `/transaction/create`, `/transaction/detail/:id`, `/cashier` | TODO |
| Item transaksi | `transaction_items` | `GET /transactions/:transactionId/items` | (backend-only) | TODO |
| Shift kasir | `shifts` | `POST /shifts`, `GET /shifts`, `GET /shifts/:id`, `GET /shifts/user/:user_id`, `GET /shifts/outlet/:outlet_id`, `PATCH /shifts/:id/close`, `GET /shifts/:id/participants`, `POST /shifts/:id/participants`, `DELETE /shifts/:id/participants/:user_id`, `PATCH /shifts/:id/participants/:user_id/restore`, `POST /shifts/:id/handoff` | `/shift`, `/shift/detail/:id`, `/cashier` | TODO |
| Audit log shift | `audit-logs` | `GET /shifts/:shift_id/audit-log` | `/shift/detail/:id` | TODO |
| Metrik peserta shift | `metrics` | `GET /shifts/:shift_id/participants/:user_id/metrics` | `/shift/detail/:id` | TODO |
| Outlet | `outlets` | `POST /outlets`, `GET /outlets`, `GET /outlets/:id`, `PATCH /outlets/:id`, `DELETE /outlets/:id`, `PATCH /outlets/:id/image`, `DELETE /outlets/:id/image` | `/outlet`, `/outlet/create`, `/outlet/edit/:id/`, `/outlet/detail/:id` | TODO |
| Meja outlet | `store-tables` | `GET /outlets/:outletId/tables`, `POST /outlets/:outletId/tables`, `PATCH /outlets/:outletId/tables/:id`, `DELETE /outlets/:outletId/tables/:id` | `/outlet`, `/transaction/create` | TODO |
| Merchant | `merchants` | `POST /merchants`, `GET /merchants`, `GET /merchants/:id`, `PATCH /merchants/:id`, `DELETE /merchants/:id`, `PATCH /merchants/:id/image`, `DELETE /merchants/:id/image` | `/merchants`, `/merchants/create`, `/merchants/edit/:id`, `/merchants/detail/:id` | TODO |
| Pengguna | `users` | `POST /users`, `GET /users`, `GET /users/:id`, `PATCH /users/:id`, `DELETE /users/:id`, `PATCH /users/:id/avatar`, `DELETE /users/:id/avatar` | `/user`, `/user/create`, `/user/:id/edit`, `/user/:id` | TODO |
| RBAC — role | `rbac` | `POST /rbac/roles`, `GET /rbac/roles`, `GET /rbac/roles/:id`, `PATCH /rbac/roles/:id`, `DELETE /rbac/roles/:id`, `POST /rbac/roles/:id/permissions`, `DELETE /rbac/roles/:id/permissions/:permId` | `/role`, `/role/create`, `/role/edit/:id`, `/role/detail/:id` | TODO |
| RBAC — permission | `rbac` | `POST /rbac/permissions`, `GET /rbac/permissions`, `GET /rbac/permissions/:id`, `DELETE /rbac/permissions/:id` | `/permission`, `/permission/create` | TODO |
| RBAC — assignment user-role | `rbac` | `POST /rbac/user-roles`, `DELETE /rbac/user-roles`, `GET /rbac/users/:userId/roles` | `/user/create`, `/user/:id/edit` | TODO |
| Notifikasi | `notifications` | `GET /notification`, `GET /notification/:id`, `PATCH /notification/:id/read`, `PATCH /notification/read-all` | `/notification` | TODO |
| Pengaturan akun & situs | `settings` | `GET /settings/profile`, `PUT /settings/profile`, `PUT /settings/password`, `POST /settings/email/verify`, `PUT /settings/email`, `POST /settings/account/deactivate`, `GET /settings/site`, `PUT /settings/site` | `/settings`, `/settings/edit-profile`, `/settings/change-password`, `/settings/change-email`, `/settings/site-settings`, `/settings/deactivate-account` | TODO |
| Upload berkas & gambar | `uploads` | `POST /uploads`, `GET /uploads/:id`, `GET /uploads/:id/signed-url`, `DELETE /uploads/:id` | Lintas modul via `apps/web/src/services/uploads.ts` — form produk, user, merchant, outlet, settings | TODO |
| Katalog pelanggan (self-order) | `customer-catalog` | `POST /customer-sessions/start`, `GET /catalog/session/me`, `GET /catalog/session/status`, `GET /catalog/shift-status`, `GET /catalog/categories`, `GET /catalog/products`, `GET /catalog/tables`, `POST /catalog/orders`, `GET /catalog/orders/:id` | `/menu/:outletId`, `/menu/:outletId/home`, `/menu/:outletId/browse`, `/menu/:outletId/cart`, `/menu/:outletId/order` | TODO |
| Health check root | `app` | `GET /` | (backend-only) | TODO |
| Landing page | — | (no backend, kecuali `POST /auth/register` dari `apps/landing`) | `/landing` (web); `apps/landing` single-page tanpa router | TODO |
| Halaman error | — | (no backend) | `/403`, `/404`, catch-all `/:catchAll(.*)` | TODO |
