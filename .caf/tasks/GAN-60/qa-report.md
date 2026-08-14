## Ticket: GAN-60
## Agent: qa
## Status: FAIL

## Quality Gate Results
- Typecheck/Build (`pnpm --filter umkm-pos-app build` → `vue-tsc -b && vite build`): PASS
  ```
  ✓ built in 1.76s
  (only chunk-size warnings, no type errors)
  ```
- Lint: SKIP — `umkm-pos-app` package has no `lint` script (`pnpm --filter umkm-pos-app lint` → "None of the selected packages has a \"lint\" script"). Root `pnpm lint` only runs `umkm-pos-api:lint`; no web lint target exists in this repo, not specific to this ticket.
- Test: SKIP — no unit/e2e test suite covers `dashboard/pages/index.vue`; ticket has no test task in tasks.md.

## Security Check Results (backend)
N/A — ticket is FE-only, no backend files changed (confirmed via `git status`/`git diff --stat`, only `apps/web/src/modules/dashboard/pages/index.vue` modified).

## Acceptance Criteria Verification
- [x] `showLoading()`/`hideLoading()` wraps all 6 API-calling functions — PASS
  - `fetchSummaryStats`: `index.vue:213` (showLoading), `:290` (hideLoading in finally)
  - `fetchAllReports`: `index.vue:316` (showLoading), `:389` (hideLoading at end)
  - `retrySalesSummary`: `:401` / `:416`
  - `retryDailyReports`: `:426` / `:441`
  - `retryTopProducts`: `:451` / `:469`
  - `retryOutletComparison`: `:479` / `:494`
  - Local `statsLoading`/`*Loading` refs kept intact, still passed to `:loading` chart props — no regression.
- [x] Every catch/error-branch (incl. `Promise.allSettled` branches) calls `showToast` with `getErrorMessage(...)` — PASS
  - `fetchSummaryStats`: 3 allSettled branches (`:249-253`, `:262-266`, `:274-278`) + outer catch (`:283-287`), all toast + `console.error` preserved.
  - `fetchAllReports`: 4 branches (`:333-337`, `:349-353`, `:365-369`, `:381-385`) all toast.
  - 4 retry functions: each catch block has `showToast` using `getErrorMessage(error)` (`:409-413`, `:434-438`, `:462-466`, `:487-491`).
- [x] `console.error` preserved alongside toast in `fetchSummaryStats` (not removed) — PASS (`:248,261,273,282`). Note: `fetchAllReports` and retry functions never had `console.error` calls originally and still don't — consistent, no regression, toast is still present so criterion "toast tetap wajib muncul" is satisfied.
- [x] Error state refs (`salesSummaryError`, etc.) retained, still bound to `:error` prop on chart components — PASS, template unchanged (`index.vue:39,48,58,67`).
- [x] No behavior change outside loading/error handling — PASS. Retry logic (early-return on `!params.value`), `validateDateRange`, `params`/`formattedDateRange` computed all untouched (diff shows only loading/toast additions + whitespace/trailing-space cleanup on pre-existing lines).
- [x] `dateRangeError` untouched, stays local `Message` component state, not converted to toast — PASS (`index.vue:17-24`, `:157-178`), matches FE-7.
- [x] `npm run build` in `apps/web` passes with no new type errors — PASS (see Quality Gate above).
- [ ] FE-6 constraint — **FAIL**: see Issues below.

