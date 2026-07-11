---
name: audit-to-ticket
description: Baca audit-report.md hasil Auditor Agent, tampilkan tiap temuan untuk approval manusia satu per satu, lalu create Linear issue HANYA untuk yang di-approve.
allowed-tools: Read, Bash(ls:*), mcp__linear__createIssue, mcp__linear__listTeams, mcp__linear__listLabels
---

## Konteks

Kamu menjalankan langkah manusia-in-the-loop setelah Auditor Agent selesai scan.
Auditor Agent SENGAJA tidak boleh create ticket sendiri (lihat `.opencode/agent/auditor.md` § Scope: "itu keputusan manusia, bukan agent ini"). Command ini adalah satu-satunya jalur resmi dari audit-report.md ke Linear — jangan buat jalur lain.

## Argumen

$ARGUMENTS — opsional, path ke audit-report.md spesifik (mis. `.ai/audits/2026-07-10/audit-report.md`).
Kalau kosong, cari folder tanggal terbaru di `.ai/audits/`.

## Langkah

### 1. Temukan dan baca audit-report.md

- Kalau argumen kosong: `ls -t .ai/audits/` untuk cari folder tanggal terbaru, baca `audit-report.md` di dalamnya.
- Kalau audit-report.md tidak ditemukan sama sekali, laporkan ke user dan STOP — jangan lanjut dengan asumsi apapun.
- Parse bagian "## Temuan Prioritas" — abaikan "## Temuan Non-Prioritas" (memang sengaja tidak diusulkan jadi task oleh Auditor).

### 2. Tampilkan tiap temuan satu per satu, minta keputusan eksplisit

Untuk SETIAP temuan di "Temuan Prioritas", tampilkan ke user persis seperti ini dan TUNGGU jawaban sebelum lanjut ke temuan berikutnya — jangan proses batch tanpa konfirmasi per item:

```
---
Temuan N/TOTAL: [KATEGORI] <judul>
Lokasi: <file:line>
Masalah: <deskripsi dari audit-report.md>
Dampak: <dari audit-report.md>
Usulan: <dari audit-report.md>

Buat jadi Linear ticket? (ya / edit / skip)
---
```

- **ya** → lanjut ke langkah 3 dengan deskripsi apa adanya dari audit-report.md
- **edit** → tanya bagian mana yang mau diubah (judul/deskripsi/severity), lalu konfirmasi ulang versi editan sebelum lanjut ke langkah 3
- **skip** → catat sebagai "tidak dibuat", lanjut ke temuan berikutnya

### 3. Create Linear issue (hanya untuk yang di-approve)

- Use `listTeams` or `mcp__linear__listTeams` if team ID is not known from project context.
- Title: judul temuan (ringkas, actionable — bukan copy-paste deskripsi panjang)
- Description: format berikut, isi dari audit-report.md (atau versi editan):
  ```
  ## Sumber
  Auditor Agent scan <tanggal audit>, file: `.ai/audits/<tanggal>/audit-report.md`

  ## Lokasi
  <file:line>

  ## Masalah
  <deskripsi>

  ## Dampak
  <dampak>

  ## Usulan
  <usulan task>
  ```
- Label/priority: map dari kategori —
  - `SECURITY` → priority Urgent/High, label `security` (kalau label ini ada di workspace — cek dulu via `listLabels` / `mcp__linear__listLabels`, jangan asumsi ada)
  - `DEBT`/`CONVENTION` → priority Medium, label `tech-debt`
  - `COVERAGE` → priority Low-Medium, label `test-coverage`
- Simpan issue ID + URL yang dikembalikan Linear.

### 4. Ringkasan akhir

Setelah semua temuan diproses, tampilkan ringkasan:

```
Selesai. Dari N temuan prioritas:
- X dibuat jadi ticket: [daftar judul + link Linear]
- Y di-skip: [daftar judul singkat]
- Z di-edit sebelum dibuat: [daftar judul]
```

## Batasan (jangan dilanggar)

- JANGAN create issue tanpa konfirmasi eksplisit per item — "ya" untuk satu temuan bukan berarti "ya" untuk semua.
- JANGAN proses "Temuan Non-Prioritas" — itu memang sengaja tidak diusulkan Auditor.
- JANGAN edit/hapus audit-report.md — file itu milik Auditor Agent, command ini read-only terhadapnya.
- JANGAN buat folder `.ai/tasks/<TICKET-ID>/` — itu domain Planner Agent setelah ticket masuk pipeline normal, bukan tanggung jawab command ini.
- Kalau Linear MCP gagal (auth, rate limit, dll) di tengah proses, STOP dan laporkan progress sejauh mana (jangan retry diam-diam, jangan lanjut ke temuan berikutnya seolah semua baik-baik saja).
