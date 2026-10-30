# Tasks GAN-144

## Frontend Tasks
- [ ] (apps/merchant) Di `apps/merchant/src/modules/product-lists/pages/index.vue`, ubah blok empty state yang ada (`v-else-if="products.length === 0"`): teks menjadi "Belum ada produk" dan tambahkan tombol "Tambah Produk" yang memanggil `addProduct`, `disabled` mengikuti `!isCanCreate`. Jangan ubah layout daftar, kondisi `loading`, atau file lain. (AC-1, AC-2, AC-3, AC-4, AC-5)
- [ ] (apps/merchant) Jalankan `pnpm typecheck`, `pnpm lint`, `pnpm test` dan `pnpm --filter @umkm-pos/merchant run build`; catat hasil di `verify-report.md`. Merchant tidak punya script lint/typecheck/test, jadi catat sebagai "not verifiable — no script" bila perintah tidak mencakupnya. (AC-6, AC-7, AC-8)

## Coverage
- AC-1: task 1
- AC-2: task 1
- AC-3: task 1
- AC-4: task 1
- AC-5: task 1
- AC-6: task 2
- AC-7: task 2
- AC-8: task 2
