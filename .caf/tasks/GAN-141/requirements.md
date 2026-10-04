# Requirements: GAN-141 - [admin] Create user/merchant/outlet dengan gambar dilaporkan gagal padahal record tersimpan

## Status: PLAN

## Overview
Ketika membuat (create) atau memperbarui (edit) data User, Merchant, dan Outlet di aplikasi `apps/admin`, proses penyimpanan data entitas utama (API post/put) dan proses pemasangan/penghapusan gambar/avatar/logo (API set/remove image/avatar) berada dalam satu blok `try...catch` yang sama.

Jika langkah penyimpanan data utama berhasil tetapi langkah pemasangan atau penghapusan gambar gagal (misalnya karena upload record sudah tidak valid, 5xx server error, atau kendala jaringan), error tersebut tertangkap oleh blok `catch` utama. Akibatnya:
1. Notifikasi error menampilkan "Gagal Menambah ..." / "Gagal Memperbarui ..." seolah-olah seluruh proses gagal dan record tidak tersimpan.
2. Halaman formulir tetap terbuka dan navigasi `router.back()` tidak terpanggil.
3. Pengguna yang mencoba menekan tombol "Simpan" kembali akan mendapatkan pesan error HTTP 409 Conflict ("Email already registered", "Merchant slug already exists", "Outlet slug already exists for this merchant").

## Goals
1. Memisahkan penanganan error operasi gambar dari penanganan error penyimpanan entitas utama pada alur Create dan Edit di modul `user`, `merchants`, dan `outlet`.
2. Jika pembuatan/pembaruan entitas utama berhasil namun operasi gambar gagal, aplikasi tetap menganggap record berhasil disimpan, menavigasi kembali ke halaman sebelumnya/daftar (`router.back()`), dan menampilkan peringatan (toast warning/error khusus gambar) bahwa record tersimpan tetapi operasi gambar gagal.
3. Mencegah resubmission berulang yang memicu error 409 Conflict.

## Affected Files
- `apps/admin/src/modules/user/pages/create.vue`
- `apps/admin/src/modules/user/pages/edit.vue`
- `apps/admin/src/modules/merchants/pages/create.vue`
- `apps/admin/src/modules/merchants/pages/edit.vue`
- `apps/admin/src/modules/outlet/pages/create.vue`
- `apps/admin/src/modules/outlet/pages/edit.vue`

## Acceptance Criteria
1. **User Create (`apps/admin/src/modules/user/pages/create.vue`)**:
   - Jika `postUser` berhasil dan `setUserAvatar` berhasil: navigasi kembali (`router.back()`).
   - Jika `postUser` berhasil namun `setUserAvatar` gagal: menampilkan notifikasi toast peringatan (`type: 'warn'`) bahwa pengguna berhasil dibuat namun foto profil gagal dipasang, dan tetap menavigasi kembali (`router.back()`).
   - Jika `postUser` gagal: menampilkan toast error "Gagal Menambah Pengguna." dan form tetap terbuka.

2. **User Edit (`apps/admin/src/modules/user/pages/edit.vue`)**:
   - Jika `putUser` berhasil dan operasi avatar (`setUserAvatar` / `removeUserAvatar`) berhasil: navigasi kembali (`router.back()`).
   - Jika `putUser` berhasil namun operasi avatar gagal: menampilkan notifikasi toast peringatan bahwa data pengguna berhasil diperbarui namun perubahan foto profil gagal, dan tetap menavigasi kembali (`router.back()`).
   - Jika `putUser` gagal: menampilkan toast error "Gagal Memperbarui Pengguna." dan form tetap terbuka.

3. **Merchant Create (`apps/admin/src/modules/merchants/pages/create.vue`)**:
   - Jika `postMerchants` berhasil dan `setMerchantImage` berhasil: navigasi kembali (`router.back()`).
   - Jika `postMerchants` berhasil namun `setMerchantImage` gagal: menampilkan notifikasi toast peringatan bahwa merchant berhasil dibuat namun logo gagal dipasang, dan tetap menavigasi kembali (`router.back()`).
   - Jika `postMerchants` gagal: menampilkan toast error "Gagal Menambah Merchant." dan form tetap terbuka.

4. **Merchant Edit (`apps/admin/src/modules/merchants/pages/edit.vue`)**:
   - Jika `putMerchants` berhasil dan operasi gambar (`setMerchantImage` / `removeMerchantImage`) berhasil: navigasi kembali (`router.back()`).
   - Jika `putMerchants` berhasil namun operasi gambar gagal: menampilkan notifikasi toast peringatan bahwa data merchant berhasil diperbarui namun perubahan logo gagal, dan tetap menavigasi kembali (`router.back()`).
   - Jika `putMerchants` gagal: menampilkan toast error "Gagal Memperbarui Merchant." dan form tetap terbuka.

5. **Outlet Create (`apps/admin/src/modules/outlet/pages/create.vue`)**:
   - Jika `postOutlet` berhasil dan `setOutletImage` berhasil: navigasi kembali (`router.back()`).
   - Jika `postOutlet` berhasil namun `setOutletImage` gagal: menampilkan notifikasi toast peringatan bahwa outlet berhasil dibuat namun logo gagal dipasang, dan tetap menavigasi kembali (`router.back()`).
   - Jika `postOutlet` gagal: menampilkan toast error "Gagal Menambah Outlet." dan form tetap terbuka.

6. **Outlet Edit (`apps/admin/src/modules/outlet/pages/edit.vue`)**:
   - Jika `putOutlet` berhasil dan operasi gambar (`setOutletImage` / `removeOutletImage`) berhasil: navigasi kembali (`router.back()`).
   - Jika `putOutlet` berhasil namun operasi gambar gagal: menampilkan notifikasi toast peringatan bahwa data outlet berhasil diperbarui namun perubahan logo gagal, dan tetap menavigasi kembali (`router.back()`).
   - Jika `putOutlet` gagal: menampilkan toast error "Gagal Memperbarui Outlet." dan form tetap terbuka.

7. **Build Verification**:
   - Perintah `pnpm --filter @umkm-pos/admin build` berhasil dieksekusi tanpa error TypeScript maupun bundler Vite.
