# Verification Report: GAN-127

Status: SUCCESS

## Changes Implemented

Updated user-facing UI wording to standard Bahasa Indonesia across the following modules in `apps/web`:

1. **Outlet & Meja Outlet Module (`apps/web/src/modules/outlet/`)**
   - `router/index.ts`: Breadcrumb labels (`Beranda`, `Outlet`, `Detail`, `Edit`, `Tambah`).
   - `pages/index.vue`: Search placeholder (`Cari outlet...`), action button (`Tambah Outlet`), loading state (`Memuat outlet...`), empty state (`Belum ada outlet.`), status tags (`Aktif` / `Tidak Aktif`), metadata labels (`Lokasi`, `Dibuat Pada`), delete confirm dialog & toast messages.
   - `pages/create.vue` & `pages/edit.vue`: Page titles (`Tambah Outlet`, `Edit Outlet`), form labels (`Nama`, `Lokasi`, `Kode Rahasia Pelanggan`, `Status Aktif`, `Outlet aktif`), Zod validation messages (`Nama wajib diisi.`, `Lokasi wajib diisi.`, `Slug wajib diisi.`), buttons (`Batal`, `Simpan`), and error/success toasts.
   - `pages/detail.vue`: Detail titles (`Detail Outlet`, `Informasi Outlet`, `Meja Outlet`), field labels (`Nama`, `Lokasi`, `Kode Rahasia Tamu`, `Status`, `Dibuat Pada`, `Diperbarui Pada`), table actions (`Tambah Meja`, `Aktif`/`Tidak Aktif`), and toasts.
   - `components/CustomerQrModal.vue`: Secret code warnings, card instructions (`Scan Untuk Pesan`, `Scan QR lalu masukkan kode rahasia untuk mulai memesan.`, `Kode Rahasia`, `BELUM DIATUR`), buttons (`Download QR`, `Cetak QR`), and print template.
   - `components/TableFormModal.vue`: Modal headers (`Tambah Meja` / `Edit Meja`), form labels (`Kode`, `Nama`, `Kapasitas`, `Aktif`), button (`Simpan`), and toasts.

2. **Merchant Module (`apps/web/src/modules/merchants/`)**
   - `router/index.ts`: Route meta titles & breadcrumbs (`Beranda`, `Merchant`, `Tambah Merchant`, `Edit Merchant`, `Detail Merchant`).
   - `pages/index.vue`: Search placeholder (`Cari merchant...`), button (`Tambah Merchant`), loading state (`Memuat merchant...`), empty state (`Belum ada merchant.`), metadata labels (`Dibuat Pada`), delete confirm dialog & toasts.
   - `pages/create.vue` & `pages/edit.vue`: Page titles (`Tambah Merchant`, `Edit Merchant`), form labels (`Nama`, `Nomor Telepon`, `Alamat`), Zod validations (`Nama wajib diisi.`, `Slug wajib diisi.`, `Nomor telepon wajib diisi.`, `Alamat wajib diisi.`), action buttons (`Batal`, `Simpan`), and toasts.
   - `pages/detail.vue`: Page & card titles (`Detail Merchant`, `Informasi Merchant`), field labels (`Nama`, `Nomor Telepon`, `Alamat`, `Dibuat Pada`, `Diperbarui Pada`), and toasts.

3. **Pengguna Module (`apps/web/src/modules/user/`)**
   - `router/index.ts`: Route meta titles & breadcrumbs (`Beranda`, `Pengguna`, `Tambah`, `Edit`, `Detail`).
   - `pages/index.vue`: Search placeholder (`Cari pengguna...`), button (`Tambah Pengguna`), loading state (`Memuat pengguna...`), empty state (`Belum ada pengguna.`), status tags (`Aktif` / `Tidak Aktif`), metadata labels (`Dibuat Pada`), deactivate confirm dialog & toasts.
   - `pages/create.vue` & `pages/edit.vue`: Page titles (`Tambah Pengguna`, `Edit Pengguna`), form labels (`Nama`, `Status Aktif`, `Pengguna aktif`), Zod validations (`Username wajib diisi.`, `Nama wajib diisi.`, `Format email tidak valid.`, `Password minimal 6 karakter.`), buttons (`Batal`, `Simpan`), and toasts.
   - `pages/detail.vue`: Page titles (`Detail Pengguna`, `Informasi Pengguna`, `Informasi Outlet`), button labels (`Edit Pengguna`, `Tetapkan Outlet`, `Cabut`), status tags, table columns (`Hak Akses`), revoke confirmation dialog & toasts.
   - `components/AssignOutletModal.vue`: Modal title (`Tetapkan Outlet`), stepper titles (`Outlet`, `Role`, `Pratinjau`), card headers, table headers (`Nama`, `Lokasi`, `Deskripsi`, `Hak Akses`), action buttons (`Pilih` / `Batal Pilih`, `Batal`, `Kembali`, `Lanjut`, `Simpan`), and empty state messages.

4. **RBAC Module (`apps/web/src/modules/role/`, `apps/web/src/modules/permission/`)**
   - `role/router/index.ts` & `permission/router/index.ts`: Breadcrumbs (`Beranda`, `Role`, `Permission`, `Tambah`, `Edit`, `Detail`).
   - `role/pages/index.vue`: Search placeholder (`Cari role...`), button (`Tambah Role`), loading state (`Memuat role...`), empty state (`Belum ada role.`), metadata labels (`Deskripsi`, `Total Hak Akses`, `Dibuat Pada`), delete confirmation dialog & toasts.
   - `role/pages/create.vue` & `role/pages/edit.vue`: Titles (`Tambah Role`, `Edit Role`), form labels (`Nama`, `Deskripsi`), Zod validations (`Nama wajib diisi.`, `Deskripsi wajib diisi.`), buttons (`Batal`, `Simpan`), and fixed toast titles.
   - `role/pages/detail.vue`: Detail titles (`Detail Role`, `Informasi Role`, `Hak Akses`), field labels (`Nama`, `Total Hak Akses`, `Deskripsi`, `Dibuat Pada`, `Diperbarui Pada`), table column headers (`Kode`, `Deskripsi`), and toasts.
   - `permission/pages/index.vue`: Search placeholder (`Cari permission...`), button (`Tambah Permission`), loading state (`Memuat permission...`), empty state (`Belum ada permission`, `Tidak ada permission yang ditemukan.`), metadata labels (`Deskripsi`, `Dibuat Pada`), delete confirmation dialog & toasts.
   - `permission/pages/create.vue`: Title (`Tambah Permission`), form labels (`Kode`, `Deskripsi`), Zod validations (`Kode wajib diisi.`, `Deskripsi wajib diisi.`), buttons (`Batal`, `Simpan`), and fixed toast titles.

## Verification Checklist

- [x] Glossaries respected: `invoice`, `barcode`, `QR code` / `QR`, `export`, `import`, `upload`, `download` remain in English.
- [x] Build shared-types: `npm run --prefix packages/shared-types build` succeeded without error.
- [x] Type check & production build: `npm run --prefix apps/web build` (running `vue-tsc -b && vite build`) succeeded with 0 errors.
