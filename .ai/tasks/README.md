# .ai/tasks/

> **DRAFT — wajib direview.** File ini digenerate otomatis oleh `caf-initiator`.

Setiap ticket punya folder sendiri di sini. Agent saling lempar file, bukan chat/memori.

Nama folder mengikuti key ticket dari tracker (**Linear**),
konsisten dengan nama branch `ai-agent/{{TICKET-ID}}`.

## Struktur per Ticket

```
.ai/tasks/{{TICKET-ID}}/
  requirements.md    ← Planner Agent: apa yang diminta, acceptance criteria
  design.md          ← Architect Agent: pendekatan teknis (kalau perlu)
  tasks.md           ← Planner Agent: breakdown task konkret
  verify-report.md   ← agent implementasi: hasil implement + verify
  qa-report.md       ← QA Agent: hasil test mendalam
  review-notes.md    ← Reviewer Agent: hasil review kualitatif
```

Lihat `CAF.md` Layer 3 untuk format `verify-report.md` dan detail tiap artifact.
