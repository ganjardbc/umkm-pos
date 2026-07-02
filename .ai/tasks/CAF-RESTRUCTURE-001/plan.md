# CAF-RESTRUCTURE-001 — Audit & Rencana Restrukturisasi Folder

**Status:** PLAN (belum dieksekusi — menunggu approval developer)
**Tanggal audit:** 2026-07-01

---

## 1. Inventaris Lengkap Folder/File yang Dievaluasi

### Root Level
```
CLAUDE.md                    — 4.6K
AGENTS.md                    — 9.0K
CAF.md                       — 11.4K  (framework reference)
CAF-Getting-Started.md       — 11.4K  (tampak duplikat CAF.md)
README.md                    — 1.1K
src/                         — KOSONG
```

### `.claude/`
```
.claude/agents/code-reviewer.md      — CAF Layer 2 agent (ada 1 dari 7 yang dibutuhkan)
.claude/settings.local.json          — local config, skip dari audit
```

### `.ai/`
```
.ai/skills/api-contract.md           — pattern reference
.ai/skills/code-review.md            — review checklist deskriptif
.ai/skills/nestjs-module.md          — pattern reference NestJS
.ai/skills/pinia-store.md            — pattern reference Pinia
.ai/skills/prisma-schema.md          — pattern reference Prisma
.ai/skills/vue-module.md             — pattern reference Vue

.ai/workflows/task-completion.md     — ✅ CAF Layer 4 (ada)

MISSING:
.ai/workflows/piv-workflow.md        — ❌
.ai/workflows/agent-handoff.md       — ❌
.ai/tasks/README.md                  — ❌
.ai/tasks/.gitkeep                   — ❌
```

### `.agents/` (tidak ada di struktur target CAF)
```
.agents/rules/antigravity-rtk-rules.md
.agents/skills/add-api-module/SKILL.md
.agents/skills/add-web-module/SKILL.md
.agents/skills/code-review/SKILL.md
.agents/skills/db-migrate/SKILL.md
.agents/skills/implement-task/SKILL.md
.agents/skills/secutiry-check/SKILL.md   ← typo: "secutiry"
.agents/skills/task-done/SKILL.md
```

### `.kiro/` (Kiro AI tool — tidak ada di struktur target CAF)
```
Prompts (4): opsx-apply, opsx-archive, opsx-explore, opsx-propose
Skills (4):  openspec-apply-change, openspec-archive-change, openspec-explore, openspec-propose
Specs (4):   dashboard-reports-page/, multi-cashier-shifts/, pos-terminal-interface/, product-category-management/
Historical reports (18): *_SUMMARY.md, *_PLAN.md, *_ANALYSIS.md, *_IMPLEMENTATION.md, dsb.
```

### `.opencode/` (OpenCode tool — tidak ada di struktur target CAF)
```
commands/ (4): opsx-apply, opsx-archive, opsx-explore, opsx-propose (identik dengan .kiro/prompts/)
skills/ (4):   openspec-* (identik dengan .kiro/skills/)
package.json, package-lock.json, .gitignore, node_modules/
```

### `openspec/` (OpenSpec framework — tidak ada di struktur target CAF)
```
config.yaml
changes/archive/ (2): 2026-05-11-file-upload-to-s3/, 2026-05-14-add-image-uploads-to-features/
changes/create-landing-app/     ← ACTIVE change (belum diimplementasi)
specs/ (3): feature-image-uploads/, file-upload/, reusable-upload-infrastructure/
utils/
```

### `docs/`
```
✅ Ada: api/, architecture/, backend/, database/, development/, frontend/, product/, runbooks/
❌ Missing dari CAF:
   docs/decisions/              — ADR folder
   docs/golden-examples/backend/
   docs/golden-examples/frontend/
```

### Per-App Files
```
✅ apps/web/CLAUDE.md
✅ apps/web/AGENTS.md
✅ apps/api/CLAUDE.md
✅ apps/api/AGENTS.md
```

---

## 2. Tabel Keputusan

