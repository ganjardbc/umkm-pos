## Ticket: GAN-48
## Status: PLAN

## Deskripsi
Mencegah kerentanan keamanan cross-tenant/cross-outlet dengan memvalidasi parameter `outlet_id` pada transaksi di API transactions. API harus memverifikasi bahwa outlet yang diminta merupakan milik merchant pengguna (dari JWT) dan pengguna memiliki akses terasosiasi ke outlet tersebut (kecuali untuk role owner yang mendapatkan akses merchant-wide).

## Acceptance Criteria
- [ ] Modifikasi API `GET /transactions` untuk membatasi list transaksi hanya pada outlet-outlet yang diperbolehkan bagi user. Jika user menyertakan `outlet_id` di query parameter, periksa kepemilikan merchant dan otorisasi user ke outlet tersebut. Jika tidak disertakan, kembalikan hanya transaksi dari outlet yang di-assign ke user.
- [ ] Modifikasi API `POST /transactions` untuk menolak request dengan status 403 Forbidden jika user tidak memiliki akses/role pada `outlet_id` yang dikirim di body payload.
- [ ] Modifikasi API `GET /transactions/:id`, `POST /transactions/:id/cancel`, dan `PATCH /transactions/:id/status` untuk memastikan transaksi yang dicari berada di outlet yang diperbolehkan bagi user. Jika transaksi berada di outlet lain yang tidak dapat diakses user, kembalikan status 404 Not Found atau 403 Forbidden.
- [ ] Otorisasi outlet-level dilewati/diberikan secara penuh untuk user dengan role `owner` pada merchant tersebut.

## Constraints
- Multi-tenant: `merchant_id` wajib diverifikasi dari JWT/`request.user`, tidak boleh dipercaya dari client input.
- Validasi outlet wajib membedakan role `owner` (akses merchant-wide ke seluruh outlet merchant) dan role non-owner (akses terbatas pada outlet yang di-assign di tabel `user_roles`).
- Tidak mengubah kontrak request/response API (hanya menambahkan layer validasi dan filter server-side).

## Out of Scope
- Migrasi database schema atau perubahan model prisma.
- Fitur frontend UI untuk pergantian outlet (sudah diimplementasikan dengan `APP_ACTIVE_OUTLET`).
- Validasi outlet pada modul non-transaksi (seperti products atau stock) karena di luar scope ticket.

## Dependensi
- JWT authentication dan database model `user_roles` sudah tersedia di codebase.
