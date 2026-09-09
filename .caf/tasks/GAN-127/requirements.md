# Requirements: GAN-127

## Status: PLAN

## Overview
Ticket GAN-127 aims to standardize user-facing wording in `apps/web` into Bahasa Indonesia across four modules:
1. **Outlet & Meja Outlet** (`/outlet/**`)
2. **Merchant** (`/merchants/**`)
3. **Pengguna** (`/user/**`)
4. **RBAC** — Role & Permission (`/role/**`, `/permission/**`)

All user-facing strings including form labels, button labels, page/modal headers, breadcrumb labels, input placeholders, toast messages, confirm dialogs, Zod validation errors, empty state messages, and loading messages will be updated to standard Bahasa Indonesia directly in the components (hardcoded string approach, without introducing `vue-i18n`).

## Scope & Glossary Rules

### Glossary (Remain in English per specification)
- `invoice`
- `barcode`
- `QR code` / `QR`
- `export`
- `import`
- `upload`
- `download`

### Standard Bahasa Indonesia Terms
- Add / Create -> **Tambah** (e.g. *Tambah Outlet*, *Tambah Merchant*, *Tambah Pengguna*, *Tambah Role*, *Tambah Permission*, *Tambah Meja*)
- Edit / Update -> **Edit** (e.g. *Edit Outlet*, *Edit Merchant*, *Edit Pengguna*, *Edit Role*, *Edit Meja*)
- Delete / Remove -> **Hapus** (e.g. *Hapus Outlet*, *Hapus Merchant*, *Hapus Role*, *Hapus Meja*)
- Deactivate -> **Nonaktifkan** (e.g. *Nonaktifkan Pengguna*)
- Detail / View -> **Detail** / **Lihat**
- Save -> **Simpan**
- Cancel -> **Batal**
- Back -> **Kembali**
- Next -> **Lanjut**
- Select / Unselect -> **Pilih** / **Batal Pilih**
- Revoke -> **Cabut**
- Active / Inactive -> **Aktif** / **Tidak Aktif**
- Name -> **Nama**
- Location -> **Lokasi**
- Address -> **Alamat**
- Phone -> **Nomor Telepon** / **Telepon**
- Description -> **Deskripsi**
- Capacity -> **Kapasitas**
- Created At -> **Dibuat Pada**
- Updated At -> **Diperbarui Pada**
- Total Permissions -> **Total Hak Akses** / **Total Permission**
- Code -> **Kode**
- Guest Secret Code -> **Kode Rahasia Pelanggan** / **Kode Rahasia Tamu**
- Information -> **Informasi**
- Success / Error (Toast) -> **Berhasil** / **Gagal**

## Module Breakdown

### 1. Outlet & Meja Outlet (`apps/web/src/modules/outlet/`)
- `router/index.ts`: Breadcrumbs labels (`Home` -> `Beranda`, `Outlet`, `Detail`, `Edit`, `Add` -> `Tambah`)
- `pages/index.vue`: Search placeholder, button `Add Outlet` -> `Tambah Outlet`, loading message `Memuat outlet...`, empty state `Belum ada outlet.`, status tag `Aktif`/`Tidak Aktif`, card labels (`Merchant`, `Lokasi`, `Dibuat Pada`), confirm dialog `Hapus Outlet` ("Apakah Anda yakin ingin menghapus outlet ini?"), toasts (sukses & gagal).
- `pages/create.vue`: Title `Tambah Outlet`, form labels & Zod validation messages (`Nama wajib diisi.`, `Slug wajib diisi.`, `Lokasi wajib diisi.`), checkbox label `Outlet aktif`, buttons `Batal` & `Simpan`, toasts.
- `pages/edit.vue`: Title `Edit Outlet`, form labels & Zod messages, buttons `Batal` & `Simpan`, toasts.
- `pages/detail.vue`: Titles (`Detail Outlet`, `Informasi Outlet`, `Meja Outlet`), field labels (`Nama`, `Slug`, `Lokasi`, `Kode Rahasia Tamu`, `Merchant`, `Status`, `Dibuat Pada`, `Diperbarui Pada`), button `Tambah Meja`, table empty text `Belum ada meja untuk outlet ini.`, toasts.
- `components/CustomerQrModal.vue`: Header, instruction texts, QR card text (`Scan QR lalu masukkan secret code untuk mulai pesan.`), buttons `Download QR`, `Print QR` (per glossary: download tetap download), print template strings.
- `components/TableFormModal.vue`: Header `Tambah Meja` / `Edit Meja`, labels (`Kode`, `Nama`, `Kapasitas`, `Aktif`), button `Simpan`, toasts.

