# CAF — Coderium Agent Framework
### Panduan Universal (dapat dijalankan di project apa saja)

> **Cara pakai dokumen ini:** taruh file ini di root repo sebagai `CAF.md`, lalu jalankan prompt:
> `"Pelajari CAF.md dan eksekusi"` ke AI coding agent (Claude Code, dsb).
> AI akan membaca **Bagian 0** terlebih dahulu, melakukan deteksi terhadap repo, lalu membangun
> Layer 1–5 sesuai kondisi project — bukan mengikuti stack contoh yang mungkin tertulis di sini.

---

## Bagian 0 — Instruksi Eksekusi untuk AI

**Jangan langsung membuat file.** Ikuti urutan berikut:

### Langkah 1 — Audit Kondisi Repo Saat Ini
Cek apakah sudah ada konfigurasi AI coding agent lain di repo ini:
```
.claude/        ← Claude Code
.kiro/          ← Kiro
.opencode/      ← OpenCode
openspec/       ← OpenSpec
.cursor/        ← Cursor
```
- **Kalau kosong** → lanjut ke Langkah 2, mulai dari nol.
- **Kalau ada satu atau lebih** → JANGAN langsung menimpa. Laporkan ke user dulu file/folder
  apa saja yang ditemukan, lalu tanyakan: konsolidasi (pilih satu sumber kebenaran, migrasikan
  isi yang relevan) atau biarkan coexist. Jangan mengambil keputusan ini sendiri.

### Langkah 2 — Deteksi Struktur & Stack Project
Baca file-file berikut untuk mengisi placeholder di seluruh dokumen ini:
- `package.json` (root) → cek `workspaces`, cek monorepo tool (`turbo.json`, `nx.json`, `lerna.json`, `pnpm-workspace.yaml`)
- Untuk tiap app/package terdeteksi → baca `package.json`-nya → identifikasi framework (Vue/React/Next/Nest/Express/Django/dst), package manager (pnpm/npm/yarn/bun)
- Cek `prisma/schema.prisma`, `.env.example`, atau ORM config lain → identifikasi database
- Cek `README.md` untuk konteks bisnis/domain project

Isi tabel placeholder di **Lampiran A** berdasarkan hasil deteksi ini sebelum lanjut.

### Langkah 3 — Deteksi Ticket Tracker
Cek indikasi tracker yang dipakai:
- `.linear/`, mention "linear" di README/CI config → **Linear**
- `.jira/`, `atlassian.yml`, mention "jira"/"atlassian" → **Jira**
- Tidak ada indikasi apapun → **tanyakan ke user** (jangan asumsi). Opsi: Linear / Jira / GitHub Issues.

Gunakan hasil ini untuk memilih varian **Layer 5** yang sesuai (lihat bagian bercabang di bawah).

### Langkah 3b — Deteksi VCS Platform
Cek remote git dan konfigurasi CI untuk menentukan platform version control:
- `git remote -v` mengarah ke `github.com` → **GitHub** (PR, `gh` CLI, GitHub Actions)
- `git remote -v` mengarah ke `gitlab.com` atau self-hosted GitLab → **GitLab** (Merge Request,
  `glab` CLI, GitLab CI)
- Tidak jelas → **tanyakan ke user**. Jangan asumsi GitHub sebagai default.

Ini menentukan istilah ("PR" vs "MR"), tool CLI, dan format webhook di Layer 5 — dokumen ini
memakai istilah "PR" secara default tapi ganti ke terminologi platform yang terdeteksi.

### Langkah 3c — Deteksi Topologi Backend
Cek apakah backend ada di dalam repo atau dimiliki tim/repo lain:
- Ada folder backend (mis. `apps/api`, `server/`) dengan schema DB, controller, service sendiri
  → **full-stack monorepo**, Backend Agent relevan dibuat.
