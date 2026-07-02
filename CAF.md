# Coderium Agent Framework (CAF)
### Panduan Memulai untuk Project Baru

---

## Apa itu CAF

CAF adalah framework untuk menjadikan AI sebagai anggota tim engineering yang bisa mengerjakan ticket dari awal sampai Pull Request secara otomatis. AI tidak hanya membantu menulis kode — ia merencanakan, mengimplementasikan, memverifikasi, dan melaporkan hasilnya, mengikuti aturan dan konvensi yang sudah ditetapkan tim.

CAF bukan produk jadi yang di-install sekali selesai. Ini adalah **struktur yang dibangun bertahap** di dalam repo project kamu, dan makin baik seiring dengan iterasi.

---

## Pola Kerja: PIV (Plan → Implement → Verify)

Semua agent di CAF mengikuti satu pola kerja yang sama:

```
PLAN       → buat rencana tertulis, jangan sentuh kode dulu
IMPLEMENT  → eksekusi sesuai rencana
VERIFY     → cek sendiri sebelum mengaku selesai (lint, typecheck, test)
              kalau gagal → perbaiki dan coba lagi (max 3x)
              kalau masih gagal → stop, eskalasi ke manusia
```

Ini mencegah dua masalah paling umum di AI coding: langsung coding tanpa arah, dan mengaku selesai tanpa verifikasi.

---

## Pipeline Lengkap

```
Ticket masuk (Linear/GitHub Issues)
  ↓
Planner Agent      — baca ticket, buat rencana (jangan sentuh kode)
  ↓
Architect Agent    — tentukan pendekatan teknis (opsional, untuk task kompleks)
  ↓
Frontend/Backend Agent — implementasi + self-verify (retry max 3x)
  ↓
Documentation Agent — update docs (paralel, tidak blocking)
  ↓
QA Agent           — test mendalam, cek edge case
  ↓
Reviewer Agent     — review kualitatif (pendekatan, technical debt, keamanan)
  ↓
Open PR + Mention Developer
  ↓
[fase berikutnya] AI PR Reviewer — merespons komentar reviewer manusia
```

**Catatan penting:** Review manusia tetap wajib sebelum merge. Tidak ada auto-merge dalam kondisi apapun.

---

## 5 Layer yang Harus Dibangun

### Layer 1 — Project Knowledge Base
> Fondasi agar AI benar-benar memahami project kamu

Ini yang membedakan AI yang "generik" vs AI yang "paham project ini". Tanpa layer ini, agent akan menghasilkan kode yang secara sintaks benar tapi tidak mengikuti konvensi tim.

**File yang dibutuhkan:**

```
CLAUDE.md                    ← instruksi utama untuk Claude Code (<150 baris)
AGENTS.md                    ← instruksi untuk semua AI coding agent
apps/web/CLAUDE.md           ← konvensi spesifik frontend
apps/api/CLAUDE.md           ← konvensi spesifik backend

docs/
  decisions/                 ← ADR: kenapa keputusan teknis diambil
    adr-001-*.md
    adr-002-*.md
  golden-examples/           ← kode nyata sebagai referensi (bukan deskripsi)
    backend/
      *.controller.ts        ← contoh thin controller
      *.service.ts           ← contoh fat service
      *.dto.ts               ← contoh DTO dengan validasi
    frontend/
      *.vue                  ← contoh komponen ideal
      use*.ts                ← contoh composable pattern
      *.service.ts           ← contoh API service
```

**Prinsip:**
- `CLAUDE.md` isi **behavior saja**, bukan penjelasan umum yang AI sudah tahu
- `golden-examples` bukan file baru — **copy dari file existing yang paling rapi** di codebase
- ADR menjawab **"kenapa"**, bukan cuma "apa aturannya"
- Iteratif: tiap kali agent salah konvensi, update knowledge base-nya

---

### Layer 2 — Agent Definitions
> Tiap agent punya peran, scope, dan kontrak yang jelas

Simpan di `.claude/agents/` (untuk Claude Code) atau folder equivalen untuk tool lain.

**Struktur tiap file agent:**
```markdown
## Role
[satu kalimat: apa peran agent ini]

## Scope
[area kode mana yang boleh diakses/diubah]

## Tools yang Diizinkan
[read-only atau write, MCP mana yang boleh diakses]

## Input
[artifact apa yang diterima dari agent sebelumnya]

## Output
[artifact apa yang dihasilkan untuk agent berikutnya]

## Pola Kerja (PIV)
[instruksi eksplisit: plan dulu, baru implement, baru verify]

## Verify Checklist
[perintah konkret yang harus dijalankan sebelum selesai]

## Retry Logic
[kalau verify gagal: perbaiki dan coba lagi max N kali]
```

