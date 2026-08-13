---
allowed-tools: Read, Write, Grep, Glob, Bash
description: Jalankan quality gate + QA checklist manual di branch/diff lokal, sebelum buka PR atau trigger pipeline
argument-hint: [TICKET-ID, contoh: "GAN-44"]
---

> DRAFT hasil caf-initiator — review dan lengkapi sebelum dipakai, terutama bagian
> yang ditandai TODO project-specific.

# QA Check (Preview, Manual)

**Command ini READ-ONLY terhadap kode aplikasi. Boleh menjalankan lint/typecheck/test via Bash dan menulis ke `.caf/tasks/{TICKET-ID}/qa-report.md` saja — JANGAN edit/fix kode secara otomatis. Ini command untuk MELAPORKAN kondisi, bukan memperbaiki.**

Tujuan: self-check manual di branch lokal sebelum kode dikirim ke pipeline otomatis atau
sebelum buka PR — supaya masalah dasar ketahuan lebih awal, bukan nunggu QA Agent di pipeline
penuh yang biayanya jauh lebih mahal.

## Ticket

Ticket ID: `$ARGUMENTS`

WAJIB diisi. Kalau kosong, tanya user ticket mana yang dimaksud dan STOP sampai dijawab —
jangan tebak.

Ambil detail ticket (title, description, acceptance criteria): kalau ada MCP tracker
terhubung (Linear/Jira/GitHub Issues), pakai itu. Kalau tidak, minta user paste detail ticket
secara manual sebelum lanjut — jangan mengarang requirement yang tidak disebutkan.

Argument boleh diikuti area fokus opsional setelah TICKET-ID (mis.
`GAN-44 validasi form checkout`). Kalau ada, persempit pemeriksaan ke area itu — tapi tetap
laporkan kalau ada masalah jelas di luar area fokus yang kelihatan sepanjang jalan.

## Input

Diff dari base branch. Deteksi base branch dari config/git — cek `caf.config.yaml` field
`repo.baseBranch` kalau ada; jangan asumsi nama branch tanpa verifikasi.

Kalau `.caf/tasks/{TICKET-ID}/requirements.md` ada, pakai sebagai acuan acceptance criteria.

## Ikuti Pola QA Agent

Kalau `.claude/agents/qa.md` ada, **baca file itu dan patuhi isinya sebagai sumber
kebenaran utama** untuk scope, pola kerja, dan format output — bukan instruksi di command ini.
Command ini cuma wrapper: kamu yang menjalankan peran QA di thread utama, tanpa
men-spawn subagent.

Kalau file itu tidak ada, gunakan default berikut:

1. **Quality Gate** — jalankan command yang benar-benar ada di `package.json`
   (verifikasi dulu nama script-nya, jangan asumsi `npm run lint` ada):
   - typecheck
   - lint
   - test (kalau ada test relevan dengan diff)
2. **Acceptance Criteria** — kalau ada `requirements.md` relevan, cek tiap kriteria
   satu-satu, sertakan bukti baris kode (`file:baris`) untuk tiap yang PASS. Kriteria tanpa
   bukti = belum PASS, bukan PASS.
3. **Edge Case** — identifikasi skenario edge case yang relevan dengan perubahan (validasi
   gagal, error handling, race condition, state kosong), laporkan mana yang sudah di-cover
   kode/test dan mana yang belum.
4. **Security Check** (kalau ada perubahan backend) — TODO project-specific: sesuaikan daftar
   ini dengan risiko nyata project. Titik cek umum: scoping data antar tenant/user, coverage
   otorisasi di endpoint baru, raw SQL/query injection, secret atau data sensitif yang bocor
   ke log/response.

## Format Output

Sama seperti format `qa-report.md` yang dipakai pipeline otomatis:

```
## Status: PASS / NEEDS_HUMAN

## Quality Gate Results
- Typecheck: PASS/FAIL
- Lint: PASS/FAIL
- Test: PASS/FAIL/SKIP (alasan)

## Acceptance Criteria
- [ ] <kriteria> — status, bukti file:baris

## Edge Cases
| Skenario | Expected | Actual | Status |

## Issues Found
### CRITICAL
### NON-CRITICAL
```

Kalau ada quality gate yang FAIL, sertakan potongan output error aslinya apa adanya —
jangan diringkas jadi "ada error lint".

## Simpan Hasil

WAJIB tulis hasil ke `.caf/tasks/{TICKET-ID}/qa-report.md` — jangan cuma tampilkan di chat.

Sebelum menulis, cek dulu file target sudah ada atau belum:

- **Belum ada** → buat foldernya kalau perlu, tulis, lanjut.
- **Sudah ada** → JANGAN langsung overwrite. Tampilkan ringkasan isi yang sekarang ke user
  dan tanya mau diapakan: overwrite (hasil run ini menimpa), simpan sebagai file
  pembanding, atau batal. STOP sampai user menjawab.

## Setelah Selesai

**Command ini TIDAK men-trigger `caf-orchestrator` atau pipeline otomatis apapun.**
Tidak ada agent lanjutan yang di-spawn, tidak ada status ticket yang diubah, tidak ada
komentar/PR yang diposting ke tracker. Yang dihasilkan cuma file lokal di
`.caf/tasks/{TICKET-ID}/` untuk dibaca manusia.

Kalau user setuju dengan hasil preview ini dan mau lanjut ke pipeline otomatis, mereka
tetap harus melakukannya sendiri seperti biasa (set status ticket ke "Ready for AI" di tracker, atau apapun trigger yang dipakai project ini) — ingatkan hal ini di akhir
run, jangan biarkan user mengira pipeline sudah jalan.

Laporan ini juga TIDAK diposting ke tracker/PR. Kalau semua PASS, user bisa lanjut buka PR
manual atau trigger pipeline dengan lebih percaya diri. Kalau ada CRITICAL issue, sarankan
user perbaiki dulu sebelum trigger pipeline penuh — supaya tidak buang waktu/biaya pipeline
untuk kode yang sudah ketahuan bermasalah dari awal.
