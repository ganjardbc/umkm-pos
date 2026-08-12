## Ticket: diskon-per-item-saat-checkout
## Agent: backend & frontend
## Status: SUCCESS

## Attempt Log
- Attempt 1: PASS — Shared types, Prisma schema, NestJS service/DTO/tests, and Vue 3 Pinia POS store, Cart UI, Receipt printer/preview, Detail page updated and verified.

## Acceptance Criteria
- [x] Kasir dapat membuka modal/popover diskon pada setiap baris item produk di keranjang belanja (`Cart.vue`).
- [x] Tersedia 2 mode diskon: Persen (`%`, 0-100%) dan Nominal Tetap (`Rp`, 0 sampai batas kotor item).
- [x] Terdapat preview kalkulasi nilai diskon dan subtotal bersih item sebelum diterapkan ke keranjang.
- [x] Baris item di keranjang menampilkan badge diskon, coretan harga asli, dan subtotal bersih terpotong.
- [x] Total tagihan keranjang (`cartTotal`) dihitung reaktif berdasarkan akumulasi subtotal bersih setelah diskon.
- [x] Kasir dapat mereset atau menghapus diskon pada baris item untuk mengembalikan harga normal.
- [x] Mengubah kuantitas item (`qty +/-`) memperbarui kalkulasi diskon otomatis.
- [x] Payload `POST /api/v1/transactions` mengirimkan dan memproses `discount_type` dan `discount_value`.
- [x] Database `transaction_items` menyimpan `discount_type`, `discount_value`, dan `discount_amount`.
- [x] Validasi server-side memastikan persentase 0-100%, nominal <= gross subtotal, dan subtotal >= 0.
- [x] Struk bluetooth printer, HTML generator, dan ReceiptPreview menampilkan baris potongan diskon.
- [x] Halaman detail transaksi (`/transaction/detail/:id`) menampilkan kolom diskon dan rincian item.

## Quality Gate
- Backend Build (NestJS & Typecheck): PASS (`pnpm --filter umkm-pos-api build`)
- Backend Test (Jest): PASS (`pnpm --filter umkm-pos-api test` — 14 suites, 186 tests passed)
- Backend Lint (ESLint): PASS (`pnpm --filter umkm-pos-api lint`)
- Frontend Build (Vue-TSC & Vite): PASS (`pnpm --filter umkm-pos-app build`)
- Shared Types Build: PASS (`pnpm --filter @umkm-pos/shared-types build`)
- Multi-tenant scope & RBAC: PASS

## Files Changed
- `packages/shared-types/src/products/product.types.ts`
- `packages/shared-types/src/index.ts`
- `apps/api/prisma/schema.prisma`
- `apps/api/src/transactions/dto/create-transaction.dto.ts`
- `apps/api/src/transactions/transactions.service.ts`
- `apps/api/src/transactions/transactions.service.spec.ts`
- `apps/web/src/modules/transaction/stores-pos/state.ts`
- `apps/web/src/modules/transaction/stores-pos/getters.ts`
- `apps/web/src/modules/transaction/stores-pos/actions.ts`
- `apps/web/src/modules/transaction/components/Cart.vue`
- `apps/web/src/modules/transaction/components/ReceiptPreview.vue`
- `apps/web/src/modules/transaction/utils/receiptGenerator.ts`
- `apps/web/src/modules/transaction/utils/bluetoothPrinter.ts`
- `apps/web/src/modules/transaction/pages/detail.vue`
