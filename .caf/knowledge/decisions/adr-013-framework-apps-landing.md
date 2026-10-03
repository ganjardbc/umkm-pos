# ADR-013: Framework: apps/landing

## Status
Proposed — the rationale below was inferred from the repository by Claude on 2026-10-03 and is NOT confirmed by the team. Change to Accepted only after a human has reviewed it.

## Context
App "@umkm-pos/landing" (apps/landing) uses Vue.

It is the static marketing page.

## Decision
Build it with Vue 3 + Vite but keep it independent: it does **not** consume `@umkm-pos/ui`, PrimeVue or vue-router, and has its own brand palette.

Why (recorded): the root `CLAUDE.md` states this is deliberate — a static marketing page with its own palette. Why Vue rather than a static-site generator is not recorded (inferred: one framework across the repo).

## Alternatives Considered
Not recorded. Open question for the team.

## Consequences
- Landing is not rebuilt when `packages/ui` or `packages/shared-types` change (see `ci.yml`).
- Its conventions differ from merchant/admin: flat `components/` + `composables/`, translations in `src/locales/{id,en}.ts`, no module folders.
- No lint, typecheck or test script: `build` is the only gate.
