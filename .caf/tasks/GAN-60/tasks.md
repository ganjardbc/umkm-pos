## Ticket: GAN-60

## Backend Tasks
(none — FE only)

## Frontend Tasks
- [ ] FE-1: Di `apps/web/src/modules/dashboard/pages/index.vue`, tambah import `showLoading, hideLoading` dari `@/helpers/loading.ts`, `showToast` dari `@/helpers/toast.ts`, dan `getErrorMessage` dari `@/helpers/utils.ts`
- [ ] FE-2: Bungkus body `fetchSummaryStats()` dengan `showLoading()` di awal try dan `hideLoading()` di `finally` (existing `statsLoading.value` tetap dipertahankan)
- [ ] FE-3: Di tiga error-branch `Promise.allSettled` dalam `fetchSummaryStats` (summaryRes, inventoryRes, shiftsRes gagal), tambah `showToast({ type: 'error', title: 'Error.', message: getErrorMessage(...) atau fallback string })` sebelum/sesudah `console.error` yang ada — pertahankan `console.error` untuk debug
- [ ] FE-4: Bungkus body `fetchAllReports()` dengan `showLoading()` sebelum `Promise.allSettled` dan `hideLoading()` setelah semua handling selesai (di akhir fungsi)
- [ ] FE-5: Di tiap 4 error-branch hasil `results[n]` dalam `fetchAllReports`, tambah `showToast({ type: 'error', title: ..., message: getErrorMessage(results[n].reason) || fallback })` — title sesuaikan per chart (mis. "Gagal memuat Sales Summary")
- [ ] FE-6: Di masing-masing 4 fungsi retry (`retrySalesSummary`, `retryDailyReports`, `retryTopProducts`, `retryOutletComparison`), bungkus try/catch dengan `showLoading()`/`hideLoading()` di `finally`, dan tambah `showToast({ type: 'error', ... })` di blok `catch` masing-masing (pakai `getErrorMessage(error)` bukan `error instanceof Error ? error.message : ...` manual, konsisten dengan pola modul lain)
- [ ] FE-7: Pastikan tidak ada regresi pada `dateRangeError` (Message component validasi) — tetap pakai state lokal, tidak diubah jadi toast

## Shared Types Tasks
(none)

## Docs Tasks
(none — tidak ada endpoint/schema baru)

## Skip Agents
- backend: tidak ada perubahan API/schema, ticket murni FE error-handling consistency di satu file Vue
