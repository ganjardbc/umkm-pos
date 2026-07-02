## Ticket: PROD-101

## Backend Tasks
- (none — bug murni di frontend, `stock_qty` & `min_stock` sudah tersedia dari API existing `getListProduct` / `getDetailProduct`)

## Frontend Tasks
- [ ] FE-1: `apps/web/src/modules/product-lists/pages/index.vue` — perbaiki binding class kolom "Qty" (baris ~76-82).
  - Bug sekarang: `:class="slotProps.data.min_stock && 'text-primary-600'"` → warna primary muncul asal `min_stock` diisi (>0), gak peduli stok aman/tidak.
  - Fix: warning class HANYA kalau `stock_qty <= min_stock` DAN `min_stock > 0`. Kalau `min_stock` 0/null, gak ada warning.
  - Sarankan helper computed/method per-row, contoh:
    ```ts
    const isLowStock = (product: any) =>
      Number(product?.min_stock) > 0 && Number(product?.stock_qty) <= Number(product?.min_stock);
    ```
  - Terapkan warning class (mis. `text-orange-600` / severity warning, samakan token warna dgn dipakai di tempat lain — cek `design-system.md`) hanya di kolom Qty. Kolom "Min Stock" tidak perlu ikut2an warning (biarkan default, cocokkan ke AC no.3).
- [ ] FE-2: `apps/web/src/modules/product-lists/pages/detail.vue` — tambah indikator visual "Low Stock" di section "Product Information" (dekat field Stock Quantity / Minimum Stock, baris ~73-82).
  - Pakai kondisi sama seperti FE-1: `min_stock > 0 && stock_qty <= min_stock`.
  - Gunakan komponen `Tag` (sudah dipakai di file ini untuk Status) dengan `severity="warn"` (atau severity warning yang konsisten dgn PrimeVue theme project) dan label "Low Stock".
  - Tag muncul di sebelah/bawah field Stock Quantity, tampil hanya kalau kondisi low stock true — jangan render apapun kalau stok aman.
- [ ] FE-3 (opsional, cek dulu): kalau ada komponen/helper severity warna stok yang reusable dipakai modul lain (mis. product/product-lists lain), taruh logic `isLowStock` di helper shared (mis. `apps/web/src/modules/product-lists/helpers/` kalau ada, atau file lokal per page kalau belum ada folder helpers) biar gak duplicate antara index.vue dan detail.vue.

## Shared Types Tasks
- (none — tidak ada perubahan kontrak API/tipe)

## Docs Tasks
- (none — tidak ada perubahan API contract atau schema DB)
