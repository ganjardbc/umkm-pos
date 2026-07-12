## Ticket: GAN-52
## Status: SUCCESS

## Deskripsi
Memperbaiki route path pada navigasi breadcrumb di modul Kategori Produk (Product Categories) dan Daftar Produk (Product Lists). 
Masalah saat ini:
1. Breadcrumb untuk edit kategori mengarah ke path tanpa ID: `/product/product-categories/edit` (aktif tapi route tidak lengkap/salah jika diakses manual meskipun state aktif).
2. Breadcrumb untuk detail kategori salah mengarah ke `/product/product-categories/create`.
3. Breadcrumb untuk edit dan detail produk mengarah ke path `/product/product-lists/edit` dan `/product/product-lists/detail` tanpa ID produk yang menyebabkan error 404 jika di-klik.

Solusi yang diusulkan adalah menyesuaikan breadcrumb agar mengarah kembali ke tab yang tepat (`/product?tab=categories` atau `/product?tab=products`) dan menghapus parameter `route` pada breadcrumb item terakhir yang aktif (halaman saat ini) dengan menyetel `isActive: true` tanpa parameter `route` (atau disesuaikan dengan konvensi jika diperlukan).

## Acceptance Criteria
- [x] Breadcrumb pada halaman Edit Kategori (`/product/product-categories/edit/:id`) memiliki item terakhir "Edit" dengan `isActive: true` dan tidak memiliki parameter `route` (atau dikosongkan) agar tidak bisa di-klik dan mengarah ke link yang salah.
- [x] Breadcrumb pada halaman Detail Kategori (`/product/product-categories/detail/:id`) memiliki item terakhir "Detail" dengan `isActive: true` dan tidak memiliki parameter `route` (sebelumnya salah mengarah ke `/create`).
- [x] Breadcrumb pada halaman Edit Produk (`/product/product-lists/edit/:id`) memiliki item terakhir "Edit" dengan `isActive: true` dan tidak memiliki parameter `route`.
- [x] Breadcrumb pada halaman Detail Produk (`/product/product-lists/detail/:id`) memiliki item terakhir "Detail" dengan `isActive: true` dan tidak memiliki parameter `route`.
- [x] Breadcrumb Kategori/Produk level kedua (Categories / Products) mengarah kembali ke tab yang sesuai (`/product?tab=categories` dan `/product?tab=products`).

## Constraints
- Tidak mengubah logic routing utama Vue Router (path definitions).
- Hanya mengubah properti metadata `breadcrumbs` di file definisi router modul.
- Mengikuti arsitektur Frontend Vue 3 yang ada di `apps/web/src/modules/`.

## Out of Scope
- Mengubah tampilan UI/layout breadcrumb.
- Mengubah permission guard atau logic otentikasi.

## Dependensi
- Tidak ada dependensi ke modul backend atau shared types karena ini murni perbaikan routing & metadata frontend.
