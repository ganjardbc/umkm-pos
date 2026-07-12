## Ticket: GAN-52
## Agent: backend
## Status: SUCCESS

## Attempt Log
- Attempt 1: PASS

## Acceptance Criteria
- [x] Breadcrumb pada halaman Edit Kategori (`/product/product-categories/edit/:id`) memiliki item terakhir "Edit" dengan `isActive: true` dan tidak memiliki parameter `route` — Terpenuhi di `apps/web/src/modules/product-categories/router/index.ts` baris 86-88
- [x] Breadcrumb pada halaman Detail Kategori (`/product/product-categories/detail/:id`) memiliki item terakhir "Detail" dengan `isActive: true` dan tidak memiliki parameter `route` — Terpenuhi di `apps/web/src/modules/product-categories/router/index.ts` baris 112-114
- [x] Breadcrumb pada halaman Edit Produk (`/product/product-lists/edit/:id`) memiliki item terakhir "Edit" dengan `isActive: true` dan tidak memiliki parameter `route` — Terpenuhi di `apps/web/src/modules/product-lists/router/index.ts` baris 86-88
- [x] Breadcrumb pada halaman Detail Produk (`/product/product-lists/detail/:id`) memiliki item terakhir "Detail" dengan `isActive: true` dan tidak memiliki parameter `route` — Terpenuhi di `apps/web/src/modules/product-lists/router/index.ts` baris 112-114
- [x] Breadcrumb Kategori/Produk level kedua (Categories / Products) mengarah kembali ke tab yang sesuai (`/product?tab=categories` dan `/product?tab=products`) — Terpenuhi di `apps/web/src/modules/product-categories/router/index.ts` baris 82 dan `apps/web/src/modules/product-lists/router/index.ts` baris 82

## Quality Gate
- Typecheck: PASS
- Lint: PASS
- Test: PASS (Backend unit tests pass, frontend builds successfully with full type-safety checking)
- Multi-tenant scope: PASS (No change to data fetching scope)
- RBAC coverage: PASS (No change to RBAC definitions)

## Files Changed
- apps/web/src/modules/product-categories/router/index.ts
- apps/web/src/modules/product-lists/router/index.ts

## Catatan
Ini adalah task frontend murni yang ditugaskan secara spesifik untuk membenahi metadata navigasi breadcrumb di router Vue 3 frontend.
