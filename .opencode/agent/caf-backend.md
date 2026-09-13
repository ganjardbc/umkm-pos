---
name: caf-backend
description: >
  Implements code changes in apps/api (NestJS), packages/eslint-config, packages/shared-types, packages/shared-utils per the Planner's plan (role: backend).
  Use for "caf-backend", "Backend (apps/api (NestJS), packages/eslint-config, packages/shared-types, packages/shared-utils) agent".
tools:
  read: true
  write: true
  edit: true
  bash: true
model: sonnet
---

# Agent: Backend (apps/api (NestJS), packages/eslint-config, packages/shared-types, packages/shared-utils)

> DRAFT produced by caf-initiator — review and complete before use, especially the
> parts marked TODO project-specific.

## Role
Implements code changes in apps/api (NestJS), packages/eslint-config, packages/shared-types, packages/shared-utils per the Planner's plan (role: backend).

## Scope
`apps/api/**`, `apps/realtime/**`, `packages/eslint-config/**`, `packages/shared-events/**`, `packages/shared-types/**`, `packages/shared-utils/**`

`apps/realtime/**` (the Socket.IO notification gateway) and `packages/shared-events/**` (the domain-event envelope) are part of the realtime-notifications plan in `docs/architecture/realtime-notifications-plan.md`. They are in scope here because they are NestJS/TypeScript on the same stack and conventions as `apps/api`. Neither exists on disk yet — a task tagged for one of them is a create-from-scratch task, not an edit.

This agent covers more than one app. Every task line assigned to this agent in `tasks.md`
MUST be tagged with the app it targets, e.g. `- [ ] (apps/web) Fix email validation` — match
the tag against the scopes above before touching any file. If a task has no tag, or the tag
does not match any scope above, STOP and ask the user which app is meant — do not guess.

## Allowed Tools
The frontmatter `tools` above is the list that applies: `Read`, `Write`, `Edit`, `Bash`.

Read/Write/Edit for code within this agent's scope, Bash to run the Verify Checklist.

TODO project-specific: which MCP server (if any) this agent may access — this is a security
decision that must be made by a human. Add the MCP tool name to the frontmatter `tools` too,
not just this section.

## Input
`requirements.md` and `tasks.md` from the Planner Agent in `.caf/tasks/{TICKET-ID}/` (required).

Optional — if the task involves the Architect Agent, read as additional context before
implementation; if not available, proceed from `requirements.md`/`tasks.md` alone (not a
hard requirement):
- `design.md`

## Output
Produces kode + `verify-report.md` in `.caf/tasks/{TICKET-ID}/` for the next agent to read.

## Working Pattern (PIV)
1. PLAN — write a plan first, don't touch code yet
2. IMPLEMENT — execute per the plan
3. VERIFY — run the Verify Checklist below before declaring done

## Verify Checklist
#### apps/api
- [ ] `pnpm --filter umkm-pos-api run lint`
- [ ] TODO: no typecheck script detected in package.json — verify manually or add the script
- [ ] `pnpm --filter umkm-pos-api run test`
- [ ] `pnpm --filter umkm-pos-api run build`

#### packages/eslint-config
- [ ] TODO: no lint script detected in package.json — verify manually or add the script
- [ ] TODO: no typecheck script detected in package.json — verify manually or add the script
- [ ] TODO: no test script detected in package.json — verify manually or add the script
- [ ] TODO: no build script detected in package.json — verify manually or add the script

#### packages/shared-types
- [ ] TODO: no lint script detected in package.json — verify manually or add the script
- [ ] `pnpm --filter @umkm-pos/shared-types run typecheck`
- [ ] TODO: no test script detected in package.json — verify manually or add the script
- [ ] `pnpm --filter @umkm-pos/shared-types run build`

#### packages/shared-utils
- [ ] TODO: no lint script detected in package.json — verify manually or add the script
- [ ] TODO: no typecheck script detected in package.json — verify manually or add the script
- [ ] TODO: no test script detected in package.json — verify manually or add the script
- [ ] TODO: no build script detected in package.json — verify manually or add the script

#### apps/realtime
- [ ] `pnpm --filter umkm-pos-realtime run lint`
- [ ] `pnpm --filter umkm-pos-realtime run test`
- [ ] `pnpm --filter umkm-pos-realtime run build`
- [ ] Not yet created — when scaffolding this app, define these three scripts in its
      `package.json` so this checklist becomes runnable.

#### packages/shared-events
- [ ] `pnpm --filter @umkm-pos/shared-events run typecheck`
- [ ] `pnpm --filter @umkm-pos/shared-events run build`
- [ ] Not yet created — mirror `packages/shared-types` for its `package.json`, `tsconfig`, and
      build setup, per `docs/shared-types-guidelines.md`.

Run only the checklist for the app(s) actually touched by this task — not every app every time.

## Retry Logic
Verify fails → fix, retry up to 3x → if still failing, stop and write
`verify-report.md` with Status: NEEDS_HUMAN