**8 Agent Spesialis:**

| Agent | Fase | Output Artifact |
|---|---|---|
| Planner | Plan | `requirements.md`, `tasks.md` |
| Architect | Plan (opsional) | `design.md` |
| Frontend | Implement + Verify | kode + `verify-report.md` |
| Backend | Implement + Verify | kode + `verify-report.md` |
| QA | Verify mendalam | `qa-report.md` |
| Reviewer | Review kualitatif | `review-notes.md` |
| Documentation | Paralel | update `docs/` |
| DevOps | Post-merge (next phase) | deployment |

**Model Routing (hemat token):**
- Haiku → task sederhana (rename, format, lookup)
- Sonnet → implementasi standar, debugging, review
- Opus → arsitektur kompleks, keputusan besar

---

### Layer 3 — Artifact Handoff
> Agent tidak saling "ngobrol" — mereka saling lempar file

Setiap ticket punya folder sendiri. Agent membaca output agent sebelumnya dari folder ini, bukan dari memori atau chat.

```
.ai/tasks/TICKET-ID/
  requirements.md    ← Planner Agent: apa yang diminta, acceptance criteria
  design.md          ← Architect Agent: pendekatan teknis (kalau perlu)
  tasks.md           ← Planner Agent: breakdown task konkret
  verify-report.md   ← Frontend/Backend Agent: hasil implement + verify
  qa-report.md       ← QA Agent: hasil test mendalam
  review-notes.md    ← Reviewer Agent: hasil review kualitatif
```

**Format `verify-report.md`:**
```markdown
## Ticket: TICKET-ID
## Status: SUCCESS / NEEDS_HUMAN

## Attempt Log
- Attempt 1: FAIL — [error]
- Attempt 2: PASS

## Acceptance Criteria
- [x] kriteria 1 — terpenuhi di File.vue baris N
- [x] kriteria 2 — terpenuhi di service.ts

## Quality Gate
- Lint: PASS
- Typecheck: PASS
- Test: PASS / SKIP (alasan)

## Catatan
[deviasi dari plan, kalau ada]
```

---

### Layer 4 — Quality Gates
> Checkpoint yang benar-benar dieksekusi, bukan cuma instruksi teks

**Minimal yang harus ada:**
```bash
pnpm typecheck        # wajib pass
pnpm lint             # wajib pass
pnpm test             # wajib pass (kalau ada test relevan)
pnpm build            # wajib pass sebelum PR dibuka
```

**Buat file `.ai/workflows/task-completion.md`** berisi:
- Definition of Done yang eksplisit
- Commands yang harus dijalankan
- Documentation update rules (endpoint baru → update api-contract.md, dst)
- PR checklist sebelum branch dianggap siap

**Tambahan yang direkomendasikan:**
- Custom ESLint rule untuk aturan kritis yang tidak boleh dilanggar
  (contoh: query tanpa `tenant_id` scope, business logic di controller)
- Git hook sebagai backstop terakhir

**Kalau `verify-report.md` status `NEEDS_HUMAN`:**
- Pipeline berhenti
- Komentar otomatis ke ticket berisi ringkasan error
- Status ticket diubah ke "Blocked" atau "Needs Review"
- Developer yang di-mention untuk handle manual

---

### Layer 5 — Orchestration
> Mesin yang menjalankan pipeline secara otomatis

**Komponen infrastruktur:**

```
VPS kecil (~$5-6/bulan)
  └── Webhook Receiver (Express, ~150 baris)
        └── Spawn Claude Code per-agent (on-demand, bukan nyala terus)
              └── Akses MCP: Linear MCP + GitHub MCP / gh CLI
```

**Alur teknis:**
```
Linear event (status ticket berubah ke "Ready for AI")
  → POST /webhook/linear
  → verifikasi signature
  → parse ticket ID + deskripsi
  → git checkout -b ai-agent/TICKET-ID
  → spawn: claude --agent planner
  → spawn: claude --agent frontend (baca .ai/tasks/TICKET-ID/)
  → baca verify-report.md
      SUCCESS  → komentar ke Linear, branch siap review
      NEEDS_HUMAN → komentar error ke Linear, stop pipeline
```

