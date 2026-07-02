# Golden Examples

File-file di folder ini adalah **copy dari implementasi nyata** yang dipilih karena paling rapi dan paling representatif di codebase. Fungsinya sebagai referensi konkret untuk agent (Backend/Frontend) saat mengimplementasi modul baru.

## Cara Pakai (untuk Agent)

Sebelum menulis kode, baca file yang relevan di folder ini sebagai contoh pola yang benar. Ikuti struktur, decorator, dan konvensinya — jangan invent pola baru.

---

## Backend

| File | Asal | Yang Ditunjukkan |
|---|---|---|
| [backend/controller.ts](backend/controller.ts) | `apps/api/src/products/products.controller.ts` | Thin controller: `@RequirePermission` di semua endpoint, `@CurrentUser('merchant_id')`, `@Query() dto` (ADR-004) |
| [backend/service.ts](backend/service.ts) | `apps/api/src/store-tables/store-tables.service.ts` | Merchant scoping (ADR-001), private pre-condition helpers, audit trail, error types konsisten |
| [backend/query.dto.ts](backend/query.dto.ts) | `apps/api/src/stock/dto/stock-logs-query.dto.ts` | DTO inheritance (ADR-004): `extends PaginationDto` + filter fields, validator + Swagger |

### Aturan Kunci Backend

1. **ADR-001** — `merchant_id` selalu dari `@CurrentUser('merchant_id')`, tidak pernah dari DTO/body/query.
2. **ADR-004** — Endpoint dengan pagination + filter: gunakan satu `@Query() query: XxxQueryDto` yang extends `PaginationDto`. Jangan mix `@Query('field')` + `@Query()` di endpoint yang sama.
3. **Controller tipis** — Tidak ada `if`, tidak ada logic, tidak ada Prisma call. Hanya routing + delegate.
4. **Service wajib scope** — Setiap Prisma query yang menyentuh data tenant-scoped wajib ada `where: { merchant_id: merchantId }`.

---

## Frontend

| File | Asal | Yang Ditunjukkan |
|---|---|---|
| [frontend/page.vue](frontend/page.vue) | `apps/web/src/modules/product-categories/pages/detail.vue` | Composition API + direct service call + RBAC gating + error handling |
| [frontend/composable.ts](frontend/composable.ts) | `apps/web/src/modules/shift/composables/useShift.ts` | Singleton reactive state, computed guards, async action wrappers ⚠️ pola struktur saja |
| [frontend/api.ts](frontend/api.ts) | `apps/web/src/modules/notification/services/api.ts` | Named exports, `@/plugins/axios`, signature konsisten |

### Aturan Kunci Frontend

1. **API calls** — Wajib melewati `services/api.ts`. Component boleh import dari sana langsung. Tidak boleh `axios.get(...)` di component, store, atau composable.
2. **Store vs direct service** — Gunakan store (actions.ts berisi logic) hanya jika state disharing lintas component. Untuk state lokal halaman, panggil service langsung dari page.
3. **RBAC gating** — Gunakan `isHasPermission(PERMISSION_CODE)` dari `@/helpers/auth`. Permission codes dari `services/rbac.ts`, bukan hardcode string.
4. **Navigasi** — Gunakan `PREFIX_ROUTE_NAME` / `PREFIX_ROUTE_PATH` dari `services/constants.ts`, bukan hardcode nama route.

---

## Sumber ADR

- [ADR-001](../decisions/adr-001-multi-tenant-data-scoping.md) — Multi-tenant scoping via auth
- [ADR-002](../decisions/adr-002-db-first-schema-convention.md) — DB-first schema convention
- [ADR-003](../decisions/adr-003-merchant-access-control.md) — Merchant access control
- [ADR-004](../decisions/adr-004-dto-inheritance-for-query-params.md) — DTO inheritance untuk query params
