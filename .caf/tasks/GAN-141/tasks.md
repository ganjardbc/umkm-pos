# Tasks: GAN-141 - [admin] Create user/merchant/outlet dengan gambar dilaporkan gagal padahal record tersimpan

## Frontend Tasks

- [x] (apps/admin) Isolasi error penanganan avatar pada create user di `apps/admin/src/modules/user/pages/create.vue` menggunakan try-catch terpisah untuk `setUserAvatar` dengan pesan peringatan jika gagal serta tetap mengeksekusi `router.back()`.
- [x] (apps/admin) Isolasi error penanganan avatar pada edit user di `apps/admin/src/modules/user/pages/edit.vue` menggunakan try-catch terpisah untuk `setUserAvatar` dan `removeUserAvatar` dengan pesan peringatan jika gagal serta tetap mengeksekusi `router.back()`.
- [x] (apps/admin) Isolasi error penanganan logo pada create merchant di `apps/admin/src/modules/merchants/pages/create.vue` menggunakan try-catch terpisah untuk `setMerchantImage` dengan pesan peringatan jika gagal serta tetap mengeksekusi `router.back()`.
- [x] (apps/admin) Isolasi error penanganan logo pada edit merchant di `apps/admin/src/modules/merchants/pages/edit.vue` menggunakan try-catch terpisah untuk `setMerchantImage` dan `removeMerchantImage` dengan pesan peringatan jika gagal serta tetap mengeksekusi `router.back()`.
- [x] (apps/admin) Isolasi error penanganan logo pada create outlet di `apps/admin/src/modules/outlet/pages/create.vue` menggunakan try-catch terpisah untuk `setOutletImage` dengan pesan peringatan jika gagal serta tetap mengeksekusi `router.back()`.
- [x] (apps/admin) Isolasi error penanganan logo pada edit outlet di `apps/admin/src/modules/outlet/pages/edit.vue` menggunakan try-catch terpisah untuk `setOutletImage` dan `removeOutletImage` dengan pesan peringatan jika gagal serta tetap mengeksekusi `router.back()`.
- [x] (apps/admin) Verifikasi build `@umkm-pos/admin` dengan menjalankan `pnpm --filter @umkm-pos/admin build`.