- Repo hanya berisi frontend yang consume API eksternal (`server/api/` cuma berisi mock/fixture,
  tidak ada koneksi DB langsung, ada dokumentasi/OpenAPI spec dari tim lain) → **pure frontend
  consumer**. Jangan buat Backend Agent — buat ADR yang menjelaskan batas ini (mis.
  `adr-client-side-only-no-bff.md`) supaya Planner Agent tahu backend selalu di luar scope dan
  gap kontrak API harus ditandai `OPEN QUESTION`/blocker, bukan diasumsikan bisa diimplementasi.

### Langkah 3d — Deteksi Sensitivitas Keamanan/Compliance
Cek indikasi domain sensitif: folder/kode terkait `auth`, `rbac`, `permission`, `encrypt`,
`pii`, atau README yang menyebut compliance (SOC2, HIPAA, dst).
- Kalau terdeteksi → tandai project sebagai **security-sensitive**. Ini menambah requirement di
  Layer 1 (ADR wajib untuk enforcement layer & secret exposure) dan Layer 2 (`.claude/settings.json`
  dengan Bash allow/deny rules sebagai defense-in-depth, bukan cuma scope di file agent markdown).
- Kalau tidak terdeteksi → lewati, tidak perlu dipaksakan.

### Langkah 4 — Eksekusi Bertahap
Jalankan **Fase 1 → Fase 4** sesuai urutan di bagian "Urutan Implementasi" di bawah.
Setelah tiap fase selesai, **berhenti dan laporkan** ke user sebelum lanjut ke fase berikutnya —
jangan menjalankan Fase 3 (otomasi VPS/webhook) tanpa konfirmasi eksplisit, karena fase ini
melibatkan kredensial dan infrastruktur live.

### Langkah 5 — Jangan Duplikasi Isi
Kalau project sudah punya sebagian dari Layer 1 (misal sudah ada `CLAUDE.md`), **update/lengkapi**,
jangan timpa total. Prinsip CAF: dokumen hidup yang berevolusi, bukan template sekali-tempel.

---

## Apa itu CAF

CAF adalah framework untuk menjadikan AI sebagai anggota tim engineering yang bisa mengerjakan
ticket dari awal sampai Pull Request secara otomatis. AI tidak hanya membantu menulis kode — ia
merencanakan, mengimplementasikan, memverifikasi, dan melaporkan hasilnya, mengikuti aturan dan
konvensi yang sudah ditetapkan tim.

CAF bukan produk jadi yang di-install sekali selesai. Ini adalah **struktur yang dibangun
bertahap** di dalam repo project kamu, dan makin baik seiring dengan iterasi.

CAF tidak terikat pada stack, tracker, atau AI runner tertentu — dokumen ini generik dan
menyesuaikan diri lewat proses deteksi di Bagian 0.

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

Ini mencegah dua masalah paling umum di AI coding: langsung coding tanpa arah, dan mengaku
selesai tanpa verifikasi.

---

## Pipeline Lengkap

```
Ticket masuk ({{TRACKER}}/GitHub Issues)
  ↓
Planner Agent      — baca ticket, buat rencana (jangan sentuh kode)
  ↓
Architect Agent    — tentukan pendekatan teknis (opsional, untuk task kompleks)
  ↓
{{APP_1}}/{{APP_2}} Agent — implementasi + self-verify (retry max 3x)
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

**Catatan penting:** Review manusia tetap wajib sebelum merge. Tidak ada auto-merge dalam
kondisi apapun.

---

## 5 Layer yang Harus Dibangun

### Layer 1 — Project Knowledge Base
> Fondasi agar AI benar-benar memahami project kamu

**File yang dibutuhkan** (sesuaikan jumlah `{{APP_N}}/CLAUDE.md` dengan jumlah app terdeteksi):

```
CLAUDE.md                       ← instruksi utama untuk Claude Code (<150 baris)
AGENTS.md                       ← instruksi untuk semua AI coding agent (cross-tool)
{{APP_1}}/CLAUDE.md             ← konvensi spesifik {{APP_1}} (mis. frontend)
{{APP_2}}/CLAUDE.md             ← konvensi spesifik {{APP_2}} (mis. backend)

