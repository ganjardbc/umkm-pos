# GAN-55: Refactor RBAC permissions to plural naming convention

## Status: PLAN

## Source
Ticket GAN-55. Auditor scan `.ai/audits/products-api-2026-07-12.md`.

## Problem
`products.controller.ts` and `categories.controller.ts` use singular
`@RequirePermission('product.*')` / `('category.*')` decorators. AGENTS.md
RBAC Rules (line 258-284) mandate plural resource naming: `<resource>.<action>`
e.g. `products.read`, `outlets.write`. Seed file (`apps/api/prisma/seed.ts`)
seeds matching singular permission codes (`product.create`, `product.read`,
`product.update`, `product.delete`, `product.view`, `category.create`,
`category.read`, `category.update`, `category.delete`) and assigns them to
roles (owner/admin/manager/cashier/viewer).

## Decision on action-suffix ambiguity
AGENTS.md example list only shows two actions per resource (`.read`/`.write`).
Current code uses four+ granular actions (create/read/update/delete, plus a
`product.view` alias). Collapsing to read/write would change permission
semantics (loses create-vs-update-vs-delete distinction) — out of scope per
ticket, which only asks to fix the plural/singular naming
("misalnya mengganti `product.read` menjadi `products.read`").

**Scope for this ticket: pluralize the resource segment only, keep existing
action suffixes unchanged.**

| Old code | New code |
|---|---|
| `product.create` | `products.create` |
| `product.read` | `products.read` |
| `product.update` | `products.update` |
| `product.delete` | `products.delete` |
| `product.view` | `products.view` |
| `category.create` | `categories.create` |
| `category.read` | `categories.read` |
| `category.update` | `categories.update` |
| `category.delete` | `categories.delete` |

## Scope
- `apps/api/src/products/products.controller.ts`
- `apps/api/src/products/categories/categories.controller.ts`
- `apps/api/prisma/seed.ts` (permission codes + role→permission arrays)
- Any other backend/frontend reference to the old singular codes (search repo-wide,
  e.g. `apps/web` route `meta.permission[]`, RBAC seed scripts, tests) — do not
  break existing access.

Out of scope: other resources already using singular names (`outlet.*`,
`shift.*`, `role.*`, `permission.*`, `user.*`, `transaction.*`) — not part of
this ticket, do not touch (avoid unrequested big refactor per AGENTS.md).

## Open Questions
None blocking — action-suffix scope decision documented above. If wrong,
Reviewer/QA should flag before merge.
