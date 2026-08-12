---
description: Jalankan quality gate + QA checklist manual di branch/diff lokal, sebelum buka PR atau trigger pipeline
---

# QA Check (Preview, Manual)

**Command ini READ-ONLY terhadap kode aplikasi. Boleh menjalankan lint/typecheck/test via Bash dan menulis ke `.ai/tasks/{TICKET-ID}/qa-report.md` saja — JANGAN edit/fix kode secara otomatis. Ini command untuk MELAPORKAN kondisi, bukan memperbaiki.**

Tujuan: self-check manual di branch lokal sebelum kode dikirim ke pipeline otomatis atau
sebelum buka PR — supaya masalah dasar ketahuan lebih awal.

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

Diff dari base branch (`main` / `develop`).
Kalau `.ai/tasks/{TICKET-ID}/requirements.md` ada, pakai sebagai acuan acceptance criteria.

## Ikuti Pola QA Agent

Kalau `.opencode/agent/qa.md` ada, **baca file itu dan patuhi isinya sebagai sumber
kebenaran utama** untuk scope, pola kerja, dan format output — bukan instruksi di command ini.
Command ini cuma wrapper: kamu yang menjalankan peran QA di thread utama, tanpa
men-spawn subagent.

Kalau file itu tidak ada, gunakan default berikut:

1. **Quality Gate** — jalankan command yang benar-benar ada di `package.json`:
   - typecheck
   - lint
   - test (kalau ada test relevan dengan diff)
2. **Acceptance Criteria** — kalau ada `requirements.md` relevan, cek tiap kriteria
   satu-satu, sertakan bukti baris kode (`file:baris`) untuk tiap yang PASS. Kriteria tanpa
   bukti = belum PASS, bukan PASS.
3. **Edge Case** — identifikasi skenario edge case yang relevan dengan perubahan (validasi
   gagal, error handling, race condition, state kosong), laporkan mana yang sudah di-cover
   kode/test dan mana yang belum.
4. **Security Check** (kalau ada perubahan backend) — cek scoping data antar tenant/user, coverage otorisasi endpoint baru, sanitasi query, data sensitif yang bocor ke response/log.

## Format Output

Sama seperti format `qa-report.md` yang dipakai pipeline otomatis:

```markdown
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

Kalau ada quality gate yang FAIL, sertakan potongan output error aslinya apa adanya.

## Simpan Hasil

WAJIB tulis hasil ke `.ai/tasks/{TICKET-ID}/qa-report.md` — jangan cuma tampilkan di chat.

Sebelum menulis, cek dulu file target sudah ada atau belum:

- **Belum ada** → buat foldernya kalau perlu, tulis, lanjut.
- **Sudah ada** → JANGAN langsung overwrite. Tampilkan ringkasan isi yang sekarang ke user
  dan tanya mau diapakan: overwrite (hasil run ini menimpa), simpan sebagai file
  pembanding, atau batal. STOP sampai user menjawab.

## Setelah Selesai

Laporan disimpan di `.ai/tasks/{TICKET-ID}/qa-report.md`. Kalau ada CRITICAL issue, sarankan user perbaiki sebelum membuat PR.
