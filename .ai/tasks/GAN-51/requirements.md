## Ticket: GAN-51
## Status: IMPLEMENTED

## Deskripsi
Fitur pencarian kategori produk di halaman index Category tidak berfungsi karena fungsi `search()` hanya melakukan `console.log(form.value)` tanpa memperbarui query pagination atau memicu fetch ulang dari API. Tugas ini adalah memperbaiki fungsi search tersebut di Frontend (dengan debounce) dan mengimplementasikan filter pencarian (`search`) di Backend.

## Acceptance Criteria
- [x] Backend mendukung parameter query `search` pada endpoint `GET /api/v1/products/categories` untuk mencari kategori berdasarkan `name` atau `description` (case-insensitive contains).
- [x] Komponen pencarian (`UiSearch`) pada Halaman Index Kategori memicu pencarian dengan debounce timer sebesar 300ms saat user mengetik keyword pencarian.
- [x] Melakukan pencarian akan me-reset pagination page kembali ke halaman 1 (`page = 1`) sebelum memicu pemanggilan API `getListCategories`.
- [x] Request API ke `/api/v1/products/categories` menyertakan parameter `search` jika input search terisi.
- [x] Komponen `UiSearch` diperbaiki agar menggunakan `defineModel` untuk binding data dua arah (v-model) yang valid tanpa melanggar prinsip read-only props di Vue 3.

## Constraints
- Multi-tenant: query database di backend wajib menyertakan `merchant_id` yang diambil dari JWT (`CurrentUser`), bukan input client.
- RBAC: endpoint backend wajib menggunakan guard `@RequirePermission('category.read')`.
- Gunakan debounce 300ms untuk membatasi frekuensi request ke server saat mengetik keyword pencarian.

## Out of Scope
- Pencarian produk di halaman lain selain Halaman Index Category.
- Perubahan visual desain komponen `UiSearch` atau tata letak halaman Kategori.

## Dependensi
- Endpoint backend `GET /api/v1/products/categories` yang mendukung query parameter `search` harus selesai dikerjakan agar pencarian frontend dapat berfungsi dengan benar.
