# ADR-015: Framework: packages/ui

## Status
Proposed — the rationale below was inferred from the repository by Claude on 2026-10-03 and is NOT confirmed by the team. Change to Accepted only after a human has reviewed it.

## Context
App "@umkm-pos/ui" (packages/ui) uses Vue.

`apps/merchant` and `apps/admin` need the same components, layouts, styles, auth storage and HTTP client.

## Decision
Keep the shared frontend code in one **source-only** package (no build step). Both apps alias it in `vite.config.ts`/`tsconfig*.json` and auto-import its components.

Why (recorded in the root `CLAUDE.md`): components stay auto-imported and typed without a publish/build cycle. The package must not import `@/…`; app state comes in as props, and the HTTP client is injected through `setApiClient()`/`getApiClient()`.

## Alternatives Considered
Not recorded (a built library package would be the usual alternative). Open question for the team.

## Consequences
- No `build` script: the only package-level check is `typecheck`; real verification is building both apps.
- Tailwind v4 only scans roots declared with `@source` — a new source root without one silently loses its classes.
- A change here triggers both the merchant and admin CI jobs.
