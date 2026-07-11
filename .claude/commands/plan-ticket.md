---
allowed-tools: Read, Grep, Glob, Bash
description: Preview rencana Planner Agent untuk satu ticket tanpa trigger pipeline penuh
argument-hint: [TICKET-ID, contoh: "GAN-44"]
---

# Plan Ticket (Preview, Manual)

**Ini command READ-MOSTLY. Boleh menulis KE `.ai/tasks/{TICKET-ID}/` saja
(requirements.md, tasks.md) — JANGAN sentuh kode aplikasi apapun.**

Tujuan command ini: preview hasil planning SEBELUM ticket ini beneran
di-trigger lewat status "Ready for AI" di Linear (yang akan jalankan
pipeline penuh otomatis lewat caf-orchestrator). Berguna untuk sanity-check
manual tanpa konsekuensi spawn agent implementasi/QA/reviewer.

## Ticket

Ticket ID: $ARGUMENTS

Ambil detail ticket ini (title, description, acceptance criteria) — kalau
ada MCP Linear terhubung, gunakan itu. Kalau tidak, minta user paste detail
ticket secara manual sebelum lanjut.

## Ikuti Pola Planner Agent

Kalau `.claude/agents/planner.md` ada, baca dan ikuti isinya sebagai sumber
kebenaran utama untuk format output dan pola kerja. Kalau tidak ada, gunakan
default berikut:

1. Baca ticket, pahami acceptance criteria
2. Identifikasi app/module mana yang terdampak (frontend, backend, atau
   keduanya) — verifikasi dari struktur project aktual, jangan asumsi
3. Breakdown jadi task konkret, urutkan berdasarkan dependency
4. Kalau ada celah kontrak antar layer (misal field yang dibutuhkan
   frontend belum ada di DTO backend), catat sebagai temuan eksplisit —
   ini justru tanda planning bekerja dengan benar, bukan tanda ticket
   kurang lengkap
5. Kalau ticket terlalu ambigu untuk di-breakdown dengan percaya diri,
   laporkan ambiguitasnya secara eksplisit — JANGAN menebak requirement
   yang tidak disebutkan

## Output

Tulis ke `.ai/tasks/{TICKET-ID}/requirements.md` dan
`.ai/tasks/{TICKET-ID}/tasks.md`, format konsisten dengan yang dipakai
pipeline otomatis (lihat contoh di ticket yang sudah pernah jalan, kalau
ada, sebagai referensi format).

Setelah selesai, tampilkan ringkasan singkat ke user: berapa task, app apa
saja yang terdampak, ada ambiguitas/celah kontrak atau tidak.

## Setelah Selesai

Ingatkan user: ini baru preview planning. Kalau user setuju dengan hasil
plan ini dan mau lanjut ke implementasi otomatis, mereka tetap perlu ubah
status ticket ke "Ready for AI" di Linear seperti biasa — command ini TIDAK
otomatis trigger pipeline lanjutan.
