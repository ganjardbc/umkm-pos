## Ticket: GAN-48

## Backend Tasks
- [x] BE-1: Tambahkan method helper `getAllowedOutletIds(userId: string, merchantId: string): Promise<string[]>` di `TransactionsService` untuk mengambil daftar outlet yang berhak diakses oleh user (seluruh outlet merchant untuk role `owner`, atau hanya outlet yang terdaftar di `user_roles` untuk non-owner).
- [x] BE-2: Update method `findAll` di `TransactionsService` untuk menerima argument `userId: string`, memvalidasi query parameter `outlet_id` terhadap `getAllowedOutletIds`, dan memfilter query database menggunakan daftar outlet yang diperbolehkan.
- [x] BE-3: Update controller handler `findAll` di `TransactionsController` untuk meloloskan `userId` (menggunakan decorator `@CurrentUser('id')`) ke service method `findAll`.
- [x] BE-4: Update method `createPosTransaction` / `prepareTransactionPayload` di `TransactionsService` untuk memastikan user terdaftar di outlet (`dto.outlet_id`) yang dikirim dari payload transaksi (kecuali jika user adalah `owner`).
- [x] BE-5: Update method `findOne` di `TransactionsService` untuk menerima argument `userId: string` dan membatasi pencarian transaksi hanya pada outlet yang diperbolehkan bagi user (`outlet_id: { in: allowedOutletIds }`).
- [x] BE-6: Update controller handler `findOne` di `TransactionsController` untuk meloloskan `userId` ke service method `findOne`.
- [x] BE-7: Update method `cancel` di `TransactionsService` untuk menggunakan filter `allowedOutletIds` saat mencari transaksi sebelum pembatalan dilakukan.
- [x] BE-8: Update service method `updateStatus` di `TransactionsService` agar meloloskan `userId` saat memanggil `findOne`.

## Frontend Tasks
- (none)

## Shared Types Tasks
- (none)

## Docs Tasks
- (none)

## Skip Agents
- frontend: Perubahan hanya terjadi di backend untuk memvalidasi input outlet_id dari client.
