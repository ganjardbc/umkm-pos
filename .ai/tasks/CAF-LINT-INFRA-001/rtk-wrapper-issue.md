# RTK Wrapper Lint Parsing Issue

## Root Cause

RTK hook (`rtk hook claude`) intercepts every Bash command via Claude's PreToolUse hook.

**Execution chain for `pnpm lint`:**
```
pnpm lint
  → hook rewrites to: rtk lint (strips "pnpm" prefix, detects "lint" keyword)
  → rtk lint internally runs the command with --format json appended
  → tries to parse stdout as ESLint JSON array
  → BUT stdout is turbo's workspace-multiplexed output:
      "umkm-pos-app:lint: /path/to/file.vue\n  3:19  error ..."
  → not valid ESLint JSON → parse fails → exit code 2
```

Evidence:
- CHANGELOG: "strip npx/bunx/pnpm prefixes in lint linter detection" — RTK is designed to handle `pnpm <linter>` directly (e.g., `pnpm eslint`), not `pnpm lint` where `lint` is a package.json script that runs turbo.
- Error: `ESLint output (JSON parse failed: EOF while parsing a value at line 1 column 0)` — RTK ran the command (got output), then failed to parse it as JSON.
- `pnpm --filter umkm-pos-app lint` works fine — that command runs `eslint` directly, output IS valid ESLint JSON.

**Why it broke now (and not before):** Before this task, web had no `lint` script → `pnpm lint` had nothing to output from web → turbo produced minimal output → RTK might have still failed or produced empty JSON (parse OK on empty). Now web produces real lint output via turbo → turbo's prefixed multiline output hits RTK's JSON parser → parse fail.

---

## What RTK Expects vs What It Gets

| | Expected | Actual |
|---|---|---|
| Format | Raw ESLint JSON array: `[{"filePath":"...","messages":[...],...}]` | Turbo-prefixed lines: `umkm-pos-app:lint: /path/file.vue` |
| Source | Direct `eslint . --format json` | `turbo lint` (orchestrates multiple workspaces, streams their stdout prefixed) |
| Parse | JSON.parse() succeeds | Fails at byte 0 |

---

## Fix Options

### Option A — Add `pnpm lint` to RTK `exclude_commands` (Recommended)

In `~/.config/rtk/config.toml` (or `~/Library/Application Support/rtk/config.toml`):

```toml
[hooks]
exclude_commands = ["pnpm lint"]
```

RTK skips interception for this specific command → turbo output passes through raw → no parse failure.

**Pros:** Zero change to project scripts or workflow. `pnpm --filter umkm-pos-app lint` still intercepted correctly (different command string).
**Cons:** Root-level `pnpm lint` loses RTK token compression (but turbo output isn't compressible by ESLint filter anyway).
**Risk:** Low.

---

### Option B — Rename root script to avoid `lint` keyword detection

In root `package.json`:
```json
"lint:all": "turbo lint"
```

Remove `"lint": "turbo lint"`. Use `pnpm lint:all` instead.

**Pros:** RTK never sees `pnpm lint` → no rewrite.
**Cons:** Breaks `pnpm lint` as the standard command. CI scripts, docs, and Quality Gate checklist that reference `pnpm lint` must be updated. Turbo pipeline still uses `"lint"` task name internally (no change needed there).
**Risk:** Medium — convention break across codebase.

---

### Option C — Custom RTK filter for turbo output

Create `~/.config/rtk/filters.toml` (project-level `.rtk/filters.toml`) with a passthrough rule for turbo-lint:

```toml
[filters.turbo-lint]
description = "Pass turbo lint output through without JSON parsing"
match_command = "^pnpm lint$"
passthrough = true
```

RTK may or may not support `passthrough = true` as a filter option (depends on RTK filter schema). Needs verification.
**Risk:** High — uncertain if RTK filter schema supports full passthrough.

---

## Recommendation

**Option A.** One line change to global RTK config. Surgical, no project impact.

Exact change:
```toml
# in ~/Library/Application Support/rtk/config.toml
[hooks]
exclude_commands = ["pnpm lint"]   # was: []
```

After applying: `pnpm lint` passes through to turbo → shows raw workspace output → no parse error → exit code reflects actual lint result (1 if violations, 0 if clean).

Individual workspace lints (`pnpm --filter <pkg> lint`) are unaffected and still get RTK ESLint compression.

---

## Scope Note

This issue surfaced only because we added web's lint script in this task. Before: turbo ran 1 task (api, clean output) → RTK parse might have succeeded on minimal JSON or been empty. After: turbo runs 2 tasks → multiline prefixed output → definite parse fail.

Fix is RTK config, not project code.