docs/
  decisions/                    ← ADR: kenapa keputusan teknis diambil
    adr-001-*.md
  golden-examples/               ← kode nyata sebagai referensi (bukan deskripsi)
    {{APP_2}}/                   ← contoh thin controller, fat service, DTO tervalidasi, dst
    {{APP_1}}/                   ← contoh komponen ideal, composable/hook pattern, API service
```

**Prinsip:**
- `CLAUDE.md` isi **behavior saja**, bukan penjelasan umum yang AI sudah tahu
- `golden-examples` bukan file baru — **copy dari file existing yang paling rapi** di codebase
  hasil deteksi Langkah 2
- ADR menjawab **"kenapa"**, bukan cuma "apa aturannya"
- Iteratif: tiap kali agent salah konvensi, update knowledge base-nya (lihat pola: convention
  yang muncul organik saat testing → didokumentasikan setelahnya, bukan diprediksi di awal)

**Kalau project ditandai security-sensitive (Langkah 3d):**
- ADR wajib mencakup: enforcement layer untuk RBAC/permission (di layer mana dicek — middleware,
  composable, guard — dan kenapa di situ), serta larangan eksplisit expose secret/key di kode
  client-side (mis. `NUXT_PUBLIC_*`/`NEXT_PUBLIC_*` env yang ke-bundle ke browser).
- `CLAUDE.md`/`AGENTS.md` cantumkan larangan konkret dengan contoh salah, bukan cuma prinsip
  abstrak "jaga keamanan".

---

### Layer 2 — Agent Definitions
> Tiap agent punya peran, scope, dan kontrak yang jelas

Simpan di `.claude/agents/` (untuk Claude Code) atau folder equivalen untuk tool lain
(`.kiro/agents/`, `.opencode/agents/`, dst — sesuaikan dengan AI runner yang dipilih project).

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
[perintah konkret yang harus dijalankan sebelum selesai — isi dari deteksi script di package.json]

## Retry Logic
[kalau verify gagal: perbaiki dan coba lagi max N kali]
```

**8 Agent Spesialis (sesuaikan nama {{APP_1}}/{{APP_2}} dengan hasil deteksi):**

| Agent | Fase | Output Artifact |
|---|---|---|
| Planner | Plan | `requirements.md`, `tasks.md` |
| Architect | Plan (opsional) | `design.md` |
| {{APP_1}} (mis. Frontend) | Implement + Verify | kode + `verify-report.md` |
| {{APP_2}} (mis. Backend) | Implement + Verify | kode + `verify-report.md` |
| QA | Verify mendalam | `qa-report.md` |
| Reviewer | Review kualitatif | `review-notes.md` |
| Documentation | Paralel | update `docs/` |
| DevOps | Post-merge (next phase) | deployment |

**Model Routing (hemat token):**
- Model kecil/murah → task sederhana (rename, format, lookup)
- Model standar → implementasi standar, debugging, review
- Model paling mampu → arsitektur kompleks, keputusan besar

> Catatan implementasi nyata: sebelum menugaskan agent ke ticket kompleks yang melibatkan
> lebih dari satu app, jalankan Planner Agent dulu secara terpisah — celah kontrak antar layer
> (mis. parameter query yang belum ada di DTO backend) baru sering ketahuan di tahap ini, dan
> itu tanda pipeline bekerja dengan benar, bukan tanda ticket-nya tidak lengkap.

**Rule OPEN QUESTIONS (generalisasi, berlaku untuk semua agent, bukan cuma gap kontrak backend):**
Klaim behavior apapun — komponen shared, service eksternal, sistem lain — yang cuma diinferensi
dari **membaca kode tanpa menjalankan/mengetest**, wajib ditandai `OPEN QUESTION` di `tasks.md`
atau `requirements.md`, bukan ditulis seolah sudah pasti. Ini mencegah Planner/agent implementasi
membangun rencana di atas asumsi yang belum terverifikasi.

