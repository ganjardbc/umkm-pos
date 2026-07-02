# CAF-GOLDEN-EXAMPLES-001: Golden Examples — Plan

Status: AWAITING APPROVAL

---

## Candidates

| # | Kategori | File Asal | Alasan Dipilih |
|---|---|---|---|
| 1 | Backend · Controller | `apps/api/src/products/products.controller.ts` | Thin controller: semua endpoint punya `@RequirePermission`, `findAll` gunakan `@Query() query: ProductsQueryDto` (ADR-004), `@CurrentUser('merchant_id')` konsisten, nol business logic. Full CRUD + image ops = cakupan representatif. |
| 2 | Backend · Service | `apps/api/src/store-tables/store-tables.service.ts` | Semua query di-scope `merchant_id` via param (ADR-001); private helpers `assertOutlet()` + `ensureUniqueCode()` tunjukkan pola pre-condition validation; error types konsisten (`NotFoundException`, `ConflictException`); `created_by`/`updated_by` audit trail di semua mutasi (ADR-002). 114 baris, padat. |
| 3 | Backend · DTO | `apps/api/src/stock/dto/stock-logs-query.dto.ts` | Textbook ADR-004: `extends PaginationDto`, dua filter field (`product_id`, `outlet_id`) tunjukkan komposabilitas, `@IsOptional @IsUUID` + `@ApiPropertyOptional` dengan contoh UUID. 25 baris — mudah dijadikan template. |
| 4 | Frontend · Vue page | `apps/web/src/modules/product-categories/pages/detail.vue` | Satu-satunya page yang gunakan ketiga service files (api, constants, rbac): import `getDetailCategories` dari `services/api`, `PREFIX_ROUTE_NAME` dari `services/constants`, `UPDATE` dari `services/rbac`. RBAC gating via `isHasPermission(UPDATE)`. Error handling via `showToast` + `getErrorMessage`. `<script setup lang="ts">` + `onMounted`. |
| 5 | Frontend · Composable | `apps/web/src/modules/shift/composables/useShift.ts` | Satu-satunya composable di proyek. Demonstrasi singleton reactive state, computed guards (`isShiftClosed`, `isUserOwner`, `isUserInShift`), dan async action wrappers dengan try/finally. Catatan: banyak `any` type — pattern struktur benar tapi type safety perlu ditingkatkan di masa depan. |
| 6 | Frontend · Service (api.ts) | `apps/web/src/modules/notification/services/api.ts` | Minimal + idiomatis: gunakan `@/plugins/axios` (bukan raw fetch/import axios langsung), named exports konsisten, signature `(params, options)` uniform di semua endpoint. 17 baris — template yang jelas dan tidak berisik. |

---

## Catatan Evaluasi

### Yang Tidak Dipilih dan Alasannya

| File | Masalah |
|---|---|
| `stock/stock.controller.ts` | `findInventory` masih mix `@Query('outlet_id')` + `@Query() pagination` — pelanggaran ADR-004 aktif. |
| `store-tables/store-tables.controller.ts` | Gunakan raw `@Query('active_only')` tanpa DTO wrapper — OK untuk satu param tapi tidak tunjukkan pola ADR-004. |
| `audit-logs/audit-logs.controller.ts` | Manual `parseInt` di controller, tidak gunakan DTO untuk pagination params. |
| Sebagian besar `*/stores/actions.ts` | File kosong (`// Add your actions here`) — tidak ada contoh nyata. |
| `outlet/stores/actions.ts` | Sama, kosong. |

### Observasi Kesenjangan Pattern Frontend

Mayoritas modul frontend punya `stores/actions.ts` kosong. Artinya halaman memanggil service langsung dari component (`notification/`, `product-categories/`, dll.) — bukan lewat store actions. Ini berbeda dengan pola yang didokumentasikan di `frontend.md` agent.

Golden examples yang dipilih mencerminkan pola **yang benar-benar digunakan di codebase** (pragmatic), bukan pola ideal dari agent doc. Ini disengaja agar agent tidak menghasilkan kode yang tidak konsisten dengan module yang sudah ada.

---

## Target Output (jika diapprove)

```
docs/golden-examples/
├── backend/
│   ├── controller.ts          ← copy dari products.controller.ts
│   ├── service.ts             ← copy dari store-tables.service.ts
│   └── query.dto.ts           ← copy dari stock-logs-query.dto.ts
└── frontend/
    ├── page.vue               ← copy dari product-categories/pages/detail.vue
    ├── composable.ts          ← copy dari shift/composables/useShift.ts
    └── api.ts                 ← copy dari notification/services/api.ts
```

Setiap file akan diberi header comment singkat yang menyebut asal file dan aturan yang diilustrasikan.
