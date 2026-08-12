## Ticket: diskon-per-item-saat-checkout

## Backend Tasks
- [ ] BE-1: [Schema & Prisma Migration: Tambahkan kolom `discount_type`, `discount_value`, dan `discount_amount` pada model `transaction_items` di `apps/api/prisma/schema.prisma` dan buat script migrasi SQL]
- [ ] BE-2: [DTO Update: Update `TransactionItemInputDto` di `apps/api/src/transactions/dto/create-transaction.dto.ts` dengan properti `discount_type` ('percentage' | 'fixed' | null) dan `discount_value` (number | null) beserta class-validator rules]
- [ ] BE-3: [Service Calculation & Validation: Update `prepareTransactionPayload` di `apps/api/src/transactions/transactions.service.ts` untuk memvalidasi diskon persen (0-100), nominal (<= gross subtotal), menghitung `discount_amount`, `subtotal` bersih per item, dan total transaksi]
- [ ] BE-4: [Unit Test Update: Tambahkan/perbarui test cases di `apps/api/src/transactions/transactions.service.spec.ts` untuk kalkulasi diskon per-item (persen, fixed nominal, zero discount, validation error)]

## Frontend Tasks
- [ ] FE-1: [Store POS Update: Perbarui interface `CartItem` di `apps/web/src/modules/transaction/stores-pos/state.ts`, aksi penambahan/modifikasi diskon di `actions.ts`, serta kalkulasi `cartTotal` di `getters.ts`]
- [ ] FE-2: [Cart Item Discount UI: Tambahkan tombol diskon, badge potongan diskon, dialog/modal modal input diskon per-item (% dan Rp), validasi interaktif, dan tombol reset diskon pada `apps/web/src/modules/transaction/components/Cart.vue`]
- [ ] FE-3: [Checkout Payload & Payment Modal: Sesuaikan pemetaan payload saat submit order di `Cart.vue` dan `PaymentModal.vue` agar mengirimkan `discount_type` dan `discount_value`]
- [ ] FE-4: [Receipt & Print Template: Perbarui `apps/web/src/modules/transaction/utils/receiptGenerator.ts`, `bluetoothPrinter.ts`, dan `ReceiptPreview.vue` untuk merender baris diskon per item jika ada]
- [ ] FE-5: [Detail Transaksi Page: Perbarui `apps/web/src/modules/transaction/pages/detail.vue` agar menampilkan kolom potongan diskon per item dan ringkasan diskon item pada tabel detail transaksi]

## Shared Types Tasks
- [ ] ST-1: [Definisikan enum/type `DiscountType` ('percentage' | 'fixed') dan field diskon item transaksi di `packages/shared-types`]

## Docs Tasks
- [ ] DOC-1: [Perbarui `docs/api/api-contract.md` pada section `POST /api/v1/transactions` dan response `GET /api/v1/transactions/:id` dengan field diskon item]
- [ ] DOC-2: [Perbarui `docs/database/database-design.md` pada section tabel `transaction_items` mencatat kolom diskon]
