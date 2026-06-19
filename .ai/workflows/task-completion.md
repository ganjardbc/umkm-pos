# Task Completion Workflow

## Purpose

Define what must happen after every completed task.

---

# Definition of Done

A task is considered DONE only if:

* Code implemented
* Typecheck passed (`pnpm typecheck`)
* Build passed (`pnpm build`)
* Relevant documentation updated
* No broken existing flows

---

# Documentation Update Rules

## Backend Change

Update jika ada perubahan:

```txt
docs/api/api-contract.md       — jika ada endpoint baru/berubah
docs/database/database-design.md — jika ada model/field baru
```

---

## Frontend Change

Update jika ada perubahan:

```txt
docs/frontend/frontend-routes.md  — jika ada route baru
docs/frontend/ui-pages.md         — jika ada page baru
```

---

## Architecture Change

Update jika ada perubahan:

```txt
docs/architecture/design.md
docs/architecture/module-breakdown.md
```

---

# Backlog Update

Ketika task selesai, update status di:

```txt
docs/development/backlog.md
```

Contoh:

```txt
Status: TODO → DONE
```

---

# Progress Update

Update:

```txt
docs/development/progress.md
```

Pindahkan task dari:

```txt
Current Tasks → Completed Tasks
```

Update Overall Progress dan Phase progress.

---

# Pull Request Checklist

Before marking task DONE:

* Dokumentasi updated
* No TypeScript errors
* No lint errors
* No multi-tenant violations (merchant_id scope)
* No permission violations
* No duplicate types
* Follows AGENTS.md
* `pnpm typecheck` pass
* `pnpm build` pass (jika feasible)

---

# Commands to Run

```bash
# Dari root
pnpm typecheck
pnpm lint

# API specific
pnpm --filter umkm-pos-api test

# Web specific
pnpm --filter umkm-pos-app build
```
