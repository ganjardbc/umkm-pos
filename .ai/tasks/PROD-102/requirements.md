## Ticket: PROD-102
## Status: PLAN

## Deskripsi
Halaman list produk (`apps/web/src/modules/product-lists/pages/index.vue`) punya input search
tapi gak nyambung ke API (`search()` cuma `console.log`). Belum ada filter kategori padahal
backend (`GET /api/v1/products`) udah support `category_id`. `search` param belum didukung
backend sama sekali.

## Acceptance Criteria
- [ ] Ketik keyword di search input, hasil list produk terfilter sesuai `name` produk yang match keyword (backend query, bukan filter client-side)
- [ ] Search pakai debounce (min 300ms) — tidak fire request tiap keystroke
- [ ] Ada dropdown filter kategori di atas tabel list produk, opsi diambil dari `getActiveCategories()`
- [ ] Pilih kategori di dropdown memfilter list produk sesuai `category_id` yang dipilih
- [ ] Search keyword + filter kategori bisa dipakai bersamaan (AND, dikirim sebagai query param bareng)
- [ ] Pindah halaman pagination (`onPageChange`) tetap kirim `search` dan `category_id` yang lagi aktif — tidak reset ke filter kosong
- [ ] Ganti kategori atau ubah keyword search me-reset `pagination.page` balik ke 1
- [ ] Dropdown kategori punya opsi "All Categories" (value kosong/null) untuk clear filter

## Constraints
- Multi-tenant: `merchant_id` tetap dari JWT di backend, tidak berubah
- RBAC: endpoint `GET /products` sudah pakai `@RequirePermission('product.read')` — tidak berubah
- Backend `ProductsQueryDto`/`PaginationDto` belum ada field `search` — harus ditambahkan, jangan duplicate field yang sudah ada
- Query search backend case-insensitive, cocokkan ke `products.name` (MySQL `contains` mode insensitive default untuk collation project — konfirmasi tidak perlu `mode: 'insensitive'` eksplisit karena MySQL Prisma provider gak support opsi itu, andalkan default collation)
- Ikuti pola existing di `index.vue` — jangan restrukturisasi state management jadi Pinia store kalau belum ada polanya di module ini (module ini pakai local `ref`, bukan store `state.ts/actions.ts` yang masih stub kosong)
- Jangan ubah behaviour outlet_id filter yang sudah ada (`getOutlet()?.id`)

## Out of Scope
- Filter tambahan lain (status aktif/inaktif, range harga, dsb) — tidak diminta ticket ini
- Search di endpoint lain (categories, transactions, dll)
- Mengisi store Pinia `product-lists` yang masih stub (state.ts/actions.ts kosong) — biarkan seperti sekarang kecuali dibutuhkan langsung untuk filter ini

## Dependensi
- `getActiveCategories()` di `apps/web/src/modules/product-categories/services/api.ts` — sudah ada, dipakai ulang
- `GET /api/v1/products` — endpoint sudah ada, hanya butuh tambahan query param `search`
