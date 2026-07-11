## Ticket: GAN-49
## Status: PLAN

## Deskripsi
Backend harus menghitung ulang (recompute) dan memvalidasi nilai `change_amount` berdasarkan `cash_received` dan `total_amount` secara server-side pada input transaksi baru maupun update status transaksi (khusus metode pembayaran 'cash'). Jangan mempercayai input `change_amount` secara mentah-mentah dari klien.

## Acceptance Criteria
- [ ] Backend memvalidasi field `cash_received` dan menghitung ulang `change_amount` untuk semua pembayaran cash (`payment_method === 'cash'`).
- [ ] Di method `create` (POS / customer order) dan `updateStatus` (saat order status diselesaikan), backend harus menghitung `expectedChange = cash_received - total_amount` (server-side total).
- [ ] Jika klien mengirim `change_amount` yang tidak sesuai dengan hasil perhitungan server-side (selisih di luar pembulatan desimal standard / `.toFixed(2)`), sistem harus mengembalikan `BadRequestException` dengan pesan validasi yang jelas.
- [ ] Jika klien tidak mengirimkan `change_amount`, backend secara otomatis mengisi nilai tersebut berdasarkan perhitungan server-side.
- [ ] Data struk cetak (modal atau print) di frontend harus merefleksikan nilai valid dari server-side database.

## Constraints
- Multi-tenant: `merchant_id` HARUS diverifikasi dari JWT token di controller/service context.
- Skema database (MySQL + Prisma) tidak berubah, field `cash_received` dan `change_amount` tetap ada.
- Presisi nilai uang menggunakan `.toFixed(2)` sebelum komparasi untuk mencegah isu rounding float.

## Out of Scope
- Penambahan tipe payment method baru di luar yang sudah ada.
- Integrasi payment gateway otomatis (semua cash/manual calculation tetap dipertahankan).

## Dependensi
- File `transactions.service.ts` yang menangani flow POS commit dan finalisasi order customer.
