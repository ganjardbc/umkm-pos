## Ticket: GAN-52

## Backend Tasks
*Tidak ada perubahan backend.*

## Frontend Tasks
- [x] FE-1: Edit file `apps/web/src/modules/product-categories/router/index.ts`
  - Pada route `${PREFIX_ROUTE_NAME}-edit` (edit kategori): ubah item breadcrumb terakhir ("Edit") agar menghapus property `route` (atau diset kosong `""`) dan pertahankan `isActive: true`.
  - Pada route `${PREFIX_ROUTE_NAME}-detail` (detail kategori): ubah item breadcrumb terakhir ("Detail") agar menghapus property `route` (atau diset kosong `""`) daripada mengarah ke `/create`, dan pertahankan `isActive: true`.
- [x] FE-2: Edit file `apps/web/src/modules/product-lists/router/index.ts`
  - Pada route `${PREFIX_ROUTE_NAME}-edit` (edit produk): ubah item breadcrumb terakhir ("Edit") agar menghapus property `route` (atau diset kosong `""`) dan pertahankan `isActive: true`.
  - Pada route `${PREFIX_ROUTE_NAME}-detail` (detail produk): ubah item breadcrumb terakhir ("Detail") agar menghapus property `route` (atau diset kosong `""`) dan pertahankan `isActive: true`.

## Shared Types Tasks
*Tidak ada perubahan shared-types.*

## Docs Tasks
*Tidak ada perubahan dokumentasi.*
