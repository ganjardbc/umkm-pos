---
allowed-tools: Read, Write, Grep, Glob, Bash(ls:*), Bash(git branch:*), Bash(git status:*)
description: Preview rencana Planner Agent untuk satu ticket (requirements.md + tasks.md) tanpa trigger pipeline penuh
argument-hint: [TICKET-ID, contoh: "GAN-44"]
---

> DRAFT hasil caf-initiator — review dan lengkapi sebelum dipakai, terutama bagian
> yang ditandai TODO project-specific.

# Plan Ticket (Preview, Manual)

**Command ini READ-MOSTLY. Boleh menulis ke `.caf/tasks/{TICKET-ID}/` saja (requirements.md, tasks.md) — JANGAN sentuh kode aplikasi apapun.**

Tujuan: preview hasil planning SEBELUM ticket ini beneran masuk pipeline otomatis.
Berguna untuk sanity-check manual tanpa konsekuensi spawn agent implementasi/QA/Reviewer —
kalau plannya ternyata salah arah, ketahuan di sini, bukan setelah pipeline penuh jalan.

## Ticket

Ticket ID: `$ARGUMENTS`

WAJIB diisi. Kalau kosong, tanya user ticket mana yang dimaksud dan STOP sampai dijawab —
jangan tebak.

Ambil detail ticket (title, description, acceptance criteria): kalau ada MCP tracker
terhubung (Linear/Jira/GitHub Issues), pakai itu. Kalau tidak, minta user paste detail ticket
secara manual sebelum lanjut — jangan mengarang requirement yang tidak disebutkan.

## Ikuti Pola Planner Agent

Kalau `.claude/agents/planner.md` ada, **baca file itu dan patuhi isinya sebagai sumber
kebenaran utama** untuk scope, pola kerja, dan format output — bukan instruksi di command ini.
Command ini cuma wrapper: kamu yang menjalankan peran Planner di thread utama, tanpa
men-spawn subagent.

Kalau file itu tidak ada, gunakan default berikut:

1. Baca ticket, pahami acceptance criteria.
2. Identifikasi app/module mana yang terdampak — **verifikasi dari struktur project aktual**
   (package.json, workspace config, isi folder), jangan asumsi dari nama ticket.
3. Breakdown jadi task konkret, urutkan berdasarkan dependency antar task.
4. Kalau ada celah kontrak antar layer (mis. field yang dibutuhkan frontend belum ada di
   response backend), catat sebagai temuan eksplisit — ini justru tanda planning bekerja
   dengan benar, bukan tanda ticket kurang lengkap.
5. Kalau ticket terlalu ambigu untuk di-breakdown dengan percaya diri, laporkan ambiguitasnya
   secara eksplisit — JANGAN menebak requirement yang tidak disebutkan.

## Format Output

Dua file, format konsisten dengan yang dipakai pipeline otomatis (kalau ada ticket lain yang
sudah pernah jalan di `.caf/tasks/`, pakai itu sebagai acuan format sebelum bikin format
sendiri):

```
requirements.md
## Konteks           ← ringkasan ticket + app/module terdampak
## Acceptance Criteria ← per kriteria, satu baris checklist
## Di Luar Scope     ← yang sengaja TIDAK dikerjakan di ticket ini
## Celah & Ambiguitas ← kontrak antar layer yang belum nyambung, requirement yang belum jelas

tasks.md
## Task
- [ ] 1. <task konkret> — app/module, dependency ke task nomor berapa
```

Setelah selesai, tampilkan ringkasan singkat ke user: berapa task, app apa saja yang
terdampak, ada ambiguitas/celah kontrak atau tidak.

## Simpan Hasil

WAJIB tulis hasil ke `.caf/tasks/{TICKET-ID}/requirements.md` dan `.caf/tasks/{TICKET-ID}/tasks.md` — jangan cuma tampilkan di chat.

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
