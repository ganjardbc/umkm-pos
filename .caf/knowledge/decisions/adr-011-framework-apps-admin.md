# ADR-011: Framework: apps/admin

## Status
Proposed — the rationale below was inferred from the repository by Claude on 2026-10-03 and is NOT confirmed by the team. Change to Accepted only after a human has reviewed it.

## Context
App "@umkm-pos/admin" (apps/admin) uses Vue.

It is the platform-admin console: it calls the `/api/v1/admin/*` endpoints and was split out of the merchant app.

## Decision
Build it on the same stack as `apps/merchant` (Vue 3, Vite, PrimeVue, Pinia, Tailwind v4) and share the UI through `@umkm-pos/ui`.

Why (inferred): the same module layout (`modules/<name>/{pages,components,stores,services,router}`) and the same shared components mean one set of conventions for both consoles. Why a separate app rather than a section inside merchant is not recorded.

## Alternatives Considered
Not recorded. The obvious alternative — admin pages inside `apps/merchant` behind a permission — is what the split moved away from. Open question for the team.

## Consequences
- Admin has its own deploy unit (`umkm-pos-admin` in `docker-compose.yml`) and its own CI job.
- A change in `packages/ui` or `packages/shared-types` rebuilds both merchant and admin.
- No lint, typecheck or test script: `build` (`vue-tsc -b && vite build`) is the only gate.
