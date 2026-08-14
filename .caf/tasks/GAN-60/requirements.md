## Ticket: GAN-60
## Status: PLAN

## Deskripsi
`apps/web/src/modules/dashboard/pages/index.vue` pakai loading/error state lokal per-chart (ref boolean + ref string manual) tanpa integrasi ke `useGlobalLoading`/`useGlobalToast`. Konsisten-kan error handling: pakai helper terpusat `showLoading`/`hideLoading` (dari `@/helpers/loading.ts`) untuk indikator loading global, dan `showToast` (dari `@/helpers/toast.ts`) untuk notifikasi error — pola yang sudah dipakai modul lain (contoh: `apps/web/src/modules/product-lists/pages/index.vue`).

## Acceptance Criteria
- [ ] Setiap pemanggilan API di `dashboard/pages/index.vue` (`fetchSummaryStats`, `fetchAllReports`, `retrySalesSummary`, `retryDailyReports`, `retryTopProducts`, `retryOutletComparison`) memanggil `showLoading()`/`hideLoading()` dari `@/helpers/loading.ts` mengelilingi request (selain state loading lokal per-chart yang sudah ada untuk skeleton UI — tidak dihapus, dipertahankan karena dipakai prop `:loading` tiap chart component)
- [ ] Setiap `catch`/error-branch (termasuk di dalam `Promise.allSettled` result handling) memanggil `showToast({ type: 'error', title: ..., message: getErrorMessage(error) || fallback })` dari `@/helpers/toast.ts` dan `@/helpers/utils.ts` (`getErrorMessage`) — bukan cuma `console.error`
- [ ] `console.error` yang tersisa (kalau ada, untuk debug) tidak menggantikan toast — toast tetap wajib muncul ke user
- [ ] State error string per-chart (`salesSummaryError`, dst.) tetap dipertahankan karena dipakai prop `:error` di masing-masing chart component untuk render UI error inline — toast jadi tambahan notifikasi, bukan pengganti
- [ ] Tidak ada perubahan behavior di luar loading/error handling (retry logic, date range validation, params computed tetap sama)
- [ ] `npm run build` (type-check) di `apps/web` lulus tanpa error baru

## Constraints
- Pakai helper existing `@/helpers/loading.ts` (`showLoading`, `hideLoading`) dan `@/helpers/toast.ts` (`showToast`) — JANGAN import `useGlobalLoading`/`useGlobalToast` langsung di komponen (ikuti pola layer helper yang sudah ada di codebase, bukan panggil composable mentah)
- Pakai `getErrorMessage` dari `@/helpers/utils.ts` untuk extract pesan error dari axios error, konsisten dengan modul lain
- Tidak mengubah struktur props chart component (`:loading`, `:error`, `@retry`) — komponen anak (`SalesSummaryChart.vue`, dll.) tidak disentuh
- File yang disentuh hanya `apps/web/src/modules/dashboard/pages/index.vue`

## Out of Scope
- Refactor komponen chart anak (`SalesSummaryChart.vue`, `DailyReportsChart.vue`, `TopProductsChart.vue`, `OutletComparisonChart.vue`, `SummaryStats.vue`)
- Perubahan backend/API
- Perubahan UX/desain toast atau global loading indicator itu sendiri (`useGlobalLoading`/`useGlobalToast`/`GlobalLoading.vue`/`GlobalToast.vue` component, kalau ada)

## Dependensi
- `@/composables/useGlobalLoading.ts`, `@/composables/useGlobalToast.ts`, `@/helpers/loading.ts`, `@/helpers/toast.ts` — sudah ada, tidak perlu dibuat
- `getErrorMessage` di `@/helpers/utils.ts` — sudah ada (dipakai modul product-lists)
