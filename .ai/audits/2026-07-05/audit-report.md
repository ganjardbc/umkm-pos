## Audit: 2026-07-05
## Agent: auditor
## Scope: full repo (apps/api focus — RBAC + merchant_id scoping per CLAUDE.md invariant)

## Ringkasan

Global `JwtAuthGuard` + `PermissionGuard` pattern dipatuhi konsisten di 19/20 controller. Tapi ketemu 2 celah RBAC nyata (guard di-comment), 1 cross-tenant data leak di uploads module, dan gap test coverage besar di modul security-critical (auth, rbac, users, merchants, outlets — 0 spec file). Tidak ada raw SQL (`$queryRaw`/`$executeRaw`), tidak ada TODO/FIXME/HACK tersisa di kode.

## Temuan Prioritas (5)

### 1. [SECURITY] Cross-tenant file access — uploads module tanpa ownership/merchant check
- **Lokasi:** `apps/api/src/uploads/uploads.service.ts:62-84` (`findById`, `generateSignedUrl`, `delete`), dipanggil dari `apps/api/src/uploads/uploads.controller.ts:68,81,94`
- **Masalah:** Query `prisma.uploads.findUnique({ where: { id } })` cuma pakai `id` dari URL param — tidak ada filter `merchant_id`/`uploaded_by_id` sama sekali. User A di Merchant X yang punya permission `upload.read`/`upload.delete` bisa akses/hapus/generate signed-url file merchant lain cukup tebak/tahu UUID.
- **Dampak:** Pelanggaran langsung invariant "every query must scope by merchant_id" (ADR-003). Bisa bocorin foto produk/dokumen merchant lain, atau delete file cross-tenant.
- **Usulan:** Tambah kolom relasi (merchant_id atau uploaded_by_id check) di query + validasi di service sebelum return/delete.

### 2. [SECURITY] RBAC guard di-comment — endpoint role/permission data tanpa access control
- **Lokasi:** `apps/api/src/rbac/rbac.controller.ts:50` (`GET /rbac/roles`, `// @RequirePermission('role.read')`) dan `:189` (`GET /rbac/users/:userId/roles`, `// @RequirePermission('role.read')`)
- **Masalah:** Decorator permission di-comment out, cuma proteksi global `JwtAuthGuard`. Semua user authenticated (level cashier sekalipun) bisa list semua role+permission sistem dan lihat role assignment user manapun (termasuk userId user lain, tanpa cek merchant).
- **Dampak:** Bocor struktur RBAC internal + data role assignment lintas user/merchant ke role rendah. Kemungkinan sisa debug/dev bypass yang lupa di-restore.
- **Usulan:** Uncomment `@RequirePermission('role.read')` di kedua endpoint, tambah cek merchant scoping utk `getUserRoles`.

### 3. [SECURITY] `assignRoleToUser` tanpa validasi merchant/outlet ownership
- **Lokasi:** `apps/api/src/rbac/rbac.service.ts:214-239` (`assignRoleToUser`), dipanggil `apps/api/src/rbac/rbac.controller.ts:169-178`
- **Masalah:** `dto.outlet_id` dan `dto.user_id` dari client body diterima mentah, tidak divalidasi apakah outlet tsb milik merchant si pemanggil (`CurrentUser`). Tidak ada `merchant_id` di path service ini sama sekali.
- **Dampak:** User dengan permission `role.assign` di Merchant A berpotensi assign role ke user/outlet milik Merchant B (privilege escalation lintas tenant) — bertentangan ADR-003.
- **Usulan:** Tambah verifikasi outlet_id & user_id berada di merchant yang sama dengan `CurrentUser('merchant_id')` sebelum create `user_roles`.

### 4. [COVERAGE] Modul security-critical tanpa unit test sama sekali
- **Lokasi:** `apps/api/src/auth/auth.service.ts`, `apps/api/src/rbac/rbac.service.ts`, `apps/api/src/users/users.service.ts`, `apps/api/src/merchants/merchants.service.ts`, `apps/api/src/outlets/outlets.service.ts` — tidak ada `*.service.spec.ts` sama sekali (12 spec file total utk 23 service file)
- **Masalah:** Modul yang paling sensitif terhadap invariant multi-tenant (auth, rbac, users, merchants, outlets) justru nol test. Temuan #1-#3 di atas kemungkinan besar sudah lolos karena tidak ada regression test yang cek merchant scoping.
- **Dampak:** Regresi security/data-integrity di modul inti tidak akan tertangkap CI.
- **Usulan:** Prioritaskan spec baru utk `rbac.service.ts` (cover cross-tenant assign) dan `auth.service.ts` dulu, baru users/merchants/outlets.

### 5. [CONVENTION] `notifications.service.ts` findOne tidak validasi merchant, hanya user_id
- **Lokasi:** `apps/api/src/notifications/notifications.service.ts:29-36`
- **Masalah:** `findOne` fetch by `id` global lalu cek `user_id`/`outlet_id` cocok — kalau match bisa proceed. Tidak cek merchant_id eksplisit (mengandalkan asumsi user_id unik per merchant, tidak eksplisit didokumentasikan sebagai invariant yang aman).
- **Dampak:** Rendah selama user_id benar-benar tidak overlap antar merchant, tapi menyimpang dari pola eksplisit `merchant_id` scoping yang dipakai modul lain — inkonsistensi konvensi, rawan salah tiru pola ini ke modul baru.
- **Usulan:** Tambah `merchant_id` eksplisit di where clause utk konsisten dgn pola modul lain, meski risiko aktual rendah.

## Temuan Non-Prioritas (dicatat, tidak diusulkan jadi task)

- `apps/api/src/database/prisma.service.ts`, `rbac.service.ts` (roles/permissions definitions), `notifications.service.ts`, `uploads/s3-config.service.ts` masuk daftar "no merchant_id" grep — sebagian legitimate (roles/permissions global by design), sudah dibedah di atas.
- `app.controller.ts` root health-check endpoint (`GET /`) tanpa `@Public()` — otomatis protected oleh global JwtAuthGuard, jadi health check butuh JWT. Bukan security issue, tapi ganjil buat health check konvensional.
- 6 service lain tanpa spec (`metrics`, `settings`, `transaction_items`, `customer-catalog`, `store-tables`, `reports`, `common/excel-export`) — coverage gap tapi risiko lebih rendah dari #4.
- Modul `sync` disebut di memory project-overview tapi tidak ditemukan di `apps/api/src/` saat ini — kemungkinan memory usang (17 hari), bukan bug.
- Tidak ditemukan TODO/FIXME/HACK/XXX di apps/ dan packages/.
- Tidak ditemukan raw SQL (`$queryRaw`/`$executeRaw`).

## Catatan

Temuan #1-#3 butuh keputusan: apakah upload/role assignment memang harus strict per-merchant, atau ada kasus legit superadmin lintas-merchant (perlu klarifikasi ADR-003 scope exception kalau ada). Sebelum jadi ticket, cek dulu apakah ada middleware/interceptor lain (di luar service/controller yang diperiksa) yang menutup gap ini — audit ini baca kode statis, belum trace runtime.
