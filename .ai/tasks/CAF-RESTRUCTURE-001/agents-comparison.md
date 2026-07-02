# Perbandingan: .agents/ vs .claude/agents/reviewer.md

**Tujuan:** Membantu developer memutuskan apakah `.agents/` aman dihapus setelah step 4 selesai.

---

## 1. Sumber di .agents/

### `.agents/rules/antigravity-rtk-rules.md`
- Konten: Aturan penggunaan RTK proxy untuk AI agent
- Status: **Tidak ada padanannya di .claude/agents/**
- Rekomendasi plan: Migrate → tambah section di AGENTS.md (belum dikerjakan di PR ini)

### `.agents/skills/code-review/SKILL.md`
- Konten: **Identik 100%** dengan `.claude/agents/code-reviewer.md`
- Sudah dicover sepenuhnya oleh `code-reviewer.md`
- Aman dihapus

### `.agents/skills/secutiry-check/SKILL.md`
- Konten: Grep-based security audit (multi-tenant scope, RBAC coverage, DTO validation, password exposure, SQL injection)
- Perbedaan dari `code-reviewer.md`:
  - Lebih detail di grep commands (ada command ready-to-run)
  - Fokus per-module (bukan per-diff)
  - Format output berbeda: ✅/⚠️/❌ vs 🔴/🟡/🔵
  - Ada "Hard fail conditions" eksplisit

### `.agents/skills/add-api-module/SKILL.md`
- Konten: Template scaffold NestJS module (file templates lengkap)
- Padanannya: Akan di-fold ke `.claude/agents/backend.md` (step 4)

### `.agents/skills/add-web-module/SKILL.md`
- Konten: Template scaffold Vue module (file templates lengkap)
- Padanannya: Akan di-fold ke `.claude/agents/frontend.md` (step 4)

### `.agents/skills/implement-task/SKILL.md`
- Konten: End-to-end task implementation workflow
- Padanannya: Akan di-fold ke `backend.md` + `frontend.md` (step 4)

### `.agents/skills/db-migrate/SKILL.md`
- Konten: Prisma migration steps + naming convention
- Padanannya: Akan di-fold ke `.claude/agents/backend.md` (step 4)

### `.agents/skills/task-done/SKILL.md`
- Konten: DoD checklist + docs update
- Padanannya: Sebagian sudah di `.ai/workflows/task-completion.md` (perlu enhance — bukan di PR ini)

---

## 2. Isi .claude/agents/reviewer.md (yang dibuat di step 4)

`reviewer.md` menggabungkan dua sumber:
1. **Format & severity dari `code-reviewer.md`** — 🔴/🟡/🔵 system, output one-line per finding
2. **Security grep checks dari `secutiry-check/SKILL.md`** — grep commands per-module yang bisa dijalankan langsung

**Yang TIDAK tercakup di reviewer.md** (sengaja di-scope out):
- Grep commands dari `secutiry-check` yang format-nya standalone script — ini tetap berguna sebagai security-check standalone (tapi sudah dicover oleh `.claude/agents/code-reviewer.md` yang ada)
- RTK usage rules dari `antigravity-rtk-rules.md` — ini perlu di-merge ke AGENTS.md (belum dikerjakan di PR ini)

---

## 3. Keputusan: Kapan Aman Hapus .agents/?

**Aman dihapus SETELAH:**
- [x] `.claude/agents/backend.md` dibuat (fold add-api-module + db-migrate + implement-task backend) — **dikerjakan di step 4**
- [x] `.claude/agents/frontend.md` dibuat (fold add-web-module + implement-task frontend) — **dikerjakan di step 4**
- [x] `.claude/agents/reviewer.md` dibuat (fold secutiry-check) — **dikerjakan di step 4**
- [ ] `.agents/rules/antigravity-rtk-rules.md` di-merge ke AGENTS.md — **BELUM dikerjakan, perlu PR terpisah**
- [ ] `.agents/skills/task-done/SKILL.md` di-merge ke `task-completion.md` — **BELUM dikerjakan**

**Rekomendasi:** Hapus `.agents/` di PR berikutnya, setelah AGENTS.md diupdate dengan RTK rules.
Jika ingin hapus sekarang: RTK rules perlu di-copy ke AGENTS.md dulu (satu section pendek).

---

## 4. Diff Fungsional: .agents/skills/ vs .claude/agents/

| `.agents/skills/` | `.claude/agents/` (setelah step 4) | Coverage |
|---|---|---|
| `code-review/SKILL.md` | `code-reviewer.md` (existing) | ✅ 100% |
| `secutiry-check/SKILL.md` | `reviewer.md` (step 4, security section) | ✅ ~90% (grep commands tetap ada) |
| `add-api-module/SKILL.md` | `backend.md` (step 4) | ✅ 100% |
| `add-web-module/SKILL.md` | `frontend.md` (step 4) | ✅ 100% |
| `implement-task/SKILL.md` | `backend.md` + `frontend.md` (step 4) | ✅ 100% |
| `db-migrate/SKILL.md` | `backend.md` (step 4) | ✅ 100% |
| `task-done/SKILL.md` | `task-completion.md` (enhance — belum) | ⚠️ 70% |
| `antigravity-rtk-rules.md` | AGENTS.md section (belum) | ❌ 0% |
