## Ticket: GAN-68
## Agent: reviewer
## Verdict: APPROVE

## Security Audit

### Multi-tenant scope: PASS
Semua handler di `users.controller.ts` menerima `merchantId` dari `@CurrentUser('merchant_id')` (JWT), tidak pernah dari body/DTO/query. `users.service.ts` konsisten scope semua query Prisma dengan `merchant_id` (`findAll` L39, `findOne` L65, `create` L85/93/109, `update` L137/147). Tidak berubah oleh ticket ini — sesuai constraint.

### RBAC coverage: PASS
Ketujuh handler di `users.controller.ts` sekarang punya `@RequirePermission`:
- `POST /users` → `user.create` (L35)
- `GET /users` → `user.read` (L51, **fix ticket ini**)
- `GET /users/:id` → `user.read` (L65)
- `PATCH /users/:id` → `user.update` (L77)
- `DELETE /users/:id` → `user.delete` (L95)
- `PATCH /users/:id/avatar` → `user.update` (L108)
- `DELETE /users/:id/avatar` → `user.update` (L122)

Tidak ada `@Public()` di controller ini. Guard order aman: `JwtAuthGuard` global (`APP_GUARD`) berjalan sebelum `PermissionGuard` per-controller (`@UseGuards(PermissionGuard)` L30), jadi `request.user` sudah terisi saat `PermissionGuard.canActivate` jalan.

### DTO validation: PASS
`@Body()` di `create`, `update`, `setAvatar` semuanya pakai DTO class (`CreateUserDto`, `UpdateUserDto`, `SetUserAvatarDto`) — tidak ada `body: any`. Tidak tersentuh oleh diff ticket ini.

### Public route exposure: N/A
Tidak ada `@Public()` di modul `users` — tidak relevan untuk ticket ini.

### Raw SQL: PASS
Tidak ada `$queryRaw`/`$executeRaw` di `apps/api/src/users/`.

### Lain-lain
- `new PrismaClient()`: tidak ditemukan — `PrismaService` di-inject via constructor, sesuai konvensi.
- Secret/password logging: tidak ditemukan.
- Hardcoded credentials/URL: hanya `https://example.com/avatar.png` di Swagger `@ApiProperty example` pada DTO — bukan credential nyata, aman.
- Transaction usage: `findAll` sudah pakai `this.prisma.$transaction([...])` untuk count+data query (L41) — tidak berubah oleh ticket ini, pola sudah benar sebelumnya.

## Diff Verification
`git diff HEAD` scope perubahan:
- `apps/api/src/users/users.controller.ts` — **+1 baris**: `@RequirePermission('user.read')` di L51, tepat setelah `@Get()` (L50) dan sebelum `@ApiOperation` (L52). Identik pola penempatan dengan `findOne()` (L64-66). Tidak ada perubahan signature/parameter method apa pun.
- `apps/api/src/users/users.controller.spec.ts` (baru) — test controller-level (metadata reflection) + guard-level (`PermissionGuard.canActivate` langsung) untuk membuktikan 403 tanpa `user.read` dan `true`/200-path dengan `user.read`. Test terisolasi (unit), tidak ada e2e HTTP penuh melalui supertest — konsisten dengan pola test existing project (tidak ada e2e-spec per-modul, mis. `scope-by-outlet.guard.spec.ts`).
- `docs/api/api-contract.md` — DOC-1: menambah section "Required Permissions" untuk semua 7 endpoint `/users`, termasuk dua endpoint avatar yang sebelumnya tidak tercantum sama sekali di listing route (`PATCH/DELETE /users/:id/avatar`). Isi akurat dan konsisten dengan kode controller — perbaikan dokumentasi yang bermanfaat, sedikit melebihi scope literal DOC-1 (yang hanya minta update entry `GET /users`) tapi tidak melanggar constraint apa pun dan meningkatkan kelengkapan dokumen secara wajar.
- `apps/api/src/rbac/rbac.service.spec.ts` — 1 baris whitespace (menambah newline di akhir file), tidak fungsional, tidak terkait ticket. Non-issue, kemungkinan efek samping formatter/lint --fix.

## Kualitatif Review

### Blocker (harus diperbaiki sebelum PR)
Tidak ada.

### Non-blocker (bisa dibuka issue terpisah)
1. Tidak ada full e2e HTTP test (supertest) yang membuktikan status code literal 403/200 melalui pipeline routing NestJS penuh (`JwtAuthGuard` → `PermissionGuard` → controller → service). Test saat ini unit-level (guard di-drive langsung dengan mock `ExecutionContext`, dan controller method dites terpisah dari guard). Ini logically equivalent dan konsisten dengan pola test existing di proyek — dicatat sebagai gap coverage untuk masa depan, bukan blocker ticket ini.
2. Temuan requirements.md (out of scope): kemungkinan ada endpoint lain di codebase dengan pola silent-missing `@RequirePermission` serupa (guard default "allow" saat metadata tidak ada adalah desain yang secara inheren rawan silent-gap seperti ini). Disarankan audit terpisah lintas modul di ticket lain — tidak diaudit di sini karena scope ticket eksplisit dibatasi ke `users.controller.ts`.

### Positif (untuk referensi)
- Diff sangat minimal dan presisi (1 baris fix), tepat sesuai constraint ticket "perubahan dibatasi pada users.controller.ts" — tidak ada scope creep pada kode produksi.
- Placement decorator konsisten sempurna dengan pola sibling handler (`findOne`) — memudahkan review dan konsisten dengan konvensi file.
- Test baru mencakup dua level pembuktian yang saling melengkapi (metadata reflection + guard behavior langsung), cukup kuat untuk membuktikan fix tanpa infrastruktur e2e baru.
- Update `docs/api/api-contract.md` menambahkan section "Required Permissions" yang sebelumnya tidak ada sama sekali untuk modul users — good catch, meningkatkan kegunaan dokumen untuk developer lain, dan turut menutup gap dokumentasi endpoint avatar yang sebelumnya tidak tercantum di listing route.

## Verdict Rationale

Semua acceptance criteria terpenuhi dengan bukti file:line jelas; security audit (multi-tenant scope, RBAC coverage, DTO validation) PASS di seluruh modul `users`; diff produksi minimal dan tepat sasaran (1 baris) tanpa menyentuh service/DTO/schema sesuai constraint; quality gate (build/lint/test) hijau menurut verify-report dan qa-report; tidak ada temuan 🔴/🟡 yang menghalangi PR.

## Untuk Developer

Tidak ada tindakan wajib. Opsional (non-blocking, bisa jadi ticket terpisah): tambah e2e-spec HTTP penuh untuk modul `users` jika/ketika proyek mulai mengadopsi pola e2e per-modul, dan buka audit ticket terpisah untuk memindai controller lain yang mungkin punya pola silent-missing `@RequirePermission` yang sama.
