## Ticket: CAF-REORG-04A (internal, pra-tracker)
## Status: READY FOR IMPLEMENTATION

## Latar Belakang

Bagian 1 dari 3 di Checkpoint 4 (lihat percakapan sebelumnya untuk full scope Checkpoint 4).
Dikerjakan terpisah atas permintaan eksplisit — TIDAK menunggu update `caf-orchestrator`
(poin 2) atau `caf-orchestrator-cms` (poin 3).

## ⚠️ Risiko yang diterima secara sadar

Setelah checkpoint ini selesai, `caf-orchestrator` **tidak bisa lagi spawn** agent
`frontend`/`backend` untuk `umkm-pos` — kode spawn-nya hardcode ke nama file lama
(`.claude/agents/frontend.md`/`backend.md` convention, dikonfirmasi dari komentar di
`agents.js:46-48` milik `caf-orchestrator`). Ini AMAN untuk saat ini karena tidak ada
webhook trigger aktif ke `umkm-pos`. **JANGAN aktifkan webhook/trigger apapun ke `umkm-pos`
sampai CAF-REORG-04B (update `caf-orchestrator`) selesai** — kalau diaktifkan sebelum itu,
pipeline akan gagal di step Frontend/Backend Agent.

## Scope

**In scope:**
- Rename `frontend.md` → `caf-frontend.md` dan `backend.md` → `caf-backend.md` di
  `umkm-pos/.claude/agents/`
- Patch surgical konten (path/name/slug), pola identik dengan 8 agent lain di CAF-REORG-03
- Cek referensi ke nama `frontend`/`backend` (tanpa prefix) di file lain yang dipertahankan
  (command, `AGENTS.md`, dst) — update kalau memang mengacu ke agent ini secara eksplisit

**Eksplisit di luar scope:**
- Update kode `caf-orchestrator` (CAF-REORG-04B, checkpoint terpisah)
- Update kode `caf-orchestrator-cms` (CAF-REORG-04C, checkpoint terpisah, perlu investigasi
  dulu karena stack `website-cms-v2` berbeda)
- Mengaktifkan webhook/trigger apapun ke `umkm-pos`
- Test spawn end-to-end (baru bisa dilakukan setelah 04B selesai)

## Acceptance Criteria

### AC1 — Rename + patch, konten preserved
- [ ] `git mv frontend.md caf-frontend.md`, `git mv backend.md caf-backend.md`
- [ ] Patch HANYA: path `.ai/`→`.caf/` (kalau masih ada sisa dari CAF-REORG-03 — seharusnya
      sudah bersih, verifikasi ulang saja), frontmatter `name`/`slug` → `caf-frontend`/`caf-backend`
- [ ] Self-check diff: isi final vs isi sebelum `git mv` (dari CAF-REORG-03, bukan dari awal
      sekali) — HANYA baris path/name yang berubah, sisanya identik

### AC2 — Referensi silang diupdate
- [ ] Scan seluruh repo `umkm-pos` untuk referensi eksplisit ke `frontend`/`backend` sebagai
      nama agent (bukan sebagai kata umum/nama folder `apps/web` dst) — update ke
      `caf-frontend`/`caf-backend` kalau memang menunjuk file agent ini
- [ ] Laporkan kalau ada ambiguitas (misal referensi yang tidak jelas apakah menunjuk ke
      agent atau ke konsep umum "frontend/backend") — jangan tebak, laporkan untuk keputusan

## Non-negotiable constraints
- Pola kerja identik CAF-REORG-03: rename+patch, BUKAN regenerate — preserve konten evolved
- Self-check diff wajib sebelum lapor selesai
- TIDAK mengaktifkan webhook/trigger — di luar scope, dan berbahaya sebelum 04B selesai