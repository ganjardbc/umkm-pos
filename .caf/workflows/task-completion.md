# Task Completion — Definition of Done

> Sebagian isi file ini auto-generate dari script yang terdeteksi di `package.json`.
> Review sebelum dipakai.

## Perintah Verifikasi Wajib

Jalankan hanya blok workspace yang disentuh ticket. Selalu pakai `--filter <nama package>` — jangan
perintah root tanpa filter (`pnpm lint`, `pnpm test`), karena itu menyebar ke semua workspace dan diam-diam
melewati yang tidak punya script.

`apps/api` (`umkm-pos-api`)
- [ ] `pnpm --filter umkm-pos-api run lint:ci` — wajib pass (`lint` biasa menulis ulang file dengan `--fix`)
- [ ] `pnpm --filter umkm-pos-api run test` — wajib pass
- [ ] `pnpm --filter umkm-pos-api run build` — wajib pass (sekaligus typecheck; tidak ada script `typecheck`)

`apps/merchant`, `apps/admin`, `apps/landing`
- [ ] `pnpm --filter @umkm-pos/merchant run build` / `pnpm --filter @umkm-pos/admin run build` /
      `pnpm --filter @umkm-pos/landing run build` — wajib pass (menjalankan `vue-tsc -b`)
- [ ] Gap: tidak ada script lint, typecheck, atau test di ketiga app ini

`packages/ui`
- [ ] `pnpm --filter @umkm-pos/ui run typecheck` — wajib pass
- [ ] Build kedua konsumennya: merchant dan admin

`packages/shared-types`
- [ ] `pnpm --filter @umkm-pos/shared-types run typecheck` — wajib pass
- [ ] `pnpm --filter @umkm-pos/shared-types run build` — wajib pass, lalu build app yang memakainya

`packages/shared-utils`, `packages/eslint-config` — tidak punya script; verifikasi lewat konsumennya.

## Documentation Update Rules

Aturan ini sudah ada di `docs/development/conventions.md` (§ Documentation Convention):

- Endpoint baru/berubah → `docs/api/api-contract.md`
- Model/field baru → `docs/database/database-design.md` (dan `docs/database/erd.md`)
- Route baru → `docs/frontend/frontend-routes.md`
- Page baru → `docs/frontend/ui-pages.md`
- Module baru → `docs/architecture/module-breakdown.md`
- Task selesai → `docs/development/progress.md` + `docs/development/backlog.md`

Tambahan (usulan Claude 2026-10-03, belum dikonfirmasi tim):
- Script `package.json` berubah → perbarui file ini dan Verify Checklist di `.claude/agents/`.
- Keputusan arsitektur baru → ADR di `docs/decisions/`.

## PR Checklist

- [ ] Semua Perintah Verifikasi di atas PASS
- [ ] `verify-report.md` di `.caf/tasks/{TICKET-ID}/` sudah Status: SUCCESS
- [ ] Tidak ada perubahan di luar scope ticket
- [ ] Query Prisma baru pada data tenant di-scope `merchant_id` dari JWT (ADR-001 di `docs/decisions/`)
- [ ] Endpoint baru punya `@RequirePermission()` atau `@Public()` yang disengaja
- [ ] Perubahan `schema.prisma` disertai migration, dan `prisma generate` sudah dijalankan
- [ ] Header request kustom baru ditambahkan ke `allowedHeaders` di `apps/api/src/main.ts`
- [ ] Perubahan `packages/shared-types` sudah di-build ulang; perubahan `packages/ui` sudah di-build di
      merchant dan admin
- [ ] Tidak ada secret atau file `.env` yang ikut ter-commit

Empat butir terakhir dan dua butir tenant/permission adalah usulan Claude dari aturan yang terlihat di kode —
belum dikonfirmasi tim.
