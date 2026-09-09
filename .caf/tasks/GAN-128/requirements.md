# Requirements: GAN-128 — Wording ID — Laporan & Notifikasi (apps/web)

## Status: PLAN

## Overview
Ticket GAN-128 standardizes user-facing UI wording to Bahasa Indonesia across the Reports (`/reports`) and Notification (`/notification`) modules in `apps/web`.

Per glossary guideline, standard technical terms remain in English: "invoice", "barcode", "QR code", "export", "import", "upload", "download".

## Scope & Target Files

### 1. Reports Module (`apps/web/src/modules/reports/`)
- `apps/web/src/modules/reports/router/index.ts`
  - Route meta title: `'Reports'` -> `'Laporan'`
  - Breadcrumb: `'Reports'` -> `'Laporan'`, `'Home'` -> `'Beranda'`
- `apps/web/src/modules/reports/pages/index.vue`
  - DatePicker placeholder: `'Select date range'` -> `'Pilih rentang tanggal'`
  - Date range validation error messages:
    - `'Please select both start and end dates'` -> `'Pilih tanggal mulai dan tanggal selesai'`
    - `'Start date must be before or equal to end date'` -> `'Tanggal mulai harus sebelum atau sama dengan tanggal selesai'`
    - `'End date cannot be in the future'` -> `'Tanggal selesai tidak boleh di masa depan'`
  - Report cards titles & descriptions:
    - Title: `'Sales Summary'` -> `'Ringkasan Penjualan'`
    - Description: `'Total revenue, transactions, and average order value'` -> `'Total pendapatan, transaksi, dan rata-rata nilai pesanan'`
    - Title: `'Daily Reports'` -> `'Laporan Harian'`
    - Description: `'Daily sales trends and transaction data'` -> `'Tren penjualan harian dan data transaksi'`
    - Title: `'Top Products'` -> `'Produk Terlaris'`
    - Description: `'Best-selling products by revenue (Top 10)'` -> `'Produk terlaris berdasarkan pendapatan (10 Teratas)'`
    - Title: `'Outlet Comparison'` -> `'Perbandingan Outlet'`
    - Description: `'Revenue and transaction count per outlet'` -> `'Pendapatan dan jumlah transaksi per outlet'`
    - Title: `'Transaction Report'` -> `'Laporan Transaksi'`
    - Description: `'Detailed transaction history with payment methods and status'` -> `'Riwayat transaksi detail dengan metode pembayaran dan status'`
  - Download error fallback: `'Download failed'` -> `'Gagal mengunduh'`
- `apps/web/src/modules/reports/components/ReportCard.vue`
  - Button loading state: `'Downloading...'` -> `'Mengunduh...'` (Button label `'Download'` remains `'Download'` per glossary rule)

### 2. Notification Module & Components (`apps/web/src/modules/notification/`, `apps/web/src/components/`)
- `apps/web/src/modules/notification/router/index.ts`
  - Route meta title: `'Notification'` -> `'Notifikasi'`
  - Breadcrumb: `'Notification'` -> `'Notifikasi'`, `'Home'` -> `'Beranda'`
- `apps/web/src/modules/notification/pages/index.vue`
  - Page header title: `'Notifications'` -> `'Notifikasi'`
  - Action button: `'Mark all as read'` -> `'Tandai semua telah dibaca'`
  - Single item action: `'Mark read'` -> `'Tandai dibaca'`
  - Loading state message: `'Loading notifications...'` -> `'Memuat notifikasi...'`
  - Error state message: `'Failed to load notifications.'` -> `'Gagal memuat notifikasi.'`
  - Empty state title: `'There is no notifications'` -> `'Tidak ada notifikasi'`
  - Empty state description: `'You don't have new notifications for now.'` -> `'Anda tidak memiliki notifikasi baru saat ini.'`
- `apps/web/src/components/UiSidebarNotification.vue` (Notification popover dropdown)
  - Popover header: `'Notifications('` -> `'Notifikasi ('`
  - Empty state title: `'No Notifications'` -> `'Tidak Ada Notifikasi'`
  - Empty state description: `'You\'re all caught up!'` -> `'Semua notifikasi sudah dibaca!'`
  - Button label: `'View All'` -> `'Lihat Semua'`

## Acceptance Criteria
1. 100% user-facing strings in `/reports`, `/notification`, and the notification sidebar popover are in Bahasa Indonesia.
2. Glossary terms ("download", "export", etc.) are maintained per specification.
3. No functional or UI regression: types and production build pass (`pnpm --filter umkm-pos-app build`).
