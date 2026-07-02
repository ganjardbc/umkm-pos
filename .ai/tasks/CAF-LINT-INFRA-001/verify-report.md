# CAF-LINT-INFRA-001 — Verify Report

Branch: `chore/caf-lint-infra-fix`

## Checklist

| Langkah | Status | Detail |
|---------|--------|--------|
| 1. apps/web: ESLint installed | ✅ | `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-vue`, `eslint-config-prettier`, `globals` ditambah ke devDependencies |
| 1. apps/web: eslint.config.mjs dibuat | ✅ | Flat config dengan `@typescript-eslint/recommended` + `eslint-plugin-vue` flat/recommended + prettier. Rules relaxed: `no-explicit-any: off`. |
| 1. apps/web: script "lint" ditambah | ✅ | `"lint": "eslint \"src/**/*.{ts,vue}\" --fix"` |
| 2. apps/api: dist/** ditambah ke ignores | ✅ | `ignores: ['eslint.config.mjs', 'dist/**', 'node_modules/**']` |
| 3. components.d.ts: untracked | ✅ | Ditambah ke `.gitignore`, `git rm --cached` dijalankan |

---

## Hasil `pnpm turbo lint` (root)

```
Tasks:    1 successful, 2 total
Cached:   1 cached, 2 total (api dari cache)
Failed:   umkm-pos-app#lint
```

**Sebelum task ini:** Turbo hanya menjalankan 1 task (api). Web di-skip karena tidak ada script lint.
**Setelah task ini:** Turbo menjalankan 2 tasks — api (pass) + web (fail dengan violations pre-existing).

Infrastruktur Quality Gate berfungsi: web tidak lagi di-skip diam-diam.

---

## apps/api lint

```
✅ 0 problems
```

---

## apps/web lint — Non-auto-fixable violations (pre-existing, OUT OF SCOPE)

Setelah `--fix` dijalankan, 17 masalah tersisa:

| File | Line | Rule | Severity | Catatan |
|------|------|------|----------|---------|
| `src/components/TemplateCreate.vue` | 3:19 | `vue/no-parsing-error` | error | `v-bind="$attrs, { novalidate: true }"` — comma expression invalid di template |
| `src/components/UiSearch.vue` | 4:16 | `vue/no-mutating-props` | error | Direct mutation of modelValue prop |
| `src/components/UiSidebarMenu.vue` | 16:11 | `vue/no-use-v-if-with-v-for` | error | v-if harus di wrapper element |
| `src/components/UiSidebarOutlet.vue` | 85, 104, 105 | `@typescript-eslint/no-unused-vars` | error | 3 unused imports |
| `src/modules/auth/pages/index.vue` | 126:32 | `no-unsafe-optional-chaining` | error | Optional chaining in spread/arithmetic |
| `src/modules/auth/pages/register.vue` | 454:31 | `no-unsafe-optional-chaining` | error | Optional chaining in spread/arithmetic |
| `src/modules/dashboard/pages/__tests__/apiFetching.test.ts` | 260:16 | `@typescript-eslint/no-unused-vars` | error | Unused `error` in catch |
| `src/modules/shift/pages/CurrentShift.vue` | 32:7 | `@typescript-eslint/no-unused-vars` | error | Unused `emit` |
| `src/components/UiAdvanceFilter.vue` | 35, 42 | `vue/require-explicit-emits` | warning | Emitted events not declared |
| `src/components/UiEmptyState.vue` | 26:3 | `vue/require-default-prop` | warning | Prop 'icon' missing default |
| `src/components/UiSidebarMenu.vue` | 11, 21 | `vue/require-explicit-emits` | warning | Emitted events not declared |
| `src/modules/transaction/components/ReceiptModal.vue` | 50:3 | `vue/no-required-prop-with-default` | warning | Required prop with default |
| `src/modules/transaction/components/ReceiptPreview.vue` | 93:3 | `vue/no-required-prop-with-default` | warning | Required prop with default |

**Total: 10 errors, 7 warnings** — semua pre-existing, tidak menyentuh kode baru.

---

## Catatan: RTK + pnpm lint

`pnpm lint` (root) → RTK wrapper → gagal parse turbo output sebagai ESLint JSON → exit code 2.
Workaround: gunakan `pnpm turbo lint` langsung untuk hasil yang akurat dari root.
Ini bukan masalah ESLint infra, ini RTK integration issue terpisah.

---

## Files Changed

- `apps/web/package.json` — tambah lint script + ESLint devDependencies
- `apps/web/eslint.config.mjs` — baru (dibuat)
- `apps/web/.gitignore` — tambah `components.d.ts`
- `apps/api/eslint.config.mjs` — tambah `dist/**` ke ignores
- `pnpm-lock.yaml` — updated (ESLint packages web)
