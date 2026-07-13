## Ticket: GAN-51

## Backend Tasks
- [x] BE-1: Buat DTO baru untuk query categories `apps/api/src/products/categories/dto/categories-query.dto.ts` yang meng-extend `PaginationDto` dan menambahkan properti opsional `search?: string`.
- [x] BE-2: Update `CategoriesController.findAll` di `apps/api/src/products/categories/categories.controller.ts` untuk menggunakan `CategoriesQueryDto` sebagai tipe parameter query dan mendokumentasikan parameter `search` di Swagger menggunakan `@ApiQuery`.
- [x] BE-3: Update method `findAll` di `apps/api/src/products/categories/categories.service.ts` untuk menerima `query: CategoriesQueryDto`, lalu tambahkan kondisi filter database `where: { merchant_id: merchantId, OR: [{ name: { contains: search } }, { description: { contains: search } }] }` menggunakan Prisma client.

## Frontend Tasks
- [x] FE-1: Perbaiki komponen pencarian `apps/web/src/components/UiSearch.vue` dengan menggunakan `defineModel<string>()` untuk binding `v-model` yang valid alih-alih melakukan manipulasi `props.modelValue` secara langsung.
- [x] FE-2: Update method `fetchCategory` di `apps/web/src/modules/product-categories/pages/index.vue` agar menyertakan parameter `search` dari `form.value.search` ke dalam objek payload yang dikirimkan ke API `getListCategories`.
- [x] FE-3: Implementasikan debounce timer 300ms di dalam fungsi `search` pada `apps/web/src/modules/product-categories/pages/index.vue` untuk me-reset halaman pagination ke 1 (`pagination.value.page = 1`) dan memicu pemanggilan `fetchCategory()`.

## Shared Types Tasks
- (none)

## Docs Tasks
- [x] DOC-1: Update dokumentasi contract API di `docs/api/api-contract.md` pada bagian `GET /product-categories` untuk menambahkan dokumentasi parameter query `search`.
