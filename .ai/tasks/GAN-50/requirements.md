## Ticket: GAN-50
## Status: SUCCESS

## Deskripsi
Menghapus direktori `stores/` yang berisi boilerplate Pinia store kosong ("Hello World") di modul `product-categories` dan `product-lists` pada aplikasi frontend (web). Logika data fetching dan state management di kedua modul tersebut sudah ditangani langsung di level component menggunakan Axios dan reactive state Vue, sehingga store Pinia ini tidak digunakan (dead code).

## Acceptance Criteria
- [ ] Direktori `apps/web/src/modules/product-categories/stores/` beserta seluruh isinya (`state.ts`, `actions.ts`, `getters.ts`, `index.ts`) dihapus sepenuhnya.
- [ ] Direktori `apps/web/src/modules/product-lists/stores/` beserta seluruh isinya (`state.ts`, `actions.ts`, `getters.ts`, `index.ts`) dihapus sepenuhnya.
- [ ] Tidak ada error kompilasi/typecheck setelah penghapusan store tersebut (menjalankan `pnpm typecheck` dan `pnpm --filter umkm-pos-app build` sukses).
- [ ] Fitur manajemen produk dan kategori produk tetap berjalan normal tanpa adanya regresi (data fetching, pagination, CRUD, filter, pencarian berjalan seperti semula).

## Constraints
- Hanya menghapus file store yang tidak terpakai, jangan mengubah logika bisnis, styling, atau routing yang sudah ada di modul tersebut.
- Pastikan tidak ada berkas/komponen lain di dalam `apps/web` yang mengimpor `useCategoriesStore` dari `product-categories` atau `useProductStore` dari `product-lists`.

## Out of Scope
- Migrasi logika fetching dari component ke Pinia (karena component-level state dan direct Axios fetch merupakan standar yang sudah berjalan baik di modul ini).
- Perubahan pada backend API (`apps/api`).

## Dependensi
- Tidak ada.
