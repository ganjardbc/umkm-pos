# Module Breakdown — WisataPOS

## Backend Modules (apps/api/src/)

| Module | Path | Responsibility |
|--------|------|----------------|
| auth | `src/auth/` | JWT login, register, token refresh |
| users | `src/users/` | User CRUD, profile management |
| merchants | `src/merchants/` | Merchant tenant root entity |
| outlets | `src/outlets/` | Multi-outlet management |
| products | `src/products/` | Product catalog + stok |
| product-categories | `src/products/` | Kategori produk |
| transactions | `src/transactions/` | POS commit (atomic) |
| transaction_items | `src/transaction_items/` | Price snapshot per item |
| shifts | `src/shifts/` | Shift kasir + participants |
| stock | `src/stock/` | Stock adjustment + log |
| reports | `src/reports/` | Laporan harian aggregat |
| rbac | `src/rbac/` | Role + permission management |
| notifications | `src/notifications/` | In-app notifications |
| uploads | `src/uploads/` | File upload ke S3/MinIO |
| store-tables | `src/store-tables/` | Meja per outlet |
| customer-catalog | `src/customer-catalog/` | Public menu + customer session |
| settings | `src/settings/` | Pengaturan merchant/outlet |
| audit-logs | `src/audit-logs/` | Audit trail aksi penting |
| common | `src/common/` | Guards, pipes, interceptors, decorators |
| database | `src/database/` | PrismaService |

---

## Frontend Modules (apps/web/src/modules/)

| Module | Path | Description |
|--------|------|-------------|
| auth | `modules/auth/` | Login page |
| dashboard | `modules/dashboard/` | Dashboard overview |
| pos | `modules/pos/` | POS terminal (cashier interface) |
| transaction | `modules/transaction/` | Transaction history + detail |
| product | `modules/product/` | Product management |
| product-categories | `modules/product-categories/` | Kategori produk |
| product-lists | `modules/product-lists/` | Product list (customer-facing) |
| shift | `modules/shift/` | Shift management |
| stock | `modules/stock/` | Stock adjustment |
| reports | `modules/reports/` | Laporan penjualan |
| merchants | `modules/merchants/` | Merchant profile |
| outlet | `modules/outlet/` | Outlet management |
| user | `modules/user/` | User management |
| role | `modules/role/` | Role management |
| permission | `modules/permission/` | Permission management |
| settings | `modules/settings/` | Pengaturan sistem |
| notification | `modules/notification/` | Notifikasi in-app |
| customer-catalog | `modules/customer-catalog/` | Customer self-order page |
| profile | `modules/profile/` | User profile |
| error | `modules/error/` | Error pages (403, 404) |
| landing | `modules/landing/` | Landing/home page |

---

## Shared Packages

| Package | Name | Contents |
|---------|------|----------|
| shared-types | `@umkm-pos/shared-types` | API response types, domain types |
| shared-utils | `@umkm-pos/shared-utils` | Pure utility functions |
| eslint-config | `@umkm-pos/eslint-config` | Shared ESLint config |
