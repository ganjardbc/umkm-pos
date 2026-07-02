# PIV Workflow — Plan → Implement → Verify

## Apa itu PIV

Semua agent di CAF mengikuti satu pola kerja:

```
PLAN       → buat rencana tertulis, JANGAN sentuh kode
IMPLEMENT  → eksekusi sesuai rencana
VERIFY     → cek sendiri sebelum mengaku selesai
              jika gagal → perbaiki dan coba lagi (max 3x)
              jika masih gagal → stop, eskalasi ke developer
```

Ini bukan sekedar convention — ini hard requirement. Agent yang skip PLAN dan langsung IMPLEMENT akan menghasilkan kode yang tidak sesuai konvensi. Agent yang skip VERIFY akan menghasilkan verify-report.md palsu.

---

## Phase: PLAN

### Siapa yang eksekusi
Planner Agent, Architect Agent

### Apa yang harus dibaca sebelum mulai
```
.ai/tasks/<TICKET-ID>/           — artifact dari agent sebelumnya
AGENTS.md                        — rules dan konvensi wajib
apps/api/CLAUDE.md               — konvensi backend
apps/web/CLAUDE.md               — konvensi frontend
docs/development/backlog.md      — konteks task
docs/api/api-contract.md         — endpoint yang sudah ada
docs/database/database-design.md — schema saat ini
```

### Output yang dihasilkan
```
.ai/tasks/<TICKET-ID>/requirements.md   — Planner
.ai/tasks/<TICKET-ID>/tasks.md          — Planner
.ai/tasks/<TICKET-ID>/design.md         — Architect (opsional, hanya task kompleks)
```

### Aturan PLAN
- Jangan buka file editor kode selama phase ini
- Jika tidak cukup konteks → baca lebih banyak file, jangan asumsi
- requirements.md harus punya acceptance criteria yang measurable
- tasks.md harus cukup konkret untuk dieksekusi tanpa ambiguitas

---

## Phase: IMPLEMENT

### Siapa yang eksekusi
Backend Agent, Frontend Agent

### Urutan wajib sebelum mulai
1. Baca `requirements.md` + `tasks.md` + `design.md` (jika ada)
2. Baca AGENTS.md (bukan dari memori)
3. Baca `apps/api/CLAUDE.md` atau `apps/web/CLAUDE.md` sesuai scope

### Urutan implementasi backend
1. Schema change (jika ada) → migration
2. DTOs dengan class-validator
3. Service (business logic, merchant-scoped)
4. Controller (thin, hanya routing)
5. Module + App Module registration

### Urutan implementasi frontend
1. constants.ts + rbac.ts
2. `<module>.service.ts` (API calls)
3. stores/ (state, getters, actions, index)
4. router/index.ts (dengan meta.permission)
5. pages/ + components/

### Aturan IMPLEMENT
- Jangan sentuh scope di luar yang ditentukan di requirements.md
- Jangan implement fitur yang tidak diminta ("while we're here")
- Jika requirements.md tidak jelas → stop, tulis pertanyaan di verify-report.md, status NEEDS_HUMAN

---

## Phase: VERIFY

### Siapa yang eksekusi
Backend Agent, Frontend Agent (self-verify), lalu QA Agent (independent verify)

### Commands wajib (jalankan semua, catat output)
```bash
pnpm typecheck
pnpm lint
pnpm --filter umkm-pos-api test          # jika backend berubah
pnpm --filter umkm-pos-app build         # jika frontend berubah
```

### Security checks (backend — wajib)
```bash
# Multi-tenant scope
grep -rn "merchant_id" apps/api/src/<module>/ --include="*.ts"
# RBAC coverage
grep -n "@Get\|@Post\|@Patch\|@Delete\|@Put\|@RequirePermission\|@Public" apps/api/src/<module>/<module>.controller.ts
```

### Retry logic

```
Attempt 1: jalankan verify → FAIL
  → baca error output
  → fix spesifik
  → jalankan verify lagi

Attempt 2: verify → FAIL
  → baca error dengan lebih teliti
  → fix, jangan asumsi

Attempt 3: verify → FAIL
  → STOP
  → tulis verify-report.md dengan Status: NEEDS_HUMAN
  → sertakan error output exact
  → jangan melanjutkan
```

### Aturan VERIFY
- Jangan skip command verify walau "yakin pasti pass"
- Jangan tulis "PASS" jika belum menjalankan command
- Jika ada 1 `pnpm typecheck` error → fix dulu baru lanjut
- verify-report.md harus berisi output actual, bukan summary

---

## Retry Escalation Format

Jika status NEEDS_HUMAN, verify-report.md harus berisi:

```markdown
## Status: NEEDS_HUMAN

## Attempt Log
- Attempt 1: FAIL — TypeScript error: "Property 'x' does not exist on type 'Y'"
- Attempt 2: FAIL — Sama setelah refactor
- Attempt 3: FAIL — Error berbeda setelah coba pendekatan lain

## Error Output (Attempt 3 — exact)
```
[paste output exact dari terminal]
```

## Apa yang Sudah Dicoba
1. [pendekatan 1]
2. [pendekatan 2]
3. [pendekatan 3]

## Pertanyaan untuk Developer
- [pertanyaan spesifik yang butuh jawaban manusia]
```

---

## Pipeline Sequence

```
Developer/Linear Ticket
  ↓
Planner Agent
  → .ai/tasks/<ID>/requirements.md
  → .ai/tasks/<ID>/tasks.md
  ↓
[Architect Agent — opsional untuk task kompleks]
  → .ai/tasks/<ID>/design.md
  ↓
Backend Agent (paralel dengan Frontend Agent jika memungkinkan)
  → kode di apps/api/src/
  → .ai/tasks/<ID>/verify-report.md (backend)
  ↓
Frontend Agent
  → kode di apps/web/src/modules/
  → .ai/tasks/<ID>/verify-report.md (frontend)
  ↓
Documentation Agent (paralel — tidak blocking)
  → update docs/
  ↓
QA Agent
  → .ai/tasks/<ID>/qa-report.md
  ↓
Reviewer Agent
  → .ai/tasks/<ID>/review-notes.md
  ↓
  APPROVE → buka PR + mention developer
  CHANGES REQUESTED → kembali ke agent yang perlu fix
  NEEDS_HUMAN → eskalasi, stop pipeline
```

---

## Hard Rules

1. **Tidak ada auto-merge** — review manusia wajib sebelum merge ke main
2. **Tidak ada skip verify** — walau "simple bugfix"
3. **Tidak ada asumsi merchant_id dari client** — selalu dari JWT
4. **Tidak ada business logic di controller** — selalu di service
5. **Status NEEDS_HUMAN = pipeline stop** — developer handle manual
