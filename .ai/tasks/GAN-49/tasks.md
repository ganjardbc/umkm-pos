## Ticket: GAN-49

## Backend Tasks
- [x] BE-1: Ubah logic validasi di `TransactionsService.validatePayment` (`apps/api/src/transactions/transactions.service.ts`):
  - [x] Jika `paymentMethod === 'cash'`, ambil `cashReceivedInput` dan `totalAmount`.
  - [x] Hitung `expectedChange = Number((cashReceived - totalAmount).toFixed(2))`.
  - [x] Jika klien mengirim `changeAmountInput` dan nilainya tidak sama dengan `expectedChange` (dibulatkan dengan precision 2), lempar `BadRequestException('change_amount does not match cash_received - total_amount')`.
  - [x] Jika klien mengirim parameter `change_amount` kosong atau null, backend otomatis mengisi `changeAmount` dengan nilai `expectedChange` daripada melempar error wajib isi.
- [x] BE-2: Pastikan finalisasi pesanan di `TransactionsService.finalizeCustomerOrder` menggunakan service method `prepareTransactionPayload` yang telah mengaplikasikan validasi baru.

## Frontend Tasks
- [ ] FE-1: Pastikan komponen Cart POS (`apps/web/src/modules/transaction/components/Cart.vue`) tetap mengirim payload `cash_received` dan `change_amount` yang terhitung dari client (opsional, karena server akan memvalidasinya secara presisi).
- [ ] FE-2: Pastikan konfirmasi pembayaran di halaman list transaksi (`apps/web/src/modules/transaction/pages/index.vue` pada function `confirmPayment`) mengirimkan data dengan kalkulasi `change_amount` yang benar untuk divalidasi server.

## Shared Types Tasks
- Tidak ada perubahan tipe data (shared-types) karena field schema payload tetap sama.

## Docs Tasks
- Tidak ada perubahan format API contract atau database-design schema baru.
