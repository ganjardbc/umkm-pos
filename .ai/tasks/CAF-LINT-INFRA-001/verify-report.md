# CAF-LINT-INFRA-001 — Verify Report (Scoped Lint Implementation)

Branch: `chore/caf-scoped-lint`

---

## Files Updated

| File | Changes |
|------|---------|
| `.claude/agents/frontend.md` | VERIFY bash (scoped command + grep/sed fix), Verify Checklist item, Quality Gate template, Batasan (pre-existing clause) |
| `.claude/agents/backend.md` | VERIFY bash (scoped command + grep/sed fix), Verify Checklist item, Quality Gate template, Batasan (pre-existing clause) |
| `.ai/workflows/task-completion.md` | Commands to Run (scoped + turbo as non-blocker comment), Hard Stop Conditions (scope qualifier), PR Checklist, pre-existing violation note |
| `.ai/workflows/piv-workflow.md` | Commands wajib (scoped commands) |

---

## Sanity Check: Scoped Lint Commands

### Issue found during testing (deviation from original plan)

Original plan command used `xargs -r pnpm --filter <pkg> exec -- eslint` directly. Two problems:

1. **Path prefix mismatch:** `pnpm exec` runs ESLint from the workspace dir (`apps/web`), but `git diff --name-only` returns repo-root paths (`apps/web/src/...`). ESLint couldn't find files → exit 2.
2. **RTK footer injection:** RTK proxy appends `--- Changes ---` to git output. `xargs` picked up `---`, `Changes`, `---` as file arguments.

### Fix applied

Added `grep -E` + `sed` to the pipeline:

```bash
# Web
git diff --name-only origin/main...HEAD -- 'apps/web/src/**/*.ts' 'apps/web/src/**/*.vue' \
  | grep -E '\.(ts|vue)$' | sed 's|^apps/web/||' \
  | xargs -r pnpm --filter umkm-pos-app exec -- eslint --fix

# API
git diff --name-only origin/main...HEAD -- 'apps/api/src/**/*.ts' \
  | grep -E '\.ts$' | sed 's|^apps/api/||' \
  | xargs -r pnpm --filter umkm-pos-api exec -- eslint --fix
```

- `grep -E '\.(ts|vue)$'` — strips RTK footer + any non-file lines
- `sed 's|^apps/web/||'` — converts repo-root path to workspace-relative path

### Sanity check results

| Command | Exit | Notes |
|---------|------|-------|
| Web scoped lint | 1 | Pre-existing violations — see below |
| API scoped lint | 0 | Clean |
| xargs -r on empty input | 0 | Confirmed no-op behavior |

### Pre-existing violations (web — out of scope)

These errors are in files changed by commit `91c5bf4` (prior branch work, not this task):

| File | Line | Rule |
|------|------|------|
| `src/components/UiSidebarMenu.vue` | 16:11 | `vue/no-use-v-if-with-v-for` |
| `src/modules/auth/pages/index.vue` | 126:32 | `no-unsafe-optional-chaining` |
| `src/modules/auth/pages/register.vue` | 454:31 | `no-unsafe-optional-chaining` |

Per pre-existing violation clause now documented in all agent definitions and task-completion.md: these are "pre-existing, out of scope" — not a Hard Stop for this task.

---

## Acceptance Criteria

- [x] `.claude/agents/frontend.md` — VERIFY bash, Checklist item, Quality Gate label, Batasan pre-existing clause
- [x] `.claude/agents/backend.md` — VERIFY bash, Checklist item, Quality Gate label, Batasan pre-existing clause
- [x] `.ai/workflows/task-completion.md` — Commands (scoped + turbo note), Hard Stop scope qualifier, PR Checklist, pre-existing note
- [x] `.ai/workflows/piv-workflow.md` — Commands wajib updated
- [x] Commands tested: working correctly (grep/sed fix applied)
- [x] `xargs -r` no-op on empty input confirmed
- [x] RTK footer issue identified and resolved
