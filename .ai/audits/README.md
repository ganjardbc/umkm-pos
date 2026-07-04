# .ai/audits/

Output folder untuk **auditor agent** (`.claude/agents/auditor.md`).

Struktur: satu folder per tanggal run, format `YYYY-MM-DD/`, isi `audit-report.md`.

```
.ai/audits/
  2026-07-05/
    audit-report.md
```

Beda dengan `.ai/tasks/<TICKET-ID>/`: audit tidak terikat ticket spesifik — ini scan proaktif seluruh codebase untuk technical debt, gap test coverage, dan pelanggaran konvensi/ADR.

Auditor agent **read-only** — tidak mengubah kode, tidak membuat ticket Linear. Hasil audit-report.md perlu direview manusia sebelum diputuskan jadi task/ticket baru di `.ai/tasks/`.
