# Scoped Lint Strategy — Quality Gate per Task

## Problem

`pnpm lint` (full workspace) melaporkan 17 pre-existing violations di `apps/web` yang bukan
milik task manapun. Jika Quality Gate wajib `pnpm lint PASS`, setiap task frontend akan selalu
FAIL walau kode baru agent bersih.

---

## Temuan: Tooling Existing

`git diff --name-only origin/main...HEAD` sudah cukup. Tidak ada tooling tambahan yang dibutuhkan.

- Base branch: **`main`** (confirmed: `origin/HEAD → origin/main`)
- Three-dot form (`origin/main...HEAD`) = files changed sejak branch diverge dari main
- `xargs -r` = no-op jika tidak ada file yang cocok (exit 0) — aman untuk task yang tidak
  menyentuh file tersebut

---

## Command Scoped (dari root repo)

### Frontend (apps/web)

```bash
git diff --name-only origin/main...HEAD -- 'apps/web/src/**/*.ts' 'apps/web/src/**/*.vue' \
  | xargs -r pnpm --filter umkm-pos-app exec -- eslint --fix
```

### Backend (apps/api)

```bash
git diff --name-only origin/main...HEAD -- 'apps/api/src/**/*.ts' \
  | xargs -r pnpm --filter umkm-pos-api exec -- eslint --fix
```

**Catatan penting:** Kedua command ini memakai `pnpm --filter <pkg> exec -- eslint`, bukan
`pnpm lint` / `turbo lint`. Ini bypass turbo dan run ESLint langsung dari workspace target
dengan config di direktori masing-masing. Tidak ter-intercept RTK dalam mode yang salah.

---

## Edge Cases

| Skenario | Behavior |
|----------|----------|
| Tidak ada file .ts/.vue berubah di paths tersebut | `xargs -r` → no-op → exit 0 → PASS |
| File berubah tapi tidak punya error | ESLint → exit 0 → PASS |
| File berubah dan punya lint error (bukan auto-fixable) | ESLint → exit 1 → FAIL (benar) |
| Commit pertama branch (belum ada di origin/main) | git diff berfungsi normal via merge-base |

---

## Rencana Perubahan

### TIDAK diubah

- `"lint": "turbo lint"` di root `package.json` → tetap untuk audit manual + CI full scan
- `pnpm lint` di CLAUDE.md + README → tetap sebagai perintah manual developer
- Aturan "No lint errors (severity error)" di Hard Stop Conditions → tetap berlaku, tapi
  dievaluasi terhadap file yang DIUBAH task, bukan seluruh workspace

### DIUBAH — Agent Definitions

#### `.claude/agents/frontend.md`

Section **VERIFY** (bash commands):
```bash
# LAMA:
pnpm lint

# BARU:
git diff --name-only origin/main...HEAD -- 'apps/web/src/**/*.ts' 'apps/web/src/**/*.vue' \
  | xargs -r pnpm --filter umkm-pos-app exec -- eslint --fix
```

Section **Verify Checklist** item:
```
# LAMA:
[ ] pnpm lint — PASS

# BARU:
[ ] lint (changed files) — PASS
```

Section **Quality Gate** di output template verify-report.md:
```
# LAMA:
- Lint: PASS

# BARU:
- Lint (changed files): PASS
```

#### `.claude/agents/backend.md`

Section **VERIFY** (bash commands):
```bash
# LAMA:
pnpm lint

# BARU:
git diff --name-only origin/main...HEAD -- 'apps/api/src/**/*.ts' \
  | xargs -r pnpm --filter umkm-pos-api exec -- eslint --fix
```

Section **Verify Checklist**:
```
# LAMA:
[ ] pnpm lint — PASS

# BARU:
[ ] lint (changed files) — PASS
```

#### `.ai/workflows/task-completion.md`

Section **Commands to Run**:
```bash
# LAMA:
pnpm lint

# BARU — ganti dengan:
# Lint scoped ke file yang berubah (agent Quality Gate):
git diff --name-only origin/main...HEAD -- 'apps/web/src/**/*.ts' 'apps/web/src/**/*.vue' \
  | xargs -r pnpm --filter umkm-pos-app exec -- eslint --fix   # jika frontend berubah
git diff --name-only origin/main...HEAD -- 'apps/api/src/**/*.ts' \
  | xargs -r pnpm --filter umkm-pos-api exec -- eslint --fix   # jika api berubah

# Full workspace lint (untuk audit manual / CI berkala — BUKAN blocker per-task):
pnpm turbo lint
```

Section **Hard Stop Conditions** — tambah catatan:
```
* Lint error (severity `error`) pada FILE YANG DIUBAH task ini
  (bukan pre-existing violations di file lain)
```

Section **Pull Request Checklist** — ganti:
```
* No lint errors → No lint errors pada changed files
```

#### `.ai/workflows/piv-workflow.md`

Section **Commands wajib**:
```bash
# LAMA:
pnpm lint

# BARU:
git diff --name-only origin/main...HEAD -- 'apps/web/src/**/*.ts' 'apps/web/src/**/*.vue' \
  | xargs -r pnpm --filter umkm-pos-app exec -- eslint --fix   # jika frontend berubah
git diff --name-only origin/main...HEAD -- 'apps/api/src/**/*.ts' \
  | xargs -r pnpm --filter umkm-pos-api exec -- eslint --fix   # jika api berubah
```

---

## Opsi Tambahan (TIDAK direkomendasikan untuk sekarang)

Tambah script `lint:changed` di root `package.json`:
```json
"lint:changed:web": "git diff --name-only origin/main...HEAD -- 'apps/web/src/**/*.ts' 'apps/web/src/**/*.vue' | xargs -r pnpm --filter umkm-pos-app exec -- eslint --fix",
"lint:changed:api": "git diff --name-only origin/main...HEAD -- 'apps/api/src/**/*.ts' | xargs -r pnpm --filter umkm-pos-api exec -- eslint --fix"
```

Alasan tidak disarankan sekarang: menambah surface area scripts yang perlu dijaga; command
langsung di agent definitions lebih eksplisit dan mudah di-audit per task.

---

## Summary Perubahan yang Perlu Approval

| File | Perubahan |
|------|-----------|
| `.claude/agents/frontend.md` | 3 tempat: VERIFY bash, Checklist item, output template |
| `.claude/agents/backend.md` | 3 tempat: VERIFY bash, Checklist item, output template |
| `.ai/workflows/task-completion.md` | Commands section + Hard Stop + PR Checklist |
| `.ai/workflows/piv-workflow.md` | Commands wajib section |
| Root `package.json` | Tidak diubah (opsional, tidak disarankan sekarang) |
| `apps/web/package.json` | Tidak diubah |
