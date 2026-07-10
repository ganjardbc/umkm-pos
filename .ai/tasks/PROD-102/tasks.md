## Ticket: PROD-102

## Backend Tasks
- [ ] BE-1: `apps/api/src/products/dto/products-query.dto.ts` — tambah field opsional:
  ```ts
  @ApiPropertyOptional({ description: 'Search products by name', example: 'kopi' })
  @IsOptional()
  @IsString()
  search?: string;
  ```
  (butuh import `IsString` dari `class-validator`)
- [ ] BE-2: `apps/api/src/products/products.service.ts` — di `findAll()`, destructure `search` dari `query`, tambah ke `where`:
  ```ts
  const { page = 1, limit = 10, outlet_id, category_id, search } = query;
  const where = {
    merchant_id: merchantId,
    ...(category_id && { category_id }),
    ...(search && { name: { contains: search } }),
  };
  ```
  Tidak perlu `mode: 'insensitive'` — Prisma MySQL provider gak support opsi itu (collation default MySQL biasanya case-insensitive).
- [ ] BE-3: tidak ada migration/schema change — `products.name` sudah ada kolomnya.

## Frontend Tasks
- [ ] FE-1: `apps/web/src/modules/product-lists/pages/index.vue` — tambah state filter kategori:
  ```ts
  const form = ref({ search: '', category_id: null });
  ```
  (ganti `form.search` existing jadi include `category_id`, jangan bikin ref terpisah biar konsisten satu object filter)
- [ ] FE-2: tambah dropdown kategori di template, di sebelah `UiSearch` (dalam div `flex flex-col md:flex-row gap-4` yang sudah ada), pakai `Dropdown` (PrimeVue, sudah dipakai di `create.vue`):
  ```html
  <Dropdown
    v-model="form.category_id"
    :options="listOfCategories"
    option-label="name"
    option-value="id"
    placeholder="All Categories"
    showClear
    class="w-full md:w-64"
    :loading="loadingCategory"
    @update:modelValue="onFilterChange"
  />
  ```
- [ ] FE-3: tambah fetch categories (contoh pola dari `create.vue`):
  ```ts
  import { getActiveCategories } from '@/modules/product-categories/services/api';
  const listOfCategories = ref<any[]>([]);
  const loadingCategory = ref(false);
  const fetchCategories = async () => {
    try {
      loadingCategory.value = true;
      const response = await getActiveCategories({ page: 1 });
      const { data } = response?.data || {};
      listOfCategories.value = data;
    } catch (err) {
      console.warn('fetch categories', err);
    } finally {
      loadingCategory.value = false;
    }
  };
  ```
  Panggil `fetchCategories()` di `onMounted` bareng `fetchProduct()`.
- [ ] FE-4: ubah `fetchProduct()` — masukkan `search` dan `category_id` ke payload:
  ```ts
  const payload = {
    page: pagination.value.page,
    limit: pagination.value.rows,
    outlet_id: outlet?.id,
    ...(form.value.search && { search: form.value.search }),
    ...(form.value.category_id && { category_id: form.value.category_id }),
  };
  ```
- [ ] FE-5: implement `search()` (dipanggil dari `@input` `UiSearch`) — debounce 300ms pakai `setTimeout`/`clearTimeout`, reset `pagination.value.page = 1`, lalu `fetchProduct()`:
  ```ts
  let searchDebounceTimer: ReturnType<typeof setTimeout>;
  const search = () => {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
      pagination.value.page = 1;
      fetchProduct();
    }, 300);
  };
  ```
  Hapus `console.log(form.value)` yang sekarang jadi isi `search()`.
- [ ] FE-6: implement `onFilterChange()` untuk dropdown kategori — reset `pagination.value.page = 1`, lalu `fetchProduct()` langsung (no debounce, karena dropdown bukan keystroke).
- [ ] FE-7: pastikan `onPageChange()` existing (baris ~213-216) tetap terpanggil tanpa reset `form.value` — cukup pastikan `fetchProduct()` yang dipanggil sudah include filter aktif dari FE-4 (tidak perlu ubah `onPageChange` itu sendiri, cukup pastikan payload di FE-4 selalu baca `form.value` terkini).

## Shared Types Tasks
- (none — `search` cukup query string, tidak perlu shared type baru; `ProductsQueryDto` backend-only DTO)

## Docs Tasks
- [ ] DOC-1: `docs/api/api-contract.md` — di bagian `Product Endpoints` / query params list, tambah catatan `search` sebagai query param untuk `GET /products` (samakan gaya dengan query params `/transactions` yang sudah didokumentasikan)