## Edge Cases Tested
| Skenario | Expected | Actual | Status |
|---|---|---|---|
| `getSalesSummary` reject di `fetchAllReports` | error state diisi via `getErrorMessage`, toast muncul | `salesSummaryError.value` masih diisi manual `results[0].reason instanceof Error ? results[0].reason.message : 'Failed to fetch sales summary'` (bukan `getErrorMessage`), toast terpisah pakai `getErrorMessage` — dua sumber pesan berbeda berpotensi | ⚠️ (bukan bug FE-5, tapi lihat FE-6 di bawah untuk retry funcs) |
| Retry gagal (mis. `retrySalesSummary` throw) | error-state assignment pakai `getErrorMessage(error)` (bukan manual instanceof), sesuai FE-6 eksplisit | Kode retry masih `error instanceof Error ? error.message : 'Failed to fetch sales summary'` untuk error-state (line 405-407, 430-432, 458-460, 483-485) — toast-nya sudah pakai `getErrorMessage`, tapi error-state assignment TIDAK diganti | ❌ FAIL |
| `params.value` null saat retry dipanggil sebelum date range valid | fungsi early-return, tidak showLoading/toast | `if (!params.value) return;` sebelum `showLoading()` — PASS, tidak ada loading-state stuck | ✅ |
| `outlet?.id` undefined (user belum pilih outlet) | request tetap jalan dengan `outlet_id: undefined`, tidak crash | Tidak diubah oleh ticket ini, existing behavior dipertahankan | ✅ (no regression) |
| Toast dipanggil bertubi saat 4 allSettled reject bersamaan | 4 toast independent muncul, tidak saling override loading indicator (showLoading/hideLoading dipanggil sekali per fetch, bukan per-branch) | Sesuai: `showLoading()` dipanggil sekali di awal `fetchAllReports`, `hideLoading()` sekali di akhir setelah semua branch diproses — PASS, tidak ada race karena `Promise.allSettled` synchronous-after-await handling | ✅ |
| Error object bukan `Error` instance (mis. string atau axios error tanpa `.message`) | `getErrorMessage` extract dengan fallback | `getErrorMessage` sudah dipakai untuk toast di semua tempat, ada fallback string per-context — PASS untuk toast; tapi error-state di retry funcs (`FAIL` di atas) masih rentan raw `.message` axios object yang kadang bukan human-readable | ❌ (turunan issue FE-6) |

## Issues Found

### CRITICAL (harus diperbaiki sebelum PR)
(tidak ada — tidak ditemukan critical security/data-scoping issue, ticket FE-only tanpa backend/API surface baru)

### NON-CRITICAL — tapi melanggar acceptance criteria eksplisit, wajib diperbaiki sebelum PR
1. **FE-6 tidak dipenuhi** — `apps/web/src/modules/dashboard/pages/index.vue:405-407, 430-432, 458-460, 483-485` (4 fungsi retry: `retrySalesSummary`, `retryDailyReports`, `retryTopProducts`, `retryOutletComparison`). Requirements FE-6 eksplisit: *"pakai `getErrorMessage(error)` bukan `error instanceof Error ? error.message : ...` manual, konsisten dengan pola modul lain"*. Kode saat ini hanya menambah `showToast` yang pakai `getErrorMessage(error)`, tapi assignment ke `*Error.value` (dipakai untuk render inline error UI via prop `:error`) masih pakai pattern manual lama:
   ```ts
   salesSummaryError.value = error instanceof Error
     ? error.message
     : 'Failed to fetch sales summary';
   ```
   Harus jadi:
   ```ts
   salesSummaryError.value = getErrorMessage(error) || 'Failed to fetch sales summary';
   ```
   Sama untuk 3 fungsi retry lainnya. Ini bug konsistensi eksplisit yang diminta ticket (bukan cuma nice-to-have) — modul `product-lists` juga tidak pakai pattern manual instanceof.

2. **Konsistensi minor (tidak diwajibkan FE-5 tapi worth flag)** — `fetchAllReports` (`index.vue:329-331, 345-347, 361-363, 377-379`) juga masih pakai `results[n].reason instanceof Error ? results[n].reason.message : '...'` untuk error-state assignment, hanya `showToast`-nya yang pakai `getErrorMessage`. Requirements/tasks.md FE-5 tidak eksplisit minta ganti pattern ini (hanya minta tambah showToast), jadi ini bukan pelanggaran acceptance criteria langsung — tapi tidak konsisten dengan semangat "getErrorMessage konsisten dengan modul lain" yang disebut di FE-6/requirements umum. Rekomendasi: samakan sekalian saat fix issue #1 di atas, biar dua sumber pesan error (state vs toast) tidak berbeda.

## Verdict

FAIL — 1 acceptance criterion (FE-6, eksplisit di tasks.md) tidak terpenuhi: 4 fungsi retry masih pakai `error instanceof Error ? error.message : ...` manual untuk error-state alih-alih `getErrorMessage(error)` seperti diminta. Tidak ada critical security issue. Build/typecheck lulus. Perlu 1 fix kecil (ganti pattern di 4 tempat) sebelum lanjut ke Reviewer.