**Defense-in-depth untuk security-sensitive project (Langkah 3d):**
Selain scope yang didefinisikan di file agent markdown, tambahkan `.claude/settings.json`
berisi Bash allow/deny rules eksplisit (mis. blok `curl`/`rm -rf` di luar workspace, blok akses
ke `.env`). File markdown mendefinisikan *niat* scope; `settings.json` menegakkannya di level
tool — jangan andalkan satu lapis saja untuk project dengan data sensitif.

---

### Layer 3 — Artifact Handoff
> Agent tidak saling "ngobrol" — mereka saling lempar file

Setiap ticket punya folder sendiri. Agent membaca output agent sebelumnya dari folder ini,
bukan dari memori atau chat. Nama folder mengikuti key ticket dari tracker yang dipakai
(`ENG-123` untuk Linear/Jira, atau nomor issue untuk GitHub Issues) — konsisten dengan nama
branch `ai-agent/{{TICKET-ID}}`.

```
.ai/tasks/{{TICKET-ID}}/
  requirements.md    ← Planner Agent: apa yang diminta, acceptance criteria
  design.md          ← Architect Agent: pendekatan teknis (kalau perlu)
  tasks.md           ← Planner Agent: breakdown task konkret
  verify-report.md   ← {{APP_1}}/{{APP_2}} Agent: hasil implement + verify
  qa-report.md       ← QA Agent: hasil test mendalam
  review-notes.md    ← Reviewer Agent: hasil review kualitatif
```

**Format `verify-report.md`:**
```markdown
## Ticket: {{TICKET-ID}}
## Status: SUCCESS / NEEDS_HUMAN

## Attempt Log
- Attempt 1: FAIL — [error]
- Attempt 2: PASS

## Acceptance Criteria
- [x] kriteria 1 — terpenuhi di File.ext baris N
- [x] kriteria 2 — terpenuhi di service.ext

## Quality Gate
- Lint: PASS
- Typecheck: PASS
- Test: PASS / SKIP (alasan)

## Catatan
[deviasi dari plan, kalau ada]
```

