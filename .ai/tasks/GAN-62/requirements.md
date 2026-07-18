## Ticket: GAN-62
## Status: PLAN

## Deskripsi
Mencegah kerentanan keamanan cross-tenant pada penugasan role dengan memvalidasi bahwa `user_id` yang dikirim dalam request body benar-benar milik merchant yang sama dengan caller (diperoleh dari JWT). Validasi ini harus diterapkan pada saat pemberian role (`assignRoleToUser`) maupun pencabutan role (`revokeRoleFromUser`).

## Acceptance Criteria
- [ ] API `POST /api/rbac/user-roles` (`assignRoleToUser`) memvalidasi `dto.user_id` milik merchant yang sama dengan caller (`merchant_id` dari JWT).
- [ ] API `DELETE /api/rbac/user-roles` (`revokeRoleFromUser`) memvalidasi `dto.user_id` milik merchant yang sama dengan caller (`merchant_id` dari JWT).
- [ ] Jika `user_id` tidak ditemukan atau tidak berada di bawah merchant yang sama dengan caller, API melempar `NotFoundException` dengan pesan yang sesuai (misal: `User not found or does not belong to your merchant`).
- [ ] Service unit tests di `apps/api/src/rbac/rbac.service.spec.ts` diperbarui untuk mencakup skenario validasi `user_id` milik merchant (baik skenario sukses maupun gagal).

## Constraints
- Multi-tenant: `merchant_id` HARUS diambil dari JWT caller (`@CurrentUser('merchant_id')`), bukan dari input client.
- Menggunakan `NotFoundException` ketika user tidak ditemukan atau tidak sesuai merchant untuk mencegah enumerasi user lintas tenant.

## Out of Scope
- Modifikasi endpoint/fitur lain di modul RBAC selain penugasan/pencabutan role user (`user-roles`).
- Perubahan database schema atau migrasi.

## Dependensi
- Tidak ada.
