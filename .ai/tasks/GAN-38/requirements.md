## Ticket: GAN-38
## Status: PLAN

## Deskripsi
E2E-test coverage buat validasi input quantity di modal adjust stock produk. Pastikan negative-overflow ditolak, quantity 0 punya perilaku jelas dan konsisten, validasi jalan di backend (bukan cuma FE).

## Konteks Existing (sudah diverifikasi baca kode)

- Backend: `apps/api/src/stock/stock.service.ts` method `adjust()` SUDAH:
  - Reject `change_qty === 0` → `BadRequestException('change_qty must not be 0')`
  - Reject hasil `newStock < 0` → `BadRequestException('Insufficient stock. Current: X, Change: Y. Stock cannot go below 0.')`
  - Reject reason tidak sesuai arah qty (increase/decrease reason mismatch)
  - DTO `CreateStockAdjustmentDto` (`apps/api/src/stock/dto/create-stock-adjustment.dto.ts`) pakai `@IsInt()` untuk `change_qty`, tanpa upper bound.
- Frontend: `apps/web/src/modules/product-lists/components/AdjustStockModal.vue`:
  - Zod resolver `change_qty: z.number().min(1, ...)` — qty selalu diinput positif, arah (+/-) ditentukan toggle `adjustment_type`. Artinya user gak bisa submit 0 dari UI form ini karena min(1).
  - Signed qty dihitung di FE (`selectedAdjustmentType === 'decrease' ? -abs : abs`) lalu dikirim ke `POST /api/v1/stock/adjust`.
- Unit test existing: `apps/api/src/stock/stock.service.spec.ts` — SUDAH cover kasus below-zero dan invalid reason, TAPI BELUM ada test case eksplisit untuk `change_qty === 0`.
- Belum ada e2e/integration test (supertest) untuk endpoint `/stock/adjust` sama sekali — hanya template `test/app.e2e-spec.ts` (default Nest boilerplate, belum ada `stock.e2e-spec.ts`).
- Belum ada Playwright test suite jalan di `apps/web` (playwright ada di devDependencies tapi belum ada `playwright.config.ts` / folder test).
- Tidak ada business rule upper-bound stock qty di `docs/database/database-design.md` maupun `AGENTS.md`.

## Acceptance Criteria
- [ ] Backend unit test baru: `change_qty === 0` pada `stock.service.spec.ts` reject dengan `BadRequestException` message `"change_qty must not be 0"`.
- [ ] Backend e2e test baru (`apps/api/test/stock.e2e-spec.ts`) via supertest, hit endpoint real `POST /api/v1/stock/adjust`, cover 3 skenario:
  - `change_qty` bikin `stock_qty` outlet jadi negatif → response `success: false`, HTTP 400, message mengandung "Stock cannot go below 0".
  - `change_qty = 0` → HTTP 400, message `"change_qty must not be 0"`.
  - `change_qty` valid (positive/negative dalam batas stok tersedia) → HTTP 201, `stock_qty` ter-update sesuai perhitungan, `inventory_movements` record tercipta.
- [ ] E2E test membuktikan validasi terjadi di backend meski request dikirim langsung ke API (bypass FE) — pakai raw payload tanpa lewat form FE.
- [ ] Frontend Playwright e2e test baru (`apps/web/e2e/stock-adjust.spec.ts`) cover:
  - Input quantity 0 di modal adjust stock → tombol submit ter-block / muncul error inline "Quantity must be at least 1." (client-side, tidak sampai call API).
  - Input quantity valid yang melebihi stok saat kurangi (decrease) → submit terkirim ke backend, toast error muncul dengan pesan dari backend (bukan pesan generic).
  - Input quantity valid dalam batas → submit sukses, toast success muncul, tabel produk ter-update `stock_qty`.
- [ ] Playwright config (`apps/web/playwright.config.ts`) dan npm script `test:e2e` ditambahkan supaya suite bisa dijalankan (`pnpm --filter umkm-pos-app test:e2e`).
- [ ] Definisi perilaku quantity 0 didokumentasikan eksplisit di `requirements.md` ini dan konsisten FE+BE: **quantity 0 DITOLAK** (bukan diizinkan tanpa efek) — sudah sesuai implementasi existing, test tinggal membuktikan konsistensi ini.
- [ ] Semua test baru lulus dijalankan (`pnpm --filter umkm-pos-api test`, `pnpm --filter umkm-pos-api test:e2e`, `pnpm --filter umkm-pos-app test:e2e`).

## Definisi Perilaku Quantity 0 (WAJIB diikuti, jangan diubah tanpa instruksi eksplisit)
Quantity 0 = **DITOLAK** di kedua layer:
- FE: zod `min(1)` blokir submit sebelum call API.
- BE: `BadRequestException('change_qty must not be 0')` di service layer.
Task ini HANYA menambah test pembuktian, TIDAK mengubah logic ini kecuali ditemukan bug saat eksekusi test (dilaporkan, bukan langsung difix di luar scope).

## Constraints
- Multi-tenant: `merchant_id` HARUS dari JWT (via `@CurrentUser('merchant_id')`), test harus pakai user/token milik merchant tertentu, bukan trust dari body.
- RBAC: endpoint `/stock/adjust` butuh permission `stock.adjust` — e2e test backend harus login dengan user yang punya permission ini (atau seed role).
- Test tidak boleh ubah logic bisnis di `stock.service.ts` / DTO / modal FE kecuali ditemukan bug nyata (upper-bound rule tidak ada — jangan tambahkan constraint baru tanpa instruksi eksplisit).
- Ikuti konvensi test existing: backend pakai Jest + supertest, frontend pakai Playwright (sudah di devDependencies, tinggal setup config).
- Jangan buat PrismaClient baru di test — kalau e2e butuh DB real, pakai `PrismaService` existing + test DB / transaction rollback pattern yang sudah dipakai project (cek `apps/api/test/` kalau ada helper, kalau belum ada, buat seed helper minimal khusus test ini).

## Out of Scope
- Business rule "batas wajar" / upper-bound stock qty — tidak ada requirement dari product/docs, jangan diimplementasikan sekarang. Kalau mau, harus jadi ticket terpisah dengan definisi angka batas yang jelas dari product owner.
- Mengubah UX modal adjust stock (layout, field baru, dsb).
- Refactor `stock.service.ts` di luar kebutuhan test.
- Optimasi performance endpoint.

## Dependensi
- Endpoint `POST /stock/adjust`, `stock.service.ts`, `AdjustStockModal.vue` — semua sudah ada, tidak ada dependensi blocking.
- Test DB / seed data (merchant, outlet, product, user dengan role `stock.adjust`) harus tersedia untuk e2e backend — cek apakah sudah ada seed script di `apps/api/prisma/seed.ts` yang bisa dipakai ulang.
