## Audit: 2026-07-10
## Agent: manual (derived from HOTFIX-RBAC-CROSS-TENANT session, bukan run auditor.md)
## Scope: apps/api/src/rbac

## Ringkasan

Selama hotfix `assignRoleToUser`/`revokeRoleFromUser` (cross-tenant privilege escalation,
sudah SUCCESS), Claude Code menemukan 4 temuan tambahan di modul RBAC yang sengaja tidak
dimasukkan ke scope hotfix (blast radius dijaga kecil). Ditulis di sini dalam format standar
audit-report.md supaya bisa diproses lewat `/audit-to-ticket` seperti hasil scan Auditor Agent
biasa.

## Temuan Prioritas (max 5)

### 1. [SECURITY] Cross-tenant read di getUserRoles tanpa permission guard
- **Lokasi:** `apps/api/src/rbac/rbac.service.ts` (fungsi `getUserRoles`), endpoint
  `GET /rbac/users/:userId/roles`
- **Masalah:** Dua masalah bertumpuk — (a) permission guard di-comment di controller untuk
  endpoint ini, (b) query tidak ada validasi bahwa `userId` target berada di
  outlet/merchant yang sama dengan caller. Sama persis pola root cause dengan
  `assignRoleToUser` yang baru di-hotfix, tapi arah read bukan write.
- **Dampak:** User dengan JWT valid (role apapun) bisa lihat role assignment user di
  merchant lain — information disclosure cross-tenant.
- **Usulan:** Uncomment `@RequirePermission('role.read')` di controller; tambah validasi
  merchant scope di service (pola sama seperti `assertOutletBelongsToMerchant` yang baru
  dibuat di hotfix RBAC).

### 2. [SECURITY] Guard di-comment di GET /rbac/roles dan GET /rbac/permissions
- **Lokasi:** `apps/api/src/rbac/rbac.controller.ts` (endpoint `GET /rbac/roles` dan
  `GET /rbac/permissions`)
- **Masalah:** `@RequirePermission(...)` di-comment di kedua endpoint ini — ditemukan saat
  audit awal (bukan bagian scope hotfix `role.assign`).
- **Dampak:** Siapapun dengan JWT valid, tanpa permission apapun, bisa list semua role dan
  permission yang ada di sistem. Bukan cross-tenant data leak (roles/permissions global,
  lihat Temuan Non-Prioritas), tapi tetap information disclosure yang tidak seharusnya
  terbuka bebas.
- **Usulan:** Uncomment kedua guard, tentukan permission minimum yang sesuai (kemungkinan
  `role.read`), verifikasi tidak ada UI/flow internal yang bergantung ke endpoint ini
  tanpa permission (cek dulu sebelum enable, supaya tidak accidentally break existing flow).

### 3. [CONVENTION] Guard-level scope-check belum ada (@ScopeByOutlet decorator)
- **Lokasi:** `apps/api/src/rbac/permission.guard.ts`
- **Masalah:** Validasi merchant/outlet scope sekarang cuma ada inline di 2 fungsi service
  (`assignRoleToUser`, `revokeRoleFromUser`), bukan generic di level guard. Kalau ada
  endpoint baru dengan pola serupa (terima `outlet_id` dari body/param), risikonya berulang
  kalau developer lupa tambah validasi manual.
- **Dampak:** Maintainability/risk jangka panjang — bukan vulnerability aktif sekarang,
  tapi pola yang gampang terulang.
- **Usulan:** Desain decorator generic `@ScopeByOutlet('outlet_id')` yang dipasang di
  `permission.guard.ts`, dipakai declaratively di endpoint yang butuh (termasuk retrofit ke
  `assignRoleToUser`/`revokeRoleFromUser` supaya validasi pindah dari inline ke guard).
  Task arsitektural, bukan hotfix — jangan sentuh guard yang dipakai puluhan endpoint lain
  tanpa test coverage penuh dulu.

## Temuan Non-Prioritas (dicatat, tidak diusulkan jadi task)

- Tabel `roles`/`permissions` global (tidak ada `merchant_id` di schema) — bukan bug, tapi
  keputusan arsitektur produk multi-tenant yang worth didiskusikan sebagai ADR terpisah,
  bukan task perbaikan urgent.

## Catatan

- Temuan 1 dan 2 sebaiknya masuk sprint terdekat — exposure aktif, fix-nya tidak besar.
- Temuan 3 butuh diskusi desain dulu sebelum jadi ticket implementasi (decorator API seperti
  apa, bagaimana extract `outlet_id` secara generic dari berbagai bentuk request body/param).
- Semua 3 temuan prioritas ada di modul yang sama (`rbac`) — pertimbangkan digabung jadi 1
  epic/project di Linear daripada 3 ticket lepas, supaya history-nya mudah ditelusuri.