| Folder/File | Isi & Fungsi Saat Ini | Tumpang Tindih dengan CAF? | Rekomendasi | Alasan |
|---|---|---|---|---|
| `CAF.md` | Dokumen framework CAF — panduan lengkap | Tidak — ini source of truth | **Keep** | Reference wajib |
| `CAF-Getting-Started.md` | Konten identik dengan CAF.md | Ya, duplikat | **Hapus** | Redundant |
| `src/` | Directory kosong | Tidak ada | **Hapus** | Tidak dipakai, bukan bagian monorepo structure |
| `.agents/rules/antigravity-rtk-rules.md` | Aturan penggunaan RTK proxy untuk AI agent | Parsial — ini behavior rule tapi tidak ada di CAF target | **Migrate → AGENTS.md** (tambah section "Tool Usage Rules") | Aturan AI tool usage lebih cocok di AGENTS.md daripada folder tersendiri |
| `.agents/skills/add-api-module/SKILL.md` | Scaffold NestJS module — template + checklist | Overlap dengan `.claude/agents/backend.md` (CAF, belum ada) | **Migrate → `.claude/agents/backend.md`** (folded sebagai section) | Content implementation steps ini menjadi bagian backend agent definition |
| `.agents/skills/add-web-module/SKILL.md` | Scaffold Vue module — template + checklist | Overlap dengan `.claude/agents/frontend.md` (CAF, belum ada) | **Migrate → `.claude/agents/frontend.md`** (folded sebagai section) | Same reason |
| `.agents/skills/implement-task/SKILL.md` | Implement backlog task end-to-end | Overlap dengan CAF Backend + Frontend Agent + AGENTS.md | **Migrate → referensi di agent definitions** | Content sudah sebagian di AGENTS.md, sisanya masuk ke backend.md + frontend.md agents |
| `.agents/skills/task-done/SKILL.md` | DoD checklist + docs update + security grep | Overlap dengan `.ai/workflows/task-completion.md` | **Migrate → enhance `task-completion.md`** | task-completion.md ada tapi kurang: tidak ada security grep, tidak ada per-module guard check — merge dari sini |
| `.agents/skills/code-review/SKILL.md` | Code review checklist deskriptif (format lama) | Overlap dengan `.claude/agents/code-reviewer.md` (lebih lengkap) | **Hapus** | code-reviewer.md lebih complete, structured, dan Claude-agent compatible |
| `.agents/skills/db-migrate/SKILL.md` | Prisma migration steps + konvensi penamaan | Overlap dengan `.ai/skills/prisma-schema.md` dan AGENTS.md | **Migrate → `docs/golden-examples/backend/`** | Berguna sebagai pattern reference, tempatnya di golden-examples |
| `.agents/skills/secutiry-check/SKILL.md` | Security audit per-module (grep-based checks) | Overlap dengan CAF Reviewer Agent (belum ada) | **Migrate → `.claude/agents/reviewer.md`** (security section) | Content bagus untuk reviewer agent — bisa jadi security checklist dalam reviewer |
| `.ai/skills/nestjs-module.md` | Pattern reference NestJS — deskriptif | Overlap dengan AGENTS.md Backend Rules + `docs/golden-examples/` (missing) | **Migrate → `docs/golden-examples/backend/`** atau **Hapus** saat golden-examples dengan kode nyata dibuat | Ini descriptive patterns, bukan kode nyata. CAF inginkan file kode nyata di golden-examples |
| `.ai/skills/vue-module.md` | Pattern reference Vue module — deskriptif | Overlap dengan AGENTS.md Frontend Rules + `docs/golden-examples/` (missing) | **Migrate → `docs/golden-examples/frontend/`** atau **Hapus** saat golden-examples dibuat | Same reason |
| `.ai/skills/code-review.md` | Code review checklist deskriptif (duplicate fungsional) | Overlap dengan `.claude/agents/code-reviewer.md` | **Hapus** | code-reviewer.md lebih lengkap |
| `.ai/skills/pinia-store.md` | Pattern reference Pinia — deskriptif + code template | Overlap dengan AGENTS.md Store Rules | **Migrate → `docs/golden-examples/frontend/`** | Content berguna sebagai reference tapi tempatnya salah |
| `.ai/skills/api-contract.md` | Pattern reference API contract | Overlap dengan AGENTS.md API Rules + docs/api/api-contract.md | **Hapus** | Semua info sudah ada di AGENTS.md dan docs/api/ |
| `.ai/skills/prisma-schema.md` | Pattern reference Prisma schema — detail | Overlap dengan AGENTS.md Database Rules | **Migrate → `docs/golden-examples/backend/`** | Content lebih detailed dari AGENTS.md — berguna sebagai golden reference |
| `.ai/workflows/task-completion.md` | ✅ DoD workflow — Layer 4 CAF | Ada — ini yang diminta CAF | **Keep + Enhance** | Perlu tambah security verification greps dari `task-done/SKILL.md` |
| `.kiro/specs/dashboard-reports-page/` | Feature spec (requirements + design + tasks) — dashboard reports | Overlap struktur dengan CAF `.ai/tasks/TICKET-ID/` | **Migrate → `.ai/tasks/dashboard-reports-page/`** | Sama persis strukturnya. Ini archived spec (fitur sudah diimplementasi) |
| `.kiro/specs/multi-cashier-shifts/` | Feature spec — multi cashier | Same as above | **Migrate → `.ai/tasks/multi-cashier-shifts/`** | Same |
| `.kiro/specs/pos-terminal-interface/` | Feature spec — POS terminal | Same as above | **Migrate → `.ai/tasks/pos-terminal-interface/`** | Same |
| `.kiro/specs/product-category-management/` | Feature spec — product category | Same as above | **Migrate → `.ai/tasks/product-category-management/`** | Same |
| `.kiro/prompts/*` (4 files) | opsx workflow prompts untuk Kiro AI tool | Tidak overlap dengan CAF — ini Kiro-specific | **Keep di `.kiro/`** | Tool-specific config, biarkan di tempatnya |
| `.kiro/skills/*` (4 files) | openspec skills untuk Kiro | Tidak overlap dengan CAF | **Keep di `.kiro/`** | Kiro-specific tool config |
| `.kiro/*.md/*.txt` (18 files) | Historical reports: summary, plan, analysis, checklist dari Kiro sessions past | Tidak ada equivalent di CAF — ephemeral artifacts | **Hapus** | Low value sebagai ongoing knowledge base. Ephemeral, bukan konvensi/keputusan arsitektur |
| `.opencode/commands/*` (4 files) | opsx commands untuk OpenCode — identik dengan `.kiro/prompts/` | Duplikat Kiro prompts, tidak overlap CAF | **Keep di `.opencode/`** | OpenCode-specific, biarkan |
| `.opencode/skills/*` (4 files) | openspec skills untuk OpenCode | Duplikat Kiro skills, tidak overlap CAF | **Keep di `.opencode/`** | OpenCode-specific, biarkan |
| `.opencode/package.json` dll. | npm package untuk OpenCode plugin | Tidak overlap | **Keep** | Tool infrastructure |
| `openspec/config.yaml` | OpenSpec framework config | Tidak overlap — tool config | **Keep** | Tool config |
| `openspec/changes/archive/*` (2 folders) | Archived change proposals: file-upload, image-uploads | Tidak ada di CAF — sudah archived | **Keep di openspec/archive** | Sudah di-archive, biarkan |
| `openspec/changes/create-landing-app/` | Active change proposal — belum diimplementasi | Overlap dengan CAF `.ai/tasks/` | **Keep di openspec/** atau **Migrate → `.ai/tasks/`** (pilihan developer) | Active change, perlu keputusan apakah tetap pakai openspec workflow atau migrasi ke CAF |
| `openspec/specs/*` (3 files) | Completed spec files | Tidak overlap langsung | **Keep di openspec/specs/** | Output dari openspec workflow |
| `docs/decisions/` | ❌ BELUM ADA — ADR folder (CAF Layer 1) | Perlu dibuat | **Create** | CAF Layer 1 wajib |
| `docs/golden-examples/backend/` | ❌ BELUM ADA (CAF Layer 1) | Perlu dibuat | **Create** | CAF Layer 1 — copy file kode nyata terbaik dari codebase |
| `docs/golden-examples/frontend/` | ❌ BELUM ADA (CAF Layer 1) | Perlu dibuat | **Create** | CAF Layer 1 — copy file kode nyata terbaik dari codebase |

---

## 3. Layer 2 — Agent Definitions yang Perlu Dibuat

Semua di `.claude/agents/`:

| File | Status | Konten Utama yang Harus Ada |
|---|---|---|
| `code-reviewer.md` | ✅ Ada | Multi-tenant, RBAC, controller thin, Prisma injection, POS atomicity |
| `planner.md` | ❌ Belum ada | Baca ticket, buat requirements.md + tasks.md, JANGAN sentuh kode |
| `architect.md` | ❌ Belum ada (opsional) | Tentukan pendekatan teknis, output design.md |
| `frontend.md` | ❌ Belum ada | Implement Vue module, PIV, verify checklist, folded dari add-web-module skill |
| `backend.md` | ❌ Belum ada | Implement NestJS module, PIV, verify checklist, folded dari add-api-module skill |
| `qa.md` | ❌ Belum ada | Test mendalam, edge case, output qa-report.md |
| `reviewer.md` | ❌ Belum ada | Review kualitatif + security (folded dari secutiry-check skill) |
| `documentation.md` | ❌ Belum ada | Update docs/ paralel, tidak blocking |

---

## 4. Layer 3 & 4 — Artifact Handoff & Workflow yang Perlu Dibuat

| File | Status | Isi |
|---|---|---|
| `.ai/workflows/task-completion.md` | ✅ Ada | Perlu enhance: tambah security grep checks dari task-done/SKILL.md |
| `.ai/workflows/piv-workflow.md` | ❌ Belum ada | SOP PIV: PLAN → IMPLEMENT → VERIFY, retry max 3x, eskalasi format |
| `.ai/workflows/agent-handoff.md` | ❌ Belum ada | Format artifact per agent, konvensi folder `.ai/tasks/TICKET-ID/` |
| `.ai/tasks/README.md` | ❌ Belum ada | Penjelasan struktur folder tasks untuk agent |
| `.ai/tasks/.gitkeep` | ❌ Belum ada | Placeholder agar folder masuk git |

---

## 5. Layer 1 — Knowledge Base yang Perlu Dibuat

| Item | Status | Catatan |
|---|---|---|
| `CLAUDE.md` root | ✅ Ada | Review apakah sudah <150 baris dan behavior-focused |
| `AGENTS.md` root | ✅ Ada | Sudah lengkap — perlu tambah section "Tool Usage Rules" untuk RTK |
| `apps/web/CLAUDE.md` | ✅ Ada | - |
| `apps/api/CLAUDE.md` | ✅ Ada | - |
| `apps/web/AGENTS.md` | ✅ Ada | - |
| `apps/api/AGENTS.md` | ✅ Ada | - |
| `docs/decisions/` | ❌ Belum ada | Buat 2 ADR paling kritis: (1) multi-tenant data scoping, (2) DB-first schema convention |
| `docs/golden-examples/backend/` | ❌ Belum ada | Copy file terbaik dari codebase: 1 controller tipis, 1 fat service, 1 DTO |
| `docs/golden-examples/frontend/` | ❌ Belum ada | Copy file terbaik: 1 Vue page, 1 composable/store, 1 service |

---

## 6. Ringkasan Rekomendasi per Aksi

### Hapus (5 item)
- `CAF-Getting-Started.md` — duplikat CAF.md
- `src/` — directory kosong
- `.agents/skills/code-review/SKILL.md` — sudah dicover code-reviewer.md
- `.ai/skills/code-review.md` — sudah dicover code-reviewer.md
- `.ai/skills/api-contract.md` — sudah tercakup AGENTS.md + docs/api/
- `.kiro/*.md/*.txt` (18 historical reports) — ephemeral artifacts, nilai rendah

### Migrate (9 item)
- `.agents/rules/antigravity-rtk-rules.md` → tambah section di AGENTS.md
- `.agents/skills/add-api-module/SKILL.md` → folded ke `.claude/agents/backend.md` (saat dibuat)
- `.agents/skills/add-web-module/SKILL.md` → folded ke `.claude/agents/frontend.md` (saat dibuat)
- `.agents/skills/implement-task/SKILL.md` → folded ke backend.md + frontend.md agents
- `.agents/skills/task-done/SKILL.md` → merge ke `.ai/workflows/task-completion.md`
- `.agents/skills/db-migrate/SKILL.md` → `docs/golden-examples/backend/db-migrate-guide.md`
- `.agents/skills/secutiry-check/SKILL.md` → folded ke `.claude/agents/reviewer.md` (saat dibuat)
- `.ai/skills/nestjs-module.md` → `docs/golden-examples/backend/` (atau hapus saat golden-examples kode nyata dibuat)
- `.ai/skills/vue-module.md` → `docs/golden-examples/frontend/` (atau hapus saat golden-examples kode nyata dibuat)
- `.ai/skills/pinia-store.md` → `docs/golden-examples/frontend/`
- `.ai/skills/prisma-schema.md` → `docs/golden-examples/backend/`
- `.kiro/specs/*/` (4 specs) → `.ai/tasks/*/` (sebagai archived task artifacts)

### Keep (tidak diubah)
- `.kiro/prompts/*`, `.kiro/skills/*` — Kiro tool-specific
- `.opencode/*` — OpenCode tool-specific
- `openspec/` — OpenSpec framework
- `docs/` existing folders

### Perlu Dibuat (20+ item)
- `docs/decisions/adr-001-multi-tenant-scoping.md`
- `docs/decisions/adr-002-db-first-schema-convention.md`
- `docs/golden-examples/backend/` (3 file kode nyata dari codebase)
- `docs/golden-examples/frontend/` (3 file kode nyata dari codebase)
- `.claude/agents/planner.md`
- `.claude/agents/architect.md` (opsional)
- `.claude/agents/frontend.md`
- `.claude/agents/backend.md`
- `.claude/agents/qa.md`
- `.claude/agents/reviewer.md`
- `.claude/agents/documentation.md`
- `.ai/workflows/piv-workflow.md`
- `.ai/workflows/agent-handoff.md`
- `.ai/tasks/README.md`
- `.ai/tasks/.gitkeep`

---

## 7. Urutan Eksekusi yang Direkomendasikan

### Fase A — Bersih-bersih (hapus, no risk)
1. Hapus `CAF-Getting-Started.md`
2. Hapus `src/`
3. Hapus `.agents/skills/code-review/SKILL.md`
4. Hapus `.ai/skills/code-review.md`
5. Hapus `.ai/skills/api-contract.md`
6. Hapus `.kiro/*.md/*.txt` (18 historical reports) — **konfirmasi developer dulu**

### Fase B — Migrate ke target locations
7. Tambah RTK rules ke AGENTS.md (section baru)
8. Merge `task-done/SKILL.md` ke `task-completion.md` (enhance)
9. Migrate `.kiro/specs/*/` → `.ai/tasks/*/`
10. Migrate `.ai/skills/nestjs-module.md` → `docs/golden-examples/backend/`
11. Migrate `.ai/skills/vue-module.md` → `docs/golden-examples/frontend/`
12. Migrate `.ai/skills/pinia-store.md` → `docs/golden-examples/frontend/`
13. Migrate `.ai/skills/prisma-schema.md` → `docs/golden-examples/backend/`
14. Migrate `.agents/skills/db-migrate/SKILL.md` → `docs/golden-examples/backend/`

### Fase C — Buat struktur CAF baru
15. Buat `docs/decisions/adr-001-multi-tenant-scoping.md`
16. Buat `docs/decisions/adr-002-db-first-schema-convention.md`
17. Pilih golden-examples dari codebase nyata (controller terbaik, service terbaik, Vue page terbaik, store terbaik)
18. Buat `.ai/workflows/piv-workflow.md`
19. Buat `.ai/workflows/agent-handoff.md`
20. Buat `.ai/tasks/README.md` + `.ai/tasks/.gitkeep`
21. Buat agent definitions di `.claude/agents/` (planner, frontend, backend, qa, reviewer, documentation)
    — folded dengan content dari `.agents/skills/` yang di-migrate

### Keputusan yang perlu approval developer
- `.kiro/*.md/*.txt` (18 files): hapus semua atau keep beberapa sebagai referensi?
- `openspec/changes/create-landing-app/`: tetap di openspec atau migrate ke `.ai/tasks/`?
- `.agents/` folder: setelah semua content di-migrate, hapus folder atau keep empty?

---

## 8. Catatan Khusus

### Dua sistem AI tools yang coexist
Project ini aktif menggunakan 3 AI tool berbeda:
- **Claude Code** → `.claude/`, `.agents/`
- **Kiro** → `.kiro/`
- **OpenCode** → `.opencode/`, `openspec/`

CAF adalah framework untuk Claude Code. Migration ini **tidak menghapus** config tool lain (.kiro, .opencode, openspec) — mereka tetap berjalan paralel. Yang di-cleanup hanya: duplikat, historical reports, dan item yang overlap dengan struktur CAF.

### `.agents/skills/` vs `.claude/agents/`
`.agents/skills/` menggunakan format skill Claude Code (ada `---` frontmatter). 
`.claude/agents/` menggunakan format Claude Code subagent definition.
Kedua format berbeda — content dari .agents/skills/ di-fold ke dalam .claude/agents/ definitions, bukan sekedar dipindah.

### `openspec/changes/create-landing-app/`
Ini satu-satunya active change di openspec. Jika landing app belum dikerjakan, pertahankan di openspec dan gunakan openspec workflow untuk implementasinya. Tidak perlu migrasi ke CAF kecuali ada keputusan untuk standardize ke CAF.
