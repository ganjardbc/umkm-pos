## Ticket: GAN-42
## Agent: reviewer
## Verdict: APPROVE

> Run ke-2 (setelah backend agent fix rbac.service.spec.ts berdasarkan CHANGES REQUESTED sebelumnya).

---

## Security Audit

### Multi-tenant scope: PASS
`merchant_id` eksklusif dari `request.user.merchant_id` (JWT) di `scope-by-outlet.guard.ts:53`.
Tidak ada titik di mana `merchant_id` dibaca dari body/params/query. Constraint terpenuhi.

### RBAC coverage: PASS (untuk scope GAN-42)
Endpoint yang diretrofit:
- `POST /rbac/user-roles` (line 171): `@RequirePermission('role.assign')` ✅ + `@ScopeByOutlet` ✅ + `@UseGuards(ScopeByOutletGuard)` ✅
- `DELETE /rbac/user-roles` (line 190): `@RequirePermission('role.assign')` ✅ + `@ScopeByOutlet` ✅ + `@UseGuards(ScopeByOutletGuard)` ✅

Pre-existing di luar scope GAN-42 (tidak berubah oleh ticket ini):
- `GET /rbac/roles` (line 51): `@RequirePermission` di-comment — pre-existing
- `GET /rbac/permissions` (line 109): `@RequirePermission` di-comment — pre-existing
- `GET /rbac/users/:userId/roles` (line 205): `@RequirePermission` di-comment — pre-existing

### DTO validation: PASS
Semua `@Body()` menggunakan typed DTO class. Tidak ada `body: any`.

### Public route exposure: PASS (tidak ada @Public() di scope GAN-42)
Tidak ada `@Public()` ditemukan di `rbac/` maupun guard baru.

### Raw SQL: PASS
Tidak ada `$queryRaw`/`$executeRaw`.

### Secret/credentials: PASS
Tidak ada console.log password/token. Tidak ada hardcoded credential.

### Service Prisma injection: PASS
`PrismaService` diinject via constructor DI di guard dan service. Tidak ada `new PrismaClient()`.

---

## Kualitatif Review

### Blocker (harus diperbaiki sebelum PR)
_Tidak ada._

Blocker dari run sebelumnya (`rbac.service.spec.ts` stale) sudah diperbaiki. File spec di disk sekarang:
- Tidak ada `merchantA`/`merchantB` constants
- Tidak ada `outlets: { findUnique: jest.fn() }` di `mockPrisma`
- Tidak ada 3-arg call ke `assignRoleToUser`
- Tidak ada 2-arg call ke `revokeRoleFromUser`
- Tidak ada `ForbiddenException` test di service spec (dipindah ke guard spec)
- Comment eksplisit `// Outlet cross-tenant check is now handled by ScopeByOutletGuard, not service` — baik untuk pembaca.

### Non-blocker (bisa dibuka issue terpisah)

1. **`scope-by-outlet.guard.ts:53` — no null-safety pada `request.user`** — 🔵
   
   Jika guard keliru dipasang dengan `@Public()` di masa depan, `request.user` akan `undefined` → unhandled `TypeError` → 500.
   Saat ini safe karena global `JwtAuthGuard` run duluan dan semua rbac endpoints non-public.
   Defensive fix sederhana:
   ```typescript
   if (!request.user?.merchant_id) {
     throw new UnauthorizedException('User context not available');
   }
   ```

2. **`ScopeByOutletGuard` hanya di `RbacModule` providers** — 🔵
   
   Guard utilitas lintas-modul. Jika modul lain butuh `@ScopeByOutlet`, perlu tambah ke providers mereka atau pindahkan guard ke `CommonModule` dengan `exports`. Bukan blocker karena scope GAN-42 hanya rbac, tapi perlu diantisipasi sebelum dipakai di modul lain.

3. **Pre-existing: 3 endpoint RBAC tanpa `@RequirePermission`** — 🟡 (out of scope GAN-42)
   
   `GET /rbac/roles`, `GET /rbac/permissions`, `GET /rbac/users/:userId/roles` — guard di-comment. 
   Selain itu `getUserRoles` di service tidak scope by `merchant_id` → cross-tenant data leak potensial.
   Sudah ditracking sebagai audit item terpisah per requirements.md. Buka ticket baru.

### Positif (untuk referensi)

- **Guard no-op pattern**: `if (!fieldPath) return true` — benar dan bersih. Guard aman di-register di module tanpa decorator.
- **`fieldPath` dot-notation parsing** — `split('.')` sederhana, support `body`/`params`/`query` dengan kode minimal. Tidak over-engineered.
- **`scope-by-outlet.guard.spec.ts`** — 5 TC solid dengan path coverage penuh. Mock isolasi baik (direct `new Guard()`, bukan `TestingModule`). Pola ini bagus jadi referensi unit test guard.
- **Service signature cleanup** — `assignRoleToUser(dto, assignedBy)` dan `revokeRoleFromUser(dto)`. Separation of concerns tercapai: guard handle ownership, service handle business logic murni.
- **Comment di spec** `// Outlet cross-tenant check is now handled by ScopeByOutletGuard` — komunikasi intent yang baik untuk pembaca spec di masa depan.
- **`AssignRoleDto` pakai `@IsUUID()`** di semua ID field — tepat, lebih ketat dari `@IsString()`.
- **CLAUDE.md updated** dengan entri `@ScopeByOutlet` dan `ScopeByOutletGuard` — dokumentasi inline terjaga.

---

## Verdict Rationale

Blocker dari review sebelumnya (spec stale) sudah diperbaiki dengan benar. `rbac.service.spec.ts` sekarang bersih: signatures benar, stale merchant-scope tests dihapus, mock setup konsisten dengan behavior service terbaru. Implementasi core (decorator, guard, retrofit controller+service, module registration) sudah benar sejak awal dan tidak ada regresi dari fix. Non-blocker yang tersisa adalah defensive improvement dan pre-existing issue yang di luar scope GAN-42.

---

## Untuk Developer

Tidak ada perubahan wajib. Siap PR.

Buka issue terpisah untuk:
1. `scope-by-outlet.guard.ts` — tambah null-safety check pada `request.user` sebelum line 53.
2. `ScopeByOutletGuard` — pertimbangkan pindahkan ke `CommonModule` + `exports` sebelum dipakai lintas modul.
3. Pre-existing: `GET /rbac/roles`, `GET /rbac/permissions`, `GET /rbac/users/:userId/roles` — uncomment `@RequirePermission` dan tambah `merchant_id` scope di `getUserRoles` service.
