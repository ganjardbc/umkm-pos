# CAF-LINT-INFRA-001 — Quality Gate Lint Fix Plan

## Temuan

### apps/web — ESLint tidak ada sama sekali

| Item | Status |
|------|--------|
| ESLint devDependency | ❌ tidak ada |
| eslint config file | ❌ tidak ada |
| `lint` script di package.json | ❌ tidak ada |
| Vue/TS eslint plugin | ❌ tidak ada |

`pnpm lint` di root → `turbo lint` → Turbo skip workspace yang tidak punya script `lint` tanpa error.
Efek: Quality Gate "lint — PASS" selalu lolos untuk web karena tidak pernah dijalankan.

### apps/api — Situasi lebih baik dari yang diasumsikan

| Item | Status |
|------|--------|
| ESLint devDependency | ✅ `eslint ^9.18` |
| `eslint.config.mjs` | ✅ ada, flat config |
| `lint` script | ✅ ada: `eslint "{src,apps,libs,test}/**/*.ts" --fix` |
| `dist/` ter-commit ke git | ✅ TIDAK (0 file dari `git ls-files apps/api/dist`) |
| `dist/` ada secara lokal | ✅ ada (build artifact lokal, tidak di-track) |

**Masalah kecil yang tersisa di api**: `eslint.config.mjs` hanya punya satu ignores entry (`eslint.config.mjs` sendiri). Tidak ada `dist/**` di ignores block. Jika seseorang jalankan `eslint .` langsung (bukan via `pnpm lint` script), akan scan `dist/` yang berisi compiled `.js`. Ini rentan terhadap perubahan invokasi di masa depan.

**Tentang "~16k pre-existing errors"**: Kemungkinan besar terjadi waktu dev menjalankan `eslint .` atau `eslint apps/api` tanpa glob script, bukan via `pnpm lint`. Script yang ada sudah benar.

---

## Rencana Fix

| # | Masalah | Root Cause | Rencana Fix | Risiko |
|---|---------|------------|-------------|--------|
| 1 | `apps/web` tidak punya lint script | ESLint tidak pernah di-setup | Install `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-vue`, `eslint-config-prettier`. Buat `eslint.config.mjs`. Tambah script `lint` di package.json. | Sedang — eslint-plugin-vue mungkin flag banyak existing violations. Perlu cek apakah fix auto (--fix) cukup atau perlu suppression rules. |
| 2 | `apps/api` eslint.config.mjs tidak ignore `dist/**` | Default NestJS template tidak include ignores untuk dist | Tambah `'dist/**'` dan `'**/*.js'` (atau `'**/*.d.ts'`) ke `ignores` array di `eslint.config.mjs` | Rendah — hanya defensive hardening, tidak ubah lint behavior normal |
| 3 | `apps/web/components.d.ts` ter-commit (generated file) | `unplugin-vue-components` auto-generate file ini | Tambah ke `.gitignore` web, regenerasi via build. Atau biarkan jika tim sengaja commit (banyak project Vue melakukan ini untuk IDE support). | Rendah — perlu konfirmasi apakah disengaja |

---

## Tidak ada di scope

- Perbaikan ESLint violations yang sudah ada di source code (bukan infrastruktur, bukan bagian dari task ini)
- Format/Prettier setup (api sudah ada)

---

## Langkah Implementasi (setelah approval)

1. `apps/web`: Install packages + buat config + tambah script
2. `apps/api`: Tambah `dist/**` ke `ignores` di `eslint.config.mjs`
3. Verifikasi: `pnpm lint` di root berhasil tanpa skip web
4. (Opsional, konfirmasi dulu) Cek `components.d.ts` intent

## Pertanyaan untuk approval

- **Web ESLint rules**: Pakai level strict atau relaxed awal? (Rekomendasi: mulai relaxed `@typescript-eslint/recommended` tanpa error-on-any, sama seperti api, supaya tidak block lint dari existing code)
- **`components.d.ts`**: Biarkan ter-commit atau pindah ke gitignore?
