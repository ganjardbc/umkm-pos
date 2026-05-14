# UMKM POS Monorepo Agent Guide

This root `AGENTS.md` provides default guidance for the whole repository.

## Repository Layout
- `apps/api/` — NestJS + Prisma backend service.
- `apps/web/` — Vue 3 + Vite frontend application.
- `packages/` — shared packages used across applications.
- `infra/` — infrastructure assets and scripts.
- `docs/` — architecture and operational runbooks.

## Working Rules
- Before editing files in a subproject, read that subproject's own `AGENTS.md` first.
- Treat nested `AGENTS.md` files as higher-priority instructions for files under their directory.
- Keep changes scoped to the relevant project (`api` vs `web`) unless the task explicitly spans both.

## Common Workflow
1. Identify which subproject is affected.
2. Run commands from that subproject directory.
3. Validate using the scripts defined in that subproject's `package.json`.
4. Summarize modified files and checks in your handoff.

## Documentation
- When adding new top-level folders, update this file with ownership and workflow notes.
- Keep this file concise; put implementation-specific conventions in nested `AGENTS.md` files.
