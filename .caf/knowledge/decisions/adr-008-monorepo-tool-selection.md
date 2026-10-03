# ADR-008: Monorepo tool selection

## Status
Proposed — the rationale below was inferred from the repository by Claude on 2026-10-03 and is NOT confirmed by the team. Change to Accepted only after a human has reviewed it.

## Context
Detected Turborepo from a config file at the root (`turbo.json`).

The repo holds four apps (`apps/api`, `apps/merchant`, `apps/admin`, `apps/landing`) and four packages (`packages/ui`, `shared-types`, `shared-utils`, `eslint-config`). Apps depend on packages: `shared-types` has a build step that must run before its consumers build.

## Decision
Use Turborepo for task orchestration. Root scripts are thin wrappers (`turbo build`, `turbo test`, `turbo lint`, `turbo typecheck`).

Why (inferred): `turbo.json` declares `"dependsOn": ["^build"]`, which gives the "build `shared-types` before the apps" ordering without hand-written scripts, plus task caching.

## Alternatives Considered
Not recorded anywhere in the repo. The usual candidates would be Nx and plain `pnpm -r` scripts; no document says they were evaluated. Open question for the team.

## Consequences
- Build order between packages and apps is declared once, in `turbo.json`.
- A root command (`pnpm lint`, `pnpm test`) only runs in workspaces that define that script — the Vue apps define neither, so a green root `pnpm lint` says nothing about them.
- CI (`.github/workflows/ci.yml`) does not use Turbo's graph: it runs `pnpm --filter <pkg> <script>` per app and decides what to run with `dorny/paths-filter`. The dependency rules therefore exist in two places.
