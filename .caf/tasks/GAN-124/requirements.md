# Ticket: GAN-124 — Wording ID: Auth, Dashboard, Settings & Halaman Error (apps/web)

## Status: PLAN

## Overview
Standardize and convert all user-facing interface text in `apps/web` for Authentication, Dashboard, Settings, and Error pages to Indonesian (Bahasa Indonesia). There is no i18n layer (`vue-i18n`) — strings are hardcoded directly in the Vue SFCs and service/constant files.

## Target User
Owner/Admin merchant and Cashiers (UMKM end users) who use Indonesian as their daily working language.

## Scope of Work

### 1. Authentication & Profile
- **Login (`apps/web/src/modules/auth/pages/index.vue`)**:
  - Form labels (Email, Kata Sandi)
  - Validation messages (Zod) in Indonesian
  - Submit button ("Masuk")
  - Register prompt link ("Belum punya akun? Daftar")
  - Toast notifications (Sukses/Gagal masuk)
- **Register (`apps/web/src/modules/auth/pages/register.vue`)**:
  - Stepper titles ("Informasi Pengguna", "Informasi Merchant", "Informasi Outlet")
  - Form labels, placeholders, helper text
  - Validation messages (Zod) in Indonesian
  - Navigation buttons ("Batal", "Kembali", "Lanjut", "Daftar")
  - Login prompt link ("Sudah punya akun? Masuk")
  - Toast notifications (Sukses/Gagal pendaftaran)
- **Profile (`apps/web/src/modules/profile/pages/index.vue` & router/breadcrumbs)**:
  - Status tag ("Aktif" / "Tidak Aktif")
  - Field labels ("Nama Pengguna", "Nama Lengkap", "Email", "Merchant", "Dibuat Pada", "Diperbarui Pada")
  - Logout confirmation modal ("Keluar dari Akun?", tombol "Batal", "Ya, Lanjutkan")
  - Toast notifications (Berhasil keluar, Gagal memuat profil)
  - Breadcrumb labels ("Beranda", "Profil")

### 2. Dashboard
- **Dashboard View (`apps/web/src/modules/dashboard/pages/index.vue`)**:
  - DatePicker placeholder ("Pilih rentang tanggal")
  - Date range validation messages in Indonesian
  - Chart titles and labels
  - Breadcrumb labels ("Beranda", "Dashboard")
- **Dashboard Components (`apps/web/src/modules/dashboard/components/`)**:
  - `SummaryStats.vue`: Metric card titles ("Penjualan Hari Ini", "Transaksi Hari Ini", "Stok Menipis", "Shift Aktif"), empty states, tooltips
  - `SalesSummaryChart.vue`: Chart titles, error states ("Gagal memuat ringkasan penjualan"), retry button ("Coba Lagi"), empty states
  - `DailyReportsChart.vue`: Chart titles, error states, retry button, tooltips, axis labels
  - `TopProductsChart.vue`: Chart titles, error states, retry button, headers, empty states
  - `OutletComparisonChart.vue`: Chart titles, error states, retry button, headers, empty states

### 3. Settings
- **Settings Constants & Router (`apps/web/src/modules/settings/services/constants.ts`, `router/index.ts`)**:
  - Menu item labels & descriptions in `LIST_MENU`:
    - "Ubah Profil" / "Perbarui informasi pribadi Anda"
    - "Ubah Kata Sandi" / "Perbarui kata sandi akun Anda"
    - "Ubah Email" / "Perbarui alamat email akun Anda"
    - "Pengaturan Situs" / "Mode gelap, bahasa, zona waktu"
    - "Nonaktifkan Akun" / "Nonaktifkan akun Anda secara permanen"
  - Breadcrumb labels ("Beranda", "Pengaturan", "Ubah Profil", "Ubah Kata Sandi", "Ubah Email", "Pengaturan Situs", "Nonaktifkan Akun")
- **Edit Profile (`apps/web/src/modules/settings/pages/edit-profile.vue`)**:
  - Title, input labels ("Nama Lengkap", "Email", "Nomor Telepon", "Bio"), placeholders
  - Email info message ("Email tidak dapat diubah di sini. Gunakan halaman Ubah Email.")
  - Validation messages (Zod)
  - Action buttons ("Batal", "Simpan")
  - Toast notifications
- **Change Password (`apps/web/src/modules/settings/pages/change-password.vue`)**:
  - Title, labels ("Kata Sandi Saat Ini", "Kata Sandi Baru", "Konfirmasi Kata Sandi Baru"), placeholders
  - Validation messages (Zod)
  - Action buttons ("Batal", "Simpan Kata Sandi")
  - Toast notifications
- **Change Email (`apps/web/src/modules/settings/pages/change-email.vue`)**:
  - Title, labels ("Email Saat Ini", "Email Baru", "Kata Sandi untuk Konfirmasi"), placeholders
  - Validation messages (Zod)
  - Action buttons ("Batal", "Simpan Email")
  - Toast notifications
- **Site Settings (`apps/web/src/modules/settings/pages/site-settings.vue`)**:
  - Title, field labels ("Tema Tampilan", "Zona Waktu", dll.), option labels
  - Action buttons ("Batal", "Simpan Pengaturan")
  - Toast notifications
- **Deactivate Account (`apps/web/src/modules/settings/pages/deactivate-account.vue`)**:
  - Title, warning alerts/messages, confirmation fields ("Ketik konfirmasi", "Kata Sandi")
  - Action buttons ("Batal", "Nonaktifkan Akun")
  - Confirmation dialogs and toast notifications

### 4. Error Pages
- **404 Page (`apps/web/src/modules/error/pages/404.vue`)**:
  - Message ("Halaman tidak ditemukan.")
  - Button ("Kembali ke Beranda")
  - Router title meta ("404 Halaman Tidak Ditemukan")
- **403 Page (`apps/web/src/modules/error/pages/403.vue`)**:
  - Message ("Akses Ditolak: Anda tidak memiliki izin untuk mengakses halaman ini.")
  - Button ("Kembali ke Beranda")
  - Router title meta ("403 Akses Ditolak")

## Technical Terms & Glossary (Preserved in English)
The following terms MUST remain in English:
- `invoice`
- `barcode`
- `QR code`
- `export`
- `import`
- `upload`
- `download`

## Out-of-Scope
- `apps/landing`
- `apps/api`
- Database seeds and dummy/demo data
- Variable names, function names, code comments, internal logs
- Installing or setting up `vue-i18n` (strings must be directly hardcoded in template/script)
- Developer documentation (`docs/**`, `CLAUDE.md`)
- Changes to UI layouts, structure, interaction flows, or CSS styles

## Success Criteria
- 100% user-facing UI strings in the target modules are in standard Bahasa Indonesia (following the glossary exceptions).
- Form validation error messages display naturally in Bahasa Indonesia.
- Toast notifications and confirm dialogs display consistently in Bahasa Indonesia.
- Typecheck and build succeed (`pnpm --filter umkm-pos-app build` / `vue-tsc -b`).
