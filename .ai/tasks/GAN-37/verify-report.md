## Ticket: GAN-37
## Agent: backend
## Status: SUCCESS

## Attempt Log
- Attempt 1: `node_modules`/Prisma client absent in sandbox. Ran `pnpm install` + `npx prisma generate` (temp local `.env`, gitignored). Build/lint/test then PASS.

## Acceptance Criteria (BE scope)
- [x] `GET /outlets` response tiap item punya `product_count: number` — `outlets.service.ts` `findAll()`, hasil `groupBy` `outlet_product_inventory` by `outlet_id`, `_count: { product_id: true }`.
- [x] Scoped `merchant_id` dari param service (bukan client input) — `where: { merchant_id: merchantId, outlet_id: { in: outletIds } }`.
- [x] Tidak N+1 — 1 query `groupBy` untuk semua outlet dalam page, hasil di-map ke `Map<outlet_id, count>`.
- [x] Signature `findAll(merchantId, pagination)` tidak berubah, `meta` pagination tidak berubah.
- [x] `findOne` tidak diubah (BE-2, by design — out of scope).
- [ ] BE-3 unit test — tidak applicable: tidak ada `outlets.service.spec.ts` existing, task minta tambah "jika ada test existing".

## Quality Gate
- Typecheck: `umkm-pos-api` tidak punya script `typecheck` — proxy pakai `nest build` → PASS, no compile error.
- Lint: `pnpm exec eslint src/outlets/outlets.service.ts` → PASS, no issues. (Lint project-wide gagal karena artifact `.js`/`.d.ts` lama sudah ter-commit di `src/` sebelumnya — pre-existing, tidak terkait perubahan ini.)
- Test: `pnpm --filter umkm-pos-api test` → PASS, 12 suites / 163 tests, tidak ada regresi.
- Multi-tenant scope: PASS — `merchant_id` selalu dari param service.
- RBAC coverage: PASS — tidak ada endpoint baru/diubah, controller tidak disentuh.
- Raw SQL: none di module ini.

## Files Changed
- apps/api/src/outlets/outlets.service.ts

## Catatan
- Sandbox awalnya tanpa `node_modules`/Prisma client generated — dijalankan `pnpm install` dan `npx prisma generate` (pakai `.env` lokal dummy `DATABASE_URL`, gitignored, tidak dicommit) agar build/test bisa jalan.
- FE (FE-1/2/3) sudah dikerjakan agent frontend sebelumnya di attempt lain (lihat riwayat git diff `apps/web/src/modules/outlet/pages/index.vue`), tidak disentuh ulang oleh agent ini.
- ST-1 (shared-types) — dicek agent FE sebelumnya: tidak ada type `Outlet`/`OutletSummary` di `packages/shared-types` yang dipakai list outlet FE, tidak applicable.
- DOC-1 (`docs/api/api-contract.md`) di luar write-scope agent backend (bukan `apps/api/src` atau `apps/api/prisma`) — perlu agent docs/human update.
