# Verification Report: GAN-141

Status: SUCCESS

## Summary
Isolasi penanganan error operasi upload / image / avatar pada create & edit formulir User, Merchant, dan Outlet di `apps/admin` telah selesai diimplementasikan.

Ketika pembuatan atau pembaruan entitas utama berhasil namun langkah upload/set/remove avatar/logo gagal:
1. Error gambar diisolasi menggunakan blok `try...catch` terpisah.
2. Notifikasi toast peringatan (`type: 'warn'`) ditampilkan untuk menginformasikan bahwa data berhasil disimpan tetapi operasi gambar/avatar gagal.
3. Form menavigasi kembali ke halaman sebelumnya (`router.back()`), mencegah pengguna melakukan submit ulang yang memicu error 409 Conflict.
4. Jika pembuatan atau pembaruan entitas utama gagal, error tetap ditangkap oleh catch utama dan menampilkan toast error tanpa navigasi.

## Modified Files
- `apps/admin/src/modules/user/pages/create.vue`
- `apps/admin/src/modules/user/pages/edit.vue`
- `apps/admin/src/modules/merchants/pages/create.vue`
- `apps/admin/src/modules/merchants/pages/edit.vue`
- `apps/admin/src/modules/outlet/pages/create.vue`
- `apps/admin/src/modules/outlet/pages/edit.vue`

## Checklist Execution
- `apps/admin` lint: not verifiable — no script
- `apps/admin` typecheck: not verifiable — no script (typechecking executed via `build` with `vue-tsc -b`)
- `apps/admin` test: not verifiable — no script
- `apps/admin` build: PASSED (`pnpm --filter @umkm-pos/admin run build` executed successfully without errors)
