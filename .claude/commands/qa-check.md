---
allowed-tools: Read, Grep, Glob, Bash
description: Jalankan quality gate + QA checklist manual di branch/diff lokal, sebelum buka PR atau trigger pipeline
argument-hint: [opsional, area spesifik untuk difokuskan]
---

# QA Check (Manual, Lokal)

**READ-ONLY terhadap kode aplikasi. Boleh menjalankan command
lint/typecheck/test via Bash. JANGAN edit/fix kode secara otomatis — ini
command untuk MELAPORKAN kondisi, bukan memperbaiki.**

Tujuan: self-check manual di branch lokal sebelum kode dikirim ke pipeline
otomatis (caf-orchestrator) atau sebelum buka PR — supaya masalah dasar
ketahuan lebih awal, bukan nunggu QA Agent di pipeline penuh.

## Fokus (opsional)

Area yang ingin difokuskan: $ARGUMENTS

Kalau kosong, jalankan cek menyeluruh terhadap seluruh diff dari base
branch (deteksi base branch dari config/git, jangan asumsi nama branch
tanpa verifikasi — cek `caf.config.yaml` field `repo.baseBranch` kalau ada).

## Ikuti Pola QA Agent

Kalau `.claude/agents/qa.md` ada, baca dan ikuti sebagai sumber kebenaran
utama untuk checklist dan format output. Kalau tidak ada, gunakan default:

1. **Quality Gate** — jalankan command yang benar-benar ada di
   `package.json` (verifikasi dulu nama script-nya, jangan asumsi):
   - typecheck
   - lint
   - test (kalau ada test relevan dengan diff)
2. **Acceptance Criteria** — kalau ada `.ai/tasks/{TICKET-ID}/requirements.md`
   yang relevan dengan branch ini, cek tiap kriteria satu-satu, sertakan
   bukti baris kode (`file:baris`) untuk tiap yang PASS
3. **Edge Case** — identifikasi skenario edge case yang relevan dengan
   perubahan (validasi gagal, error handling, race condition, dst),
   laporkan mana yang sudah di-cover kode/test, mana yang belum
4. **Security Check** (kalau ada perubahan backend) — cek multi-tenant
   scope, RBAC coverage, raw SQL, secret exposure — pola sama seperti
   yang sudah established di project ini (lihat riwayat
   HOTFIX-RBAC-CROSS-TENANT sebagai referensi jenis isu yang perlu dicari)

## Format Output

Sama seperti format `qa-report.md` yang dipakai pipeline otomatis:
```
## Status: PASS / NEEDS_HUMAN

## Quality Gate Results
- Typecheck: PASS/FAIL
- Lint: PASS/FAIL
- Test: PASS/FAIL/SKIP (alasan)

## Acceptance Criteria (kalau ada requirements.md relevan)
- [ ] kriteria — status, bukti file:baris

## Edge Cases
| Skenario | Expected | Actual | Status |

## Issues Found
### CRITICAL
### NON-CRITICAL
```

## Setelah Selesai

Ini laporan lokal saja — TIDAK ter-posting ke Linear/GitHub secara
otomatis. Kalau semua PASS, user bisa lanjut buka PR manual atau trigger
pipeline otomatis dengan lebih percaya diri. Kalau ada CRITICAL issue,
sarankan user perbaiki dulu sebelum trigger pipeline penuh — supaya gak
buang waktu/biaya pipeline untuk kode yang sudah ketauan bermasalah dari
awal.
