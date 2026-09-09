# QA Report: GAN-127

Status: SUCCESS

## Summary
The implementation for GAN-127 was reviewed and verified. All user-facing UI wording across Outlet, Merchant, User, Role, and Permission modules in `apps/web` has been correctly localized to standard Bahasa Indonesia, in adherence with project conventions and glossary terms.

## Verification Details

### 1. Scope and Acceptance Criteria Checklist
- [x] **Outlet Module (`apps/web/src/modules/outlet/`)**:
  - Router breadcrumbs updated to Bahasa Indonesia (`Beranda`, `Outlet`, `Detail`, `Edit`, `Tambah`).
  - List page (`pages/index.vue`): search placeholder (`Cari outlet...`), action button (`Tambah Outlet`), loading (`Memuat outlet...`), empty state (`Belum ada outlet.`), status badges (`Aktif` / `Tidak Aktif`), metadata labels (`Lokasi`, `Dibuat Pada`), delete confirm dialog and toasts.
  - Create & Edit pages (`pages/create.vue`, `pages/edit.vue`): titles (`Tambah Outlet`, `Edit Outlet`), field labels (`Nama`, `Lokasi`, `Kode Rahasia Pelanggan`, `Status Aktif`, `Outlet aktif`), Zod validation messages (`Nama wajib diisi.`, `Lokasi wajib diisi.`, `Slug wajib diisi.`), action buttons (`Batal`, `Simpan`), toasts.
  - Detail page (`pages/detail.vue`): titles (`Detail Outlet`, `Informasi Outlet`, `Meja Outlet`), field labels (`Nama`, `Lokasi`, `Kode Rahasia Tamu`, `Status`, `Dibuat Pada`, `Diperbarui Pada`), table actions (`Tambah Meja`, `Aktif`/`Tidak Aktif`), toasts.
  - Components (`CustomerQrModal.vue`, `TableFormModal.vue`): secret code notice and labels (`Kode Rahasia`, `BELUM DIATUR`), card instruction (`Scan Untuk Pesan`, `Scan QR lalu masukkan kode rahasia untuk mulai memesan.`), button labels (`Cetak QR`, `Download QR`), table dialog labels (`Tambah Meja` / `Edit Meja`, `Kode`, `Nama`, `Kapasitas`, `Aktif`, `Simpan`).

- [x] **Merchant Module (`apps/web/src/modules/merchants/`)**:
  - Router meta titles & breadcrumbs (`Beranda`, `Merchant`, `Tambah Merchant`, `Edit Merchant`, `Detail Merchant`).
  - List page (`pages/index.vue`): search placeholder (`Cari merchant...`), button (`Tambah Merchant`), loading (`Memuat merchant...`), empty state (`Belum ada merchant.`), metadata labels (`Dibuat Pada`), delete confirm dialog and toasts.
  - Create & Edit pages (`pages/create.vue`, `pages/edit.vue`): titles (`Tambah Merchant`, `Edit Merchant`), field labels (`Nama`, `Nomor Telepon`, `Alamat`), Zod validations (`Nama wajib diisi.`, `Slug wajib diisi.`, `Nomor telepon wajib diisi.`, `Alamat wajib diisi.`), action buttons (`Batal`, `Simpan`), toasts.
  - Detail page (`pages/detail.vue`): titles (`Detail Merchant`, `Informasi Merchant`), field labels (`Nama`, `Nomor Telepon`, `Alamat`, `Dibuat Pada`, `Diperbarui Pada`), toasts.

- [x] **User Module (`apps/web/src/modules/user/`)**:
  - Router meta titles & breadcrumbs (`Beranda`, `Pengguna`, `Tambah`, `Edit`, `Detail`).
  - List page (`pages/index.vue`): search placeholder (`Cari pengguna...`), button (`Tambah Pengguna`), loading (`Memuat pengguna...`), empty state (`Belum ada pengguna.`), status badges (`Aktif` / `Tidak Aktif`), metadata labels (`Dibuat Pada`), deactivate confirm dialog and toasts.
  - Create & Edit pages (`pages/create.vue`, `pages/edit.vue`): titles (`Tambah Pengguna`, `Edit Pengguna`), field labels (`Nama`, `Status Aktif`, `Pengguna aktif`), Zod validations (`Username wajib diisi.`, `Nama wajib diisi.`, `Format email tidak valid.`, `Password minimal 6 karakter.`), buttons (`Batal`, `Simpan`), toasts.
  - Detail page (`pages/detail.vue`): titles (`Detail Pengguna`, `Informasi Pengguna`, `Informasi Outlet`), action buttons (`Edit Pengguna`, `Tetapkan Outlet`, `Cabut`), status badges, table column headers (`Hak Akses`), revoke confirmation dialog and toasts.
  - Component (`AssignOutletModal.vue`): modal title (`Tetapkan Outlet`), stepper titles (`Outlet`, `Role`, `Pratinjau`), table headers (`Nama`, `Lokasi`, `Deskripsi`, `Hak Akses`), action buttons (`Pilih` / `Batal Pilih`, `Batal`, `Kembali`, `Lanjut`, `Simpan`), empty state messages.

- [x] **Role & Permission Modules (`apps/web/src/modules/role/`, `apps/web/src/modules/permission/`)**:
  - Router breadcrumbs (`Beranda`, `Role`, `Permission`, `Tambah`, `Edit`, `Detail`).
  - Role pages (`pages/index.vue`, `pages/create.vue`, `pages/edit.vue`, `pages/detail.vue`): search placeholder (`Cari role...`), button (`Tambah Role`), loading (`Memuat role...`), empty state (`Belum ada role.`), metadata labels (`Deskripsi`, `Total Hak Akses`, `Dibuat Pada`), Zod validations (`Nama wajib diisi.`, `Deskripsi wajib diisi.`), buttons (`Batal`, `Simpan`), detail headers & columns (`Detail Role`, `Informasi Role`, `Hak Akses`, `Kode`, `Deskripsi`), toasts.
  - Permission pages (`pages/index.vue`, `pages/create.vue`): search placeholder (`Cari permission...`), button (`Tambah Permission`), loading (`Memuat permission...`), empty state (`Belum ada permission`, `Tidak ada permission yang ditemukan.`), metadata labels (`Deskripsi`, `Dibuat Pada`), Zod validations (`Kode wajib diisi.`, `Deskripsi wajib diisi.`), buttons (`Batal`, `Simpan`), toasts.

### 2. Glossary & Quality Checks
- [x] Retained standard technical keywords: `QR code` / `QR`, `Download QR`, `Role`, `Permission`, `Slug`, `Avatar`.
- [x] Consistent tone and terminology across all modified modules.
- [x] No missing translation strings or broken template interpolations.

### 3. Build & Type Checking Verification
- [x] `packages/shared-types` build: Passed (`tsc -p tsconfig.json`).
- [x] `apps/web` typecheck and production build: Passed with 0 errors (`vue-tsc -b && vite build`).

## Conclusion
All acceptance criteria for ticket GAN-127 are met and verified. Ready for subsequent review and merge.
