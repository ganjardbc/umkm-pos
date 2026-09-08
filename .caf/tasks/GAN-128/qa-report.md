# QA Report: GAN-128 — Wording ID — Laporan & Notifikasi (apps/web)

Status: SUCCESS

## Overview
QA verification for ticket **GAN-128** ("Wording ID — Laporan & Notifikasi (apps/web)") has been completed successfully. All user-facing strings across the Reports module (`/reports`), Notification module (`/notification`), and the Sidebar Notification popover component have been localized into standard Bahasa Indonesia while adhering strictly to the technical glossary guidelines.

## Verification Scope & Results

### 1. Reports Module (`apps/web/src/modules/reports/`)
- **Router (`apps/web/src/modules/reports/router/index.ts`)**:
  - Route meta title: `'Laporan'` (previously `'Reports'`) — **PASS**
  - Breadcrumbs: `'Beranda'` and `'Laporan'` (previously `'Home'` and `'Reports'`) — **PASS**
- **Reports Page (`apps/web/src/modules/reports/pages/index.vue`)**:
  - DatePicker placeholder: `'Pilih rentang tanggal'` — **PASS**
  - Validation error messages:
    - Missing date range: `'Pilih tanggal mulai dan tanggal selesai'` — **PASS**
    - Invalid range order: `'Tanggal mulai harus sebelum atau sama dengan tanggal selesai'` — **PASS**
    - Future date: `'Tanggal selesai tidak boleh di masa depan'` — **PASS**
  - Report cards translated:
    - Card 1: `'Ringkasan Penjualan'` — `'Total pendapatan, transaksi, dan rata-rata nilai pesanan'` — **PASS**
    - Card 2: `'Laporan Harian'` — `'Tren penjualan harian dan data transaksi'` — **PASS**
    - Card 3: `'Produk Terlaris'` — `'Produk terlaris berdasarkan pendapatan (10 Teratas)'` — **PASS**
    - Card 4: `'Perbandingan Outlet'` — `'Pendapatan dan jumlah transaksi per outlet'` — **PASS**
    - Card 5: `'Laporan Transaksi'` — `'Riwayat transaksi detail dengan metode pembayaran dan status'` — **PASS**
  - Download error fallback: `'Gagal mengunduh'` — **PASS**
- **Report Card Component (`apps/web/src/modules/reports/components/ReportCard.vue`)**:
  - Action button loading state: `'Mengunduh...'` — **PASS**
  - Standard action button text: `'Download'` preserved per technical glossary guidelines — **PASS**

### 2. Notification Module & Components (`apps/web/src/modules/notification/`, `apps/web/src/components/UiSidebarNotification.vue`)
- **Router (`apps/web/src/modules/notification/router/index.ts`)**:
  - Route meta title: `'Notifikasi'` (previously `'Notification'`) — **PASS**
  - Breadcrumbs: `'Beranda'` and `'Notifikasi'` (previously `'Home'` and `'Notification'`) — **PASS**
- **Notification Page (`apps/web/src/modules/notification/pages/index.vue`)**:
  - Page header: `'Notifikasi'` — **PASS**
  - Bulk action: `'Tandai semua telah dibaca'` — **PASS**
  - Item action: `'Tandai dibaca'` — **PASS**
  - Loading state: `'Memuat notifikasi...'` — **PASS**
  - Error state: `'Gagal memuat notifikasi.'` — **PASS**
  - Empty state: `'Tidak ada notifikasi'` and `'Anda tidak memiliki notifikasi baru saat ini.'` — **PASS**
- **Sidebar Notification Popover (`apps/web/src/components/UiSidebarNotification.vue`)**:
  - Header: `'Notifikasi ({{ unreadCount }})'` — **PASS**
  - Empty state: `'Tidak Ada Notifikasi'` and `'Semua notifikasi sudah dibaca!'` — **PASS**
  - View all button: `'Lihat Semua'` — **PASS**

## Automated Quality Checks
- `pnpm --filter umkm-pos-app build` (`vue-tsc -b && vite build`): **PASS** (Zero type errors, build succeeded)
- `pnpm build` (All monorepo packages): **PASS**
- `pnpm typecheck` (All monorepo packages): **PASS**
- `pnpm lint`: **PASS**

## Acceptance Criteria Checklist
- [x] 100% user-facing strings in `/reports`, `/notification`, and the notification sidebar popover are translated to Bahasa Indonesia.
- [x] Standard technical terms ("download", "export", etc.) are maintained per glossary guidelines.
- [x] Type checks and production builds pass cleanly without regressions.
