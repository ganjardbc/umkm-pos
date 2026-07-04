## Ticket: GAN-38

## Backend Tasks
- [ ] BE-1: Cek `apps/api/prisma/seed.ts` (atau seed script lain) — pastikan ada merchant + outlet + product + user berpermission `stock.adjust` yang bisa dipakai reuse untuk e2e test. Kalau belum ada, tambah seed minimal khusus test (jangan ubah seed produksi).
- [ ] BE-2: Tambah unit test case baru di `apps/api/src/stock/stock.service.spec.ts` group `describe('adjust')`:
  - `it('should reject when change_qty is 0')` → assert `rejects.toThrow(BadRequestException)` dan cek message `"change_qty must not be 0"`.
- [ ] BE-3: Buat file baru `apps/api/test/stock.e2e-spec.ts` (pola sama seperti `app.e2e-spec.ts`, pakai `Test.createTestingModule({ imports: [AppModule] })` + supertest):
  - Setup: login via `/api/v1/auth/login` (atau inject JWT langsung kalau ada test helper) buat dapat token user dengan permission `stock.adjust`.
  - Test 1: `POST /api/v1/stock/adjust` dengan `change_qty` negatif lebih besar dari `stock_qty` saat ini → expect `400`, body `success: false`, `message` mengandung `"Stock cannot go below 0"`.
  - Test 2: `POST /api/v1/stock/adjust` dengan `change_qty: 0` → expect `400`, `message` = `"change_qty must not be 0"`.
  - Test 3: `POST /api/v1/stock/adjust` dengan `change_qty` valid (positif, reason `restock`) → expect `201`, body `success: true`, `data.outlet_inventory.stock_qty` sesuai perhitungan (`current + change_qty`), dan cek row baru di `inventory_movements` (query via PrismaService di test atau via `GET /api/v1/stock/logs`).
  - Test 4 (multi-tenant guard): request pakai `product_id`/`outlet_id` milik merchant lain → expect `404 Not Found` (bukan leak data merchant lain).
  - Teardown: rollback/hapus data test yang dibuat (pakai transaction rollback pattern atau delete manual di `afterAll`).
- [ ] BE-4: Jalankan `pnpm --filter umkm-pos-api test` dan `pnpm --filter umkm-pos-api test:e2e` (cek script e2e ada di `apps/api/package.json`, kalau belum ada tambahkan script `"test:e2e": "jest --config ./test/jest-e2e.json"` — cek dulu apa udah ada default dari Nest CLI).

## Frontend Tasks
- [ ] FE-1: Buat `apps/web/playwright.config.ts` — base config pointing ke dev server (`VITE_API_BASE_URL` + local vite server), pakai pattern standar Playwright (testDir: `./e2e`).
- [ ] FE-2: Tambah script di `apps/web/package.json`: `"test:e2e": "playwright test"`.
- [ ] FE-3: Buat folder `apps/web/e2e/` + file `stock-adjust.spec.ts`:
  - Setup: login helper (via UI login form atau inject localStorage token+user+merchant+outlet sesuai keys di `apps/web/CLAUDE.md`: `APP_TOKEN`, `APP_USER`, `APP_MERCHANT`, `APP_ACTIVE_OUTLET`, `APP_ACTIVE_ROLE`, `APP_ACTIVE_PERMISSIONS`, `APP_LIST_OUTLET`).
  - Navigasi ke halaman product list (`modules/product-lists`), klik icon adjust (`pi-cog`) buka `AdjustStockModal`.
  - Test 1: isi quantity `0` → assert error message inline `"Quantity must be at least 1."` muncul, tombol submit tidak trigger network call ke `/api/v1/stock/adjust` (assert via `page.route` intercept, expect 0 request).
  - Test 2: pilih `Reduce Stock`, isi quantity lebih besar dari `stock_qty` current produk → submit → confirm dialog → assert toast error muncul dengan message dari backend (`getErrorMessage` hasil response 400).
  - Test 3: isi quantity valid dalam batas stok → submit → confirm → assert toast success `"Stock has been adjusted successfully."` dan kolom `Qty` di tabel product ter-update.
- [ ] FE-4: Tidak ada perubahan store/service/page di luar test — `postAdjustStock` dan `AdjustStockModal.vue` tidak diubah kecuali ketemu bug nyata saat jalanin test (laporkan dulu sebelum fix).

## Shared Types Tasks
- [ ] ST-1: Tidak ada — tidak ada tipe baru dibutuhkan, `AdjustStock` type di `apps/web/src/modules/product-lists/services/types.ts` sudah cukup.

## Docs Tasks
- [ ] DOC-1: Update `docs/api/api-contract.md` bagian Stock Endpoints — tambah catatan error response `POST /stock/adjust` untuk kasus `change_qty=0` dan `stock_qty < 0`, biar kontrak error message eksplisit dan gak berubah diam-diam di masa depan.
- [ ] DOC-2: Tidak perlu update `database-design.md` — tidak ada schema/migration berubah.
