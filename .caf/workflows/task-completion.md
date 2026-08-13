# Task Completion — Definition of Done

> Sebagian isi file ini auto-generate dari script yang terdeteksi di `package.json`.
> Review sebelum dipakai.

## Perintah Verifikasi Wajib

- [ ] `pnpm run lint` — wajib pass
- [ ] `pnpm run typecheck` — wajib pass
- [ ] `pnpm run test` — wajib pass (kalau ada test relevan)
- [ ] `pnpm run build` — wajib pass sebelum PR dibuka

## Documentation Update Rules

TODO: aturan update dokumentasi spesifik project (mis. "endpoint baru → update
api-contract.md") — ini keputusan tim, tidak bisa dideteksi otomatis.

## PR Checklist

- [ ] Semua Perintah Verifikasi di atas PASS
- [ ] `verify-report.md` di `.caf/tasks/{TICKET-ID}/` sudah Status: SUCCESS
- [ ] Tidak ada perubahan di luar scope ticket
- [ ] TODO: checklist tambahan spesifik project (security review, migration check, dst)