**Yang perlu disiapkan:**
- Linear API token (baca ticket, post komentar)
- GitHub token (push branch)
- Anthropic API key
- Linear webhook secret (verifikasi request asli dari Linear)

---

## Struktur Folder Lengkap yang Direkomendasikan

```
project-root/
├── CLAUDE.md                        ← Layer 1, <150 baris
├── AGENTS.md                        ← Layer 1, cross-tool compatible
│
├── .claude/
│   └── agents/
│       ├── planner.md               ← Layer 2
│       ├── architect.md             ← Layer 2
│       ├── frontend.md              ← Layer 2
│       ├── backend.md               ← Layer 2
│       ├── qa.md                    ← Layer 2
│       ├── reviewer.md              ← Layer 2
│       └── documentation.md        ← Layer 2
│
├── .ai/
│   ├── workflows/
│   │   ├── task-completion.md       ← Layer 4
│   │   ├── piv-workflow.md          ← Layer 4, SOP PIV + retry
│   │   └── agent-handoff.md        ← Layer 3, format artifact
│   └── tasks/
│       ├── README.md                ← jelasin struktur untuk agent
│       └── .gitkeep
│
├── docs/
│   ├── decisions/                   ← Layer 1, ADR
│   │   ├── adr-001-*.md
│   │   └── adr-002-*.md
│   ├── golden-examples/             ← Layer 1, referensi kode
│   │   ├── backend/
│   │   └── frontend/
│   ├── architecture/
│   ├── database/
│   ├── api/
│   ├── frontend/
│   └── backend/
│
└── apps/ / packages/ / ...          ← kode project seperti biasa
```

---

## Urutan Implementasi yang Disarankan

### Fase 1 — Fondasi (mulai di sini)
1. Buat `CLAUDE.md` root yang ringkas (<150 baris) + `CLAUDE.md` per-package
2. Buat `AGENTS.md` dengan aturan konkret (bukan abstrak), lengkap dengan contoh benar/salah
3. Pilih 2-3 file existing paling rapi → copy ke `docs/golden-examples/`
4. Tulis 2 ADR paling kritis untuk project kamu → `docs/decisions/`
5. Buat `.ai/workflows/task-completion.md` berisi Definition of Done + PR checklist

### Fase 2 — Agent & Artifact
6. Buat `planner.md` + `frontend.md` (atau agent yang paling relevan dulu)
7. Buat `.ai/workflows/piv-workflow.md` + `agent-handoff.md`
8. Test manual: jalankan `claude --agent planner` untuk 1-2 ticket nyata, tanpa trigger otomatis
9. Evaluasi: seberapa akurat plan, seberapa bersih kode, berapa token terpakai

### Fase 3 — Otomasi
10. Setup VPS + webhook receiver
11. Connect Linear MCP
12. Aktifkan trigger otomatis dari Linear webhook
13. Tambah agent berikutnya (QA, Reviewer) satu per satu setelah Planner+Frontend stabil

### Fase 4 — Hardening
14. Tambah custom ESLint rule untuk aturan kritis
15. Tambah `gh pr create` otomatis di akhir pipeline
16. Evaluasi swap/bandingkan engine (Claude Code vs OpenCode)
17. AI PR Reviewer + DevOps Agent

---

## Yang Tidak Perlu Dilakukan

- Jangan install BMAD atau framework lain — ambil konsepnya saja jika perlu
- Jangan buat semua agent sekaligus — mulai dari Planner + 1 agent implementasi
- Jangan auto-merge — review manusia tetap wajib di semua fase
- Jangan taruh semua aturan di satu file raksasa — pisah per-scope, per-layer
- Jangan anggap `CLAUDE.md` selesai ditulis sekali — ini dokumen hidup yang diupdate tiap kali agent salah

---

## Referensi Teknologi

| Kebutuhan | Pilihan |
|---|---|
| Ticket tracker | Linear (direkomendasikan, MCP resmi tersedia, free tier cukup) |
| AI runner | Claude Code (default), OpenCode (eksperimen perbandingan) |
| MCP | Linear MCP, GitHub MCP |
| PR & branch | `gh` CLI (fase awal), GitHub MCP (fase mature) |
| Webhook receiver | Node.js + Express |
| Queue | `p-queue` (mencegah race condition) |
| Runner infra | VPS kecil (Hetzner CX22 / DigitalOcean Droplet) |
| Artifact storage | File Markdown di branch git |
