## Ticket: GAN-69
## Status: PLAN

## Deskripsi
JWT sign/verify diam-diam fallback ke hardcoded secret `'dev_secret_change_me_in_production_2026'` kalau `JWT_SECRET` env tidak diset. Ada di dua lokasi: `apps/api/src/auth/strategies/jwt.strategy.ts:20-22` (verify) dan `apps/api/src/auth/auth.module.ts:21-23` (sign, `JwtModule.registerAsync`). Harus fail-fast di startup kalau `JWT_SECRET` tidak diset, bukan silent fallback.

## Acceptance Criteria
- [ ] App gagal start (throw error, proses exit non-zero) saat `JWT_SECRET` tidak diset atau string kosong — verifiable via `unset JWT_SECRET && npm run start:dev` menghasilkan crash dengan pesan error jelas, bukan server listen sukses
- [ ] Tidak ada string literal `'dev_secret_change_me_in_production_2026'` (atau hardcoded secret lain) tersisa di codebase `apps/api/src`
- [ ] `jwt.strategy.ts` dan `auth.module.ts` sama-sama pakai satu sumber validasi `JWT_SECRET` yang konsisten (tidak dua fallback terpisah yang bisa divergen)
- [ ] Saat `JWT_SECRET` diset normal, app start & login/verify token tetap jalan seperti biasa (tidak regresi)
- [ ] Error message saat `JWT_SECRET` unset menyebut nama env var yang hilang, memudahkan debug misconfig deployment

## Constraints
- Jangan ubah behavior JWT lain (expiresIn 7d, algoritma default) — scope cuma soal secret resolution & fail-fast
- Fail-fast harus terjadi di bootstrap/module init (sebelum `app.listen()`), bukan lazy saat request pertama masuk
- Tidak boleh menyimpan/log nilai `JWT_SECRET` di manapun (termasuk error message)
- Konsisten dengan pola existing project: Nest `ConfigService`, bukan `process.env` langsung baru di tempat lain

## Out of Scope
- Rotasi/manajemen secret (vault, KMS, dsb.)
- Perubahan algoritma/signing scheme JWT
- Validasi kekuatan/panjang minimum `JWT_SECRET` (hanya validasi "ada/tidak ada")

## Dependensi
- Tidak ada dependensi task lain — perbaikan self-contained di module `auth`
