## Ticket: GAN-69
## Agent: backend
## Status: SUCCESS

## Attempt Log
- Attempt 1: PASS (missing `node_modules`/Prisma client fixed via `pnpm install` + `npx prisma generate`, then build/lint/test all PASS)

## Acceptance Criteria
- [x] App gagal start saat `JWT_SECRET` tidak diset — verified: `unset JWT_SECRET && node dist/src/main.js` → process exits code 1, error thrown in `ConfigModule.forRoot` before `app.listen()`, no server listen log emitted.
- [x] Tidak ada string literal `'dev_secret_change_me_in_production_2026'` tersisa di `apps/api/src` — grep confirms 0 matches (also cleaned stale example in `apps/api/src/auth/README.md`).
- [x] `jwt.strategy.ts` dan `auth.module.ts` pakai satu sumber validasi konsisten — keduanya `config.getOrThrow<string>('JWT_SECRET')`, plus shared fail-fast gate di `ConfigModule.forRoot({ validate: validateEnv })` (`apps/api/src/config/env-validation.ts`).
- [x] Saat `JWT_SECRET` diset normal, app start tetap jalan — build PASS, full jest suite PASS (184/184), no behavior regression (`expiresIn: '7d'` unchanged).
- [x] Error message menyebut nama env var yang hilang: `"JWT_SECRET is not set. Set it in .env before starting the app."` — tidak pernah log nilai `JWT_SECRET` itu sendiri.

## Quality Gate
- Build (`pnpm --filter umkm-pos-api build`): PASS
- Lint (`pnpm --filter umkm-pos-api lint`): PASS
- Test (`pnpm --filter umkm-pos-api test`): PASS (184 tests, 14 suites)
- Multi-tenant scope: N/A — no query/model change, no merchant_id involved
- RBAC coverage: N/A — no new/changed endpoints
- Raw SQL check: N/A — no service query touched

## Files Changed
- apps/api/src/config/env-validation.ts (new) — `validateEnv()` throws if `JWT_SECRET` missing/empty; wired into `ConfigModule.forRoot({ validate })`
- apps/api/src/app.module.ts — added `validate: validateEnv` to `ConfigModule.forRoot`
- apps/api/src/auth/strategies/jwt.strategy.ts — `secretOrKey` now `config.getOrThrow<string>('JWT_SECRET')` (fallback removed)
- apps/api/src/auth/auth.module.ts — `JwtModule.registerAsync` secret now `config.getOrThrow<string>('JWT_SECRET')` (fallback removed)
- apps/api/src/auth/README.md — stale doc example updated to match new pattern (no hardcoded fallback)
- apps/api/CLAUDE.md — `JWT_SECRET` doc note updated: required, fail-fast at startup

## Catatan
- No Joi/class-validator env schema existed in project; used lightweight plain-function `validate` (per `ConfigModule.forRoot({ validate })` Nest API), consistent with BE-1 instruction ("kalau belum ada schema... buat helper kecil").
- `getOrThrow` in both auth files kept as defense-in-depth per BE-4, even though `ConfigModule.forRoot` validate already fails fast first.
- Local env had no `node_modules`/generated Prisma client — ran `pnpm install` + `npx prisma generate` before build (required for verify, no schema changes made).
