# Verify Report: GAN-128 — Wording ID — Laporan & Notifikasi (apps/web)

Status: SUCCESS

## Overview
All user-facing strings across the Reports module (`/reports`), Notification module (`/notification`), and the notification sidebar popover component have been translated and standardized to Bahasa Indonesia in accordance with the ticket requirements and glossary guidelines.

## Verified Changes
1. `apps/web/src/modules/reports/router/index.ts`
   - Meta title updated to `'Laporan'`
   - Breadcrumb labels updated to `'Beranda'` and `'Laporan'`
2. `apps/web/src/modules/reports/pages/index.vue`
   - DatePicker placeholder updated to `'Pilih rentang tanggal'`
   - Date range validation messages updated to Indonesian
   - All report card titles & descriptions updated to Indonesian
   - Fallback error message updated to `'Gagal mengunduh'`
3. `apps/web/src/modules/reports/components/ReportCard.vue`
   - Loading button text updated to `'Mengunduh...'` (button label `'Download'` preserved per glossary)
4. `apps/web/src/modules/notification/router/index.ts`
   - Meta title updated to `'Notifikasi'`
   - Breadcrumb labels updated to `'Beranda'` and `'Notifikasi'`
5. `apps/web/src/modules/notification/pages/index.vue`
   - Header title updated to `'Notifikasi'`
   - Action button updated to `'Tandai semua telah dibaca'`
   - Single item button updated to `'Tandai dibaca'`
   - Loading message updated to `'Memuat notifikasi...''`
   - Error message updated to `'Gagal memuat notifikasi.'`
   - Empty state title updated to `'Tidak ada notifikasi'` and description to `'Anda tidak memiliki notifikasi baru saat ini.'`
6. `apps/web/src/components/UiSidebarNotification.vue`
   - Popover header updated to `'Notifikasi ('`
   - Empty state title updated to `'Tidak Ada Notifikasi'` and description to `'Semua notifikasi sudah dibaca!'`
   - View all button updated to `'Lihat Semua'`

## Verification Steps & Results
- Type checking (`vue-tsc -b`) and production build (`vite build`): PASSED (Build completed cleanly with no errors).
