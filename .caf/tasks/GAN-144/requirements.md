# Empty state di daftar produk merchant
Status: DRAFT
Source: GAN-144

## 1. Outcome
Saat merchant belum punya produk dan loading selesai, daftar produk menampilkan teks "Belum ada produk" beserta tombol "Tambah Produk" yang membawa merchant ke form tambah produk, sehingga merchant tahu langkah berikutnya.

## 2. Scope
In:
- Empty state di halaman daftar produk app merchant (teks + tombol "Tambah Produk").
Out:
- Ilustrasi baru.
- Perubahan layout daftar.
- Halaman selain daftar produk.
- API, database, dan `packages/ui`.

## 3. Constraints and Assumptions
- Constraint: frontend saja, hanya `apps/merchant`.
- Finding: daftar produk ada di `apps/merchant/src/modules/product-lists/pages/index.vue` (dirender di tab "Produk" oleh `apps/merchant/src/modules/product/pages/index.vue`). Halaman itu sudah punya blok kosong (`v-else-if="products.length === 0"`) setelah `UiLoading` (`v-if="loading"`), berisi ikon dan teks "Belum ada produk." tanpa tombol. Tiket menyebut halaman kosong tanpa penjelasan; kode menunjukkan teks sudah ada tetapi tanpa tombol aksi.
- Finding: toolbar halaman yang sama sudah punya tombol "Tambah Produk" (`addProduct`) yang memakai `router.push` ke route `product-lists-create` dan `disabled` bila tidak punya permission `CREATE`. Route itu didefinisikan di `apps/merchant/src/modules/product-lists/router/index.ts` dengan `meta.permission: [CREATE]`, yaitu halaman/form tambah produk yang sudah ada.
- Finding: daftar yang sama dipakai juga saat pencarian/filter kategori menghasilkan 0 data; `products` diisi dari satu `fetchProduct`.
- Finding: `apps/merchant/package.json` tidak punya script `lint`, `typecheck`, `test`, dan tidak ada test runner; `build` menjalankan `vue-tsc -b`. Root `package.json` punya `typecheck`, `lint`, `test` via `turbo`. Per ADR-014, tidak ada lint/typecheck/test di merchant.
- Assumption A-1: empty state yang sama juga tampil saat pencarian/filter menghasilkan 0 produk (tiket tidak membedakan); bertumpu pada kode saat ini yang tidak membedakannya.
- Assumption A-2: tombol di empty state mengikuti aturan tombol toolbar: nonaktif bila user tanpa permission `CREATE`; bertumpu pada pola tombol yang sudah ada.
- Assumption A-3: karena merchant tidak punya test runner, AC perilaku UI diverifikasi manual; AC lint/typecheck/test memakai perintah root yang disebut tiket.

## 4. Decisions Already Made
- Tombol "Tambah Produk" mengarah ke halaman/form tambah produk yang sudah ada, bukan halaman baru (tiket).

## 5. Open Questions
- Q-1 [NON-BLOCKING] Apakah saat pencarian/filter tanpa hasil perlu pesan berbeda dari "Belum ada produk"? Rekomendasi: tidak, di luar scope tiket. Proceed on A-1. — Answer:
- Q-2 [NON-BLOCKING] Apakah tombol empty state boleh nonaktif untuk user tanpa permission `CREATE`? Rekomendasi: ya (A-2). — Answer:

## 6. Acceptance Criteria
- AC-1: When daftar produk kosong dan loading selesai, then halaman menampilkan teks "Belum ada produk". Verify: manual: buka tab Produk dengan merchant tanpa produk, pastikan teks tampil setelah loading hilang.
- AC-2: When daftar produk kosong dan loading selesai, then halaman menampilkan tombol "Tambah Produk" di dalam empty state. Verify: manual: sama seperti AC-1, pastikan tombol tampil di area empty state (selain tombol toolbar).
- AC-3: When merchant dengan permission tambah produk menekan tombol "Tambah Produk" di empty state, then merchant berpindah ke halaman form tambah produk yang sudah ada. Verify: manual: tekan tombol, pastikan URL menjadi `/product/product-lists/create` dan form tambah tampil.
- AC-4: When daftar produk berisi minimal satu produk, then empty state tidak tampil. Verify: manual: buka tab Produk dengan merchant yang punya produk, pastikan teks "Belum ada produk" dan tombol empty state tidak ada.
- AC-5: When loading belum selesai, then empty state tidak tampil. Verify: manual: throttle jaringan, pastikan hanya indikator "Memuat produk..." tampil sebelum respons.
- AC-6: When perubahan selesai, then `pnpm typecheck` berhasil. Verify: command: pnpm typecheck | expect: exit 0
- AC-7: When perubahan selesai, then `pnpm lint` berhasil. Verify: command: pnpm lint | expect: exit 0
- AC-8: When perubahan selesai, then `pnpm test` berhasil. Verify: command: pnpm test | expect: exit 0
