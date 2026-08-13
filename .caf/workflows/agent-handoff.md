# Agent Handoff Format

> Sebagian isi file ini auto-generate dari roster agent terdeteksi.

Setiap ticket punya folder sendiri: `.caf/tasks/{TICKET-ID}/`. Agent baca output agent
sebelumnya dari folder ini, bukan dari chat/memori.

## Artifact per Agent (berdasarkan roster terdeteksi)

| Agent | Artifact Output |
|---|---|
| Planner | `requirements.md`, `tasks.md` |
| Architect | `design.md` |
| Frontend | kode + `verify-report.md` |
| Backend | kode + `verify-report.md` |
| QA | `qa-report.md` |
| Reviewer | `review-notes.md` |
| Documentation | update `docs/` (paralel, non-blocking) |

## Format `verify-report.md`

```markdown
# Verify Report

Status: PASS | NEEDS_HUMAN

## Checklist
- [ ] lint
- [ ] typecheck
- [ ] test
- [ ] build

## Catatan
TODO: detail hasil verifikasi, error kalau ada
```

## Agent Tambahan (Custom)

- `caf-auditor.md` — artifact format belum standar, perlu didefinisikan manual (TODO)
- `caf-pm.md` — artifact format belum standar, perlu didefinisikan manual (TODO)
- `caf-ux-designer.md` — artifact format belum standar, perlu didefinisikan manual (TODO)
