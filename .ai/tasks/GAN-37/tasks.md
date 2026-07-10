## Ticket: GAN-37

## Backend Tasks
- [ ] BE-1: Di `apps/api/src/outlets/outlets.service.ts`, method `findAll(merchantId, pagination)`:
  - Setelah dapat `data` (list outlets hasil `findMany`), ambil semua `outlet.id` dari `data`.
  - Query `this.prisma.outlet_product_inventory.groupBy({ by: ['outlet_id'], where: { merchant_id: merchantId, outlet_id: { in: outletIds } }, _count: { product_id: true } })` untuk dapat count produk per outlet dalam 1 query (hindari N+1).
  - Build `Map<outlet_id, count>` dari hasil groupBy.
  - Saat compose `dataWithSignedUrls`, tambahkan field `product_count: countMap.get(outlet.id) ?? 0` ke tiap outlet object.
  - Tidak ubah signature method, tidak ubah `meta` pagination.
- [ ] BE-2: Pastikan tidak ada regresi di `findOne` — tidak perlu tambah `product_count` di sana (out of scope).
- [ ] BE-3: Tambah unit test (jika ada test existing untuk `outlets.service.spec.ts`) — case: outlet tanpa inventory row → `product_count: 0`; outlet dengan N produk unik → `product_count: N`.

## Frontend Tasks
- [ ] FE-1: Di `apps/web/src/modules/outlet/pages/index.vue`, tambah `Column` baru header "Produk" (letakkan setelah kolom `merchants`, sebelum `created_at` — atau posisi lain yang masuk akal, tapi jangan hapus kolom existing).
  - Body slot:
    ```html
    <template #body="slotProps">
      <Tag
        v-if="!slotProps.data.product_count"
        value="Belum ada produk"
        severity="warn"
      />
      <span v-else>{{ slotProps.data.product_count }}</span>
    </template>
    ```
- [ ] FE-2: Tidak perlu ubah `services/api.ts` (`getListOutlet`) — response sudah include `product_count` dari BE-1, cukup dikonsumsi langsung dari `slotProps.data.product_count`.
- [ ] FE-3: Tidak ada perubahan store/router untuk task ini.

## Shared Types Tasks
- [ ] ST-1: Jika ada type `Outlet`/`OutletSummary` di `packages/shared-types` yang dipakai FE untuk list outlet, tambah field `product_count: number` ke type tsb. Rebuild package: `pnpm --filter @umkm-pos/shared-types build`.

## Docs Tasks
- [ ] DOC-1: Update `docs/api/api-contract.md` — pada bagian `GET /outlets`, tambah catatan bahwa tiap item response sekarang punya `product_count` (jumlah produk unik yang terdaftar di outlet tsb via `outlet_product_inventory`).
