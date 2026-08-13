---
allowed-tools: Read, Write, Grep, Glob, Bash(ls:*)
description: Preview pendekatan teknis Architect Agent untuk satu ticket (design.md) tanpa trigger pipeline penuh
argument-hint: [TICKET-ID, contoh: "GAN-44"]
---

> DRAFT hasil caf-initiator — review dan lengkapi sebelum dipakai, terutama bagian
> yang ditandai TODO project-specific.

# Design Ticket (Preview, Manual)

**Command ini READ-MOSTLY. Boleh menulis ke `.caf/tasks/{TICKET-ID}/design.md` saja — JANGAN sentuh kode aplikasi, migration, atau schema apapun.**

Tujuan: preview keputusan teknis SEBELUM ticket masuk pipeline otomatis. Architect adalah
role opsional di CAF — dipakai untuk task yang melibatkan schema baru, multi-service, atau
keputusan arsitektur non-trivial. Kalau setelah baca ticket ternyata task-nya sederhana dan
tidak butuh keputusan arsitektur, **katakan itu ke user dan berhenti** — jangan mengarang
design doc untuk task yang tidak membutuhkannya.

## Ticket

Ticket ID: `$ARGUMENTS`

WAJIB diisi. Kalau kosong, tanya user ticket mana yang dimaksud dan STOP sampai dijawab —
jangan tebak.

Ambil detail ticket (title, description, acceptance criteria): kalau ada MCP tracker
terhubung (Linear/Jira/GitHub Issues), pakai itu. Kalau tidak, minta user paste detail ticket
secara manual sebelum lanjut — jangan mengarang requirement yang tidak disebutkan.

## Input

`.caf/tasks/{TICKET-ID}/requirements.md` dari Planner (jalankan `/caf-plan-ticket` dulu kalau
belum ada, atau minta user paste requirement-nya).

Opsional, kalau tersedia di project ini — dibaca sebagai konteks tambahan, bukan syarat wajib:
- `docs/architecture/system-overview.md`
- `docs/api-contract.md`
- `docs/schema/erd.md`
- ADR yang relevan di `.caf/knowledge/decisions/`

## Ikuti Pola Architect Agent

Kalau `.claude/agents/architect.md` ada, **baca file itu dan patuhi isinya sebagai sumber
kebenaran utama** untuk scope, pola kerja, dan format output — bukan instruksi di command ini.
Command ini cuma wrapper: kamu yang menjalankan peran Architect di thread utama, tanpa
men-spawn subagent.

Kalau file itu tidak ada, gunakan default berikut:

1. Baca `requirements.md`, identifikasi keputusan teknis apa yang sebenarnya perlu diambil.
2. Petakan komponen yang terlibat — **verifikasi dari struktur kode aktual**, jangan asumsi
   nama modul/service dari nama ticket.
3. Untuk tiap keputusan: tulis opsi yang dipertimbangkan, pilihan yang diambil, dan alasannya.
   Satu opsi tanpa alternatif bukan keputusan arsitektur — itu implementasi biasa.
4. Cek konsistensi dengan ADR yang sudah ada di `.caf/knowledge/decisions/`. Kalau pendekatan yang
   diusulkan bertentangan dengan ADR yang berlaku, katakan eksplisit — itu butuh ADR baru
   (keputusan manusia), bukan diam-diam dilanggar.
5. Kalau requirement belum cukup untuk mengambil keputusan teknis dengan percaya diri,
   laporkan apa yang kurang — JANGAN menebak.

## Format Output

```
design.md
## Konteks              ← ringkasan requirement + kenapa task ini butuh Architect
## Komponen Terdampak   ← file/module/service nyata (hasil verifikasi, bukan asumsi)
## Keputusan Teknis
### <keputusan 1>
- Opsi dipertimbangkan
- Pilihan + alasan
- Konsekuensi / trade-off
## Kontrak Antar Layer  ← bentuk data yang mengalir antar app/service, kalau ada
## Risiko & Mitigasi
## Dampak ke ADR        ← selaras dengan ADR mana; butuh ADR baru atau tidak
## Pertanyaan Terbuka   ← yang belum bisa diputuskan tanpa jawaban manusia
```

Setelah selesai, tampilkan ringkasan singkat ke user: berapa keputusan teknis diambil, ada
konflik dengan ADR atau tidak, ada pertanyaan terbuka atau tidak.

## Simpan Hasil

WAJIB tulis hasil ke `.caf/tasks/{TICKET-ID}/design.md` — jangan cuma tampilkan di chat.

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

Kalau ada `## Pertanyaan Terbuka` yang belum terjawab, sarankan user selesaikan itu dulu
sebelum trigger pipeline — agent implementasi akan menebak kalau desainnya menggantung, dan
tebakannya baru ketahuan salah setelah kode ditulis.
