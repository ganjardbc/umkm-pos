# ADR-009: Package manager selection

## Status
Proposed — the rationale below was inferred from the repository by Claude on 2026-10-03 and is NOT confirmed by the team. Change to Accepted only after a human has reviewed it.

## Context
Detected pnpm from `pnpm-lock.yaml` and `pnpm-workspace.yaml` (workspaces: `apps/*`, `packages/*`).

## Decision
Use pnpm workspaces. Internal packages are consumed by name (`@umkm-pos/shared-types`, `@umkm-pos/ui`) and single workspaces are targeted with `pnpm --filter <package-name> <script>`.

Why (inferred): workspace linking and `--filter` are what both the docs (`CLAUDE.md`) and CI rely on.

## Alternatives Considered
Not recorded in the repo (npm/yarn workspaces would be the usual candidates). Open question for the team.

## Consequences
- `README.md` requires Node.js 22+ and pnpm 10+; CI installs with `pnpm install --frozen-lockfile`.
- Filters take the package **name**, not the folder: the API is `umkm-pos-api`, without the `@umkm-pos/` scope the other workspaces use. Easy to get wrong.
- A change to `pnpm-lock.yaml` or `pnpm-workspace.yaml` triggers every CI pipeline.
