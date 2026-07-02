## Ticket: CAF-GOLDEN-EXAMPLES-001
## Agent: (manual — dijalankan di branch chore/caf-golden-examples)
## Status: SUCCESS

---

## 1. Perubahan frontend.md

File: `.claude/agents/frontend.md`

### Before → After (ringkasan per section)

**`stores/actions.ts` template:**
- BEFORE: Menampilkan satu pola — actions berisi API call via Service
- AFTER: Menjelaskan kapan actions.ts boleh kosong (state lokal) vs berisi API call (shared state), dengan kedua contoh kode

**`pages/index.vue` template:**
- BEFORE: Satu pola — page selalu gunakan store (`use<Module>Store().fetchItems()`)
- AFTER: Dua pola eksplisit:
  - Pola A (primary): Direct service call dari page untuk state lokal — rujuk ke `docs/golden-examples/frontend/page.vue`
  - Pola B: Via store untuk state yang disharing lintas component

**Frontend Self-Check:**
- BEFORE: `[ ] Tidak ada API call langsung di store action, component, atau composable`
- AFTER: `[ ] Semua API call melewati services/api.ts — tidak ada axios.get/post langsung di component atau store`
- TAMBAH: `[ ] RBAC gating via isHasPermission() dari @/helpers/auth (bukan hardcode role string)`

**Verify Checklist:**
- BEFORE: `[ ] API calls hanya di services/<module>.service.ts`
- AFTER: `[ ] API calls melewati services/api.ts (bukan axios langsung di component/store)`
- TAMBAH: `[ ] actions.ts berisi logic hanya jika state disharing lintas component`

**Batasan:**
- BEFORE: "API calls hanya boleh di `services/<module>.service.ts` — tidak di store action, component, atau composable"
- AFTER: Dipecah menjadi dua aturan:
  1. HTTP call WAJIB lewat `services/api.ts` (tidak boleh axios langsung)
  2. Component BOLEH panggil `services/api.ts` langsung (tanpa store) untuk state lokal
- TAMBAH: Aturan RBAC gating via `isHasPermission()`
- TAMBAH: Koreksi nama file service: `services/api.ts` (bukan `<module>.service.ts`)

---

## 2. Konfirmasi 6 File Golden-Examples

| # | File | Source | Status |
|---|---|---|---|
| 1 | `docs/golden-examples/backend/controller.ts` | `apps/api/src/products/products.controller.ts` | ✅ Ter-copy dengan header |
| 2 | `docs/golden-examples/backend/service.ts` | `apps/api/src/store-tables/store-tables.service.ts` | ✅ Ter-copy dengan header |
| 3 | `docs/golden-examples/backend/query.dto.ts` | `apps/api/src/stock/dto/stock-logs-query.dto.ts` | ✅ Ter-copy dengan header |
| 4 | `docs/golden-examples/frontend/page.vue` | `apps/web/src/modules/product-categories/pages/detail.vue` | ✅ Ter-copy dengan header |
| 5 | `docs/golden-examples/frontend/composable.ts` | `apps/web/src/modules/shift/composables/useShift.ts` | ✅ Ter-copy dengan catatan `any` type |
| 6 | `docs/golden-examples/frontend/api.ts` | `apps/web/src/modules/notification/services/api.ts` | ✅ Ter-copy dengan header |

Tambahan: `docs/golden-examples/README.md` — index + aturan kunci backend & frontend.

---

## 3. Quality Gate

```
Build (pnpm --filter umkm-pos-app build): PASS — ✓ built in 1.70s
Typecheck: SKIP — tidak ada perubahan TypeScript source code
Lint: SKIP — tidak ada perubahan source code

Alasan skip: semua perubahan adalah penambahan file docs/ dan update
.claude/agents/frontend.md (markdown). Tidak ada perubahan di
apps/web/src/ atau apps/api/src/.
```

---

## 4. Modul Frontend dengan actions.ts TIDAK Kosong (Kasus Pengecualian)

Hasil scan:

| Modul | actions.ts | Keterangan |
|---|---|---|
| `customer-catalog` | Berisi logic nyata | Shared state: cart (addToCart, removeFromCart, dll), session, polling status — wajar karena state disharing antar beberapa page catalog |
| `auth` | Berisi logic | Login flow, token storage |
| `shift` | Menggunakan composable (`useShift.ts`) alih-alih store actions | Pattern berbeda — singleton composable |
| Semua modul lain (outlet, product-categories, merchants, dll) | Kosong (`// Add your actions here`) | Page memanggil service langsung |

Kesimpulan: Pola "direct service call dari page" adalah pola dominan di codebase ini. Store actions berisi logic hanya di modul yang memang butuh shared state (customer-catalog, auth).

---

---

## 5. Fix Inkonsistensi frontend.md (chore/caf-fix-frontend-md)

### Diff Ringkas

**Perubahan 1 — Struktur modul wajib (baris 66):**
```diff
-│   └── <module>.service.ts
+│   └── api.ts
```

**Perubahan 2 — Header section services (baris 89):**
```diff
-#### `services/<module>.service.ts`
+#### `services/api.ts`
```

**Perubahan 3 — Tambah Pola C setelah Pola B:**
```diff
+**Pola C — Composable (shared state kompleks dengan computed guards):**
+Gunakan hanya jika sudah ada precedent kuat (lihat modul
+`shift/composables/useShift.ts`). Untuk modul baru, default ke Pola A atau B
+kecuali ada alasan jelas butuh computed guards/reactive singleton di luar
+Pinia store.
+
+Referensi: `docs/golden-examples/frontend/composable.ts` (catatan: contoh
+struktural, type safety `any` tidak untuk ditiru).
```

Sisa file tidak diubah — Batasan, Verify Checklist, Frontend Self-Check sudah konsisten memakai `api.ts`.

---

## Files Changed

- `.claude/agents/frontend.md` — update 4 section
- `docs/golden-examples/README.md` — baru
- `docs/golden-examples/backend/controller.ts` — baru
- `docs/golden-examples/backend/service.ts` — baru
- `docs/golden-examples/backend/query.dto.ts` — baru
- `docs/golden-examples/frontend/page.vue` — baru
- `docs/golden-examples/frontend/composable.ts` — baru
- `docs/golden-examples/frontend/api.ts` — baru
