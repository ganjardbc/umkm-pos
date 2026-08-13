# PIV Workflow

> Sebagian isi file ini auto-generate dari roster agent terdeteksi di `.claude/agents`.
> Review sebelum dipakai — terutama bagian TODO.

## Pola Kerja

```
PLAN       → buat rencana tertulis, jangan sentuh kode dulu
IMPLEMENT  → eksekusi sesuai rencana
VERIFY     → cek sendiri (lint, typecheck, test) sebelum mengaku selesai
              kalau gagal → perbaiki dan coba lagi (max 3x)
              kalau masih gagal → stop, eskalasi ke manusia (Status: NEEDS_HUMAN)
```

## Agent Aktif di Project Ini

- [x] Planner
- [x] Architect
- [x] Frontend
- [x] Backend
- [x] QA
- [x] Reviewer
- [x] Documentation

## Retry Logic per Gate

- Implementasi (Frontend/Backend): max 3x (default CAF.md), lalu stop → NEEDS_HUMAN
- QA gate: TODO: retry count QA belum dikonfirmasi, cek orchestrator
- Reviewer gate: TODO: retry count Reviewer belum dikonfirmasi, cek orchestrator

## Peringatan: Parser Contract

Field `Status:` yang diemit tiap agent (mis. `PASS`/`NEEDS_HUMAN` untuk QA,
`READY_FOR_HUMAN_REVIEW`/`NEEDS_CHANGES` untuk Reviewer) HARUS berupa token literal
persis seperti yang di-parse orchestrator — tanpa embel-embel/qualifier tambahan.
Mismatch di titik ini menghabiskan retry budget tanpa error yang jelas ke user. Selalu
verifikasi prompt agent dan parser orchestrator sebagai pasangan, bukan terpisah.

TODO: konfirmasi token literal yang dipakai orchestrator project ini sudah cocok persis
dengan yang diemit tiap agent di atas.