**Rule Retry Budget dan QA Handoff:**
- Kalau QA Agent menemukan gap setelah implementasi agent sebelumnya sudah `SUCCESS` di quality
  gate, fix atas temuan QA **melanjutkan Attempt Log yang sama** (mis. "Attempt 2: fix QA Finding
  #1 dan #2"), bukan retry budget baru yang terpisah dari batas max 3x.
- QA Agent **tidak boleh jalan** kalau status agent implementasi sebelumnya masih `NEEDS_HUMAN` —
  itu precondition wajib dicek di awal `qa.md`, supaya QA tidak menguji kode yang penulisnya
  sendiri sudah mengaku gagal.

---

### Layer 4 — Quality Gates
> Checkpoint yang benar-benar dieksekusi, bukan cuma instruksi teks

**Minimal yang harus ada** (isi command sesuai script yang benar-benar ada di `package.json`
hasil deteksi — jangan asumsikan nama script tanpa verifikasi):
```bash
{{PKG_MANAGER}} typecheck   # wajib pass
{{PKG_MANAGER}} lint        # wajib pass — VERIFIKASI dulu script ini ada; kalau tidak ada,
                             # laporkan sebagai gap infrastruktur, jangan buat quality gate palsu
{{PKG_MANAGER}} test        # wajib pass (kalau ada test relevan)
{{PKG_MANAGER}} build       # wajib pass sebelum PR dibuka
```

**Scoped lint vs full lint (Hard Stop yang adil):**
Jalankan dua level lint, jangan cuma satu:
- **Full lint** (`{{PKG_MANAGER}} lint` di seluruh repo) → non-blocking, untuk audit menyeluruh,
  hasilnya dilaporkan tapi tidak menggagalkan task.
- **Scoped lint** (hanya file yang diubah task ini, ambil dari
  `git diff --name-only origin/main...HEAD`) → ini yang jadi Hard Stop quality gate. Agent hanya
  boleh disalahkan atas kode yang benar-benar ia tulis, bukan pelanggaran pre-existing di file
  lain yang kebetulan ada di repo yang sama.

**Rule Baseline-Comparison untuk quality gate FAIL yang diklaim pre-existing:**
Gate (`typecheck`/`test`/`build`) yang FAIL tetap boleh dilaporkan `Status: SUCCESS` **hanya**
kalau semua syarat berikut dipenuhi — kalau tidak, FAIL tetap `NEEDS_HUMAN`:
1. Dibuktikan pre-existing lewat baseline comparison (`git stash` lalu jalankan ulang gate yang
   sama) — hasil FAIL harus **identik** sebelum dan sesudah perubahan task ini.
2. Bukti comparison dicatat eksplisit di `Attempt Log`, bukan sekadar klaim "ini pre-existing"
   tanpa langkah verifikasi yang ditunjukkan.
3. FAIL tersebut dilaporkan sebagai temuan terpisah di `Catatan` — agent wajib merekomendasikan
   pembuatan ticket terpisah untuk isu infra ini, dengan ringkasan error yang cukup untuk
   di-follow-up manusia.
4. Field `Quality Gate` di `verify-report.md` tetap jujur menunjukkan FAIL untuk gate yang gagal
   — jangan ditulis PASS demi laporan terlihat bersih.

**Buat file `.ai/workflows/task-completion.md`** berisi:
- Definition of Done yang eksplisit
- Commands yang harus dijalankan
- Documentation update rules (endpoint baru → update api-contract.md, dst)
- PR checklist sebelum branch dianggap siap

**Tambahan yang direkomendasikan:**
- Custom lint rule untuk aturan kritis yang tidak boleh dilanggar (spesifik ke domain project,
  mis. query tanpa `tenant_id` scope, business logic di controller)
- Git hook sebagai backstop terakhir
- Cek keberadaan artifact build lama yang ter-commit (`.js`/`.d.ts` hasil compile) — ini bisa
  membuat lint gate jadi tidak reliable karena error pada file yang seharusnya tidak diedit AI

**Kalau `verify-report.md` status `NEEDS_HUMAN`:**
- Pipeline berhenti
- Komentar otomatis ke ticket berisi ringkasan error
- Status ticket diubah ke "Blocked" atau "Needs Review"
- Developer yang di-mention untuk handle manual

---

### Layer 5 — Orchestration
> Mesin yang menjalankan pipeline secara otomatis. **Pilih satu varian sesuai hasil Langkah 3.**

**Komponen infrastruktur (sama untuk semua tracker):**
```
VPS kecil (~$5-6/bulan)
  └── Webhook Receiver (Express, ~150 baris)
        └── Spawn AI runner per-agent (on-demand, bukan nyala terus)
              └── Akses MCP: {{TRACKER}} MCP + {{VCS}} MCP / gh CLI / glab CLI
```
`{{VCS}}` diisi dari hasil deteksi Langkah 3b (GitHub atau GitLab). Kalau GitLab yang terdeteksi,
ganti seluruh istilah "PR"/"Pull Request" di dokumen-dokumen turunan (`task-completion.md`,
agent files) jadi "MR"/"Merge Request", dan `gh pr create` jadi `glab mr create`.

#### Varian A — Linear
```
Linear event (status ticket berubah ke "Ready for AI")
  → POST /webhook/linear
  → verifikasi signature
  → parse ticket ID + deskripsi
  → git checkout -b ai-agent/{{TICKET-ID}}
  → spawn: agent planner
  → spawn: agent {{APP_1}} (baca .ai/tasks/{{TICKET-ID}}/)
  → baca verify-report.md
      SUCCESS  → komentar ke Linear, branch siap review
      NEEDS_HUMAN → komentar error ke Linear, stop pipeline
```
Yang perlu disiapkan: Linear API token, GitHub token, Anthropic API key, Linear webhook secret.

#### Varian B — Jira
```
Jira event (status berubah ke "In Progress" / status custom "Ready for AI")
  → POST /webhook/jira
  → verifikasi signature (header x-hub-signature, shared secret)
  → parse issue key, summary, description, assignee
  → git checkout -b ai-agent/{{TICKET-ID}}
  → spawn: agent planner
  → spawn: agent {{APP_1}} (baca .ai/tasks/{{TICKET-ID}}/)
  → baca verify-report.md
      SUCCESS  → post komentar ke Jira, branch siap review
      NEEDS_HUMAN → post komentar error, ubah status ke "Blocked", stop pipeline
```
Yang perlu disiapkan: Jira API token + email, Jira base URL, Jira project key, Jira webhook
secret, GitHub token, Anthropic API key.

Perbedaan teknis penting: payload Jira lebih verbose (`issue.key`, `issue.fields.summary`,
`issue.fields.status.name`); status transition pakai ID numerik (fetch dulu
`GET /rest/api/3/issue/{key}/transitions`); komentar diposting via
`POST /rest/api/3/issue/{key}/comment` dengan format ADF atau plain text.

#### Varian C — GitHub Issues (fallback tanpa tracker eksternal)
```
GitHub Issue event (label "ready-for-ai" ditambahkan)
  → GitHub webhook / GitHub Actions trigger
  → parse issue number + body
  → git checkout -b ai-agent/issue-{{NUMBER}}
  → spawn: agent planner → spawn: agent {{APP_1}}
  → baca verify-report.md
      SUCCESS  → komentar ke issue, branch siap review
      NEEDS_HUMAN → komentar error, label "blocked", stop pipeline
```
Yang perlu disiapkan: GitHub token dengan scope Actions + Issues, Anthropic API key.

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
│       ├── {{app_1}}.md             ← Layer 2
│       ├── {{app_2}}.md             ← Layer 2
│       ├── qa.md                    ← Layer 2
│       ├── reviewer.md              ← Layer 2
│       └── documentation.md         ← Layer 2
│
├── .ai/
│   ├── workflows/
│   │   ├── task-completion.md       ← Layer 4
│   │   ├── piv-workflow.md          ← Layer 4, SOP PIV + retry
│   │   └── agent-handoff.md         ← Layer 3, format artifact
│   └── tasks/
│       ├── README.md                ← jelasin struktur untuk agent
│       └── .gitkeep
│
├── docs/
│   ├── decisions/                   ← Layer 1, ADR
│   ├── golden-examples/             ← Layer 1, referensi kode
│   │   ├── {{app_2}}/
│   │   └── {{app_1}}/
│   ├── architecture/
│   └── ...                          ← sesuaikan domain project
│
└── {{apps_dir}}/ / {{packages_dir}}/ ← kode project seperti biasa
```

---

## Urutan Implementasi yang Disarankan

### Fase 1 — Fondasi (mulai di sini)
1. Buat `CLAUDE.md` root yang ringkas (<150 baris) + `CLAUDE.md` per-app
2. Buat `AGENTS.md` dengan aturan konkret (bukan abstrak), lengkap dengan contoh benar/salah
3. Pilih 2-3 file existing paling rapi → copy ke `docs/golden-examples/`
4. Tulis 2 ADR paling kritis untuk project kamu → `docs/decisions/`
5. Buat `.ai/workflows/task-completion.md` berisi Definition of Done + PR checklist
   — **verifikasi dulu semua script yang direferensikan benar-benar ada**, jangan asumsi

### Fase 2 — Agent & Artifact
6. Buat `planner.md` + agent implementasi yang paling relevan dulu
7. Buat `.ai/workflows/piv-workflow.md` + `agent-handoff.md`
8. Test manual: jalankan agent planner untuk 1-2 ticket nyata, tanpa trigger otomatis
   — mulai dari ticket single-agent sederhana, baru naik ke ticket multi-agent
9. Evaluasi: seberapa akurat plan, seberapa bersih kode, berapa token terpakai

### Fase 3 — Otomasi (perlu konfirmasi eksplisit dari user sebelum mulai)
Karena fase ini menyentuh infrastruktur nyata (server, kredensial), jalankan bertahap — jangan
langsung full-otomatis di percobaan pertama:
10. **PLAN infrastruktur** — spek VPS, struktur webhook receiver, skema keamanan (signature
    verification)
11. Setup VPS + deploy webhook receiver skeleton, **test lokal dulu** sebelum connect ke tracker
12. Connect MCP tracker (Linear/Jira) sesuai Varian yang dipilih — baru setelah receiver sendiri
    teruji jalan
13. Aktifkan trigger otomatis dari webhook, lalu **test dengan 1 ticket nyata** — bandingkan
    hasilnya dengan hasil test manual di Fase 2 poin 8 untuk pastikan behavior konsisten
14. Tambah agent berikutnya (QA, Reviewer) satu per satu, setelah Planner + agent implementasi
    stabil lewat trigger otomatis (bukan cuma stabil waktu manual)

### Fase 4 — Hardening
15. Tambah custom lint rule untuk aturan kritis
16. Tambah pembuatan PR/MR otomatis di akhir pipeline (`gh pr create` atau `glab mr create`,
    sesuai VCS terdeteksi di Langkah 3b)
17. Evaluasi swap/bandingkan AI runner (kalau relevan)
18. AI PR/MR Reviewer + DevOps Agent

---

## Yang Tidak Perlu Dilakukan

- Jangan install framework agent lain — ambil konsepnya saja jika perlu
- Jangan buat semua agent sekaligus — mulai dari Planner + 1 agent implementasi
- Jangan auto-merge — review manusia tetap wajib di semua fase
- Jangan taruh semua aturan di satu file raksasa — pisah per-scope, per-layer
- Jangan anggap `CLAUDE.md` selesai ditulis sekali — ini dokumen hidup yang diupdate tiap kali
  agent salah konvensi
- Jangan jalankan Fase 3 tanpa konfirmasi eksplisit dari user — ini menyentuh kredensial dan
  infrastruktur live

---

## Referensi Teknologi (generik, isi kolom kanan sesuai deteksi/preferensi project)

| Kebutuhan | Pilihan Umum | Isi Project Ini |
|---|---|---|
| Ticket tracker | Linear / Jira / GitHub Issues | `{{TRACKER}}` |
| VCS platform | GitHub / GitLab | `{{VCS}}` |
| Topologi backend | Full-stack monorepo / pure frontend consumer | `{{BACKEND_TOPOLOGY}}` |
| AI runner | Claude Code (default), OpenCode, dst | `{{AI_RUNNER}}` |
| MCP | Tracker MCP + VCS MCP | `{{MCP_LIST}}` |
| PR & branch | `gh`/`glab` CLI (fase awal), MCP (fase mature) | — |
| Webhook receiver | Node.js + Express | — |
| Queue | `p-queue` (mencegah race condition) | — |
| Runner infra | VPS kecil (Hetzner CX22 / DigitalOcean Droplet) | — |
| Artifact storage | File Markdown di branch git | — |

---

## Lampiran A — Placeholder Reference

Diisi AI di Langkah 2–3 sebelum generate file apapun.

| Placeholder | Diisi dari | Contoh |
|---|---|---|
| `{{APP_1}}`, `{{APP_2}}` | Nama folder app hasil deteksi | `web`, `api` |
| `{{PKG_MANAGER}}` | `packageManager` di `package.json` root | `pnpm`, `npm`, `yarn` |
| `{{apps_dir}}` / `{{packages_dir}}` | Struktur monorepo terdeteksi | `apps/`, `packages/` |
| `{{TRACKER}}` | Hasil deteksi/konfirmasi Langkah 3 | `Linear`, `Jira`, `GitHub Issues` |
| `{{VCS}}` | Hasil deteksi Langkah 3b | `GitHub`, `GitLab` |
| `{{BACKEND_TOPOLOGY}}` | Hasil deteksi Langkah 3c | `full-stack monorepo`, `pure frontend consumer` |
| `{{AI_RUNNER}}` | Folder config AI terdeteksi, atau tanya user | `Claude Code` |
| `{{TICKET-ID}}` | Format key tracker yang dipilih | `ENG-123`, `#42` |

> Jika salah satu placeholder tidak bisa dipastikan dari deteksi otomatis, **tanyakan ke user**
> alih-alih menebak. Placeholder yang salah isi akan menyebar ke seluruh Layer 1–5.