### 2. Merchant (`apps/web/src/modules/merchants/`)
- `router/index.ts`: Breadcrumbs labels (`Home` -> `Beranda`, `Merchants` -> `Merchant`, `Create Merchant` -> `Tambah Merchant`, `Edit Merchant` -> `Edit Merchant`, `View Merchant` -> `Detail Merchant`)
- `pages/index.vue`: Search, button `Add Merchant` -> `Tambah Merchant`, loading message `Memuat merchant...`, empty state `Belum ada merchant.`, card metadata (`Dibuat Pada`), confirm dialog `Hapus Merchant` ("Apakah Anda yakin ingin menghapus merchant ini?"), toasts.
- `pages/create.vue`: Title `Tambah Merchant`, form labels (`Nama`, `Slug`, `Nomor Telepon`, `Alamat`), Zod validations (`Nama wajib diisi.`, `Slug wajib diisi.`, `Nomor telepon wajib diisi.`, `Alamat wajib diisi.`), buttons `Batal` & `Simpan`, toasts.
- `pages/edit.vue`: Title `Edit Merchant`, form labels, Zod validations, buttons `Batal` & `Simpan`, toasts.
- `pages/detail.vue`: Title `Detail Merchant`, `Informasi Merchant`, button `Edit Merchant`, labels (`Nama`, `Slug`, `Nomor Telepon`, `Alamat`, `Dibuat Pada`, `Diperbarui Pada`), toasts.

### 3. Pengguna (`apps/web/src/modules/user/`)
- `router/index.ts`: Breadcrumbs (`Home` -> `Beranda`, `User` -> `Pengguna`, `Add` -> `Tambah`, `Edit` -> `Edit`, `Detail` -> `Detail`)
- `pages/index.vue`: Search, button `Add User` -> `Tambah Pengguna`, loading message `Memuat pengguna...`, empty state `Belum ada pengguna.`, status tag `Aktif`/`Tidak Aktif`, metadata (`Email`, `Merchant`, `Dibuat Pada`), confirm dialog `Nonaktifkan Pengguna` ("Apakah Anda yakin ingin menonaktifkan pengguna ini?"), toasts.
- `pages/create.vue`: Title `Tambah Pengguna`, labels (`Username`, `Nama`, `Email`, `Password`, `Status Aktif`), Zod validations (`Username wajib diisi.`, `Nama wajib diisi.`, `Format email tidak valid.`, `Password minimal 6 karakter.`), checkbox label `Pengguna aktif`, buttons `Batal` & `Simpan`, toasts.
- `pages/edit.vue`: Title `Edit Pengguna`, labels, Zod validations, checkbox label, buttons `Batal` & `Simpan`, toasts.
- `pages/detail.vue`: Title `Detail Pengguna`, `Informasi Pengguna`, button `Edit Pengguna`, field labels, section `Informasi Outlet`, button `Tetapkan Outlet` / `Assign Outlet`, DataTable empty message `Belum ada outlet yang ditugaskan.`, column headers, action button `Cabut`, confirm dialog `Cabut Role` ("Tindakan ini akan mencabut role pengguna dari outlet ini."), toasts.
- `components/AssignOutletModal.vue`: Header `Tetapkan Outlet`, Stepper steps (`Outlet`, `Role`, `Pratinjau`), step headings, DataTable empty messages, select buttons (`Pilih` / `Batal Pilih`), Stepper footer buttons (`Batal`, `Kembali`, `Lanjut`, `Simpan`), empty state messages.

### 4. RBAC — Role & Permission (`apps/web/src/modules/role/`, `apps/web/src/modules/permission/`)
- `role/router/index.ts` & `permission/router/index.ts`: Breadcrumbs (`Home` -> `Beranda`, `Role`, `Permission`, `Add` -> `Tambah`, `Edit`, `Detail`)
- `role/pages/index.vue`: Button `Tambah Role`, loading `Memuat role...`, empty state `Belum ada role.`, metadata (`Deskripsi`, `Total Hak Akses`, `Dibuat Pada`), confirm dialog `Hapus Role` ("Apakah Anda yakin ingin menghapus role ini?"), toasts.
- `role/pages/create.vue` & `edit.vue`: Title `Tambah Role` / `Edit Role`, labels (`Nama`, `Deskripsi`), Zod validations (`Nama wajib diisi.`, `Deskripsi wajib diisi.`), fix copy-paste error toast title (`Gagal Menambah Role` / `Gagal Memperbarui Role`), buttons `Batal` & `Simpan`.
- `role/pages/detail.vue`: Title `Detail Role`, `Informasi Role`, field labels, section `Hak Akses` / `Permissions`, DataTable empty message `Belum ada hak akses.`, toasts.
- `permission/pages/index.vue`: Button `Tambah Permission`, loading `Memuat permission...`, empty state `Belum ada permission.`, metadata (`Deskripsi`, `Dibuat Pada`), confirm dialog `Hapus Permission` ("Apakah Anda yakin ingin menghapus permission ini?"), toasts.
- `permission/pages/create.vue`: Title `Tambah Permission`, labels (`Kode`, `Deskripsi`), Zod validations (`Kode wajib diisi.`, `Deskripsi wajib diisi.`), fix toast title (`Gagal Menambah Permission`), buttons `Batal` & `Simpan`.

## Success Metrics
- 100% of user-facing UI strings in the target modules are in standard Bahasa Indonesia (except glossary terms: invoice, barcode, QR code, export, import, upload, download).
- `pnpm --filter umkm-pos-app build` (including `vue-tsc -b`) succeeds without type or build errors.
