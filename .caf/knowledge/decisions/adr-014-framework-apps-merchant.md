# ADR-014: Framework: apps/merchant

## Status
Proposed — the rationale below was inferred from the repository by Claude on 2026-10-03 and is NOT confirmed by the team. Change to Accepted only after a human has reviewed it.

## Context
App "@umkm-pos/merchant" (apps/merchant) uses Vue.

It is the merchant dashboard, the POS terminal and the customer self-order pages.

## Decision
Use Vue 3 (Composition API) + Vite + PrimeVue + Pinia + Tailwind v4, organised as feature modules under `src/modules/<name>/` with per-module `pages/`, `components/`, `stores/`, `services/` and `router/`.

Why: not recorded in the repo. The module convention itself is documented in `docs/development/conventions.md` and scaffolded by `pnpm --filter @umkm-pos/merchant run new-module`.

## Alternatives Considered
Not recorded. Open question for the team.

## Consequences
- Routes are collected from `modules/**/router/index.ts`; permissions come from each module's `services/rbac.ts`.
- No lint, typecheck or test script, and no test runner in `package.json`: the seven `*.test.ts` files under `modules/dashboard/` cannot be run today.
- Typing is loose in services and stores (`any`, `(this as any)`), which `vue-tsc` does not catch.
