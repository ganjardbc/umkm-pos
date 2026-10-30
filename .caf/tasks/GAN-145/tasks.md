# Tasks GAN-145

Tidak perlu `design.md`: perubahan hanya di satu app (`apps/merchant`), tanpa skema/migrasi, tanpa perubahan kontrak antar layer.

## Frontend Tasks
- [ ] (apps/merchant) Di kartu produk pada `apps/merchant/src/modules/product-lists/pages/index.vue`, tambahkan `Tag` "Stok Menipis" (severity `warn`, sama seperti `detail.vue`) di dekat baris "Jumlah Stok", tampil hanya bila `isLowStock(product)` benar; pakai helper `isLowStock` yang sudah ada tanpa mengubahnya. (AC-1, AC-2, AC-3, AC-4)
- [ ] (apps/merchant) Jalankan `pnpm --filter @umkm-pos/merchant build` dan pastikan exit code 0; lalu cek manual AC-1 sampai AC-4 di daftar produk. (AC-1, AC-2, AC-3, AC-4, AC-5)

## Coverage
- AC-1: task 1, task 2
- AC-2: task 1, task 2
- AC-3: task 1, task 2
- AC-4: task 1, task 2
- AC-5: task 2
