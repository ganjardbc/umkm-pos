---
name: task-done
description: Run the full Definition of Done checklist for the current task — typecheck, lint, tests, then update backlog and progress docs. Pass the task ID (e.g. NOTIF-001).
---

# Skill: Task Done

## Trigger

Use when a task is finished and needs the DoD checklist run:
- "mark task done NOTIF-001"
- "run done checklist for RPT-002"
- "/task-done <TASK-ID>"

## Workflow

### 1. Run quality checks

Run all from repo root:

```bash
pnpm typecheck
```

```bash
pnpm lint
```

If backend changed:
```bash
pnpm --filter umkm-pos-api test
```

If frontend changed:
```bash
pnpm --filter umkm-pos-app build
```

Fix any errors before proceeding. Do not skip.

### 2. Verify multi-tenant rules (backend tasks)

Grep for violations:
```bash
grep -r "merchant_id" apps/api/src --include="*.ts" | grep "body\." | grep -v "//.*body\."
```

If any results → fix before marking done.

### 3. Verify permission guards (backend tasks)

Every non-public controller method must have `@RequirePermission` or be covered by class-level guard. Quick check:
```bash
grep -r "@Get\|@Post\|@Patch\|@Delete\|@Put" apps/api/src/<module>/*.controller.ts
```

Compare against `@RequirePermission` decorators in same file.

### 4. Update backlog

In `docs/development/backlog.md`:
- Find the task by ID
- Change `Status: TODO` or `Status: IN_PROGRESS` → `Status: DONE`

### 5. Update progress

In `docs/development/progress.md`:
- Move task entry from **Current Tasks** to **Completed Tasks**
- Update Phase progress percentage
- Update Overall Progress percentage

### 6. Update relevant docs (only what changed)

| Changed area | Update this file |
|---|---|
| New/changed API endpoint | `docs/api/api-contract.md` |
| New/changed DB model or field | `docs/database/database-design.md` |
| New frontend route | `docs/frontend/frontend-routes.md` |
| New frontend page | `docs/frontend/ui-pages.md` |
| New module or architectural change | `docs/architecture/module-breakdown.md` |

### 7. Final confirmation

Report:
- Checks passed: typecheck ✓, lint ✓, (tests ✓ if ran)
- Docs updated: list which files
- Backlog: `<TASK-ID>` → DONE
- Progress: updated

## Hard stops

If any of these fail, do NOT mark done:
- TypeScript errors
- Lint errors with `error` severity
- Multi-tenant violation found
- Missing `@RequirePermission` on protected route
