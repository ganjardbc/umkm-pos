---
name: implement-backlog-task
description: Implement a task from docs/development/backlog.md following all AGENTS.md conventions. Pass task ID (e.g. NOTIF-001) or leave blank to pick the next TODO task.
---

# Skill: Implement Backlog Task

## Trigger

Use when asked to implement a backlog task, e.g.:
- "implement NOTIF-001"
- "work on next backlog task"
- "/implement-backlog-task RPT-002"

## Workflow

### 1. Read context

Always read these before starting:
- `docs/development/backlog.md` — find the task, read full description
- `AGENTS.md` — rules, conventions, forbidden actions
- Relevant doc files listed in AGENTS.md `Mandatory Context` section for the task domain

If task ID not provided, pick the first `Status: TODO` task with highest priority.

### 2. Understand scope

From backlog entry extract:
- Which **API endpoints** are needed (if any)
- Which **frontend pages/components** are needed (if any)
- Which **Prisma models** are touched (if any)

### 3. Backend implementation (if needed)

Follow this exact order:

1. **Schema** — add/update models in `apps/api/prisma/schema.prisma` if needed
2. **Migration** — run `cd apps/api && npx prisma migrate dev --name <snake_case_name>`
3. **DTOs** — create in `apps/api/src/<module>/dto/`
   - Use `class-validator` decorators
   - Add `@ApiProperty()` for Swagger
4. **Service** — business logic in `apps/api/src/<module>/<module>.service.ts`
   - Always scope by `merchant_id` from `currentUser.merchantId`
   - Never read `merchant_id` from request body
   - Use `this.prisma` injected via constructor
5. **Controller** — thin layer in `apps/api/src/<module>/<module>.controller.ts`
   - Only: DTO, decorators, service call, return
   - Use `@CurrentUser()`, `@RequirePermission('resource.action')`
   - No business logic, no Prisma
6. **Module** — register controller/service/imports in `<module>.module.ts`
7. **App module** — import new module in `apps/api/src/app.module.ts` if new module

### 4. Frontend implementation (if needed)

Module structure: `apps/web/src/modules/<module-name>/`

Required files:
```
pages/index.vue          — main page component
router/index.ts          — route definition with meta.permission
services/constants.ts    — PREFIX_ROUTE_PATH, PREFIX_ROUTE_NAME, API paths
services/rbac.ts         — permission constants (READ, WRITE, etc.)
services/<module>.service.ts — axios API calls
stores/state.ts          — reactive state definition
stores/getters.ts        — computed getters
stores/actions.ts        — async actions
stores/index.ts          — defineStore() composing all above
```

Route meta must include:
```ts
meta: {
  title: 'Page Title',
  layout: 'default',          // or 'auth' or 'public'
  permission: ['resource.read'],
  breadcrumbs: [...]
}
```

API calls go in `services/<module>.service.ts` using the axios instance from `@/plugins/axios`.

### 5. Shared types (if needed)

Add shared types to `packages/shared-types/src/` and rebuild:
```bash
pnpm --filter @umkm-pos/shared-types build
```

### 6. Definition of Done checklist

Run before marking complete:
```bash
pnpm typecheck
pnpm lint
pnpm --filter umkm-pos-api test    # if backend changed
```

Then update docs:
- `docs/development/backlog.md` — change `Status: TODO` → `Status: DONE`
- `docs/development/progress.md` — move task to Completed, update progress %
- `docs/api/api-contract.md` — if new/changed endpoints
- `docs/database/database-design.md` — if schema changed
- `docs/frontend/frontend-routes.md` — if new routes
- `docs/frontend/ui-pages.md` — if new pages

## Constraints

- Never implement features outside the task scope
- Never implement non-MVP features (Loyalty, CRM, Supplier, Tax, Accounting, WhatsApp)
- Never create `PrismaClient` directly in service — use `PrismaService`
- Never put business logic or DB queries in controller
- Never trust `merchant_id` from client input
- Never bypass `@RequirePermission()` or `@Public()` conventions
