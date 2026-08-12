## Ticket: GAN-69

## Backend Tasks
- [ ] BE-1: Tambah env validation untuk `JWT_SECRET` di startup. Kalau project sudah/belum punya Joi/class-validator env schema (cek `apps/api/src/config/` atau `ConfigModule.forRoot` di `app.module.ts`), tambahkan `JWT_SECRET` sebagai required field di sana. Kalau belum ada schema validation sama sekali, buat helper kecil (mis. `apps/api/src/config/env-validation.ts` atau di dalam `ConfigModule.forRoot({ validate: ... })`) yang throw `Error('JWT_SECRET is not set. Set it in .env before starting the app.')` saat env kosong — dipanggil di `ConfigModule.forRoot()` di `app.module.ts` (fail sebelum `bootstrap()` lanjut ke `app.listen()`).
- [ ] BE-2: Hapus fallback hardcoded di `apps/api/src/auth/strategies/jwt.strategy.ts:20-22` — ganti `config.get<string>('JWT_SECRET') || 'dev_secret_change_me_in_production_2026'` jadi `config.getOrThrow<string>('JWT_SECRET')` (Nest `ConfigService.getOrThrow` throw otomatis kalau key tidak ada — pastikan versi `@nestjs/config` yang dipakai support method ini, cek `package.json`).
- [ ] BE-3: Hapus fallback hardcoded di `apps/api/src/auth/auth.module.ts:21-23` (dalam `JwtModule.registerAsync` useFactory) — ganti jadi `config.getOrThrow<string>('JWT_SECRET')` juga, konsisten dengan BE-2.
- [ ] BE-4: Kalau BE-1 (env validation di `ConfigModule.forRoot`) sudah cover fail-fast, `getOrThrow` di BE-2/BE-3 jadi defense-in-depth (tetap dipasang, tidak saling menggantikan) — pastikan tidak ada third fallback lokasi lain yang missed (grep `dev_secret_change_me_in_production_2026` di seluruh `apps/api/src` untuk pastikan hanya 2 lokasi ini).
- [ ] BE-5: Tidak ada module registration baru — module `auth` sudah terdaftar.

## Frontend Tasks
(none — scope murni backend auth bootstrap)

## Shared Types Tasks
(none)

## Docs Tasks
- [ ] DOC-1: Update `apps/api/CLAUDE.md` section "Environment" — tegaskan `JWT_SECRET` wajib diset atau app gagal start (bukan sekadar "Secret for JWT tokens").

## Skip Agents
- frontend: Tidak ada perubahan UI/API contract yang menyentuh frontend — perbaikan murni di bootstrap/config backend auth module.
