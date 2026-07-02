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

# Security Greps (Backend Tasks)

Run sebelum mark done. Ganti `<module>` dengan nama modul yang dikerjakan.

### Multi-tenant scope

```bash
grep -rn "merchant_id" apps/api/src/<module>/ --include="*.ts" | grep "body\.\|dto\." | grep -v "//.*body\.\|//.*dto\."
```

Hasil → fix dulu. `merchant_id` harus dari `currentUser.merchantId`, bukan dari body/dto.

### RBAC coverage

```bash
grep -n "@Get\|@Post\|@Patch\|@Delete\|@Put\|@RequirePermission\|@Public" apps/api/src/<module>/<module>.controller.ts
```

Setiap HTTP verb harus punya `@RequirePermission` atau `@Public()`.

### Public route exposure

```bash
grep -rn "@Public()" apps/api/src/<module>/ --include="*.ts"
```

Setiap `@Public()` harus disengaja (auth, health check, catalog publik).

### DTO validation

```bash
grep -n "body: any\|Body() body" apps/api/src/<module>/<module>.controller.ts
```

Tidak boleh ada `body: any` pada route non-trivial.

### Password / secret exposure

```bash
grep -rn "console.log\|logger\." apps/api/src/<module>/ --include="*.ts" | grep -i "password\|token\|secret\|jwt"
```

Tidak boleh logging credentials.

### SQL injection risk

```bash
grep -rn "\$queryRaw\|\$executeRaw" apps/api/src/<module>/ --include="*.ts"
```

Jika ada: wajib tagged template literal, bukan string concatenation.

---

# Hard Stop Conditions

Jangan mark DONE jika ada:

* TypeScript error
* Lint error (severity `error`)
* `merchant_id` diambil dari body/dto bukan `currentUser`
* HTTP route tanpa `@RequirePermission` atau `@Public()`
* Logging raw password/token/secret
* `$queryRaw` dengan string concatenation

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
* Security greps clean (lihat section di atas)
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
