---
name: security-check
description: Run a focused security audit on changed API code — checks multi-tenant scoping, RBAC enforcement, public route exposure, and input validation.
---

# Skill: Security Check

## Trigger

Use before marking any backend task done, or explicitly:
- "security check the notifications module"
- "audit RBAC on this controller"
- "/security-check [module-name]"

## Checks

### 1. Multi-tenant scope

Every service method that queries the DB must use `merchant_id` from auth user.

Grep for violations:
```bash
grep -n "merchant_id" apps/api/src/<module>/<module>.service.ts
```

Pass: `merchant_id: currentUser.merchantId` or similar from function param (not body)

Fail: `merchant_id: body.merchantId` or `merchant_id: dto.merchantId`

### 2. Public route exposure

List all `@Public()` routes:
```bash
grep -rn "@Public()" apps/api/src/ --include="*.ts"
```

Each result must be intentionally public (auth endpoints, health check, customer catalog). Flag any that look sensitive.

### 3. RBAC coverage

For each controller method decorated with `@Get`, `@Post`, `@Patch`, `@Delete`, `@Put`, verify it has either:
- `@RequirePermission('resource.action')` on the method, OR
- Class-level `@RequirePermission` (check decorator on the class), OR
- `@Public()` (if intentionally open)

```bash
grep -n "@Get\|@Post\|@Patch\|@Delete\|@Put\|@RequirePermission\|@Public" apps/api/src/<module>/<module>.controller.ts
```

### 4. DTO validation

Every controller method accepting a body must use a DTO class with `class-validator` decorators.

- No `body: any` or `body: Record<string, any>` on public-facing routes
- All string inputs: `@IsString()`, `@IsUUID()`, etc.
- Optional fields: `@IsOptional()`
- Numeric fields: `@IsNumber()` or `@IsInt()`

Check:
```bash
grep -n "body: any\|Body() body" apps/api/src/<module>/<module>.controller.ts
```

### 5. Password / secret exposure

No sensitive data in logs or response:
```bash
grep -rn "password\|jwt\|token\|secret" apps/api/src/<module>/ --include="*.ts" | grep -v "// " | grep -v "@ApiProperty\|@IsString\|dto\|hash\|bcrypt\|compare"
```

Review results — password hashing via bcrypt is OK, logging raw password is not.

### 6. SQL injection risk

Prisma parameterizes by default. Flag any raw queries:
```bash
grep -rn "\$queryRaw\|\$executeRaw" apps/api/src/<module>/ --include="*.ts"
```

Raw queries are allowed for performance but must use tagged template literals (Prisma's safe form), never string concatenation.

## Report Format

For each check, output:

```
✅ PASS — Multi-tenant scope: all queries use currentUser.merchantId
⚠️  WARN — Public routes: POST /auth/login is @Public (expected)
❌ FAIL — RBAC: PATCH /<module>/:id missing @RequirePermission
```

List all failures explicitly. Do not skip to "looks fine" without running the greps.

## Hard fail conditions

These must be fixed before task is marked DONE:
- Any service query missing `merchant_id` scope
- Any non-public route missing `@RequirePermission`
- Raw password/token in logger call
- `body: any` on non-trivial POST/PATCH without DTO
