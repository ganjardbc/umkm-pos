# Agent Handoff — Konvensi Artifact

## Prinsip Dasar

Agent tidak saling "ngobrol" — mereka saling lempar file. Setiap agent membaca output agent sebelumnya dari `.ai/tasks/<TICKET-ID>/`, bukan dari memori atau chat history.

---

## Struktur Folder per Ticket

```
.ai/tasks/<TICKET-ID>/
  requirements.md    ← Planner Agent: apa yang diminta, acceptance criteria
  tasks.md           ← Planner Agent: breakdown task per layer
  design.md          ← Architect Agent: pendekatan teknis (opsional)
  verify-report.md   ← Backend/Frontend Agent: hasil implementasi + verify
  qa-report.md       ← QA Agent: hasil test mendalam
  review-notes.md    ← Reviewer Agent: verdict + catatan kualitatif
```

---

## Naming Convention

### TICKET-ID

Gunakan format dari sistem tracking:
- Linear: `UMKM-42`, `POS-117`
- Manual: `CREATE-LANDING-APP`, `REFACTOR-AUTH-FLOW`
- Selalu UPPERCASE dengan hyphen

### Folder Path

```
.ai/tasks/UMKM-42/
.ai/tasks/CREATE-LANDING-APP/
```

---

## Handoff Map: Siapa Baca Apa

| Agent | Membaca | Menulis |
|---|---|---|
| Planner | backlog.md, AGENTS.md, kode existing | `requirements.md`, `tasks.md` |
| Architect | `requirements.md` | `design.md` |
| Backend | `requirements.md`, `tasks.md`, `design.md` | kode + `verify-report.md` |
| Frontend | `requirements.md`, `tasks.md`, `design.md` | kode + `verify-report.md` |
| Documentation | `verify-report.md` | update `docs/` |
| QA | `requirements.md`, `verify-report.md`, kode | `qa-report.md` |
| Reviewer | semua artifact + kode | `review-notes.md` |

---

## Format Tiap Artifact

### requirements.md

```markdown
## Ticket: <ID>
## Status: PLAN

## Deskripsi
[1-3 kalimat apa yang diminta]

## Acceptance Criteria
- [ ] kriteria 1 — measurable
- [ ] kriteria 2

## Constraints
- [constraint teknis yang berlaku]

## Out of Scope
- [fitur yang tidak dikerjakan di task ini]

## Dependensi
- [task/API/model yang harus ada dulu]
```

### tasks.md

```markdown
## Ticket: <ID>

## Backend Tasks
- [ ] BE-1: [task konkret]
- [ ] BE-2: [task konkret]

## Frontend Tasks
- [ ] FE-1: [task konkret]

## Shared Types Tasks
- [ ] ST-1: [task konkret jika perlu]

## Docs Tasks
- [ ] DOC-1: [docs yang perlu diupdate]
```

### design.md

```markdown
## Ticket: <ID>
## Status: DESIGN

## Pendekatan
[deskripsi + alasan]

## Schema Changes (jika ada)
[prisma model snippet + migration name]

## API Endpoints (jika ada)
[table: method, path, permission, DTO, response]

## Service Methods
[signature TypeScript]

## Frontend Changes (jika ada)
[store, service, page yang berubah]

## Keputusan & Trade-off
[table: keputusan, opsi, pilihan, alasan]
```

### verify-report.md

```markdown
## Ticket: <ID>
## Agent: backend / frontend
## Status: SUCCESS / NEEDS_HUMAN

## Attempt Log
- Attempt 1: PASS / FAIL — [error jika fail]

## Acceptance Criteria
- [x] kriteria 1 — terpenuhi di File.ts baris N
- [ ] kriteria 2 — FAIL: alasan

## Quality Gate
- Typecheck: PASS / FAIL
- Lint: PASS / FAIL
- Test: PASS / SKIP (alasan)
- Multi-tenant scope: PASS / FAIL (backend only)
- RBAC coverage: PASS / FAIL (backend only)

## Files Changed
- apps/api/src/<module>/...
- apps/web/src/modules/<module>/...

## Catatan
[deviasi dari plan, jika ada]
```

### qa-report.md

```markdown
## Ticket: <ID>
## Agent: qa
## Status: PASS / FAIL / PARTIAL

## Quality Gate Results
[output dari pnpm typecheck, lint, test]

## Security Check Results
[hasil grep checks]

## Acceptance Criteria Verification
[per-criteria dengan cite file:line]

## Edge Cases Tested
[table: skenario, expected, actual, status]

## Issues Found
[CRITICAL vs NON-CRITICAL, dengan file:line]

## Verdict
[PASS / FAIL dengan alasan]
```

### review-notes.md

```markdown
## Ticket: <ID>
## Agent: reviewer
## Verdict: APPROVE / CHANGES REQUESTED / DEFER

## Security Audit
[hasil grep checks per kategori]

## Kualitatif Review
[Blocker vs Non-blocker]

## Verdict Rationale
[1-3 kalimat alasan]

## Untuk Developer
[instruksi konkret jika CHANGES REQUESTED]
```

---

## Status yang Valid

Setiap artifact harus punya status field yang jelas:

| Status | Artinya | Action |
|---|---|---|
| `PLAN` | Planner selesai, menunggu implementasi | Spawn Backend/Frontend Agent |
| `DESIGN` | Architect selesai, menunggu implementasi | Spawn Backend/Frontend Agent |
| `SUCCESS` | Implementasi + verify berhasil | Spawn QA Agent |
| `NEEDS_HUMAN` | Agent stuck, perlu intervensi | Developer handle manual |
| `PASS` | QA / Reviewer sudah review, aman lanjut | Buka PR |
| `FAIL` | QA / Reviewer menemukan blocker | Kembali ke implementasi |
| `APPROVE` | Reviewer approve | Buka PR |
| `CHANGES REQUESTED` | Reviewer temukan blocker | Fix dulu |
| `DEFER` | Non-blocker, PR boleh dibuka | Buka issue terpisah |

---

## Contoh Alur Handoff

```
Planner selesai:
  .ai/tasks/UMKM-42/requirements.md  (Status: PLAN)
  .ai/tasks/UMKM-42/tasks.md

Backend Agent membaca requirements.md → implement → selesai:
  .ai/tasks/UMKM-42/verify-report.md  (Status: SUCCESS)

QA Agent membaca verify-report.md → test → selesai:
  .ai/tasks/UMKM-42/qa-report.md  (Status: PASS)

Reviewer Agent membaca semua → review → selesai:
  .ai/tasks/UMKM-42/review-notes.md  (Verdict: APPROVE)

Developer:
  → buka PR dari branch ai-agent/UMKM-42
  → review kode
  → merge (manual)
```

---

## Yang Tidak Boleh

- Jangan buat artifact di luar `.ai/tasks/<TICKET-ID>/`
- Jangan simpan "catatan sementara" di artifact resmi
- Jangan tulis `Status: SUCCESS` tanpa benar-benar menjalankan verify commands
- Jangan skip artifact — jika Planner tidak buat tasks.md, Backend Agent tidak tahu apa yang harus dikerjakan
